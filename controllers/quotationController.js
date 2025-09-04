import Quotation from '../models/Quotation.js';
import Product from '../models/Product.js';

// Create a new quotation
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
      notes
    } = req.body;

    // Calculate total amount
    let totalAmount = 0;
    if (items && items.length > 0) {
      for (const item of items) {
        // Get product price from database
        const productData = await Product.findOne({ name: item.product });
        if (productData) {
          item.price = productData.price;
          totalAmount += productData.price * item.quantity;
        }
      }
    }

    const quotation = new Quotation({
      name,
      email,
      phone,
      company,
      address,
      productCategory,
      product,
      items,
      totalAmount,
      notes,
      fileUrl: req.file ? req.file.path : null
    });

    const savedQuotation = await quotation.save();
    res.status(201).json(savedQuotation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all quotations
export const getQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find().sort({ createdAt: -1 });
    res.json(quotations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get quotation by ID
export const getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    res.json(quotation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update quotation status
export const updateQuotationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const quotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    res.json(quotation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete quotation
export const deleteQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndDelete(req.params.id);
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    res.json({ message: 'Quotation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get quotations by status
export const getQuotationsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const quotations = await Quotation.find({ status }).sort({ createdAt: -1 });
    res.json(quotations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyQuotations = async (req, res) => {
  try {
    // Assuming req.user contains the logged-in user's information
    // You might need to adjust this based on how you identify user's quotations
    const quotations = await Quotation.find({ email: req.user.email }).sort({ createdAt: -1 });
    res.json(quotations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};