import StoreOrder from '../models/StoreOrder.js';

// ─── POST /api/store-orders ───────────────────────────────────────────────────
// Create a new store / POS order
export const createStoreOrder = async (req, res) => {
  try {
    const {
      orderId,
      source,
      customerName,
      items,
      subtotal,
      discount,
      total,
      status,
      paymentMethod,
      paymentStatus,
      storeId,
      createdBy,
    } = req.body;

    // Required field guards
    if (!customerName || !customerName.trim()) {
      return res.status(400).json({ success: false, message: 'customerName is required' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'items array must not be empty' });
    }
    if (subtotal == null || total == null) {
      return res.status(400).json({ success: false, message: 'subtotal and total are required' });
    }
    if (!paymentMethod) {
      return res.status(400).json({ success: false, message: 'paymentMethod is required' });
    }
    if (!storeId) {
      return res.status(400).json({ success: false, message: 'storeId is required' });
    }

    const order = new StoreOrder({
      orderId,       // optional – auto-generated if omitted
      source:        source        || 'physical',
      customerName:  customerName.trim(),
      items,
      subtotal,
      discount:      discount      ?? 0,
      total,
      status:        status        || 'confirmed',
      paymentMethod,
      paymentStatus: paymentStatus || 'pending',
      storeId,
      createdBy,     // optional ObjectId of the staff member
    });

    const saved = await order.save();

    console.log(`✅ StoreOrder created – orderId: ${saved.orderId}, total: ${saved.total}`);

    return res.status(201).json({ success: true, data: saved });
  } catch (err) {
    console.error('createStoreOrder error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/store-orders ────────────────────────────────────────────────────
// List all store orders (admin)
export const getStoreOrders = async (req, res) => {
  try {
    const { storeId, status, from, to } = req.query;
    const filter = {};

    if (storeId)  filter.storeId = storeId;
    if (status)   filter.status  = status;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to)   filter.createdAt.$lte = new Date(to);
    }

    const orders = await StoreOrder.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/store-orders/:id ────────────────────────────────────────────────
export const getStoreOrderById = async (req, res) => {
  try {
    const order = await StoreOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Store order not found' });
    }
    return res.json({ success: true, data: order });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/store-orders/:id/status ────────────────────────────────────────
// Update order status (admin)
export const updateStoreOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const order = await StoreOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Store order not found' });
    }

    if (status)        order.status        = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    const updated = await order.save();
    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
