// routers/quotationRoutes.js
import express from 'express';
import {
  createQuotation,
  getQuotations,
  getQuotationById,
  updateQuotationStatus,
  deleteQuotation,
  getQuotationsByStatus,
  getMyQuotations
} from '../controllers/quotationController.js';
import { protect } from '../middleware/auth.js'; // Changed to named import
import upload from '../utils/upload.js';

const router = express.Router();

// Public route for submitting quotations
router.post('/', upload.single('file'), createQuotation);

// Protected routes (require authentication) - use 'protect' instead of 'auth'
router.get('/', protect, getQuotations);
router.get('/my-quotations', protect, getMyQuotations);
router.get('/status/:status', protect, getQuotationsByStatus);
router.get('/:id', protect, getQuotationById);
router.patch('/:id/status', protect, updateQuotationStatus);
router.delete('/:id', protect, deleteQuotation);

export default router;