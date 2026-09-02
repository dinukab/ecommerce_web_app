import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import DeliveryZone from '../models/DeliveryZone.js';
import StockHistory from '../models/StockHistory.js';
import crypto from 'crypto';
import { generateInvoicePdf } from '../utils/generateInvoicePdf.js';
import { sendInvoiceEmail } from '../utils/mailer.js';

async function logStockHistory(order: any) {
  try {
    const orderIdStr = order.orderId || (order._id ? order._id.toString() : '');
    const reasonText = `Online transaction ${orderIdStr}`;

    // Deduplication check: prevent duplicate stock history entries for the same order
    if (orderIdStr) {
      const existing = await StockHistory.findOne({ reason: reasonText });
      if (existing) {
        console.log(`ℹ️ Stock history already logged for order: ${orderIdStr}`);
        return;
      }
    }

    const itemsToLog = order.orderItems || order.items || [];
    for (const item of itemsToLog) {
      if (item && item.product) {
        await StockHistory.create({
          product: item.product,
          type: 'remove',
          quantity: item.quantity,
          reason: reasonText,
          by: order.user ? order.user.toString() : 'system',
          storeId: order.storeId || '69e539fd180ff885ce56ca57',
        });
      }
    }
    console.log(`✅ Stock history written for online order: ${orderIdStr}`);
  } catch (err) {
    console.error('Failed to log stock history:', err);
  }
}

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
      let product = null;

      if (item.product && mongoose.Types.ObjectId.isValid(item.product)) {
        product = await Product.findById(item.product);
      }

      if (!product && item.name) {
        product = await Product.findOne({
          name: { $regex: new RegExp(`^${item.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') }
        });
      }

      if (!product && item.name) {
        const cleanName = item.name.split(' ')[0];
        if (cleanName && cleanName.length > 2) {
          product = await Product.findOne({
            name: { $regex: new RegExp(cleanName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i') }
          });
        }
      }

      if (product) {
        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
          });
        }

        const price = product.sellingPrice || item.price || 0;
        itemsPrice += price * item.quantity;
        validatedItems.push({
          product: product._id,
          name: product.name,
          quantity: item.quantity,
          price: price,
          image: product.images?.[0] || item.image || '',
        });
      } else {
        const price = item.price || 0;
        itemsPrice += price * item.quantity;
        validatedItems.push({
          product: mongoose.Types.ObjectId.isValid(item.product) ? item.product : new mongoose.Types.ObjectId(),
          name: item.name || 'Product',
          quantity: item.quantity,
          price: price,
          image: item.image || '',
        });
      }
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

    const initialOrderStatus = 'processing';

    // Security: Always bind the order customerName & shippingAddress fullName to the authenticated user's account name
    const secureCustomerName = req.user?.name || shippingAddress.fullName;

    const order = new Order({
      user: req.user._id,
      customerName: secureCustomerName,
      items: validatedItems,
      orderItems: validatedItems,
      subtotal: itemsPrice,
      total: totalPrice,
      shippingAddress: {
        ...shippingAddress,
        fullName: secureCustomerName,
      },
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
      storeId: '69e539fd180ff885ce56ca57',  // Open Door store ID
      storeName: 'Open Door',                  // Human-readable source label
    });

    const createdOrder = await order.save();

    if (!createdOrder) {
      return res.status(500).json({ success: false, message: 'Failed to save order to database' });
    }

    // Deduct stock immediately and log to StockHistory for all online orders
    try {
      for (const item of validatedItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }
      await logStockHistory(createdOrder);
    } catch (stockError) {
      console.error('Error updating stock and stock history:', stockError);
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
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const wasPaid = order.paymentStatus === 'paid';

    if (orderStatus) {
      order.orderStatus = orderStatus;
      order.status = orderStatus;
    }
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    // Cash on Delivery Logic
    if (order.paymentMethod === 'cash-on-delivery') {
      if (orderStatus === 'delivered' || paymentStatus === 'paid') {
        order.paymentStatus = 'paid';
        order.orderStatus = 'delivered';
        order.status = 'delivered';
        if (!order.deliveredAt) order.deliveredAt = new Date();
      }

      if (orderStatus === 'cancelled' || paymentStatus === 'declined') {
        // Prevent restocking multiple times if already cancelled
        if (order.orderStatus !== 'cancelled' || req.body.forceCancel) {
          order.paymentStatus = 'declined';
          order.orderStatus = 'cancelled';
          order.status = 'cancelled';
          order.cancelledAt = new Date();
          order.cancelReason = req.body.cancelReason || 'Declined/Cancelled by admin';

          for (const item of order.orderItems) {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { stock: item.quantity },
            });
          }
        } else {
          order.paymentStatus = 'declined';
          order.orderStatus = 'cancelled';
          order.status = 'cancelled';
        }
      }
    } else {
      // Logic for PayHere or other methods
      if (orderStatus === 'delivered') {
        order.deliveredAt = new Date();
        order.paymentStatus = 'paid';
      }

      if (orderStatus === 'cancelled') {
        // Only restock if it was paid and previously deducted
        if (order.paymentStatus === 'paid' && order.orderStatus !== 'cancelled') {
           for (const item of order.orderItems) {
             await Product.findByIdAndUpdate(item.product, {
               $inc: { stock: item.quantity },
             });
           }
        }
        order.paymentStatus = 'declined';
        order.orderStatus = 'cancelled';
        order.status = 'cancelled';
        order.cancelledAt = new Date();
        order.cancelReason = req.body.cancelReason || 'Cancelled by admin';
      }
    }

    const updatedOrder = await order.save();
    if (updatedOrder.paymentStatus === 'paid' && !wasPaid) {
      await logStockHistory(updatedOrder);
    }
    return res.json({ success: true, data: updatedOrder });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/track/:trackingNumber
export const trackOrder = async (req: Request, res: Response) => {
  try {
    const searchVal = req.params.trackingNumber.toUpperCase().replace(/^#/, '').trim();
    const order = await Order.findOne({
      $or: [
        { trackingNumber: searchVal },
        { orderId: searchVal }
      ]
    }).select(
      'orderStatus estimatedDeliveryDate shippingAddress trackingNumber orderId createdAt orderItems items'
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Invalid tracking number or order number' });
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
      trackingNumber: order.trackingNumber || order.orderId,
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

    const isLocalTest = md5sig === 'LOCAL_TEST' && (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV);
    if (md5sig === expectedMd5Sig || isLocalTest) {
      if (status_code === '2') {
        // 1. Payment success (status_code 2 means success in PayHere)
        const order = await Order.findById(order_id);
        
        // Only process if the order isn't already marked as paid
        if (order && order.paymentStatus !== 'paid') {
          order.paymentStatus = 'paid';
          order.orderStatus = 'processing';
          order.status = 'processing';
          await order.save();

          // 2. Deduct stock now that payment is confirmed
          try {
            for (const item of order.orderItems) {
              await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity },
              });
            }
            console.log(`✅ Stock deducted for PayHere order: ${order_id}`);
            await logStockHistory(order);
          } catch (stockError) {
            console.error('Error updating stock after PayHere payment:', stockError);
          }
        }
      } else if (Number(status_code) < 0) {
        // 3. Payment failed or declined (status codes -1, -2, etc.)
        await Order.findByIdAndUpdate(order_id, {
          paymentStatus: 'declined',
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

// PUT /api/orders/:id/cancel
export const cancelOrder = async (req: any, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Only the owner can cancel
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Only allow cancellation for pending/confirmed/processing orders
    const cancellableStatuses = ['pending', 'confirmed', 'processing'];
    if (!cancellableStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an order with status: ${order.orderStatus}`,
      });
    }

    const { cancelReason, additionalInfo } = req.body;

    order.orderStatus = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelReason = cancelReason || 'No reason provided';
    if (additionalInfo) {
      order.orderNotes = (order.orderNotes ? order.orderNotes + '\n' : '') + `[Cancellation note]: ${additionalInfo}`;
    }

    await order.save();

    // Restore stock for COD orders (stock was deducted on order creation).
    // PayHere orders only deduct stock on payment confirmation, so no restore needed.
    if (order.paymentMethod === 'cash-on-delivery') {
      try {
        for (const item of order.orderItems) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity },
          });
        }
        console.log(`✅ Stock restored for cancelled COD order: ${order.orderId}`);
      } catch (stockError) {
        console.error('Error restoring stock after cancellation:', stockError);
      }
    }

    return res.json({ success: true, message: 'Order cancelled successfully', data: order });
  } catch (err: any) {
    console.error('cancelOrder error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

// POST /api/orders/:id/send-invoice
export const sendInvoice = async (req: any, res: Response) => {
  try {
    const order: any = await Order.findById(req.params.id).populate('user', 'email name');
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    console.log('[sendInvoice] order.user:', order.user);
    console.log('[sendInvoice] req.user:', req.user);
    console.log('[sendInvoice] order.shippingAddress:', order.shippingAddress);

    // Try to get email from populated user, falling back to req.user (auth token)
    const userEmail = order.user?.email || req.user?.email;
    if (!userEmail) {
      return res.status(400).json({ success: false, message: "User email not found" });
    }

    console.log('[sendInvoice] Generating PDF for:', userEmail);
    const pdfBuffer = await generateInvoicePdf(order, userEmail);
    console.log('[sendInvoice] PDF generated, size:', pdfBuffer.length);

    await sendInvoiceEmail({
      to: userEmail,
      subject: `Your Invoice - Order #${order.orderId || order._id}`,
      text: `Hi ${order.customerName || 'Customer'}, please find your invoice attached.`,
      pdfBuffer,
      filename: `invoice-${order.orderId || order._id}.pdf`,
    });

    console.log('[sendInvoice] Email sent successfully to:', userEmail);
    return res.json({ success: true, message: "Invoice sent to your email" });
  } catch (err: any) {
    console.error('[sendInvoice] FULL ERROR:', err);
    return res.status(500).json({ 
      success: false, 
      message: err.message || "Failed to send invoice",
      detail: err?.responseCode || err?.code || undefined
    });
  }
};
