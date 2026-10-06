import express from 'express';
import {
  getDashboardStats,
  getUsersList,
  toggleUserBan,
  adminResetUserPassword,
  getInventoryStats,
} from '../controllers/dashboardController.js';
import { stealthAdminProtect } from '../middleware/auth.js';

const router = express.Router();

// Stealth cloaked: Unauthorized callers receive 404 instead of 401/403
router.get('/stats', stealthAdminProtect, getDashboardStats);
router.get('/users', stealthAdminProtect, getUsersList);
router.put('/users/:id/ban', stealthAdminProtect, toggleUserBan);
router.put('/users/:id/reset-password', stealthAdminProtect, adminResetUserPassword);
router.get('/inventory', stealthAdminProtect, getInventoryStats);

export default router;
