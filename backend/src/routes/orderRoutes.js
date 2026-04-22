import express from 'express';
import { createOrder, getOrderHistory } from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/myorders', protect, getOrderHistory);

export default router;
