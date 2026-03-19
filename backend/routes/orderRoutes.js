const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

router.get("/:userId", orderController.getOrderHistory);

module.exports = router;
