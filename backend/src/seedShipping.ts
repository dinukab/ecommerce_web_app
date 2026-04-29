import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ShippingInfo from './models/shippingInfo.js';
import connectDB from './config/database.js';

dotenv.config();

const shippingData = [
  {
    title: 'Standard Shipping',
    description: 'Our most popular shipping option for everyday orders.',
    category: 'Shipping Options',
    type: 'info',
    metadata: {
      shippingCost: 500,
      deliveryDays: '3-5 Business Days',
      availability: 'Islandwide'
    },
    order: 1
  },
  {
    title: 'Express Delivery',
    description: 'Need it fast? Choose express delivery at checkout.',
    category: 'Shipping Options',
    type: 'info',
    metadata: {
      shippingCost: 1200,
      deliveryDays: '1-2 Business Days',
      availability: 'Major Cities Only'
    },
    order: 2
  },
  {
    title: 'Western Province',
    description: 'Fast delivery across all districts in Western Province.',
    category: 'Delivery Areas',
    type: 'info',
    metadata: {
      deliveryDays: '1-3 Days',
      regions: ['Colombo', 'Gampaha', 'Kalutara']
    },
    order: 3
  },
  {
    title: 'Shipping to Central Province',
    description: 'Reliable shipping to Kandy and surrounding areas.',
    category: 'Delivery Areas',
    type: 'info',
    metadata: {
      deliveryDays: '3-5 Days',
      regions: ['Kandy', 'Matale', 'Nuwara Eliya']
    },
    order: 4
  },
  {
    title: 'Can I change my shipping address after ordering?',
    description: 'You can change your shipping address within 2 hours of placing your order.',
    category: 'Shipping FAQs',
    type: 'faq',
    content: {
      question: 'Can I change my shipping address after ordering?',
      answer: 'Yes, if the order has not been dispatched yet. Please contact support immediately or use the "Edit Order" button in your account dashboard within 2 hours of purchase.'
    },
    order: 5
  }
];

const seedShipping = async () => {
  try {
    await connectDB();

    // Clear existing data
    await ShippingInfo.deleteMany({});
    console.log('🗑️ Cleared existing shipping info');

    // Insert sample data
    await ShippingInfo.insertMany(shippingData);
    console.log('✅ Shipping info seeded successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding shipping info:', error);
    process.exit(1);
  }
};

seedShipping();
