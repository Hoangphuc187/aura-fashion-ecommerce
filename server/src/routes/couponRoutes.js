import express from 'express';
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponActive,
  refundCouponUsage,
  getActiveCoupons,
} from '../controllers/couponController.js';
import { stealthAdminProtect } from '../middleware/auth.js';

const router = express.Router();

// Public / Customer endpoint to view active store coupons
router.get('/active', getActiveCoupons);

// Stealth Admin cloaking: returns 404 for unauthorized visitors
router.get('/', stealthAdminProtect, getAllCoupons);
router.post('/', stealthAdminProtect, createCoupon);
router.put('/:id', stealthAdminProtect, updateCoupon);
router.delete('/:id', stealthAdminProtect, deleteCoupon);
router.put('/:id/toggle', stealthAdminProtect, toggleCouponActive);
router.post('/:id/refund', stealthAdminProtect, refundCouponUsage);

export default router;
