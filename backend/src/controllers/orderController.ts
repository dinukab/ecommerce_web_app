import { Request, Response } from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import DeliveryZone from '../models/DeliveryZone.js';
import crypto from 'crypto';

// POST /api/orders
export const createOrder = async (req: any, res: Response) => {
  try {
    const {
      orderItems,
      shippingAddress,
      deliveryMethod,
      paymentMethod,
      orderNotes,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items' });
    }

    // Validate stock and recalculate item prices from the DB.
    let itemsPrice = 0;
    const validatedItems = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: `Product not found: ${item.name}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
      }

      itemsPrice += product.sellingPrice * item.quantity;
      validatedItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.sellingPrice,
        image: product.images?.[0] || '',
      });
    }

    let deliveryFee = 0;
    let estimatedDays = 0;
    let zoneId = null;

    if (deliveryMethod !== 'pickup') {
      const zone = await DeliveryZone.findOne({
        districts: { $regex: new RegExp(`^${shippingAddress.district}$`, 'i') },
        isActive: true,
      });

      if (!zone) {
        return res.status(400).json({
          success: false,
          message: 'Delivery not available for this district',
        });
      }

      deliveryFee = zone.deliveryFee;
      estimatedDays = zone.estimatedDays;
      zoneId = zone._id;

      if (deliveryMethod === 'express') {
        deliveryFee = deliveryFee * 1.5;
        estimatedDays = Math.max(1, Math.ceil(estimatedDays / 2));
      }
    }

    const totalPrice = itemsPrice + deliveryFee;
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + estimatedDays);

    const initialOrderStatus = (paymentMethod === 'cod' || paymentMethod === 'cash-on-delivery') ? 'confirmed' : 'pending';

    const order = new Order({
      user: req.user._id,
      customerName: shippingAddress.fullName,
      items: validatedItems,
      orderItems: validatedItems,
      subtotal: itemsPrice,
      total: totalPrice,
      shippingAddress,
      deliveryZone: zoneId,
      deliveryMethod,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: initialOrderStatus,
      itemsPrice,
      deliveryFee,
      totalPrice,
      estimatedDeliveryDate,
      orderNotes,
      storeId:   '69e539fd180ff885ce56ca57',
      storeName: 'Open Door',
    });

    const createdOrder = await order.save();
    
    if (!createdOrder) {
      return res.status(500).json({ success: false, message: 'Failed to save order to database' });
    }

    // Deduct stock immediately ONLY for COD orders. 
    // PayHere orders will deduct stock in the notification handler (payhereNotify).
    if (paymentMethod === 'cod') {
      try {
        for (const item of validatedItems) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity },
          });
        }
      } catch (stockError) {
        console.error('Error updating stock for COD:', stockError);
      }
    }


    // PayHere Logic
    if (paymentMethod === 'payhere') {
      const merchantId = process.env.PAYHERE_MERCHANT_ID || '1228499';
      const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
      const orderId = createdOrder._id.toString();
      const amount = createdOrder.totalPrice.toFixed(2);
      const currency = 'LKR';

      let hash = '';
      if (merchantSecret) {
        const hashedSecret = crypto
          .createHash('md5')
          .update(merchantSecret)
          .digest('hex')
          .toUpperCase();

        hash = crypto
          .createHash('md5')
          .update(merchantId + orderId + amount + currency + hashedSecret)
          .digest('hex')
          .toUpperCase();
      }

      const payhereParams = {
        sandbox: process.env.PAYHERE_IS_SANDBOX === 'true',
        merchant_id: merchantId,
        return_url: `${process.env.FRONTEND_URL}/orders/confirmation/${orderId}`,
        cancel_url: `${process.env.FRONTEND_URL}/checkout`,
        notify_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/orders/payhere-notify`,
        order_id: orderId,
        items: createdOrder.orderItems.map((i: any) => i.name).join(', '),
        amount: amount,
        currency: currency,
        hash: hash,
        first_name: shippingAddress.fullName.split(' ')[0],
        last_name: shippingAddress.fullName.split(' ').slice(1).join(' ') || 'User',
        email: req.user.email,
        phone: shippingAddress.phone,
        address: shippingAddress.addressLine1,
        city: shippingAddress.city,
        country: 'Sri Lanka',
      };

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully and saved to database',
        data: {
          ...createdOrder.toObject(),
          payhereParams,
          payhereHash: hash, // For backward compatibility if needed
          payhereMerchantId: merchantId
        }
      });
    }

    return res.status(201).json({ 
      success: true, 
      message: 'Order placed successfully and saved to database',
      data: createdOrder 
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/my-orders
export const getMyOrders = async (req: any, res: Response) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, data: orders });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/:id
export const getOrderById = async (req: any, res: Response) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    return res.json({ success: true, data: order });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/orders/:id/status (admin)
export const updateOrderStatus = async (req: any, res: Response) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.orderStatus = orderStatus;
    order.status = orderStatus;

    if (orderStatus === 'delivered') {
      order.deliveredAt = new Date();
      order.paymentStatus = 'paid';
    }

    if (orderStatus === 'cancelled') {
      order.cancelledAt = new Date();
      order.cancelReason = req.body.cancelReason || 'Cancelled by admin';

      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    const updatedOrder = await order.save();
    return res.json({ success: true, data: updatedOrder });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/track/:trackingNumber
export const trackOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findOne({
      trackingNumber: req.params.trackingNumber.toUpperCase(),
    }).select(
      'orderStatus estimatedDeliveryDate shippingAddress trackingNumber createdAt orderItems'
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Invalid tracking number' });
    }

    const publicData = {
      id: order._id,
      orderId: order.orderId,
      status: order.status || order.orderStatus,
      estimatedDeliveryDate: order.estimatedDeliveryDate,
      createdAt: order.createdAt,
      city: order.shippingAddress?.city,
      district: order.shippingAddress?.district,
      itemsCount: order.items?.length || order.orderItems?.length || 0,
      trackingNumber: order.trackingNumber,
    };

    return res.json({ success: true, data: publicData });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/orders/payhere-notify
export const payhereNotify = async (req: Request, res: Response) => {
  try {
    const {
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
    } = req.body;

    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || '';
    const hashedSecret = crypto
      .createHash('md5')
      .update(merchantSecret)
      .digest('hex')
      .toUpperCase();

    const expectedMd5Sig = crypto
      .createHash('md5')
      .update(
        merchant_id +
          order_id +
          payhere_amount +
          payhere_currency +
          status_code +
          hashedSecret
      )
      .digest('hex')
      .toUpperCase();

    if (md5sig === expectedMd5Sig) {
      if (status_code === '2') {
        // 1. Payment success (status_code 2 means success in PayHere)
        const order = await Order.findById(order_id);
        
        // Only process if the order isn't already marked as paid
        if (order && order.paymentStatus !== 'paid') {
          order.paymentStatus = 'paid';
          order.orderStatus = 'confirmed';
          order.status = 'confirmed';
          await order.save();

          // 2. Deduct stock now that payment is confirmed
          try {
            for (const item of order.orderItems) {
              await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity },
              });
            }
            console.log(`✅ Stock deducted for PayHere order: ${order_id}`);
          } catch (stockError) {
            console.error('Error updating stock after PayHere payment:', stockError);
          }
        }
      } else if (Number(status_code) < 0) {
        // 3. Payment failed or declined (status codes -1, -2, etc.)
        await Order.findByIdAndUpdate(order_id, {
          paymentStatus: 'failed',
          orderStatus: 'cancelled',
          status: 'cancelled'
        });
        console.log(`❌ PayHere payment declined/failed for order: ${order_id}`);
      }
    }


    return res.status(200).send();
  } catch (err: any) {
    console.error('PayHere Notify Error:', err);
    return res.status(500).send();
  }
};
