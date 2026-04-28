import express from "express";
import { addToCart, syncCart } from "../controllers/cartController.js";

const router = express.Router();

router.post("/add", addToCart);
router.post("/sync", syncCart);

export default router;