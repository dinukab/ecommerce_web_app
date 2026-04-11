const { z } = require("zod");
const Order = require("../models/OrderModels");

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
exports.createCheckoutOrder = async (req, res) => {
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

    const created = await Order.create(orderPayload);

    return res.status(201).json({
      orderId: created._id,
      order: created,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create order", error: error.message });
  }
};

// GET /api/orders/id/:orderId
exports.getOrderById = async (req, res) => {
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
exports.listOrders = async (req, res) => {
  try {
    const { email, userId } = req.query;
    const filter = {};
    if (typeof email === "string" && email.trim() !== "") filter.email = email.trim();
    if (typeof userId === "string" && userId.trim() !== "") filter.userId = Number(userId);

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: "Failed to list orders", error: error.message });
  }
};

// GET /api/orders/:userId (legacy)
exports.getOrderHistory = async (req, res) => {
  const userId = Number(req.params.userId);
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ message: "userId must be a number" });
  }

  try {
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load order history", error: error.message });
  }
};
