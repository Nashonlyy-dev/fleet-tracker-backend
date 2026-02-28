import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// 1. PROTECT MIDDLEWARE
export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Look for 'id' OR 'userId' to be safe
            const userId = decoded.id || decoded.userId;
            
            // Assign user to request
            req.user = await User.findById(userId).select('-password');

            // --- THE CRITICAL FIX ---
            // If the user isn't found in DB, STOP here. Don't call next().
            if (!req.user) {
                return res.status(401).json({ message: 'User no longer exists in database' });
            }

            return next(); // Everything is fine, move to controller
        } catch (error) {
            console.error("Auth Error:", error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    // Check if token was ever found
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// 2. IS-OWNER MIDDLEWARE
export const isOwner = (req, res, next) => {
    // protect must run before this to populate req.user
    if (req.user && req.user.role === 'owner') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Only Owners can access this.' });
    }
};

// ... keep your existing protect middleware ...

export const isAdmin = (req, res, next) => {
    // Check if user exists (from protect middleware) and is an admin
    if (req.user && req.user.role === 'admin') {
        next(); // User is admin, proceed to the controller
    } else {
        res.status(403).json({ message: "Not authorized as an admin" });
    }
};