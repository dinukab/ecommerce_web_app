import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import serverlessHttp from "serverless-http";
import connectDB from "./config/database.js";
import cartRoutes from "./routes/cartRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import faqRoutes from "./routes/faqRoutes.js";
import shippingInfoRoutes from "./routes/shipping-info.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import storeOrderRoutes from "./routes/storeOrderRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
// import returnRoutes from "./routes/returns.js";

if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

export const app = express();

// CORS: allow localhost for dev, and any deployed AWS frontend URL
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    // Allow any *.amazonaws.com or *.cloudfront.net URL automatically
    if (
      allowedOrigins.includes(origin) ||
      /\.amazonaws\.com$/.test(origin) ||
      /\.cloudfront\.net$/.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  }
  next();
});
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use("/api/cart", cartRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/shipping-info', shippingInfoRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/store-orders', storeOrderRoutes);
app.use('/api/store-settings', storeRoutes);

// ─── Lambda handler (used by SST / AWS Lambda Function URL) ──────────────────
// serverless-http wraps Express with a Promise-based handler (Node.js 24 compatible)
export const handler = serverlessHttp(app);

// ─── Local dev server (only when run directly, not in Lambda) ────────────────
if (process.env.NODE_ENV !== 'test' && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}