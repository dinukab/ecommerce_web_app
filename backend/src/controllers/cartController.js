import Cart from "../models/Cart.js";

export const addToCart = async (req, res) => {
  try {
    const userIdRaw = req.body?.userId ?? req.body?.user;
    const productIdRaw = req.body?.productId ?? req.body?.product;
    const quantityRaw = req.body?.quantity;

    const userId = Number(userIdRaw);
    const productId = Number(productIdRaw);
    const quantity = quantityRaw === undefined ? 1 : Number(quantityRaw);

    if (!Number.isFinite(userId) || !Number.isFinite(productId)) {
      return res.status(400).json({
        error: "Invalid request body",
        expected: {
          userId: 1,
          productId: 1,
          quantity: 1,
        },
      });
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return res.status(400).json({ error: "quantity must be a positive number" });
    }

    let cart = await Cart.findOne({ user: userId });

    // If cart doesn't exist → create new
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [{ product: productId, quantity }],
      });
    } else {
      // Check if product already in cart
      const itemIndex = cart.items.findIndex(
        (item) => item.product === productId
      );

      if (itemIndex > -1) {
        // product exists → increase quantity
        cart.items[itemIndex].quantity += quantity;
      } else {
        // new product → add
        cart.items.push({ product: productId, quantity });
      }
    }

    await cart.save();

    res.json({ message: "Product added to cart", cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addToCart };