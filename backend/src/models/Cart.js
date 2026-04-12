import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
});

export default mongoose.model("Cart", cartSchema);