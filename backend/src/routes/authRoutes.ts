import express from 'express';
import { registerUser, loginUser, getMe, updateAvatar, addAddress, removeAddress, updateAddress, addPaymentMethod, removePaymentMethod, updateProfile, forgotPassword, resetPassword, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
} from '../middleware/validationSchemas.js';

const router = express.Router();

router.post('/register',        validateRequest(registerSchema),       registerUser);
router.post('/login',           validateRequest(loginSchema),          loginUser);
router.get('/me',               protect,                               getMe);
router.put('/avatar',           protect,                               updateAvatar);
router.put('/profile',          protect, validateRequest(updateProfileSchema), updateProfile);
router.post('/address',         protect,                               addAddress);
router.put('/address/:id',      protect,                               updateAddress);
router.delete('/address/:id',   protect,                               removeAddress);
router.post('/payment-method',  protect,                               addPaymentMethod);
router.delete('/payment-method/:id', protect,                          removePaymentMethod);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password',                                         resetPassword);
router.put('/password',         protect, validateRequest(changePasswordSchema), changePassword);

export default router;
