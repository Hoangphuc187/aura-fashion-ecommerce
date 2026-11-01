import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrderByTrackingUuid,
  getAllOrders,
  updateOrderStatus,
  applyCoupon,
  customerCancelOrder,
  triggerManualExpiryCheck,
} from '../controllers/orderController.js';
import { protect, stealthAdminProtect, optionalProtect } from '../middleware/auth.js';
import { validateDto } from '../dtos/validator.js';
import { CreateOrderDtoSchema } from '../dtos/order.dto.js';
import { requireIdempotency } from '../middleware/idempotency.js';

const router = express.Router();

// Public UUID-based Order Tracking (No IDOR enumeration vulnerability)
router.get('/track/:uuid', getOrderByTrackingUuid);

// Order Creation with Idempotency & DTO Validation
router.post('/', optionalProtect, requireIdempotency, validateDto(CreateOrderDtoSchema), createOrder);
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
