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

const router = express.Router();

router.route('/')
  .post(addSupplier)
  .get(getSuppliers);

router.route('/expired-agreements')
  .get(getExpiredAgreements);

router.route('/:id')
  .get(getSupplier)
  .put(updateSupplier)
  .delete(removeSupplier);

router.route('/:supplierId/notify-low-stock')
  .post(notifyLowStock);

export default router;