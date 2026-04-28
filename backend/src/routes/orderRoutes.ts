import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  trackOrder,
  payhereNotify,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/track/:trackingNumber', trackOrder);
router.get('/:id', protect, getOrderById);
router.post('/payhere-notify', payhereNotify);
router.put('/:id/status', protect, admin, updateOrderStatus);

export default router;
