import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  applyCoupon,
  customerCancelOrder,
} from '../controllers/orderController.js';
import { protect, stealthAdminProtect, optionalProtect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', optionalProtect, createOrder); // Allows guest or authenticated with automatic user linking
router.post('/coupon', applyCoupon);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', optionalProtect, getOrderById); // IDOR Protected
router.put('/:id/cancel', protect, customerCancelOrder); // Customer self-cancel

// Admin order routes (Stealth cloaked with 404 on unauthorized)
router.get('/', stealthAdminProtect, getAllOrders);
router.put('/:id/status', stealthAdminProtect, updateOrderStatus);

export default router;
