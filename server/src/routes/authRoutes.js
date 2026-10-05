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

export default router;
