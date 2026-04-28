import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Please provide a question'],
      trim: true,
      maxlength: [500, 'Question cannot be longer than 500 characters']
    },
    answer: {
      type: String,
      required: [true, 'Please provide an answer'],
      trim: true,
      maxlength: [5000, 'Answer cannot be longer than 5000 characters']
    },
    category: {
      type: String,
      required: [true, 'Please specify a category'],
      enum: [
        'General',
        'Shipping',
        'Returns',
        'Payment',
        'Account',
        'Products',
        'Orders',
        'Technical'
      ],
      default: 'General'
    },
    order: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    views: {
      type: Number,
      default: 0
    },
    helpful: {
      type: Number,
      default: 0
    },
    notHelpful: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Index for faster queries
faqSchema.index({ category: 1, isActive: 1 });
faqSchema.index({ question: 'text', answer: 'text' });

export default mongoose.model('FAQ', faqSchema);