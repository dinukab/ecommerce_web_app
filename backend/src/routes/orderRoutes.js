const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// Create order from checkout (stores shippingAddress + totals + items)
router.post("/checkout", orderController.createCheckoutOrder);
// Alias: allow POST /api/orders as well
router.post("/", orderController.createCheckoutOrder);

// Query orders (optional filters via query string)
router.get("/", orderController.listOrders);

// Fetch single order by Mongo id
router.get("/id/:orderId", orderController.getOrderById);

// Legacy: GET /api/orders/:userId
router.get("/:userId", orderController.getOrderHistory);

module.exports = router;
