import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const getJwtSecret = () => {
  return process.env.JWT_SECRET || 'aura_fallback_dev_secret_key_2026';
};

/**
 * Standard Token Protection Middleware
 */
export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, getJwtSecret());
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Tài khoản không tồn tại hoặc đã bị xóa' });
      }

      // If user account is locked, reject requests
      if (req.user.lockUntil && req.user.lockUntil > Date.now()) {
        return res.status(423).json({
          success: false,
          message: 'Tài khoản đang bị tạm khóa để bảo vệ an toàn.',
        });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Phiên đăng nhập hết hạn hoặc không hợp lệ' });
    }
  }

  return res.status(401).json({ success: false, message: 'Chưa đăng nhập, không có token xác thực' });
};

/**
 * Optional Protection for Guest/User mixed endpoints (e.g. checkout)
 */
export const optionalProtect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, getJwtSecret());
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      req.user = null;
    }
  }
  next();
};

/**
 * Standard Admin Only Middleware (Returns 404 for stealth)
 */
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  // Stealth Cloaking: Return 404 so penetration scanners think this admin endpoint doesn't exist
  return res.status(404).json({ success: false, message: `Cannot ${req.method} ${req.originalUrl}` });
};

/**
 * Combined Stealth Guard for Admin APIs:
 * If token is missing, invalid, or user is not an admin -> returns 404 Not Found
 * This ensures automated scanners (Gobuster, ffuf, etc.) mark the route as dead.
 */
export const stealthAdminProtect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, getJwtSecret());
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.role === 'admin') {
        req.user = user;
        return next();
      }
    } catch (error) {
      // Invalid token or expired - cloak response
    }
  }

  // Cloaking response: Pretend this endpoint does not exist
  return res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
};
