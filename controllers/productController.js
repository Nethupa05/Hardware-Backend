import Product from '../models/Product.js';

// You need to implement this function or remove it
function isAdmin(req) {
  // Implement your admin check logic here
  // For now, let's assume all requests are from admin
  return true;
}

// Get all products with filtering and pagination
export async function getProducts(req, res) {
  try {
    if (isAdmin(req)) {
      const products = await Product.find();
      res.json(products);
    } else {
      const products = await Product.find({ isActive: true }); // Changed from isAvailable to isActive
      res.json(products);
    }
  } catch (err) {
    res.status(500).json({
      message: "Failed to get products",
      error: err.message
    });
  }
}

// Get a single product by ID
// controllers/productController.js
export const getProduct = async (req, res) => {
  try {
    const sku = String(req.params.sku || '').trim();
    if (!sku) return res.status(400).json({ message: 'SKU is required' });

    const product = await Product
      .findOne({ sku })
      .collation({ locale: 'en', strength: 2 }) // case-insensitive match
      .populate('supplier', 'name email phone');

    if (!product) {
      return res.status(404).json({ message: `Product not found for SKU: ${sku}` });
    }

    res.json(product);
  } catch (error) {
    console.error('Error getting product by SKU:', error);
    res.status(500).json({ message: 'Server error while fetching product' });
  }
};

// Create a new product
export const createProduct = async (req, res) => {
  try {
    const productData = req.body;
    
    // Generate SKU if not provided
    if (!productData.sku) {
      const categoryAbbr = productData.category.substring(0, 3).toUpperCase();
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      productData.sku = `${categoryAbbr}-${randomNum}`;
    }
    
    const product = new Product(productData);
    const savedProduct = await product.save();
    await savedProduct.populate('supplier', 'name email phone');
    
    // Check if stock is low and send notification
    if (savedProduct.isLowStock) {
      console.log('Low stock alert would be sent for:', savedProduct.name);
    }
    
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'SKU must be unique' });
    } else if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(val => val.message);
      res.status(400).json({ message: errors.join(', ') });
    } else {
      res.status(500).json({ message: 'Server error while creating product' });
    }
  }
};

// Update a product
export const updateProduct = async (req, res) => {
  try {
    // Don't allow updating SKU
    if (req.body.sku) {
      delete req.body.sku;
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('supplier', 'name email phone');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if stock is low and send notification
    if (product.isLowStock) {
      console.log('Low stock alert would be sent for:', product.name);
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid product ID' });
    } else if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(val => val.message);
      res.status(400).json({ message: errors.join(', ') });
    } else {
      res.status(500).json({ message: 'Server error while updating product' });
    }
  }
};

// Delete a product (soft delete by setting isActive to false)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    res.status(500).json({ message: 'Server error while deleting product' });
  }
};

// Check for low stock products
export const checkLowStock = async (req, res) => {
  try {
    // Using aggregation to compare stock with minStock
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$stock', '$minStock'] },
      isActive: true,
      stock: { $gt: 0 } // Exclude out-of-stock items
    }).populate('supplier');
    
    // Send notifications for low stock items
    lowStockProducts.forEach(product => {
      console.log('Low stock alert would be sent for:', product.name);
    });
    
    res.json({
      count: lowStockProducts.length,
      products: lowStockProducts
    });
  } catch (error) {
    console.error('Error checking low stock:', error);
    res.status(500).json({ message: 'Server error while checking low stock' });
  }
};

// Update product stock
export const updateStock = async (req, res) => {
  try {
    const { operation, quantity } = req.body;
    
    if (!operation || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Valid operation and quantity are required' });
    }
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (operation === 'add') {
      product.stock += quantity;
    } else if (operation === 'subtract') {
      if (product.stock < quantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }
      product.stock -= quantity;
    } else {
      return res.status(400).json({ message: 'Invalid operation. Use "add" or "subtract"' });
    }
    
    const updatedProduct = await product.save();
    await updatedProduct.populate('supplier', 'name email phone');
    
    // Check if stock is low and send notification
    if (updatedProduct.isLowStock) {
      console.log('Low stock alert would be sent for:', updatedProduct.name);
    }
    
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating stock:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    res.status(500).json({ message: 'Server error while updating stock' });
  }
};

// Get product categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    res.json(categories);
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ message: 'Server error while fetching categories' });
  }
};