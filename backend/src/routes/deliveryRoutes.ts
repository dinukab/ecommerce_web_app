import express from 'express';
import { 
  getDeliveryZones, 
  calculateDeliveryFee, 
  createDeliveryZone 
} from '../controllers/deliveryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/zones', getDeliveryZones);
router.post('/calculate', calculateDeliveryFee);
router.post('/zones', protect, admin, createDeliveryZone);

export default router;
