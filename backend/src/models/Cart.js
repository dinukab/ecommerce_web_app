import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  products: [
    {
      productId: String,
      quantity: Number,
    },
  ],
});

export default mongoose.model("Cart", cartSchema);