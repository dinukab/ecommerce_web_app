import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

/**
 * GET /api/products/recommendations
 * Analyzes logged-in user's previous orders to find top purchased categories.
 * Returns strictly 5 product recommendations based on top categories,
 * with fallbacks to cart categories or top-rated products for guests / new users.
 * STRICTLY READ-ONLY (No database mutations).
 */
export const getCartRecommendations = async (req: any, res: Response) => {
  try {
    const excludeStr = req.query.exclude ? String(req.query.exclude) : '';
    const cartCatStr = req.query.cartCategories ? String(req.query.cartCategories) : '';

    const excludeIds = excludeStr
      ? excludeStr.split(',').map(id => id.trim()).filter(id => mongoose.Types.ObjectId.isValid(id))
      : [];

    const cartCategories = cartCatStr
      ? cartCatStr.split(',').map(c => c.trim()).filter(Boolean)
      : [];

    const recommendedProducts: any[] = [];
    const recommendedIds = new Set<string>(excludeIds);

    // 1. Analyze previous order history if user is authenticated
    let userTopCategories: string[] = [];
    if (req.user && req.user._id) {
      const userOrders = await Order.find({ user: req.user._id }).lean();
      
      if (userOrders && userOrders.length > 0) {
        // Collect all product IDs from order items
        const purchasedProductIds: string[] = [];
        const quantityMap: { [productId: string]: number } = {};

        for (const order of userOrders) {
          const items = order.orderItems || order.items || [];
          for (const item of items) {
            if (item && item.product) {
              const pid = item.product.toString();
              purchasedProductIds.push(pid);
              quantityMap[pid] = (quantityMap[pid] || 0) + (item.quantity || 1);
            }
          }
        }

        if (purchasedProductIds.length > 0) {
          // Fetch product categories for the purchased products
          const purchasedProducts = await Product.find({
            _id: { $in: purchasedProductIds.map(id => new mongoose.Types.ObjectId(id)) }
          }).select('_id category').lean();

          // Tally total quantity purchased per category
          const categoryTally: { [category: string]: number } = {};
          for (const prod of purchasedProducts) {
            if (prod.category) {
              const catName = prod.category.trim();
              const qty = quantityMap[prod._id.toString()] || 1;
              categoryTally[catName] = (categoryTally[catName] || 0) + qty;
            }
          }

          // Sort categories by total quantity purchased descending
          userTopCategories = Object.keys(categoryTally).sort(
            (a, b) => categoryTally[b] - categoryTally[a]
          );
        }
      }
    }

    // 2. Fetch products from user's top purchased categories
    if (userTopCategories.length > 0) {
      for (const category of userTopCategories) {
        if (recommendedProducts.length >= 5) break;

        const limitNeeded = 5 - recommendedProducts.length;
        const productsFromCat = await Product.find({
          category: { $regex: new RegExp(`^${category.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') },
          _id: { $nin: Array.from(recommendedIds).map(id => new mongoose.Types.ObjectId(id)) }
        })
          .sort({ rating: -1, createdAt: -1 })
          .limit(limitNeeded)
          .lean();

        for (const p of productsFromCat) {
          recommendedProducts.push(p);
          recommendedIds.add(p._id.toString());
        }
      }
    }

    // 3. Fallback 1: Products matching current cart categories (if < 5 products)
    if (recommendedProducts.length < 5 && cartCategories.length > 0) {
      for (const category of cartCategories) {
        if (recommendedProducts.length >= 5) break;

        const limitNeeded = 5 - recommendedProducts.length;
        const productsFromCartCat = await Product.find({
          category: { $regex: new RegExp(`^${category.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') },
          _id: { $nin: Array.from(recommendedIds).map(id => new mongoose.Types.ObjectId(id)) }
        })
          .sort({ rating: -1, createdAt: -1 })
          .limit(limitNeeded)
          .lean();

        for (const p of productsFromCartCat) {
          recommendedProducts.push(p);
          recommendedIds.add(p._id.toString());
        }
      }
    }

    // 4. Fallback 2: General top-rated / featured products (if still < 5 products)
    if (recommendedProducts.length < 5) {
      const limitNeeded = 5 - recommendedProducts.length;
      const fallbackProducts = await Product.find({
        _id: { $nin: Array.from(recommendedIds).map(id => new mongoose.Types.ObjectId(id)) }
      })
        .sort({ rating: -1, numReviews: -1, createdAt: -1 })
        .limit(limitNeeded)
        .lean();

      for (const p of fallbackProducts) {
        recommendedProducts.push(p);
        recommendedIds.add(p._id.toString());
      }
    }

    // Cap strictly at 5 products
    const finalRecommendations = recommendedProducts.slice(0, 5);

    return res.status(200).json({
      success: true,
      data: finalRecommendations
    });
  } catch (err: any) {
    console.error('Error fetching cart recommendations:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Error fetching recommendations'
    });
  }
};
