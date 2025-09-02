// models/Product.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Stock cannot be negative'],
  },
  minStock: {
    type: Number,
    required: true,
    default: 10,
    min: [0, 'Minimum stock cannot be negative'],
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  image: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
  },
}, {
  timestamps: true,
});

// Create text index for search
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ supplier: 1 });
productSchema.index({ isActive: 1 });

// Virtual for checking if stock is low
productSchema.virtual('isLowStock').get(function() {
  return this.stock <= this.minStock;
});

// Method to check stock status
productSchema.methods.checkStockStatus = function() {
  if (this.stock === 0) {
    return 'out-of-stock';
  } else if (this.stock <= this.minStock) {
    return 'low-stock';
  } else {
    return 'in-stock';
  }
};

const Product = mongoose.model('Product', productSchema);
export default Product;