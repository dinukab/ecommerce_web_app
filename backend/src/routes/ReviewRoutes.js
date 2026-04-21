import express from 'express';
import { getProductReviews, createReview } from '../controllers/ReviewController.js';

const router = express.Router();

router.get('/:productId', getProductReviews);
router.post('/:productId', createReview);

export default router;
