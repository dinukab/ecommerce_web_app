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
      orderNotes
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items' });
    }

    // 1. Validate stock and recalculate items price
    let itemsPrice = 0;
    const validatedItems = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }

      itemsPrice += product.sellingPrice * item.quantity;
      validatedItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.sellingPrice,
        image: product.images?.[0] || ''
      });
    }

    // 2. Calculate delivery fee
    let deliveryFee = 0;
    let estimatedDays = 0;
    let zoneId = null;

    if (deliveryMethod !== 'pickup') {
      const zone = await DeliveryZone.findOne({ 
        districts: { $regex: new RegExp(`^${shippingAddress.district}$`, 'i') },
        isActive: true 
      });

      if (!zone) {
        return res.status(400).json({ success: false, message: 'Delivery not available for this district' });
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

    // 3. Create order
    const order = new Order({
      user: req.user._id, // Assumes auth middleware sets req.user
      orderItems: validatedItems,
      shippingAddress,
      deliveryZone: zoneId,
      deliveryMethod,
      paymentMethod,
      itemsPrice,
      deliveryFee,
      totalPrice,
      estimatedDeliveryDate,
      orderNotes
    });

    const createdOrder = await order.save();

    // 4. Update stock
    for (const item of validatedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    res.status(201).json({ success: true, data: createdOrder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/my-orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Authorization check
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/orders/:id/status (Admin Only)
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
      
      // Return stock
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    }

    const updatedOrder = await order.save();
    res.json({ success: true, data: updatedOrder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/track/:trackingNumber
export const trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ trackingNumber: req.params.trackingNumber.toUpperCase() })
      .select('orderStatus estimatedDeliveryDate shippingAddress trackingNumber createdAt orderItems');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Invalid tracking number' });
    }

    // Mask sensitive info for public tracking
    const publicData = {
      trackingNumber: order.trackingNumber,
      status: order.orderStatus,
      estimatedDeliveryDate: order.estimatedDeliveryDate,
      createdAt: order.createdAt,
      city: order.shippingAddress.city,
      district: order.shippingAddress.district,
      itemsCount: order.orderItems.length
    };

    res.json({ success: true, data: publicData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

import { z } from "zod";
import OrderModel from "../models/Order.js"; 
// Renamed to OrderModel to avoid conflict with 'Order' imported on line 1

const toNumber = () => z.coerce.number().finite();

const nonEmptyString = (label) =>
  z
    .string({ required_error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`);

const shippingAddressSchema = z.object({
  fullName: nonEmptyString("fullName"),
  phoneNumber: nonEmptyString("phoneNumber"),
  building: nonEmptyString("building"),
  colony: z.string().trim().optional(),
  province: nonEmptyString("province"),
  district: nonEmptyString("district"),
  city: nonEmptyString("city"),
  address: nonEmptyString("address"),
});

const pricingSchema = z.object({
  subtotal: toNumber().min(0),
  shippingEstimate: toNumber().min(0),
  orderTotal: toNumber().min(0),
});

const itemSchema = z.object({
  productId: nonEmptyString("productId"),
  name: nonEmptyString("name"),
  details: z.string().trim().optional(),
  quantity: toNumber().int().min(1),
  price: toNumber().min(0),
});

const createOrderSchema = z.object({
  userId: toNumber().int().positive().optional(),
  email: z.string().trim().email(),
  shippingAddress: shippingAddressSchema,
  pricing: pricingSchema,
  items: z.array(itemSchema).min(1),
  paymentStatus: z.enum(["Pending", "Paid", "Failed"]).optional(),
  transactionId: z.string().trim().optional(),
});

// Matches current frontend localStorage structure from checkout flow.
const checkoutFlowSchema = z.object({
  checkoutData: z.object({
    email: z.string().trim().email(),
    fullName: nonEmptyString("fullName"),
    province: nonEmptyString("province"),
    district: nonEmptyString("district"),
    city: nonEmptyString("city"),
    phoneNumber: nonEmptyString("phoneNumber"),
    buildingAddress: nonEmptyString("buildingAddress"),
    colonyLocality: z.string().trim().optional(),
    address: nonEmptyString("address"),
  }),
  orderTotals: z.object({
    subtotal: toNumber().min(0),
    shipping: toNumber().min(0),
    orderTotal: toNumber().min(0),
  }),
  cartItems: z
    .array(
      z.object({
        id: nonEmptyString("id"),
        name: nonEmptyString("name"),
        details: z.string().trim().optional(),
        price: toNumber().min(0),
        quantity: toNumber().int().min(1),
      })
    )
    .min(1),
});

const buildOrderFromCheckoutFlow = (payload) => {
  const { checkoutData, orderTotals, cartItems } = payload;

  return {
    email: checkoutData.email,
    shippingAddress: {
      fullName: checkoutData.fullName,
      phoneNumber: checkoutData.phoneNumber,
      building: checkoutData.buildingAddress,
      colony: checkoutData.colonyLocality,
      province: checkoutData.province,
      district: checkoutData.district,
      city: checkoutData.city,
      address: checkoutData.address,
    },
    pricing: {
      subtotal: orderTotals.subtotal,
      shippingEstimate: orderTotals.shipping,
      orderTotal: orderTotals.orderTotal,
    },
    items: cartItems.map((item) => ({
      productId: item.id,
      name: item.name,
      details: item.details,
      quantity: item.quantity,
      price: item.price,
    })),
  };
};

// POST /api/orders/checkout
// Also accepts POST /api/orders with the same body.
export const createCheckoutOrder = async (req, res) => {
  try {
    // Accept either normalized shape or the frontend checkout-flow shape.
    const normalizedParse = createOrderSchema.safeParse(req.body);
    const checkoutParse = checkoutFlowSchema.safeParse(req.body);

    if (!normalizedParse.success && !checkoutParse.success) {
      return res.status(400).json({
        message: "Invalid checkout payload",
        expected: {
          normalized: {
            email: "user@example.com",
            shippingAddress: {
              fullName: "Jane Doe",
              phoneNumber: "0771234567",
              building: "No 123",
              colony: "Landmark",
              province: "Western",
              district: "Colombo",
              city: "Colombo 07",
              address: "No 123, Street, City",
            },
            pricing: {
              subtotal: 1000,
              shippingEstimate: 400,
              orderTotal: 1400,
            },
            items: [
              { productId: "005", name: "Product_005", quantity: 1, price: 2300 },
            ],
          },
          checkoutFlow: {
            checkoutData: { email: "user@example.com", fullName: "Jane Doe", province: "..." },
            orderTotals: { subtotal: 1000, shipping: 400, orderTotal: 1400 },
            cartItems: [{ id: "005", name: "Product_005", price: 2300, quantity: 1 }],
          },
        },
        errors: {
          normalized: normalizedParse.success ? undefined : normalizedParse.error.flatten(),
          checkoutFlow: checkoutParse.success ? undefined : checkoutParse.error.flatten(),
        },
      });
    }

    const orderPayload = normalizedParse.success
      ? normalizedParse.data
      : buildOrderFromCheckoutFlow(checkoutParse.data);

    const created = await OrderModel.create(orderPayload);

    return res.status(201).json({
      orderId: created._id,
      order: created,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create order", error: error.message });
  }
};

// GET /api/orders/id/:orderId
export const getOrderByIdLegacy = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    return res.json(order);
  } catch (error) {
    return res.status(400).json({ message: "Invalid order id", error: error.message });
  }
};

// GET /api/orders?email=...&userId=...
export const listOrders = async (req, res) => {
  try {
    const { email, userId } = req.query;
    const filter = {};
    if (typeof email === "string" && email.trim() !== "") filter.email = email.trim();
    if (typeof userId === "string" && userId.trim() !== "") filter.userId = Number(userId);

    const orders = await OrderModel.find(filter).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: "Failed to list orders", error: error.message });
  }
};

// GET /api/orders/:userId (legacy)
export const getOrderHistory = async (req, res) => {
  const userId = Number(req.params.userId);
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ message: "userId must be a number" });
  }

  try {
    const orders = await OrderModel.find({ userId }).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load order history", error: error.message });
  }
};
