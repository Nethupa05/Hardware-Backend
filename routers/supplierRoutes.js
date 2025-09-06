import express from 'express';
import {
  addSupplier,
  getSuppliers,
  getSupplier,
  updateSupplier,
  removeSupplier,
  getExpiredAgreements,
  notifyLowStock
} from '../controllers/supplierController.js';
import { protect, authorize } from '../middleware/auth.js'; // Import auth middleware

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Apply authorize('admin') to routes that need admin access
router.route('/')
  .post(authorize('admin'), addSupplier) // Only admin can add suppliers
  .get(authorize('admin'), getSuppliers); // Only admin can view all suppliers

router.route('/expired-agreements')
  .get(authorize('admin'), getExpiredAgreements); // Only admin can view expired agreements

router.route('/:id')
  .get(authorize('admin'), getSupplier) // Only admin can view specific supplier
  .put(authorize('admin'), updateSupplier) // Only admin can update suppliers
  .delete(authorize('admin'), removeSupplier); // Only admin can remove suppliers

router.route('/:supplierId/notify-low-stock')
  .post(authorize('admin'), notifyLowStock); // Only admin can send notifications

export default router;