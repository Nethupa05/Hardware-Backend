import Supplier from '../models/Supplier.js';
import Product from '../models/Product.js';

// Add a new supplier
export const addSupplier = async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    const savedSupplier = await supplier.save();
    res.status(201).json({
      success: true,
      message: 'Supplier added successfully',
      data: savedSupplier
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Supplier with this email already exists'
      });
    }
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all suppliers
export const getSuppliers = async (req, res) => {
  try {
    const { page = 1, limit = 10, active } = req.query;
    const query = {};
    
    if (active !== undefined) {
      query.isActive = active === 'true';
    }
    
    const suppliers = await Supplier.find(query)
      .populate('productsSupplied', 'name category')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Supplier.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: suppliers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalSuppliers: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get a single supplier by ID
export const getSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id)
      .populate('productsSupplied', 'name category stockQuantity');
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: supplier
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update a supplier
export const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Supplier updated successfully',
      data: supplier
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Remove a supplier (mark as inactive)
export const removeSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Supplier removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get suppliers with expired agreements
export const getExpiredAgreements = async (req, res) => {
  try {
    const suppliers = await Supplier.findExpiredAgreements();
    
    res.status(200).json({
      success: true,
      data: suppliers,
      count: suppliers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Notify supplier about low stock (console log version)
export const notifyLowStock = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const { productIds, message } = req.body;
    
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    
    // Get low stock products
    const lowStockProducts = await Product.find({
      _id: { $in: productIds },
      stockQuantity: { $lt: 10 }
    });
    
    if (lowStockProducts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No products with low stock found'
      });
    }
    
    // Log notification instead of sending email
    console.log('Low Stock Notification for:', supplier.name);
    console.log('Email:', supplier.email);
    console.log('Low stock products:', lowStockProducts.map(p => p.name));
    console.log('Custom message:', message);
    
    res.status(200).json({
      success: true,
      message: 'Low stock notification logged successfully',
      data: {
        supplier: supplier.name,
        email: supplier.email,
        lowStockProducts: lowStockProducts.map(p => ({
          name: p.name,
          stockQuantity: p.stockQuantity
        })),
        customMessage: message
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};