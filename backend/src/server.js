import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import cartRoutes from "./routes/cartRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/ProductRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import faqRoutes from "./routes/faqRoutes.js";
import shippingInfoRoutes from "./routes/shipping-info.js";
import categoryRoutes from "./routes/Categoryroutes.js";
import reviewRoutes from "./routes/ReviewRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
// import returnRoutes from "./routes/returns.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', process.env.FRONTEND_URL].filter(Boolean),
  credentials: true
}));
app.use(express.json());

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
// app.use('/api/returns', returnRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
