import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name:     { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price:    { type: Number, required: true, min: 0 },
    image:    { type: String },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    
    // New fields requested for database alignment
    orderId:      { type: String, unique: true },
    customerName: { type: String },
    items:        { type: [orderItemSchema] },
    subtotal:     { type: Number, default: 0 },
    total:        { type: Number, default: 0 },
    status:       { type: String, default: 'pending' },

    // Existing fields kept for compatibility
    orderItems: { type: [orderItemSchema], required: true },
    shippingAddress: {
      fullName:     { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city:         { type: String, required: true },
      district:     { type: String, required: true },
      postalCode:   { type: String, required: true },
      phone:        { type: String, required: true },
    },
    deliveryZone: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryZone' },
    deliveryMethod: { 
      type: String, 
      enum: ['standard', 'express', 'pickup'], 
      default: 'standard' 
    },
    paymentMethod: { 
      type: String, 
      enum: ['cash-on-delivery', 'bank-transfer', 'payhere'], 
      required: true 
    },
    paymentStatus: { 
      type: String, 
      enum: ['pending', 'paid', 'declined'], 
      default: 'pending' 
    },
    itemsPrice:  { type: Number, required: true, default: 0 },
    deliveryFee: { type: Number, required: true, default: 0 },
    totalPrice:  { type: Number, required: true, default: 0 },
    orderStatus: { 
      type: String, 
      enum: ['processing', 'delivered', 'cancelled'], 
      default: 'processing' 
    },
    trackingNumber: { type: String, unique: true },
    estimatedDeliveryDate: { type: Date },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    cancelReason: { type: String },
    orderNotes:   { type: String },
    storeId:      { type: String, required: true, default: '69e539fd180ff885ce56ca57' },
    storeName:    { type: String, default: 'Open Door' },
  },
  { timestamps: true }
);

// Auto-generate orderId and tracking number before saving
orderSchema.pre('save', function (next) {
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
    this.trackingNumber = `OS${timestamp}${random}`;
  }
  next();
});

export const Order = mongoose.model('Order', orderSchema);
export default Order;
