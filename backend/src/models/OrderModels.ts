const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Optional user reference (current frontend uses email only)
  userId: { type: Number, index: true },

  // 1. Contact Information
  email: { type: String, required: true },

  // 2. Shipping Address
  shippingAddress: {
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    building: { type: String, required: true }, // Building No./House No.
    colony: { type: String },                   // Colony/Suburb/Landmark
    province: { type: String, required: true },
    district: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true }
  },

  // 3. Order Summary
  pricing: {
    subtotal: { type: Number, required: true },
    shippingEstimate: { type: Number, required: true },
    orderTotal: { type: Number, required: true }
  },

  // 4. Payment Information (SAFE DATA ONLY)
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Paid', 'Failed'], 
    default: 'Pending' 
  },
  transactionId: { type: String }, // You get this from Stripe/PayHere later

  // 5. Cart Items (Connecting what they bought)
  items: [{
    // Frontend currently uses string IDs like "005"; keep flexible.
    productId: { type: String, required: true },
    name: { type: String, required: true },
    details: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 }
  }],

  // 6. System Data
  origin: { type: String, default: 'ECOMMERCE' }, // Useful since OneShop also has a POS
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);