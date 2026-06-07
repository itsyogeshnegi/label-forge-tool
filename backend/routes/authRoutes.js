import express from 'express';
import { loginUser, logoutUser, verifyUser } from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/logout', protect, logoutUser);
router.get('/verify', protect, verifyUser);

export default router;
