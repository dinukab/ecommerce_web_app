import type { Request, Response } from 'express';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import Category from '../models/Category.js';

// @desc    Get all products with filtering, sorting, and pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};

    // Category filter
    if (req.query.category) {
      const category = await Category.findOne({ slug: req.query.category });
      if (category) {
        filter.category = category._id;
      }
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) {
        filter.price.$gte = parseFloat(req.query.minPrice as string);
      }
      if (req.query.maxPrice) {
        filter.price.$lte = parseFloat(req.query.maxPrice as string);
      }
    }

    // Rating filter
    if (req.query.minRating) {
      filter.rating = { $gte: parseFloat(req.query.minRating as string) };
    }

    // Search filter
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Badge filter
    if (req.query.badge) {
      filter.badge = req.query.badge;
    }

    // Sort
    let sort: any = { createdAt: -1 }; // Default: newest first
    if (req.query.sort === 'price-low') {
      sort = { price: 1 };
    } else if (req.query.sort === 'price-high') {
      sort = { price: -1 };
    } else if (req.query.sort === 'rating') {
      sort = { rating: -1 };
    } else if (req.query.sort === 'featured') {
      sort = { featured: -1, createdAt: -1 };
    }

    // Execute query
    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort(sort)
      .limit(limit)
      .skip(skip);

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: products,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message,
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Get reviews for this product
    const reviews = await Review.find({ product: product._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        product,
        reviews,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message,
    });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 8;

    const products = await Product.find({ featured: true })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching featured products',
      error: error.message,
    });
  }
};

// @desc    Get product reviews
// @route   GET /api/products/:id/reviews
// @access  Public
export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find({ product: req.params.id as string }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message,
    });
  }
};

// @desc    Create a product review
// @route   POST /api/products/:id/reviews
// @access  Public (should be protected in production)
export const createProductReview = async (req: Request, res: Response) => {
  try {
    const { rating, title, text, user } = req.body;

    const product = await Product.findById(req.params.id as string);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const review = await Review.create({
      product: req.params.id as string,
      user,
      rating,
      title,
      text,
    });

    // Update product rating and review count
    const reviews = await Review.find({ product: req.params.id as string });
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    product.rating = avgRating;
    product.numReviews = reviews.length;
    await product.save();

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error creating review',
      error: error.message,
    });
  }
};
