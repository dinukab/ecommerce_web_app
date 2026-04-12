import express from 'express';
import { getProducts, getProductById, getFeaturedProducts, getProductReviews, createProductReview, } from '../controllers/productController.js';
const router = express.Router();
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProductById);
router.get('/:id/reviews', getProductReviews);
router.post('/:id/reviews', createProductReview);
export default router;
