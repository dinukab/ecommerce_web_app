import mongoose from 'mongoose';

const storeSettingSchema = new mongoose.Schema({
  storeId: { type: String, required: true, unique: true },
  storeName: { type: String, required: true },
  currency: { type: String, required: true },
  currencyLocale: { type: String, required: true },
  address: { type: String },
  phone: { type: String },
  email: { type: String },
  logoUrl: { type: String },
  primaryColor: { type: String, default: '#0891b2' },
}, { 
  timestamps: true,
  collection: 'storesettings' // Explicitly use the collection name mentioned by the user
});

export default mongoose.model('StoreSetting', storeSettingSchema);
