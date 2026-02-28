import express from 'express';
const router = express.Router();
import { addDriver, getMyFleetLocations } from '../controllers/ownerController.js';
import { protect, isOwner } from '../middleware/authMiddleware.js';

// Apply security to EVERYTHING in this file
router.use(protect);
router.use(isOwner);

// POST /api/v1/owner/add-driver (Create the driver)
router.post('/add-driver', addDriver);

// GET /api/v1/owner/fleet (See the map markers)
router.get('/fleet', getMyFleetLocations);

export default router;