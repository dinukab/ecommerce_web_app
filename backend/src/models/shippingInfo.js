import mongoose from 'mongoose';

const shippingInfoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [200, 'Title cannot be longer than 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      maxlength: [5000, 'Description cannot be longer than 5000 characters']
    },
    category: {
      type: String,
      required: [true, 'Please specify a category'],
      enum: [
        'Shipping Options',
        'Delivery Areas',
        'Form Fields',
        'Shipping FAQs',
        'Shipping Policy',
        'Other'
      ]
    },
    type: {
      type: String,
      enum: ['text', 'faq', 'policy', 'guide', 'info'],
      default: 'text'
    },
    content: {
      question: String, // For FAQ type
      answer: String,   // For FAQ type
      details: String   // For other types
    },
    metadata: {
      shippingCost: Number,
      deliveryDays: String,
      regions: [String],
      availability: String
    },
    order: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Index for faster queries
shippingInfoSchema.index({ category: 1, isActive: 1 });
shippingInfoSchema.index({ type: 1 });

export default mongoose.model('ShippingInfo', shippingInfoSchema);
