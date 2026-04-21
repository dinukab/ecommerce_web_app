import Product from '../models/Product.js';
import Category from '../models/Category.js';

const toSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// GET /api/products?category=slug&page=1&limit=20&sort=name&search=
export const getProducts = async (req, res) => {
  try {
    const {
      category,
      page = 1,
      limit = 20,
      sort = 'name',
      search = '',
      storeId = 'STORE-2025-001',
    } = req.query;

    const filter = { storeId };

    if (category) {
      // Try finding by slug field first, then fall back to name-derived slug
      let categoryDoc = await Category.findOne({ slug: category, storeId }).lean();
      if (!categoryDoc) {
        const all = await Category.find({ storeId }).lean();
        categoryDoc = all.find((c) => toSlug(c.name) === category) || null;
      }

      if (categoryDoc) {
        filter.category = { $regex: new RegExp(`^${categoryDoc.name}$`, 'i') };
      } else {
        return res.json({
          success: true,
          data: [],
          pagination: { total: 0, page: Number(page), limit: Number(limit), totalPages: 0 },
        });
      }
    }

    if (search) {
      filter.$or = [
        { name: { $regex: new RegExp(search, 'i') } },
        { category: { $regex: new RegExp(search, 'i') } },
        { brand: { $regex: new RegExp(search, 'i') } },
      ];
    }

    const sortMap = {
      name: { name: 1 },
      'price-asc': { sellingPrice: 1 },
      'price-desc': { sellingPrice: -1 },
      newest: { createdAt: -1 },
      rating: { rating: -1 },
    };
    const sortQuery = sortMap[sort] || { name: 1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sortQuery)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

