import express from 'express';
import { registerUser, loginUser, getMe, updateAvatar, addAddress, removeAddress, updateAddress, addPaymentMethod, removePaymentMethod, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/avatar', protect, updateAvatar);
router.put('/profile', protect, updateProfile);
router.post('/address', protect, addAddress);
router.put('/address/:id', protect, updateAddress);
router.delete('/address/:id', protect, removeAddress);
router.post('/payment-method', protect, addPaymentMethod);
router.delete('/payment-method/:id', protect, removePaymentMethod);

export default router;
