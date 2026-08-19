import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
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
import { tenantMiddleware } from "./middleware/tenantMiddleware.js";
// import returnRoutes from "./routes/returns.js";

if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

export const app = express();

/**
 * Every tenant lives on its own subdomain, so valid origins are not a fixed
 * list — the set grows each time a shop is provisioned. Accept the platform
 * domain and anything below it, plus localhost for development.
 *
 * This is not the tenant boundary: tenantMiddleware still resolves the tenant
 * from the hostname and 404s unknown shops. This only decides whose browser
 * may call the API.
 */
function isAllowedOrigin(origin: string): boolean {
  let hostname: string;
  try {
    hostname = new URL(origin).hostname.toLowerCase();
  } catch {
    return false;
  }

  if (hostname === 'localhost' || hostname === '127.0.0.1') return true;

  const platform = (process.env.PLATFORM_DOMAIN ?? '').toLowerCase();
  if (!platform) return false;

  return hostname === platform || hostname.endsWith(`.${platform}`);
}

app.use(cors({
  origin: (origin, callback) => {
    // No Origin header: same-origin navigations, curl, server-to-server.
    if (!origin || isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    }
  },
  credentials: true
}));
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  }
  next();
});
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Resolves the tenant database for every API request. Must precede all routes.
app.use('/api', tenantMiddleware);

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

// Bind a port only when running as a long-lived process. Under Lambda the
// runtime owns the event loop, and an open listener keeps it from freezing
// cleanly between invocations.
const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;

if (process.env.NODE_ENV !== 'test' && !isLambda) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}