import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FAQ from './models/faq.js';
import connectDB from './config/database.js';

dotenv.config();

const faqs = [
  {
    question: 'How long does shipping take?',
    answer: 'Standard shipping usually takes 3-5 business days. Express shipping options are available at checkout and take 1-2 business days.',
    category: 'Shipping',
    order: 1
  },
  {
    question: 'What is your return policy?',
    answer: 'We offer a 30-day money-back guarantee on all products. Items must be returned in their original packaging and condition.',
    category: 'Returns',
    order: 2
  },
  {
    question: 'Do you ship internationally?',
    answer: 'Yes, we currently ship to over 50 countries worldwide. Shipping costs and delivery times vary by location.',
    category: 'Shipping',
    order: 3
  },
  {
    question: 'How can I track my order?',
    answer: 'Once your order is shipped, you will receive an email with a tracking number and a link to track your package.',
    category: 'Orders',
    order: 4
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and Apple Pay.',
    category: 'Payment',
    order: 5
  },
  {
    question: 'Is my personal information secure?',
    answer: 'Absolutely. We use industry-standard 256-bit SSL encryption to protect your data during checkout and account management.',
    category: 'Account',
    order: 6
  }
];

const seedFAQs = async () => {
  try {
    await connectDB();

    // Clear existing FAQs
    await FAQ.deleteMany({});
    console.log('🗑️ Cleared existing FAQs');

    // Insert sample FAQs
    await FAQ.insertMany(faqs);
    console.log('✅ Sample FAQs inserted successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding FAQs:', error);
    process.exit(1);
  }
};

seedFAQs();
