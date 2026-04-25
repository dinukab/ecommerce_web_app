import express from 'express';
import FAQ from '../models/faq.js';

const router = express.Router();

// @route   GET /api/faqs
// @desc    Get all FAQs (with filtering and sorting)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    let query = { isActive: true };

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await FAQ.countDocuments(query);

    // Get FAQs with sorting
    const faqs = await FAQ.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: faqs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: faqs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching FAQs'
    });
  }
});

// @route   GET /api/faqs/categories
// @desc    Get all FAQ categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      'General',
      'Shipping',
      'Returns',
      'Payment',
      'Account',
      'Products',
      'Orders',
      'Technical'
    ];

    // Get count for each category
    const categoryCounts = await Promise.all(
      categories.map(async (cat) => ({
        name: cat,
        count: await FAQ.countDocuments({ category: cat, isActive: true })
      }))
    );

    res.status(200).json({
      success: true,
      data: categoryCounts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/faqs/:id
// @desc    Get single FAQ and increment views
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    res.status(200).json({
      success: true,
      data: faq
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/faqs/helpful/:id
// @desc    Mark FAQ as helpful
// @access  Public
router.post('/helpful/:id', async (req, res) => {
  try {
    const { helpful } = req.body; // true for helpful, false for not helpful

    const updateQuery = helpful
      ? { $inc: { helpful: 1 } }
      : { $inc: { notHelpful: 1 } };

    const faq = await FAQ.findByIdAndUpdate(req.params.id, updateQuery, {
      new: true
    });

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Thank you for your feedback!',
      data: faq
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ===== ADMIN ROUTES (Add authentication middleware) =====

// @route   POST /api/faqs
// @desc    Create new FAQ (Admin only)
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { question, answer, category, order } = req.body;

    // Validation
    if (!question || !answer || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide question, answer, and category'
      });
    }

    const faq = new FAQ({
      question,
      answer,
      category,
      order: order || 0
    });

    await faq.save();

    res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      data: faq
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PATCH /api/faqs/:id
// @desc    Update FAQ (Admin only)
// @access  Private
router.patch('/:id', async (req, res) => {
  try {
    const { question, answer, category, order, isActive } = req.body;

    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { question, answer, category, order, isActive },
      { new: true, runValidators: true }
    );

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'FAQ updated successfully',
      data: faq
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/faqs/:id
// @desc    Delete FAQ (Admin only)
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'FAQ deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
