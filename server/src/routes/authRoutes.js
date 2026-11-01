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
  verifyTwoFactor,
  resendTwoFactor,
  toggleTwoFactor,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/securityShield.js';
import { validateDto } from '../dtos/validator.js';
import { RegisterDtoSchema, LoginDtoSchema, Verify2faDtoSchema } from '../dtos/auth.dto.js';

const router = express.Router();

// Strict rate-limited authentication endpoints with DTO Validation
router.post('/register', authRateLimiter(10, 60000), validateDto(RegisterDtoSchema), register);
router.post('/login', authRateLimiter(10, 60000), validateDto(LoginDtoSchema), login);
router.post('/oauth', authRateLimiter(15, 60000), oauthLogin);
router.post('/forgot-password', authRateLimiter(5, 60000), forgotPassword);
router.post('/reset-password', authRateLimiter(5, 60000), resetPassword);

// Two-Factor Authentication (2FA) endpoints with DTO Validation
router.post('/verify-2fa', authRateLimiter(10, 60000), validateDto(Verify2faDtoSchema), verifyTwoFactor);
router.post('/resend-2fa', authRateLimiter(5, 60000), resendTwoFactor);
router.put('/toggle-2fa', protect, toggleTwoFactor);

// Authenticated user profile & wishlist
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/wishlist/toggle', protect, toggleWishlist);

// Address book endpoints
router.post('/addresses', protect, addAddress);
router.put('/addresses/:id', protect, updateAddress);
router.delete('/addresses/:id', protect, deleteAddress);
router.put('/addresses/:id/default', protect, setDefaultAddress);

// Security & Session management
router.put('/change-password', protect, changePassword);
router.post('/logout-all', protect, logoutAllDevices);

// User-specific queries
router.get('/my-vouchers', protect, getMyVouchers);
router.get('/my-reviews-summary', protect, getMyReviewsSummary);

export default router;
