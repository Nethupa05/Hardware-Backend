import express from "express";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  checkLowStock,
  updateStock,
  getCategories
} from "../controllers/productController.js";

import { protect, authorize } from '../middleware/auth.js';

const productRouter = express.Router();

// Public read routes (getProducts checks req.user to filter if not admin)
productRouter.get("/", protect, getProducts);
productRouter.get("/low-stock", protect, authorize('admin'), checkLowStock);
productRouter.get("/categories", protect, getCategories);
productRouter.get("/:id", protect, getProduct);

// Admin-only write routes
productRouter.post("/", protect, authorize('admin'), createProduct);
productRouter.put("/:id", protect, authorize('admin'), updateProduct);
productRouter.delete("/:id", protect, authorize('admin'), deleteProduct);
productRouter.patch("/:id/stock", protect, authorize('admin'), updateStock);

export default productRouter;
