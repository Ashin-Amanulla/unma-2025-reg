import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import dotenv from 'dotenv';
import loginSeedData from './seed/login_seed_data.js';
// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import registrationRoutes from './routes/registrations.js';
import adminRoutes from './routes/admin.js';
import paymentRoutes from './routes/payment.js';
import issueRoutes from './routes/issueRoutes.js'
// Import middlewares
import { errorHandler, notFoundHandler } from './middleware/error.js';

// Import configurations
import { connectDB } from './config/database.js';
import { setupSwagger } from './config/swagger.js';
import { logger, stream } from './utils/logger.js';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Seed data
loginSeedData();

// Setup security middlewares
app.use(helmet());
app.use(cors());
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: {
            status: 'error',
            message: 'Too many requests, please try again later'
        }
    })
);

// Setup request parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Setup logging middleware
app.use(morgan('combined', { stream: stream }));

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Setup routes


const baseRoutes = `/api/v1`;

app.use(`${baseRoutes}/auth`, authRoutes);
app.use(`${baseRoutes}/registrations`, registrationRoutes);
app.use(`${baseRoutes}/admin`, adminRoutes);
app.use(`${baseRoutes}/payment`, paymentRoutes);
app.use(`${baseRoutes}/issues`, issueRoutes);



// Setup Swagger documentation
setupSwagger(app);

// Handle undefined routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    //time indian standard time
    const indianTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    logger.info(`Server running on port ${PORT} since ${indianTime}`);
});



// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    // Close server & exit process
    process.exit(1);
});

export default app; 