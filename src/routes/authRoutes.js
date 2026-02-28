import express from 'express';
import { login, register } from '../controllers/authController.js';
import { protect, isOwner } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/profile', protect, (req, res) => {
    res.json({ message: 'This is the protected profile route' });
});

export default router;