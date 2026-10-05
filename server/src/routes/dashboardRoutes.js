import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { stealthAdminProtect } from '../middleware/auth.js';

const router = express.Router();

// Stealth cloaked: Unauthorized callers receive 404 instead of 401/403
router.get('/stats', stealthAdminProtect, getDashboardStats);

export default router;
