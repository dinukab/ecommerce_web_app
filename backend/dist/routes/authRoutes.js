import express from 'express';
import { register, login, getMe, updateProfile, changePassword, updateAvatar, // Add this import
 } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
const router = express.Router();
// Public routes
router.post('/register', register);
router.post('/login', login);
// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.put('/avatar', protect, updateAvatar); // Add this route
export default router;
