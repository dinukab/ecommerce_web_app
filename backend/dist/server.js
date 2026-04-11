import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database.js';
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
// Load env variables FIRST
dotenv.config();
console.log('🚀 Starting OneShop Backend...');
console.log('Environment:', process.env.NODE_ENV);
// Connect to database
connectDB();
const app = express();
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'OneShop API is running',
    });
});
// Error handler
app.use(errorHandler);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
