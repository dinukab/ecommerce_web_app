import express from 'express';
const router = express.Router();
import ContactMessage from '../src/models/contactMessage.js';

// @route   POST /api/contact
// @desc    Create a new contact message
// @access  Public
router.post('/', async (req: any, res: any) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Create new contact message
    const contactMessage = new ContactMessage({
      name,
      email,
      subject,
      message
    });

    // Save to database
    await contactMessage.save();

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon!',
      data: contactMessage
    });
  } catch (error: any) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error submitting contact form'
    });
  }
});

// @route   GET /api/contact
// @desc    Get all contact messages (Admin only)
// @access  Private
router.get('/', async (req: any, res: any) => {
  try {
    // Add authentication middleware here in production
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/contact/:id
// @desc    Get a specific contact message (Admin only)
// @access  Private
router.get('/:id', async (req: any, res: any) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    // Mark as read
    message.status = 'read';
    await message.save();

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PATCH /api/contact/:id
// @desc    Update contact message status (Admin only)
// @access  Private
router.patch('/:id', async (req: any, res: any) => {
  try {
    const { status, adminNotes } = req.body;

    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes },
      { new: true, runValidators: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message updated successfully',
      data: message
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/contact/:id
// @desc    Delete a contact message (Admin only)
// @access  Private
router.delete('/:id', async (req: any, res: any) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact message deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
