import express from 'express';
import { login, logout, verifyToken } from '../controllers/auth.controller.js';
import { validateLogin } from '../middleware/validation.js';
import { logger } from '../utils/logger.js';

const router = express.Router();


// Login route
router.post('/login', validateLogin, login);

// Logout route
router.post('/logout', logout);

// Token verification route
router.get('/verify', verifyToken);

export default router;