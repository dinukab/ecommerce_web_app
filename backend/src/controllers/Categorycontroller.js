import Category from '../models/Category.js';
import Product from '../models/Product.js';

// Generate a URL-safe slug from a category name
const toSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// GET /api/categories
// Returns all categories with dynamically computed productCount
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();

    // Compute product count and ensure slug exists for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({
          category: { $regex: new RegExp(`^${cat.name}$`, 'i') },
        });
        // Ensure every category has a slug (for DB entries created without one)
        const slug = cat.slug || toSlug(cat.name);
        return { ...cat, slug, productCount: count };
      })
    );

    res.json({ success: true, data: categoriesWithCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/categories/:slug
export const getCategoryBySlug = async (req, res) => {
  try {
    const reqSlug = req.params.slug;

    // Try finding by slug field first, then fall back to matching computed slug from name
    let category = await Category.findOne({ slug: reqSlug }).lean();
    if (!category) {
      // Fall back: find any category whose name produces the same slug
      const all = await Category.find().lean();
      category = all.find((c) => toSlug(c.name) === reqSlug) || null;
    }

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const slug = category.slug || toSlug(category.name);

    // Attach dynamic product count
    const productCount = await Product.countDocuments({
      category: { $regex: new RegExp(`^${category.name}$`, 'i') },
    });

    res.json({ success: true, data: { ...category, slug, productCount } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
