import express from 'express';
import {
  register,
  login,
  getMe,
  logout,
  getUsers
} from '../controllers/userController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', getMe);
router.get('/', getUsers);

export default router;