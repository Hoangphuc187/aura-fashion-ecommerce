import Coupon from '../models/Coupon.js';

/**
 * Get all coupons (Admin)
 */
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (error) {
    console.error('getAllCoupons error:', error);
    res.status(500).json({ success: false, message: 'Lỗi nạp danh sách mã giảm giá' });
  }
};

/**
 * Create new coupon (Admin)
 */
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType = 'percent',
      discountValue,
      minOrderValue = 0,
      maxDiscount = null,
      description = '',
      usageLimit = 100,
      perUserLimit = 1,
      startDate = new Date(),
      expiresAt = null,
      isActive = true,
    } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập mã giảm giá' });
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá này đã tồn tại trên hệ thống' });
    }

    const numValue = Number(discountValue);
    if (isNaN(numValue) || numValue < 0) {
      return res.status(400).json({ success: false, message: 'Giá trị giảm giá không hợp lệ' });
    }

    const coupon = await Coupon.create({
      code: cleanCode,
      discountType,
      discountValue: numValue,
      minOrderValue: Number(minOrderValue) || 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      description: description.trim(),
      usageLimit: Number(usageLimit) || 100,
      usedCount: 0,
      perUserLimit: Number(perUserLimit) || 1,
      startDate: startDate ? new Date(startDate) : new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isActive: Boolean(isActive),
    });

    res.status(201).json({
      success: true,
      message: `Đã tạo mã giảm giá ${cleanCode} thành công!`,
      coupon,
    });
  } catch (error) {
    console.error('createCoupon error:', error);
    res.status(500).json({ success: false, message: 'Lỗi tạo mã giảm giá' });
  }
};

/**
 * Update coupon (Admin)
 */
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      description,
      usageLimit,
      perUserLimit,
      startDate,
      expiresAt,
      isActive,
    } = req.body;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy mã giảm giá' });
    }

    if (code) coupon.code = code.trim().toUpperCase();
    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = Number(discountValue);
    if (minOrderValue !== undefined) coupon.minOrderValue = Number(minOrderValue);
    if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount ? Number(maxDiscount) : null;
    if (description !== undefined) coupon.description = description.trim();
    if (usageLimit !== undefined) coupon.usageLimit = Number(usageLimit);
    if (perUserLimit !== undefined) coupon.perUserLimit = Number(perUserLimit);
    if (startDate) coupon.startDate = new Date(startDate);
    if (expiresAt !== undefined) coupon.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (isActive !== undefined) coupon.isActive = Boolean(isActive);

    await coupon.save();

    res.json({
      success: true,
      message: 'Cập nhật mã giảm giá thành công!',
      coupon,
    });
  } catch (error) {
    console.error('updateCoupon error:', error);
    res.status(500).json({ success: false, message: 'Lỗi cập nhật mã giảm giá' });
  }
};

/**
 * Delete coupon (Admin)
 */
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy mã giảm giá để xóa' });
    }
    res.json({ success: true, message: 'Đã xóa mã giảm giá thành công' });
  } catch (error) {
    console.error('deleteCoupon error:', error);
    res.status(500).json({ success: false, message: 'Lỗi xóa mã giảm giá' });
  }
};

/**
 * Toggle active state (Admin)
 */
export const toggleCouponActive = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy mã giảm giá' });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.json({
      success: true,
      message: `Đã ${coupon.isActive ? 'kích hoạt' : 'tạm ngưng'} mã ${coupon.code}`,
      coupon,
    });
  } catch (error) {
    console.error('toggleCouponActive error:', error);
    res.status(500).json({ success: false, message: 'Lỗi thay đổi trạng thái mã giảm giá' });
  }
};

/**
 * Refund coupon usage count manually (Admin)
 */
export const refundCouponUsage = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy mã giảm giá' });
    }

    coupon.usedCount = Math.max(0, (coupon.usedCount || 0) - 1);
    await coupon.save();

    res.json({
      success: true,
      message: `Đã hoàn trả 1 lượt sử dụng cho mã ${coupon.code}. Lượt dùng hiện tại: ${coupon.usedCount}/${coupon.usageLimit}`,
      coupon,
    });
  } catch (error) {
    console.error('refundCouponUsage error:', error);
    res.status(500).json({ success: false, message: 'Lỗi hoàn lượt sử dụng mã' });
  }
};

/**
 * Get active promotional coupons (Public / Customer)
 */
export const getActiveCoupons = async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    }).sort({ discountValue: -1 });

    res.json({ success: true, coupons });
  } catch (error) {
    console.error('getActiveCoupons error:', error);
    res.status(500).json({ success: false, message: 'Lỗi nạp danh sách mã giảm giá' });
  }
};
