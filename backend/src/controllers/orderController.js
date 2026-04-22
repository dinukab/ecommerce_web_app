import Order from '../models/Order.js';
import Customer from '../models/Customer.js';

export const createOrder = async (req, res) => {
  try {
    const { items, subtotal, discount, total, paymentMethod, deliveryAddress, notes } = req.body;

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain items' });
    }

    if (!paymentMethod) {
      return res.status(400).json({ success: false, message: 'Payment method is required' });
    }

    // Get customer data
    const customer = await Customer.findById(req.user.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Generate unique order ID
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderId = `ORD-${timestamp}${randomStr}`;

    // Create the order
    const order = await Order.create({
      orderId,
      source: 'online',
      customerId: req.user.id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      items,
      subtotal,
      discount: discount || 0,
      total,
      paymentMethod,
      deliveryAddress,
      notes,
      storeId: customer.storeId,
    });

    // Update customer stats
    customer.totalOrders += 1;
    customer.totalSpent += total;
    customer.lastPurchase = new Date();
    await customer.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error creating order',
      error: err.message 
    });
  }
};

export const getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
};
