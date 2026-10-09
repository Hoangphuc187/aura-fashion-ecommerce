import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  applyCoupon,
  customerCancelOrder,
  triggerManualExpiryCheck,
} from '../controllers/orderController.js';
import { protect, stealthAdminProtect, optionalProtect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', optionalProtect, createOrder); // Allows guest or authenticated with automatic user linking
router.post('/coupon', applyCoupon);
router.get('/myorders', protect, getMyOrders);

// Admin order routes (Stealth cloaked with 404 on unauthorized) - placed before /:id
router.get('/', stealthAdminProtect, getAllOrders);
router.post('/admin/trigger-expiry-check', stealthAdminProtect, triggerManualExpiryCheck);
router.put('/:id/status', stealthAdminProtect, updateOrderStatus);

// Individual order routes
router.get('/:id', optionalProtect, getOrderById); // IDOR Protected
router.put('/:id/cancel', protect, customerCancelOrder); // Customer self-cancel

export default router;
