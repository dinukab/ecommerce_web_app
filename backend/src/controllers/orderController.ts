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

    const order = new Order({
      user: req.user._id,
      customerName: shippingAddress.fullName,
      items: validatedItems,
      orderItems: validatedItems,
      subtotal: itemsPrice,
      total: totalPrice,
      status: 'pending',
      shippingAddress,
      deliveryZone: zoneId,
      deliveryMethod,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      itemsPrice,
      deliveryFee,
      totalPrice,
      estimatedDeliveryDate,
      orderNotes,
      storeId:   '69e539fd180ff885ce56ca57',  // Open Door store ID
      storeName: 'Open Door',                  // Human-readable source label
    });

    // Save order to database
    const createdOrder = await order.save();
    
    if (!createdOrder) {
      return res.status(500).json({ success: false, message: 'Failed to save order to database' });
    }

    // Deduct stock for each ordered item
    try {
      for (const item of validatedItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }
    } catch (stockError) {
      console.error('Error updating stock:', stockError);
      // Note: Order is already saved, but log this error for manual review
      console.error(`Order ${createdOrder._id} created but stock deduction failed for some items`);
    }

    // Generate PayHere Hash
    const merchantId = process.env.PAYHERE_MERCHANT_ID || '1228499';
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || '';
    
    let payhereHash = '';
    if (merchantSecret) {
      const amountFormatted = createdOrder.totalPrice.toFixed(2);
      const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
      const hashData = merchantId + createdOrder._id.toString() + amountFormatted + 'LKR' + hashedSecret;
      payhereHash = crypto.createHash('md5').update(hashData).digest('hex').toUpperCase();
    }

    console.log('✅ Order successfully created and saved to database:');
    console.log(`   Order ID: ${createdOrder._id}`);
    console.log(`   Tracking Number: ${createdOrder.trackingNumber}`);
    console.log(`   User ID: ${createdOrder.user}`);
    console.log(`   Total Price: ${createdOrder.totalPrice}`);
    console.log(`   Order Status: ${createdOrder.orderStatus}`);
    console.log(`   Payment Status: ${createdOrder.paymentStatus}`);

    return res.status(201).json({ 
      success: true,
      message: 'Order placed successfully and saved to database',
      data: { 
        ...createdOrder.toObject(), 
        payhereHash, 
        payhereMerchantId: merchantId 
      } 
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

    if (md5sig === expectedMd5Sig && status_code === '2') {
      // Payment success (status_code 2 means success in PayHere)
      await Order.findByIdAndUpdate(order_id, {
        paymentStatus: 'paid',
        paymentMethod: 'payhere',
      });
    }

    return res.status(200).send();
  } catch (err: any) {
    console.error('PayHere Notify Error:', err);
    return res.status(500).send();
  }
};
