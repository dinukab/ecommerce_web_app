import Cart from "../models/Cart.js";

// Add a single item to the cart
export const addToCart = async (req, res) => {
  try {
    const userId    = String(req.body?.userId ?? req.body?.user ?? '');
    const productId = String(req.body?.productId ?? req.body?.product ?? '');
    const quantity  = Number(req.body?.quantity ?? 1);

    if (!userId || !productId) {
      return res.status(400).json({
        error: "Invalid request body",
        expected: { userId: "string", productId: "string", quantity: 1 },
      });
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return res.status(400).json({ error: "quantity must be a positive number" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [{ product: productId, quantity }] });
    } else {
      const itemIndex = cart.items.findIndex((item) => item.product === productId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }
    }

    await cart.save();
    res.json({ message: "Product added to cart", cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Sync (replace) entire cart — called when customer clicks "Proceed to Checkout"
export const syncCart = async (req, res) => {
  try {
    const userId = String(req.body?.userId ?? '');
    const items  = req.body?.items;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const cartItems = (Array.isArray(items) ? items : []).map((item) => ({
      product:  String(item.productId),
      quantity: Number(item.quantity) || 1,
    }));

    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { items: cartItems } },
      { upsert: true, new: true }
    );

    res.json({ message: "Cart synced successfully", cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};