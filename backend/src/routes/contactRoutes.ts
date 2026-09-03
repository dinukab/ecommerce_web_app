import express, { Request, Response } from 'express';
import ContactMessage from '../models/contactMessage.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import sendEmail from '../utils/sendEmail.js';

const router = express.Router();

// @route   POST /api/contact
// @desc    Create a new contact message
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Create new contact message (legacy)
    const contactMessage = new ContactMessage({
      name,
      email,
      subject,
      message
    });
    await contactMessage.save();

    // ── Send Email Notification to cipheroneshop1234@gmail.com ──
    try {
      await sendEmail({
        email: 'cipheroneshop1234@gmail.com',
        replyTo: email,
        subject: `[Contact Form] ${subject} - from ${name}`,
        message: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
            <h2 style="color: #2b6cb0; border-bottom: 2px solid #3182ce; padding-bottom: 8px; margin-top: 0;">New Contact Inquiry Received</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; width: 100px; color: #4a5568;">From:</td>
                <td style="padding: 6px 0; color: #1a202c;">${name} (&lt;<a href="mailto:${email}" style="color: #3182ce;">${email}</a>&gt;)</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #4a5568;">Subject:</td>
                <td style="padding: 6px 0; color: #1a202c;">${subject}</td>
              </tr>
            </table>
            <div style="background-color: #f7fafc; padding: 16px; border-left: 4px solid #3182ce; border-radius: 4px; margin-bottom: 16px;">
              <p style="margin: 0; white-space: pre-wrap; color: #2d3748; line-height: 1.5;">${message}</p>
            </div>
            <p style="font-size: 12px; color: #718096; margin: 0;">
              💡 <em>You can click 'Reply' directly in your email client to respond to ${name} (${email}).</em>
            </p>
          </div>
        `
      });
      console.log(`📧 Contact form notification email sent to cipheroneshop1234@gmail.com for inquiry by ${email}`);
    } catch (emailError) {
      console.error('Failed to send contact notification email:', emailError);
    }

    // ── Save to Conversation & Message collections for POS Message Center ──
    try {
      let conversation = await Conversation.findOne({
        customerEmail: email.toLowerCase(),
        status: { $ne: 'closed' }
      });

      if (!conversation) {
        conversation = new Conversation({
          customerName: name,
          customerEmail: email.toLowerCase(),
          subject: subject,
          lastMessage: message,
          status: 'open'
        });
        await conversation.save();
      } else {
        conversation.lastMessage = message;
        // Mark as updatedAt so it bubbles up in inbox
        conversation.set('updatedAt', new Date());
        await conversation.save();
      }

      const messageDoc = new Message({
        conversationId: conversation._id,
        sender: 'customer',
        senderName: name,
        text: message
      });
      await messageDoc.save();
    } catch (posError) {
      console.error('POS sync error in contact route (non-fatal):', posError);
    }

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
router.get('/', async (req, res) => {
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
router.get('/:id', async (req, res) => {
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
router.patch('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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
