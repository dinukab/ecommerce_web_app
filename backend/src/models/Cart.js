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

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: Number,
      required: true,
      index: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);