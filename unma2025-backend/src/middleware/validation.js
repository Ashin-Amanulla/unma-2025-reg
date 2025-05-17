import Joi from 'joi';
import { logger } from '../utils/logger.js';

// Login validation schema
export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

// Registration validation schema
export const registrationSchema = Joi.object({
    eventId: Joi.string().required(),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[0-9+\s()-]{10,15}$/).required(),
    organization: Joi.string().allow(''),
    additionalNotes: Joi.string().allow('')
});

// Event validation schema
export const eventSchema = Joi.object({
    title: Joi.string().min(5).max(100).required(),
    description: Joi.string().min(10).required(),
    date: Joi.date().iso().required(),
    location: Joi.string().required(),
    price: Joi.number().min(0).required(),
    capacity: Joi.number().integer().min(1).required(),
    image: Joi.string().uri().allow(''),
    isActive: Joi.boolean().default(true),
    agenda: Joi.array().items(
        Joi.object({
            time: Joi.string().required(),
            title: Joi.string().required()
        })
    ),
    speakers: Joi.array().items(
        Joi.object({
            name: Joi.string().required(),
            bio: Joi.string().required(),
            image: Joi.string().uri().allow('')
        })
    )
});

/**
 * Middleware for validating login requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateLogin = (req, res, next) => {
    console.log(req.body);
    const { error } = loginSchema.validate(req.body);

    if (error) {
        logger.warn(`Login validation failed: ${error.message}`);
        return res.status(400).json({
            status: 'error',
            message: `Validation error: ${error.details[0].message}`
        });
    }

    next();
};

/**
 * Middleware for validating registration requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateRegistration = (req, res, next) => {
    const { error } = registrationSchema.validate(req.body);

    if (error) {
        logger.warn(`Registration validation failed: ${error.message}`);
        return res.status(400).json({
            status: 'error',
            message: `Validation error: ${error.details[0].message}`
        });
    }

    next();
};

/**
 * Middleware for validating event requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateEvent = (req, res, next) => {
    const { error } = eventSchema.validate(req.body);

    if (error) {
        logger.warn(`Event validation failed: ${error.message}`);
        return res.status(400).json({
            status: 'error',
            message: `Validation error: ${error.details[0].message}`
        });
    }

    next();
}; 