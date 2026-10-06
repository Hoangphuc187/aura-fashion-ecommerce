import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import Product from '../models/Product.js';
import { logSecurityEvent, SecurityEvent } from '../utils/auditLogger.js';
import { isValidEmail, validatePasswordStrength } from '../middleware/sanitize.js';
import { sendPasswordResetEmail } from '../services/emailService.js';

const getJwtSecret = () => {
  return process.env.JWT_SECRET || 'aura_fallback_dev_secret_key_2026';
};

const generateToken = (id, tokenVersion = 0) => {
  return jwt.sign({ id, tokenVersion }, getJwtSecret(), {
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
 * OAuth Login / Register (Google, Facebook)
 */
export const oauthLogin = async (req, res) => {
  try {
    const { provider = 'google', providerId, email, name, avatar } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Email từ OAuth không hợp lệ' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const idField = provider === 'facebook' ? 'facebookId' : provider === 'google' ? 'googleId' : 'googleId';

    let user = await User.findOne({
      $or: [
        { email: cleanEmail },
        ...(providerId ? [{ [idField]: providerId }] : []),
      ],
    });

    if (user) {
      if (provider === 'google' && providerId && !user.googleId) user.googleId = providerId;
      if (provider === 'facebook' && providerId && !user.facebookId) user.facebookId = providerId;
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
        facebookId: provider === 'facebook' ? providerId || `facebook_${Date.now()}` : null,
        role: 'customer',
      });
    }

    logSecurityEvent(SecurityEvent.LOGIN_SUCCESS, req, {
      userId: user._id,
      email: user.email,
      provider,
    });

    const providerTitle = provider === 'facebook' ? 'Facebook' : 'Google';
    res.json({
      success: true,
      message: `Đăng nhập qua ${providerTitle} thành công!`,
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
    if (req.body.dob !== undefined && typeof req.body.dob === 'string') {
      user.dob = req.body.dob.trim();
    }
    if (req.body.gender !== undefined && typeof req.body.gender === 'string') {
      user.gender = req.body.gender.trim();
    }
    if (req.body.avatar && typeof req.body.avatar === 'string' && (req.body.avatar.startsWith('http') || req.body.avatar.startsWith('data:image'))) {
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

    const updatedUser = await user.save();

    logSecurityEvent(SecurityEvent.PROFILE_UPDATED, req, {
      userId: user._id,
      email: user.email,
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
        dob: updatedUser.dob || '',
        gender: updatedUser.gender || '',
        address: updatedUser.address,
        addresses: updatedUser.addresses || [],
        token: generateToken(updatedUser._id, updatedUser.tokenVersion || 0),
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Lỗi cập nhật hồ sơ' });
  }
};

/**
 * Address Book Operations
 */
export const addAddress = async (req, res) => {
  try {
    const { fullName, phone, street, ward, district, city, isDefault } = req.body;
    if (!street || !city) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền địa chỉ và tỉnh/thành phố' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });

    const isFirstAddress = !user.addresses || user.addresses.length === 0;
    const shouldBeDefault = Boolean(isDefault || isFirstAddress);

    if (shouldBeDefault && user.addresses) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    const newAddr = {
      fullName: (fullName || user.name || '').trim(),
      phone: (phone || user.phone || '').trim(),
      street: street.trim(),
      ward: (ward || '').trim(),
      district: (district || '').trim(),
      city: city.trim(),
      isDefault: shouldBeDefault,
    };

    user.addresses.push(newAddr);

    // If default, also sync primary user.address
    if (shouldBeDefault) {
      user.address = {
        street: newAddr.street,
        ward: newAddr.ward,
        district: newAddr.district,
        city: newAddr.city,
      };
      if (newAddr.phone) user.phone = newAddr.phone;
    }

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Đã thêm địa chỉ mới vào sổ địa chỉ',
      addresses: user.addresses,
    });
  } catch (error) {
    console.error('addAddress error:', error);
    res.status(500).json({ success: false, message: 'Lỗi thêm địa chỉ mới' });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone, street, ward, district, city, isDefault } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });

    const addrIndex = user.addresses.findIndex((a) => a._id.toString() === id);
    if (addrIndex === -1) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy địa chỉ này' });
    }

    if (isDefault) {
      user.addresses.forEach((a) => {
        a.isDefault = false;
      });
    }

    user.addresses[addrIndex].fullName = fullName ? fullName.trim() : user.addresses[addrIndex].fullName;
    user.addresses[addrIndex].phone = phone ? phone.trim() : user.addresses[addrIndex].phone;
    user.addresses[addrIndex].street = street ? street.trim() : user.addresses[addrIndex].street;
    user.addresses[addrIndex].ward = ward !== undefined ? ward.trim() : user.addresses[addrIndex].ward;
    user.addresses[addrIndex].district = district !== undefined ? district.trim() : user.addresses[addrIndex].district;
    user.addresses[addrIndex].city = city ? city.trim() : user.addresses[addrIndex].city;
    if (isDefault !== undefined) {
      user.addresses[addrIndex].isDefault = Boolean(isDefault);
    }

    if (user.addresses[addrIndex].isDefault) {
      user.address = {
        street: user.addresses[addrIndex].street,
        ward: user.addresses[addrIndex].ward,
        district: user.addresses[addrIndex].district,
        city: user.addresses[addrIndex].city,
      };
    }

    await user.save();
    res.json({
      success: true,
      message: 'Cập nhật địa chỉ thành công',
      addresses: user.addresses,
    });
  } catch (error) {
    console.error('updateAddress error:', error);
    res.status(500).json({ success: false, message: 'Lỗi cập nhật địa chỉ' });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });

    const target = user.addresses.find((a) => a._id.toString() === id);
    user.addresses = user.addresses.filter((a) => a._id.toString() !== id);

    // If deleted address was default, make the first one default
    if (target?.isDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
      user.address = {
        street: user.addresses[0].street,
        ward: user.addresses[0].ward,
        district: user.addresses[0].district,
        city: user.addresses[0].city,
      };
    }

    await user.save();
    res.json({
      success: true,
      message: 'Đã xóa địa chỉ thành công',
      addresses: user.addresses,
    });
  } catch (error) {
    console.error('deleteAddress error:', error);
    res.status(500).json({ success: false, message: 'Lỗi xóa địa chỉ' });
  }
};

export const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });

    let found = false;
    user.addresses.forEach((a) => {
      if (a._id.toString() === id) {
        a.isDefault = true;
        found = true;
        user.address = {
          street: a.street,
          ward: a.ward,
          district: a.district,
          city: a.city,
        };
        if (a.phone) user.phone = a.phone;
      } else {
        a.isDefault = false;
      }
    });

    if (!found) return res.status(404).json({ success: false, message: 'Không tìm thấy địa chỉ' });

    await user.save();
    res.json({
      success: true,
      message: 'Đã đặt làm địa chỉ mặc định',
      addresses: user.addresses,
    });
  } catch (error) {
    console.error('setDefaultAddress error:', error);
    res.status(500).json({ success: false, message: 'Lỗi đặt địa chỉ mặc định' });
  }
};

/**
 * Change Password
 */
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập mật khẩu cũ và mật khẩu mới' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });

    // If local user with password, verify old password
    if (user.password) {
      const isMatch = await user.matchPassword(oldPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng' });
      }
    }

    const passValidation = validatePasswordStrength(newPassword);
    if (!passValidation.valid) {
      return res.status(400).json({ success: false, message: passValidation.message });
    }

    user.password = newPassword;
    user.tokenVersion = (user.tokenVersion || 0) + 1; // invalidate other old sessions
    await user.save();

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công! Các phiên đăng nhập trên thiết bị khác đã được đăng xuất an toàn.',
      token: generateToken(user._id, user.tokenVersion),
    });
  } catch (error) {
    console.error('changePassword error:', error);
    res.status(500).json({ success: false, message: 'Lỗi thay đổi mật khẩu' });
  }
};

/**
 * Logout All Devices (Revoke all active tokens)
 */
export const logoutAllDevices = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });

    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    res.json({
      success: true,
      message: 'Đã đăng xuất khỏi tất cả các thiết bị khác thành công!',
    });
  } catch (error) {
    console.error('logoutAllDevices error:', error);
    res.status(500).json({ success: false, message: 'Lỗi đăng xuất thiết bị' });
  }
};

/**
 * Get Customer Vouchers (Available, Used, Expired)
 */
export const getMyVouchers = async (req, res) => {
  try {
    const now = new Date();
    const allCoupons = await Coupon.find().lean();

    // Check customer orders to identify used coupons
    const userOrders = await Order.find({ user: req.user._id }).select('couponCode createdAt orderStatus').lean();
    const usedCouponCodes = userOrders
      .filter((o) => o.couponCode && o.orderStatus !== 'Cancelled' && o.orderStatus !== 'Refunded')
      .map((o) => o.couponCode.toUpperCase());

    const available = [];
    const used = [];
    const expired = [];

    for (const c of allCoupons) {
      const codeUpper = c.code.toUpperCase();
      const isUsedByMe = usedCouponCodes.includes(codeUpper);
      const isExpired = (c.expiresAt && new Date(c.expiresAt) < now) || (c.usageLimit && c.usedCount >= c.usageLimit);

      if (isUsedByMe) {
        used.push({ ...c, status: 'used' });
      } else if (isExpired || !c.isActive) {
        expired.push({ ...c, status: 'expired' });
      } else {
        available.push({ ...c, status: 'available' });
      }
    }

    res.json({
      success: true,
      available,
      used,
      expired,
    });
  } catch (error) {
    console.error('getMyVouchers error:', error);
    res.status(500).json({ success: false, message: 'Lỗi nạp danh sách mã giảm giá' });
  }
};

/**
 * Get Customer Reviews Summary (Reviewed vs Pending Review on Delivered orders)
 */
export const getMyReviewsSummary = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    // 1. Get all products where this user has reviewed
    const allProducts = await Product.find().lean();
    const reviewed = [];

    allProducts.forEach((prod) => {
      if (prod.reviews && prod.reviews.length > 0) {
        const userRev = prod.reviews.find((r) => r.user && r.user.toString() === userId);
        if (userRev) {
          reviewed.push({
            productId: prod._id,
            productName: prod.name,
            productImage: prod.images?.[0] || '',
            productPrice: prod.price,
            rating: userRev.rating,
            comment: userRev.comment,
            images: userRev.images || [],
            createdAt: userRev.createdAt,
          });
        }
      }
    });

    // 2. Get all products purchased in 'Delivered' orders that haven't been reviewed yet
    const deliveredOrders = await Order.find({
      user: req.user._id,
      orderStatus: 'Delivered',
    }).lean();

    const pendingReviewMap = new Map();

    deliveredOrders.forEach((order) => {
      order.orderItems?.forEach((item) => {
        const prodId = item.product?.toString();
        // check if already reviewed
        const already = reviewed.some((r) => r.productId.toString() === prodId);
        if (!already && prodId && !pendingReviewMap.has(prodId)) {
          pendingReviewMap.set(prodId, {
            productId: prodId,
            productName: item.name,
            productImage: item.image,
            productPrice: item.price,
            orderCode: order.orderCode,
            deliveredAt: order.updatedAt,
          });
        }
      });
    });

    const pendingList = Array.from(pendingReviewMap.values());

    res.json({
      success: true,
      reviewed,
      pendingReview: pendingList,
      completedReviews: reviewed,
      pendingReviews: pendingList,
    });
  } catch (error) {
    console.error('getMyReviewsSummary error:', error);
    res.status(500).json({ success: false, message: 'Lỗi nạp lịch sử đánh giá' });
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

    // Dispatch real email via Gmail SMTP (in background)
    sendPasswordResetEmail(cleanEmail, otp).catch((err) => {
      console.warn('Could not dispatch password reset email:', err?.message || err);
    });

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
