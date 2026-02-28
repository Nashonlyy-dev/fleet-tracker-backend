import express from 'express';
import { requestLocationUpdate } from '../controllers/locationController.js';
import { protect, isOwner } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/update', protect, requestLocationUpdate);

export default router;