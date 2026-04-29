import mongoose from 'mongoose';

const storeSettingsSchema = new mongoose.Schema({
  storeName: { type: String, default: 'OneShop' },
  storeId: { type: String, default: 'STORE-2025-001', unique: true },
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  currency: { type: String, default: 'LKR' }
}, { timestamps: true, collection: 'storesettings' });

export const StoreSettings = mongoose.model('StoreSettings', storeSettingsSchema);
export default StoreSettings;
