import express from 'express';
import {
  register,
  login,
  getMe,
  logout,
  getUsers,
  updateUser,
  deleteUser,
  getProfile


} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me',protect, getMe);
router.get('/', getUsers);
router.get('/profile', protect, getProfile);

router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

export default router;