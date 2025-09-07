// routers/JS/reservationRoutes.js
import express from 'express';
import {
  createReservation,
  getAllReservations,
  getMyReservations,
  getReservation,
  updateReservation,
  updateReservationStatus,
  deleteReservation
} from '../controllers/reservationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Customer routes
router.post('/', createReservation);
router.get('/my-reservations', getMyReservations);
router.get('/:id', getReservation);
router.put('/:id', updateReservation);

// Admin routes
router.get('/', authorize('admin'), getAllReservations);
router.patch('/:id/status', authorize('admin'), updateReservationStatus);
router.delete('/:id', authorize('admin'), deleteReservation);

export default router;