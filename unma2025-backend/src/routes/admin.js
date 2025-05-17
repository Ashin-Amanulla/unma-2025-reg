import express from 'express';

import { verifyToken } from '../middleware/auth.js';
import { getAnalytics } from '../controllers/analytics.controller.js';
import { getAdmin, getAdminById, createAdmin, updateAdmin, deleteAdmin, getDashboardStats } from '../controllers/admin.controller.js';
const router = express.Router();


router.use(verifyToken);
router.get('/dashboard-stats', getDashboardStats);
router.get('/analytics', getAnalytics);


router.get('/',getAdmin);
router.get('/:id',getAdminById);
router.post('/', createAdmin);
router.put('/:id', updateAdmin);
router.delete('/:id', deleteAdmin);


export default router;