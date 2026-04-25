import express from 'express';
import ShippingInfo from '../models/shippingInfo.js';

const router = express.Router();

// @route   GET /api/shipping-info
// @desc    Get all shipping information (with filtering)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, type } = req.query;
    let query = { isActive: true };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by type
    if (type) {
      query.type = type;
    }

    const shippingInfo = await ShippingInfo.find(query).sort({
      category: 1,
      order: 1,
      createdAt: -1
    });

    res.status(200).json({
      success: true,
      count: shippingInfo.length,
      data: shippingInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching shipping information'
    });
  }
});

// @route   GET /api/shipping-info/categories
// @desc    Get all shipping info categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      'Shipping Options',
      'Delivery Areas',
      'Form Fields',
      'Shipping FAQs',
      'Shipping Policy',
      'Other'
    ];

    // Get count for each category
    const categoryCounts = await Promise.all(
      categories.map(async (cat) => ({
        name: cat,
        count: await ShippingInfo.countDocuments({
          category: cat,
          isActive: true
        })
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

// @route   GET /api/shipping-info/:id
// @desc    Get single shipping info by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const shippingInfo = await ShippingInfo.findById(req.params.id);

    if (!shippingInfo) {
      return res.status(404).json({
        success: false,
        message: 'Shipping information not found'
      });
    }

    res.status(200).json({
      success: true,
      data: shippingInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ===== ADMIN ROUTES (Add authentication middleware) =====

// @route   POST /api/shipping-info
// @desc    Create new shipping info (Admin only)
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { title, description, category, type, content, metadata, order } =
      req.body;

    // Validation
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and category'
      });
    }

    const shippingInfo = new ShippingInfo({
      title,
      description,
      category,
      type,
      content,
      metadata,
      order: order || 0
    });

    await shippingInfo.save();

    res.status(201).json({
      success: true,
      message: 'Shipping information created successfully',
      data: shippingInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PATCH /api/shipping-info/:id
// @desc    Update shipping info (Admin only)
// @access  Private
router.patch('/:id', async (req, res) => {
  try {
    const { title, description, category, type, content, metadata, order, isActive } =
      req.body;

    const shippingInfo = await ShippingInfo.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        category,
        type,
        content,
        metadata,
        order,
        isActive
      },
      { new: true, runValidators: true }
    );

    if (!shippingInfo) {
      return res.status(404).json({
        success: false,
        message: 'Shipping information not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Shipping information updated successfully',
      data: shippingInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/shipping-info/:id
// @desc    Delete shipping info (Admin only)
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const shippingInfo = await ShippingInfo.findByIdAndDelete(req.params.id);

    if (!shippingInfo) {
      return res.status(404).json({
        success: false,
        message: 'Shipping information not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Shipping information deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
