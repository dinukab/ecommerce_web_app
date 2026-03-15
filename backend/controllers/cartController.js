let cart = [];

// GET /api/cart
exports.getCart = (req, res) => {
  res.json(cart);
};

// POST /api/cart/add
exports.addToCart = (req, res) => {
  const { productId, quantity } = req.body;

  const existing = cart.find(item => item.productId === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }

  res.json(cart);
};

// DELETE /api/cart/remove/:id
exports.removeFromCart = (req, res) => {
  cart = cart.filter(item => item.productId !== Number(req.params.id));
  res.json(cart);
};
