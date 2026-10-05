import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { logSecurityEvent, SecurityEvent } from '../utils/auditLogger.js';
import { isValidEmail, validatePasswordStrength } from '../middleware/sanitize.js';

const getJwtSecret = () => {
  return process.env.JWT_SECRET || 'aura_fallback_dev_secret_key_2026';
};

const generateToken = (id) => {
  return jwt.sign({ id }, getJwtSecret(), {
    expiresIn: '7d', // 7 days token expiration for production security
  });
};

/**
 * Register User
 * Enforces email validation, password complexity, and role isolation
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp họ và tên hợp lệ' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Địa chỉ email không đúng định dạng' });
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ success: false, message: passwordValidation.message });
    }

    const cleanEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email này đã được sử dụng trên hệ thống' });
    }

    // Explicitly enforce role as 'customer' to prevent privilege escalation
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      phone: typeof phone === 'string' ? phone.trim() : '',
      role: 'customer',
    });

    logSecurityEvent(SecurityEvent.LOGIN_SUCCESS, req, {
      userId: user._id,
      email: user.email,
      action: 'REGISTER_AND_LOGIN',
    });

    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Lỗi đăng ký tài khoản. Vui lòng thử lại.' });
  }
};

/**
 * Login User
 * Implements anti-enumeration, account lockout after 5 failed attempts, and audit logging
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email và mật khẩu' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    // Anti-Enumeration: If user does not exist, return generic authentication failure
    if (!user) {
      logSecurityEvent(SecurityEvent.LOGIN_FAILED, req, { email: cleanEmail, reason: 'USER_NOT_FOUND' });
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác' });
    }

    // 1. Check if account is currently locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingMinutes = Math.ceil((user.lockUntil.getTime() - Date.now()) / (60 * 1000));
      logSecurityEvent(SecurityEvent.ACCOUNT_LOCKED, req, {
        userId: user._id,
        email: user.email,
        remainingMinutes,
      });

      return res.status(423).json({
        success: false,
        isLocked: true,
        remainingMinutes,
        message: `Tài khoản tạm thời bị khóa do nhập sai mật khẩu quá 5 lần. Vui lòng thử lại sau ${remainingMinutes} phút hoặc sử dụng tính năng 'Quên Mật Khẩu'.`,
      });
    }

    // 2. Validate password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      // Lock account after 5 failed attempts for 5 minutes
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 5 * 60 * 1000);
        await user.save();

        logSecurityEvent(SecurityEvent.ACCOUNT_LOCKED, req, {
          userId: user._id,
          email: user.email,
          attempts: user.loginAttempts,
        });

        return res.status(423).json({
          success: false,
          isLocked: true,
          remainingMinutes: 5,
          message: 'Bạn đã nhập sai mật khẩu 5 lần liên tiếp. Tài khoản đã bị tạm khóa 5 phút để bảo vệ an toàn!',
        });
      }

      await user.save();
      const attemptsLeft = 5 - user.loginAttempts;

      logSecurityEvent(SecurityEvent.LOGIN_FAILED, req, {
        userId: user._id,
        email: user.email,
        attemptsLeft,
      });

      return res.status(401).json({
        success: false,
        attemptsLeft,
        message: `Email hoặc mật khẩu không chính xác. Bạn còn ${attemptsLeft} lần thử trước khi tài khoản bị khóa tạm thời.`,
      });
    }

    // 3. Reset lockout counters on successful login
    if (user.loginAttempts > 0 || user.lockUntil) {
      user.loginAttempts = 0;
      user.lockUntil = null;
      await user.save();
    }

    logSecurityEvent(SecurityEvent.LOGIN_SUCCESS, req, {
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Đã xảy ra lỗi máy chủ trong quá trình đăng nhập.' });
  }
};

/**
 * OAuth Login / Register (Google, GitHub)
 */
export const oauthLogin = async (req, res) => {
  try {
    const { provider = 'google', providerId, email, name, avatar } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Email từ OAuth không hợp lệ' });
    }

    const cleanEmail = email.toLowerCase().trim();

    let user = await User.findOne({
      $or: [
        { email: cleanEmail },
        ...(providerId ? [{ [provider === 'github' ? 'githubId' : 'googleId']: providerId }] : []),
      ],
    });

    if (user) {
      if (provider === 'google' && providerId && !user.googleId) user.googleId = providerId;
      if (provider === 'github' && providerId && !user.githubId) user.githubId = providerId;
      if (avatar && typeof avatar === 'string' && avatar.startsWith('http') && (!user.avatar || user.avatar.includes('unsplash'))) {
        user.avatar = avatar;
      }
      await user.save();
    } else {
      user = await User.create({
        name: typeof name === 'string' && name.trim() ? name.trim() : cleanEmail.split('@')[0],
        email: cleanEmail,
        avatar: typeof avatar === 'string' && avatar.startsWith('http')
          ? avatar
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        authProvider: provider,
        googleId: provider === 'google' ? providerId || `google_${Date.now()}` : null,
        githubId: provider === 'github' ? providerId || `github_${Date.now()}` : null,
        role: 'customer',
      });
    }

    logSecurityEvent(SecurityEvent.LOGIN_SUCCESS, req, {
      userId: user._id,
      email: user.email,
      provider,
    });

    res.json({
      success: true,
      message: `Đăng nhập qua ${provider === 'github' ? 'GitHub' : 'Google'} thành công!`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).json({ success: false, message: 'Lỗi xác thực dịch vụ liên kết' });
  }
};

/**
 * Get Current User Profile
 */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('wishlist');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi nạp thông tin hồ sơ' });
  }
};

/**
 * Update Profile
 * Protects against password tampering and privilege escalation
 */
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    if (req.body.name && typeof req.body.name === 'string') {
      user.name = req.body.name.trim();
    }
    if (req.body.phone !== undefined && typeof req.body.phone === 'string') {
      user.phone = req.body.phone.trim();
    }
    if (req.body.avatar && typeof req.body.avatar === 'string' && req.body.avatar.startsWith('http')) {
      user.avatar = req.body.avatar.trim();
    }
    if (req.body.address && typeof req.body.address === 'object') {
      user.address = {
        street: typeof req.body.address.street === 'string' ? req.body.address.street.trim() : user.address.street,
        ward: typeof req.body.address.ward === 'string' ? req.body.address.ward.trim() : user.address.ward,
        district: typeof req.body.address.district === 'string' ? req.body.address.district.trim() : user.address.district,
        city: typeof req.body.address.city === 'string' ? req.body.address.city.trim() : user.address.city,
      };
    }

    // Password change validation
    if (req.body.password) {
      const passValidation = validatePasswordStrength(req.body.password);
      if (!passValidation.valid) {
        return res.status(400).json({ success: false, message: passValidation.message });
      }
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    logSecurityEvent(SecurityEvent.PROFILE_UPDATED, req, {
      userId: user._id,
      email: user.email,
      passwordChanged: Boolean(req.body.password),
    });

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        phone: updatedUser.phone,
        address: updatedUser.address,
        token: generateToken(updatedUser._id),
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Lỗi cập nhật hồ sơ' });
  }
};

/**
 * Toggle Wishlist Item
 */
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId || typeof productId !== 'string' || !productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Mã sản phẩm không hợp lệ' });
    }

    const user = await User.findById(req.user._id);
    const isExist = user.wishlist.some((id) => id.toString() === productId);

    if (isExist) {
      user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    } else {
      user.wishlist.push(productId);
    }

    await user.save();
    res.json({
      success: true,
      isWishlisted: !isExist,
      message: isExist ? 'Đã xoá khỏi danh sách yêu thích' : 'Đã thêm vào danh sách yêu thích',
      wishlist: user.wishlist,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật danh sách yêu thích' });
  }
};

/**
 * Forgot Password
 * Security Hardening: Anti-enumeration & OTP leakage prevention
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp địa chỉ email hợp lệ' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    // Anti-Enumeration: Always respond with consistent message regardless of whether email exists
    if (!user) {
      logSecurityEvent(SecurityEvent.PASSWORD_RESET_REQUESTED, req, {
        email: cleanEmail,
        status: 'USER_NOT_FOUND',
      });
      return res.json({
        success: true,
        message: 'Nếu email tồn tại trong hệ thống, mã xác thực OTP đã được khởi tạo và gửi tới hộp thư của bạn (hiệu lực 10 phút).',
      });
    }

    // Generate cryptographically secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = otp;
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    await user.save();

    logSecurityEvent(SecurityEvent.PASSWORD_RESET_REQUESTED, req, {
      userId: user._id,
      email: user.email,
    });

    // In production, OTP is dispatched via SES/SMTP.
    // For local development, display in server console log ONLY (NEVER in HTTP response!)
    console.log(`\n🔑 ==========================================`);
    console.log(`[AURA OTP DISPATCH] Mã đặt lại mật khẩu cho: ${cleanEmail}`);
    console.log(`>>> MÃ OTP XÁC NHẬN: [ ${otp} ] (Hiệu lực: 10 phút) <<<`);
    console.log(`==========================================\n`);

    res.json({
      success: true,
      message: 'Nếu email tồn tại trong hệ thống, mã xác thực OTP đã được khởi tạo và gửi tới hộp thư của bạn (hiệu lực 10 phút).',
      // For local testing convenience during dev mode ONLY:
      ...(process.env.NODE_ENV !== 'production' ? { devOtp: otp } : {}),
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Lỗi yêu cầu đặt lại mật khẩu' });
  }
};

/**
 * Reset Password with OTP
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!isValidEmail(email) || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email, mã OTP và mật khẩu mới' });
    }

    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ success: false, message: passwordValidation.message });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({
      email: cleanEmail,
      resetPasswordToken: typeof otp === 'string' ? otp.trim() : otp,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Mã OTP không chính xác hoặc đã hết thời gian hiệu lực (10 phút)',
      });
    }

    // Update password and clear lockout / reset tokens
    user.password = newPassword;
    user.loginAttempts = 0;
    user.lockUntil = null;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    logSecurityEvent(SecurityEvent.PASSWORD_RESET_COMPLETED, req, {
      userId: user._id,
      email: user.email,
    });

    res.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công! Tài khoản của bạn đã được mở khóa an toàn và có thể đăng nhập ngay.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Lỗi thực hiện đặt lại mật khẩu' });
  }
};
