import mongoose from 'mongoose';
import dotenv from 'dotenv';
import DeliveryZone from './models/DeliveryZone.js';
import connectDB from './config/database.js';

dotenv.config();

const zones = [
  {
    name: 'Colombo Metro',
    districts: ['Colombo', 'Dehiwala', 'Moratuwa', 'Kotte'],
    deliveryFee: 300,
    estimatedDays: 1,
    isActive: true
  },
  {
    name: 'Western Province',
    districts: ['Gampaha', 'Kalutara', 'Negombo'],
    deliveryFee: 450,
    estimatedDays: 2,
    isActive: true
  },
  {
    name: 'Central Province',
    districts: ['Kandy', 'Matale', 'Nuwara Eliya'],
    deliveryFee: 600,
    estimatedDays: 3,
    isActive: true
  },
  {
    name: 'Southern Province',
    districts: ['Galle', 'Matara', 'Hambantota'],
    deliveryFee: 550,
    estimatedDays: 3,
    isActive: true
  },
  {
    name: 'Northern Province',
    districts: ['Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu'],
    deliveryFee: 800,
    estimatedDays: 5,
    isActive: true
  },
  {
    name: 'Eastern Province',
    districts: ['Trincomalee', 'Batticaloa', 'Ampara'],
    deliveryFee: 750,
    estimatedDays: 4,
    isActive: true
  },
  {
    name: 'North Western Province',
    districts: ['Kurunegala', 'Puttalam'],
    deliveryFee: 650,
    estimatedDays: 3,
    isActive: true
  },
  {
    name: 'North Central Province',
    districts: ['Anuradhapura', 'Polonnaruwa'],
    deliveryFee: 700,
    estimatedDays: 4,
    isActive: true
  },
  {
    name: 'Uva Province',
    districts: ['Badulla', 'Monaragala'],
    deliveryFee: 700,
    estimatedDays: 4,
    isActive: true
  },
  {
    name: 'Sabaragamuwa Province',
    districts: ['Ratnapura', 'Kegalle'],
    deliveryFee: 600,
    estimatedDays: 3,
    isActive: true
  }
];

const seedDeliveryZones = async () => {
  try {
    await connectDB();
    await DeliveryZone.deleteMany({});
    console.log('✅ Cleared existing delivery zones');
    
    await DeliveryZone.insertMany(zones);
    console.log(`✅ Inserted ${zones.length} delivery zones successfully!`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding delivery zones:', err);
    process.exit(1);
  }
};

seedDeliveryZones();
