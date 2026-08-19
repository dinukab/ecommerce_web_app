import { Response } from 'express';
import type { TenantRequest } from '../types/index.js';

export const getProductReviews = async (req: TenantRequest, res: Response) => {
  try {
    const { Review, Product } = req.models!;

    const { productId } = req.params;
    const reviews = await Review.find({ product: productId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createReview = async (req: TenantRequest, res: Response) => {
  try {
    const { Review, Product } = req.models!;

    const { productId } = req.params;
    const { user, rating, title, text } = req.body;

    const review = await Review.create({
      product: productId,
      user,
      rating,
      title,
      text
    });

    // Optionally update product average rating
    const reviews = await Review.find({ product: productId });
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    
    await Product.findByIdAndUpdate(productId, {
      rating: avgRating,
      numReviews: reviews.length
    });

    res.status(201).json({ success: true, data: review });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
