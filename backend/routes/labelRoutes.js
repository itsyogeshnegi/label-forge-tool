import express from 'express';
import { generateLabel, getLabelHistory, deleteLabelHistory } from '../controllers/labelController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', protect, generateLabel);
router.get('/history', protect, getLabelHistory);
router.delete('/history/:id', protect, deleteLabelHistory);


export default router;
