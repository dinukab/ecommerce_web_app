import { Request, Response } from 'express';
import Review from '../models/Review.js';
import Product from '../models/Product.js';

export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createReview = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { user, rating, title, text } = req.body;

    const review = await Review.create({
      product: productId,
      user,
      rating,
      title,
      text
    });

    // Update product average rating & review count
    const reviews = await Review.find({ product: productId });
    const avgRating = reviews.length > 0 
      ? Number((reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length).toFixed(1))
      : 5;
    
    await Product.findByIdAndUpdate(productId, {
      rating: avgRating,
      numReviews: reviews.length
    });

    res.status(201).json({ success: true, data: review });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
