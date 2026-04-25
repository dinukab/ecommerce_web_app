import Order from '../models/Order.js';
import Product from '../models/Product.js';
import DeliveryZone from '../models/DeliveryZone.js';

// POST /api/orders
export const createOrder = async (req, res) => {
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
      orderItems: validatedItems,
      shippingAddress,
      deliveryZone: zoneId,
      deliveryMethod,
      paymentMethod,
      itemsPrice,
      deliveryFee,
      totalPrice,
      estimatedDeliveryDate,
      orderNotes,
    });

    const createdOrder = await order.save();

    for (const item of validatedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    return res.status(201).json({ success: true, data: createdOrder });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/my-orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, data: orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/:id
export const getOrderById = async (req, res) => {
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
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/orders/:id/status (admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.orderStatus = orderStatus;

    if (orderStatus === 'delivered') {
      order.deliveredAt = Date.now();
      order.paymentStatus = 'paid';
    }

    if (orderStatus === 'cancelled') {
      order.cancelledAt = Date.now();
      order.cancelReason = req.body.cancelReason || 'Cancelled by admin';

      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    const updatedOrder = await order.save();
    return res.json({ success: true, data: updatedOrder });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/track/:trackingNumber
export const trackOrder = async (req, res) => {
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
      trackingNumber: order.trackingNumber,
      status: order.orderStatus,
      estimatedDeliveryDate: order.estimatedDeliveryDate,
      createdAt: order.createdAt,
      city: order.shippingAddress.city,
      district: order.shippingAddress.district,
      itemsCount: order.orderItems.length,
    };

    return res.json({ success: true, data: publicData });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
