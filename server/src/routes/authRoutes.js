import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  toggleWishlist,
  oauthLogin,
  forgotPassword,
  resetPassword,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  changePassword,
  logoutAllDevices,
  getMyVouchers,
  getMyReviewsSummary,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/securityShield.js';

const router = express.Router();

// Strict rate-limited authentication endpoints (anti-brute-force & spam)
router.post('/register', authRateLimiter(10, 60000), register);
router.post('/login', authRateLimiter(10, 60000), login);
router.post('/oauth', authRateLimiter(15, 60000), oauthLogin);
router.post('/forgot-password', authRateLimiter(5, 60000), forgotPassword);
router.post('/reset-password', authRateLimiter(5, 60000), resetPassword);

// Authenticated user profile & wishlist
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/wishlist/toggle', protect, toggleWishlist);

// Address book endpoints
router.post('/addresses', protect, addAddress);
router.put('/addresses/:id', protect, updateAddress);
router.delete('/addresses/:id', protect, deleteAddress);
router.put('/addresses/:id/default', protect, setDefaultAddress);

// Security endpoints
router.put('/change-password', protect, changePassword);
router.post('/logout-all', protect, logoutAllDevices);

// Vouchers & Reviews summaries
router.get('/my-vouchers', protect, getMyVouchers);
router.get('/my-reviews-summary', protect, getMyReviewsSummary);

export default router;
