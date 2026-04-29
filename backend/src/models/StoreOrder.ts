import mongoose from 'mongoose';

// ─── Item sub-schema ──────────────────────────────────────────────────────────
const storeOrderItemSchema = new mongoose.Schema(
  {
    productId: { type: String },                          // optional product ref (string or ObjectId)
    name:      { type: String, required: true },
    quantity:  { type: Number, required: true, min: 1 },
    price:     { type: Number, required: true, min: 0 },
    image:     { type: String },
  },
  { _id: false }
);

// ─── Main schema ──────────────────────────────────────────────────────────────
const storeOrderSchema = new mongoose.Schema(
  {
    // Human-readable order ID (e.g. "ORD-IO2HCE")
    orderId: {
      type:   String,
      unique: true,
    },

    // Origin of the order: "physical" (POS) | "online"
    source: {
      type:    String,
      enum:    ['physical', 'online'],
      default: 'physical',
    },

    // Walk-in customer name (no account required)
    customerName: {
      type:     String,
      required: true,
      trim:     true,
    },

    // Line items
    items: {
      type:     [storeOrderItemSchema],
      required: true,
    },

    // Pricing
    subtotal: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    total:    { type: Number, required: true, default: 0 },

    // Fulfilment status
    status: {
      type:    String,
      enum:    ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'confirmed',
    },

    // Payment
    paymentMethod: {
      type:     String,
      required: true,
    },
    paymentStatus: {
      type:    String,
      enum:    ['pending', 'paid', 'failed'],
      default: 'pending',
    },

    // Store & operator references
    storeId:   { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },

    // Tracking number
    trackingNumber: { type: String, unique: true },
  },
  { timestamps: true }
);

// ─── Auto-generate orderId and trackingNumber before saving ──────────────────
storeOrderSchema.pre('save', function (next) {
  if (!this.orderId) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const suffix = Array.from({ length: 6 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
    this.orderId = `ORD-${suffix}`;
  }

  if (!this.trackingNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.trackingNumber = `ST${timestamp}${random}`;
  }
  next();
});

export default mongoose.model('StoreOrder', storeOrderSchema);
