import { logger } from '../utils/logger.js';

/**
 * Global error handling middleware
 * @param {Object} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const errorHandler = (err, req, res, next) => {
    // Set default error status and message
    const status = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Log the error
    logger.error(`Error: ${message} - Status: ${status} - URL: ${req.originalUrl} - Method: ${req.method}`);

    // Send error response to client
    res.status(status).json({
        status: 'error',
        message: process.env.NODE_ENV === 'production' && status === 500
            ? 'Something went wrong, please try again later'
            : message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
};

/**
 * Custom error class with status code
 */
export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Not found handler middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const notFoundHandler = (req, res, next) => {
    const message = `Cannot ${req.method} ${req.originalUrl}`;
    logger.warn(`Not Found: ${message}`);

    const error = new AppError(message, 404);
    next(error);
}; 