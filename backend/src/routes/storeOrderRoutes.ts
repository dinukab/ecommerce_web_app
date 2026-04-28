import express from 'express';
import {
  createStoreOrder,
  getStoreOrders,
  getStoreOrderById,
  updateStoreOrderStatus,
} from '../controllers/storeOrderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / staff endpoints
router.post('/',    createStoreOrder);              // POST  /api/store-orders
router.get('/',     protect, admin, getStoreOrders);          // GET   /api/store-orders
router.get('/:id',  protect, admin, getStoreOrderById);       // GET   /api/store-orders/:id
router.put('/:id/status', protect, admin, updateStoreOrderStatus); // PUT /api/store-orders/:id/status

export default router;
