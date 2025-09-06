// routers/quotationRoutes.js
import express from 'express';
import {
  createQuotation,
  getQuotations,
  getQuotationById,
  updateQuotationStatus,
  deleteQuotation,
  getQuotationsByStatus,
  getMyQuotations,
  getQuotationStats
} from '../controllers/quotationController.js';
import { protect, authorize } from '../middleware/auth.js'; // Changed to use authorize instead of admin
import upload from '../utils/upload.js';

const router = express.Router();

// Public route for submitting quotations (customers can create without auth)
router.post('/', upload.single('file'), createQuotation);

// Protected customer routes
router.get('/my-quotations', protect, getMyQuotations);

// Protected admin routes - use authorize('admin') instead of admin
router.get('/', protect, authorize('admin'), getQuotations);
router.get('/stats', protect, authorize('admin'), getQuotationStats);
router.get('/status/:status', protect, authorize('admin'), getQuotationsByStatus);
router.get('/:id', protect, getQuotationById); // Both admin and owner can access
router.patch('/:id/status', protect, authorize('admin'), updateQuotationStatus);
router.delete('/:id', protect, authorize('admin'), deleteQuotation);

export default router;