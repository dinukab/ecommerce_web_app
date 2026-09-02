import express from 'express';
import { getProducts, getProductById } from '../controllers/productController.js';
import { getCartRecommendations } from '../controllers/recommendationController.js';
import { protectOptional } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/recommendations', protectOptional, getCartRecommendations);
router.get('/:id', getProductById);

export default router;