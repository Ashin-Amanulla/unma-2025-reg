import express from 'express';
import {
    createRegistration,
    getAllRegistrations,
    getRegistrationById,
    updateRegistration,
    deleteRegistration,
    sendOtp,
    verifyOtp,
    processPayment,
    getRegistrationsByType,
    getRegistrationStats,
    exportRegistrations,
    importRegistrations,
    bulkUpdateRegistrations,
    saveRegistrationStep,
    sendMessage
} from '../controllers/registrations.controller.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public endpoints
// Create new registration
router.post('/', createRegistration);

// Send OTP for verification
router.post('/send-otp', sendOtp);

// Verify OTP
router.post('/verify-otp', verifyOtp);

// Save registration step (multi-step form)
router.post('/step/:id', saveRegistrationStep);

// Process payment
router.post('/:id/payment', processPayment);

// Protected endpoints (require authentication)
// Get all registrations with filtering and pagination
router.get('/', verifyToken, getAllRegistrations);

// Get registrations by type
router.get('/type/:type', verifyToken, getRegistrationsByType);

// Get registration statistics
router.get('/stats', verifyToken, getRegistrationStats);

// Export registrations
router.get('/export', verifyToken, verifyAdmin, exportRegistrations);

// Import registrations (admin only)
router.post('/import', verifyToken, verifyAdmin, importRegistrations);

// Bulk update registrations (admin only)
router.put('/bulk', verifyToken, verifyAdmin, bulkUpdateRegistrations);

// Get registration by id
router.get('/:id', verifyToken, getRegistrationById);

// Update registration
router.put('/:id', verifyToken, updateRegistration);

// Delete registration (admin only)
router.delete('/:id', verifyToken, verifyAdmin, deleteRegistration);

router.post('/send-message', sendMessage);

export default router;