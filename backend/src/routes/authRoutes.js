import express from 'express';
import { registerUser, loginUser, getMe, updateAvatar } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/avatar', protect, updateAvatar);

export default router;