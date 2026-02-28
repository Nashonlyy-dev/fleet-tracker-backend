import express from 'express';
const router = express.Router();
import { getAllUsers, updateUserRole } from '../controllers/adminController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

// All routes here require being logged in AND being an admin
router.use(protect);
router.use(isAdmin);

router.get('/users', getAllUsers);
router.put('/update-role', updateUserRole);

export default router;