import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

/**
 * Database connection configuration
 */
export const connectDB = async () => {
    try {
        // MongoDB connection string
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/unma2025';

        // Connection options
        const options = {
          
            autoIndex: true,
        };

        // Connect to MongoDB
        const connection = await mongoose.connect(mongoURI, options);

        logger.info(`MongoDB Connected: ${connection.connection.host}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            logger.error(`MongoDB connection error: ${err}`);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
        });

        // Handle application shutdown
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                logger.info('MongoDB connection closed through app termination');
                process.exit(0);
            } catch (err) {
                logger.error(`Error closing MongoDB connection: ${err}`);
                process.exit(1);
            }
        });

        return connection;
    } catch (error) {
        logger.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
}; 