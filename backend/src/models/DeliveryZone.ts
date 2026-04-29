import mongoose from 'mongoose';

const deliveryZoneSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true, trim: true },
    districts:     { type: [String], required: true }, // Array of strings for districts in this zone
    deliveryFee:   { type: Number, required: true, min: 0 },
    estimatedDays: { type: Number, required: true, min: 1 },
    isActive:      { type: Boolean, default: true },
    storeId:       { type: String, required: true, default: 'STORE-2025-001' },
  },
  { 
    timestamps: true,
    collection: 'deliveryzones'
  }
);

export default mongoose.model('DeliveryZone', deliveryZoneSchema);
