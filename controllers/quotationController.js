import Quotation from '../models/Quotation.js';
import Product from '../models/Product.js';

// Create a new quotation (Customer only)
export const createQuotation = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      address,
      productCategory,
      product,
      items,
      notes,
      totalAmount,
      createdBy
    } = req.body;

    // If user is authenticated, use their info
    let customerEmail = email;
    let customerName = name;
    
    if (req.user) {
      customerEmail = req.user.email;
      customerName = req.user.fullName || req.user.name || name;
    }

    // Calculate total amount and process items
    let calculatedTotalAmount = 0;
    let processedItems = [];
    
    if (items && items.length > 0) {
      for (const item of items) {
        // Get product data from database using the product ID
        const productData = await Product.findById(item.product);
        if (productData) {
          const itemTotal = productData.price * item.quantity;
          calculatedTotalAmount += itemTotal;
          
          processedItems.push({
            product: productData.name, // Store product name for display
            productId: item.product,   // Store product ID for reference
            category: item.category,   // Store category
            quantity: item.quantity,
            price: productData.price,
            subtotal: itemTotal
          });
        }
      }
    }

    // Use provided totalAmount or calculated amount
    const finalTotalAmount = totalAmount || calculatedTotalAmount;

    const quotation = new Quotation({
      name: customerName,
      email: customerEmail,
      phone,
      company,
      address,
      productCategory: productCategory || (processedItems.length > 0 ? processedItems[0].category : ''),
      product: product || (processedItems.length > 0 ? processedItems[0].product : ''),
      items: processedItems,
      totalAmount: finalTotalAmount,
      notes,
      fileUrl: req.file ? req.file.path : null,
      createdBy: createdBy || (req.user ? req.user._id : null)
    });

    const savedQuotation = await quotation.save();
    res.status(201).json({
      success: true,
      data: savedQuotation
    });
  } catch (error) {
    console.error('Error creating quotation:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all quotations (Admin only)
export const getQuotations = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    
    // Build filter object
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { product: { $regex: search, $options: 'i' } }
      ];
    }
    
    const quotations = await Quotation.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'name email'); // Populate user info if available
      
    const total = await Quotation.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        quotations,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get quotation by ID (Admin or owner)
export const getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id).populate('createdBy', 'name email');
    
    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }
    
    // Check if user is admin or the owner of the quotation
    if (req.user.role !== 'admin' && quotation.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: quotation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update quotation status (Admin only)
export const updateQuotationStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const quotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        adminNotes: adminNotes || undefined,
        updatedBy: req.user._id // Track who updated the quotation
      },
      { new: true, runValidators: true }
    );
    
    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }
    
    res.json({
      success: true,
      data: quotation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete quotation (Admin only)
export const deleteQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndDelete(req.params.id);
    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }
    res.json({
      success: true,
      message: 'Quotation deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get quotations by status (Admin only)
export const getQuotationsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const quotations = await Quotation.find({ status })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'name email');
      
    const total = await Quotation.countDocuments({ status });
    
    res.json({
      success: true,
      data: {
        quotations,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get my quotations (Customer only)
export const getMyQuotations = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    // Build filter object - include quotations by user ID OR by email
    const filter = {
      $or: [
        { createdBy: req.user._id },
        { email: req.user.email }
      ]
    };
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    const quotations = await Quotation.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
      
    const total = await Quotation.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        quotations,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get quotation statistics (Admin only)
export const getQuotationStats = async (req, res) => {
  try {
    const total = await Quotation.countDocuments();
    const pending = await Quotation.countDocuments({ status: 'pending' });
    const processing = await Quotation.countDocuments({ status: 'processing' });
    const completed = await Quotation.countDocuments({ status: 'completed' });
    const rejected = await Quotation.countDocuments({ status: 'rejected' });
    
    // Get recent quotations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recent = await Quotation.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    res.json({
      success: true,
      data: {
        total,
        pending,
        processing,
        completed,
        rejected,
        recent
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};