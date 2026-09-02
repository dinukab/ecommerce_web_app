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

// DB connection is established lazily inside the handler (see below).
// This avoids the race condition where Lambda serves requests before the
// connection is ready. The readyState guard in database.ts makes it a no-op
// on warm (reused) Lambda containers.

export const app = express();

// CORS: allow localhost for dev, and any deployed AWS frontend URL
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
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
      /\.cloudfront\.net$/.test(origin) ||
      origin === 'https://opendoor.allinoneshop.store'
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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
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

// Global Error Handler (returns JSON instead of HTML on error)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  if (err.type === 'entity.too.large' || err.status === 413) {
    return res.status(413).json({
      success: false,
      message: 'File or payload too large. Please select a smaller file.',
    });
  }
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ─── Lambda handler (used by SST / AWS Lambda Function URL) ──────────────────
// Wraps serverless-http so that connectDB() is awaited before every request.
// On warm containers, connectDB() returns immediately (readyState >= 1 guard).
const _serverlessHandler = serverlessHttp(app);

export const handler = async (event: any, context: any) => {
  // Ensure DB is connected before handling the request
  await connectDB();
  return _serverlessHandler(event, context);
};

// ─── Local dev server (only when run directly, not in Lambda) ────────────────
if (process.env.NODE_ENV !== 'test' && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  connectDB().then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}