import express from 'express';
import {
  register,
  login,
  getMe,
  logout,
  getUsers,
  updateUser,
  deleteUser,
  getProfile,
  updateMe,
  deleteMe
} from '../controllers/userController.js';
import { protect, authorize, adminOrSelf } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', protect, logout);         // logout should be protected so only logged-in users can log themselves out
router.get('/me', protect, getMe);
router.get('/profile', protect, getProfile);

// Admin-only: list all users
router.get('/', protect, authorize('admin'), getUsers);

// Admin can update any user; adminOrSelf allows admin or owner for updating specific ID
router.put('/:id', protect, adminOrSelf(), updateUser);

// Admin-only delete any user
router.delete('/:id', protect, authorize('admin'), deleteUser);

// Routes for the currently authenticated user to update/delete their own profile
router.put('/me', protect, updateMe);
router.delete('/me', protect, deleteMe);

export default router;
