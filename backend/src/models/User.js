import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'cashier', 'customer'], default: 'customer' },
  storeId: { type: String, default: 'STORE-2025-001' }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
export default User;
