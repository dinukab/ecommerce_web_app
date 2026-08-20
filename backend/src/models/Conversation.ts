import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    storeId: {
      type: String,
      required: true,
      default: 'STORE-2025-001'
    },
    customerName: {
      type: String,
      required: true
    },
    customerEmail: {
      type: String,
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'pending'],
      default: 'open'
    },
    lastMessage: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

export default mongoose.model('Conversation', conversationSchema);
