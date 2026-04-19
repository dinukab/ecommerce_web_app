const orders = require("../data/orders");

// GET /api/orders/:userId
exports.getOrderHistory = (req, res) => {
  const userOrders = orders.filter(
    order => order.userId === Number(req.params.userId)
  );
  res.json(userOrders);
};
