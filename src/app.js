import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import locationRoutes from './routes/locationRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import ownerRoutes from './routes/ownerRoutes.js'

// Import routes (Ensure you add .js extension for ES Modules)
// import locationRoutes from './routes/locationRoutes.js'; 

dotenv.config();

const app = express();

// 1. Security & Request Parsing Middlewares
app.use(helmet()); // Protects headers
app.use(cors(corsOptions));   // Allows cross-origin requests
app.use(express.json()); // Parses JSON bodies
app.use(express.urlencoded({ extended: true }));

// 2. Health Check Route (Industry Standard for Monitoring)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'active', time: new Date() });
});



// 3. API Routes
app.use('/api/v1/location', locationRoutes);
app.use('/api/v1/auth', authRoutes); // Example for auth routes
app.use('/api/v1/admin', adminRoutes)
app.use('/api/v1/owner', ownerRoutes)

// 4. Global Error Handling Middleware (Catches all unhandled errors)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});


export default app;
