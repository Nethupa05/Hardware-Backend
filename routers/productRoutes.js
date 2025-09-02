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

const productRouter = express.Router();

// Get all products
productRouter.get("/", getProducts);

// Get low stock products
productRouter.get("/low-stock", checkLowStock);

// Get product categories
productRouter.get("/categories", getCategories);

// Get a single product
productRouter.get("/:id", getProduct);

// Create a new product
productRouter.post("/", createProduct);

// Update a product
productRouter.put("/:id", updateProduct);

// Delete a product
productRouter.delete("/:id", deleteProduct);

// Update product stock
productRouter.patch("/:id/stock", updateStock);

export default productRouter;