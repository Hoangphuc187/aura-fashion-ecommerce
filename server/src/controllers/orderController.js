import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import { logSecurityEvent, SecurityEvent } from '../utils/auditLogger.js';
import { sendOrderConfirmationEmail } from '../services/emailService.js';
import { sseService } from '../services/sseService.js';
import { checkExpiredOrders } from '../services/orderExpiryWorker.js';

/**
 * Create Order
 * Security Hardening: Recalculates prices from database to prevent client-side price tampering
 */
export const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      shippingMethod = 'standard',
      paymentMethod = 'COD',
      couponCode,
    } = req.body;

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Giỏ hàng của bạn đang trống' });
    }

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.fullName.trim() ||
      !shippingAddress.phone ||
      !shippingAddress.phone.trim() ||
      !shippingAddress.address ||
      !shippingAddress.address.trim() ||
      !shippingAddress.city ||
      !shippingAddress.city.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ họ tên, số điện thoại, địa chỉ và thành phố nhận hàng hợp lệ.',
      });
    }

    // 1. Fetch products from DB and recalculate server-side prices (Anti-Tampering)
    let calculatedItemsPrice = 0;
    const verifiedOrderItems = [];

    for (const item of orderItems) {
      if (!item.product || typeof item.quantity !== 'number' || item.quantity <= 0) {
        return res.status(400).json({ success: false, message: 'Dữ liệu sản phẩm trong đơn hàng không hợp lệ' });
      }

      const dbProduct = await Product.findById(item.product);
      if (!dbProduct) {
        return res.status(400).json({ success: false, message: `Sản phẩm với mã ${item.product} không tồn tại` });
      }

      // Check stock
      if (dbProduct.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm "${dbProduct.name}" chỉ còn ${dbProduct.stockQuantity} món trong kho.`,
        });
      }

      const itemTotal = dbProduct.price * item.quantity;
      calculatedItemsPrice += itemTotal;

      verifiedOrderItems.push({
        product: dbProduct._id,
        name: dbProduct.name,
        image: (dbProduct.images && dbProduct.images[0]) || '',
        price: dbProduct.price, // Server authoritative price
        size: item.size || 'M',
        color: item.color || 'Đen',
        quantity: item.quantity,
      });
    }

    // 2. Shipping calculation
    const shippingPrice = shippingMethod === 'express' ? 45000 : 30000;

    // 3. Coupon verification
    let discountAmount = 0;
    let verifiedCouponCode = '';

    if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
      const cleanCode = couponCode.trim().toUpperCase();
      const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });
      const now = new Date();
      if (
        coupon &&
        (!coupon.expiresAt || new Date(coupon.expiresAt) > now) &&
        (!coupon.startDate || new Date(coupon.startDate) <= now) &&
        (!coupon.usageLimit || (coupon.usedCount || 0) < coupon.usageLimit)
      ) {
        if (calculatedItemsPrice >= coupon.minOrderValue) {
          if (coupon.discountType === 'percent') {
            discountAmount = Math.round((calculatedItemsPrice * coupon.discountValue) / 100);
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
              discountAmount = coupon.maxDiscount;
            }
          } else if (coupon.discountType === 'freeship') {
            discountAmount = shippingPrice;
          } else {
            discountAmount = coupon.discountValue;
          }
          verifiedCouponCode = coupon.code;
        }
      }
    }

    const calculatedTotalPrice = Math.max(0, calculatedItemsPrice + shippingPrice - discountAmount);

    // 4. User linking
    let assignedUserId = req.user ? req.user._id : null;
    if (!assignedUserId && shippingAddress.phone) {
      const matchedUser = await User.findOne({ phone: shippingAddress.phone.trim() });
      if (matchedUser) assignedUserId = matchedUser._id;
    }

    // Unique order code
    const orderCode = 'AURA-' + Math.floor(100000 + Math.random() * 900000);

    const initialTimeline = [
      {
        status: 'Pending',
        title: 'Đơn hàng đã được khởi tạo',
        description: 'Hệ thống đã ghi nhận đơn hàng và đang chờ xác nhận.',
        time: new Date(),
      },
    ];

    if (['CARD', 'VIETQR', 'MOMO', 'VNPAY'].includes(paymentMethod)) {
      let methodText = 'Cổng thanh toán trực tuyến';
      if (paymentMethod === 'MOMO') methodText = 'Ví MoMo (Quét QR thanh toán)';
      if (paymentMethod === 'VNPAY') methodText = 'Cổng VNPAY-QR / Thẻ ngân hàng';
      if (paymentMethod === 'VIETQR') methodText = 'VietQR Chuyển khoản tức thì';
      if (paymentMethod === 'CARD') methodText = 'Thẻ Tín dụng / Ghi nợ quốc tế';

      initialTimeline.push({
        status: 'Processing',
        title: 'Xác nhận thanh toán',
        description: `Phương thức thanh toán qua ${methodText}.`,
        time: new Date(),
      });
    }

    const recipientEmail = (
      shippingAddress.email ||
      (req.user ? req.user.email : '') ||
      ''
    ).trim();

    const order = new Order({
      user: assignedUserId,
      orderCode,
      orderItems: verifiedOrderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone.trim(),
        email: recipientEmail,
        address: shippingAddress.address.trim(),
        ward: (shippingAddress.ward || '').trim(),
        district: (shippingAddress.district || '').trim(),
        city: shippingAddress.city.trim(),
        note: (shippingAddress.note || '').trim(),
      },
      shippingMethod,
      paymentMethod,
      paymentStatus: ['VNPAY', 'MOMO', 'COD'].includes(paymentMethod) ? 'Pending' : 'Paid',
      orderStatus: ['VNPAY', 'MOMO', 'COD'].includes(paymentMethod) ? 'Pending' : 'Processing',
      itemsPrice: calculatedItemsPrice,
      shippingPrice,
      discountAmount,
      totalPrice: calculatedTotalPrice,
      couponCode: verifiedCouponCode,
      timeline: initialTimeline,
    });

    const createdOrder = await order.save();

    // Deduct stock quantity safely
    for (const item of verifiedOrderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: -item.quantity },
      });
    }

    // Increment coupon used count if coupon was used
    if (verifiedCouponCode) {
      await Coupon.findOneAndUpdate(
        { code: verifiedCouponCode },
        { $inc: { usedCount: 1 } }
      );
    }

    logSecurityEvent(SecurityEvent.ORDER_CREATED, req, {
      orderId: createdOrder._id,
      orderCode: createdOrder.orderCode,
      totalPrice: calculatedTotalPrice,
      userId: assignedUserId,
    });

    // If COD, dispatch email confirmation immediately (for VNPay/MoMo, email is dispatched upon successful callback)
    if (paymentMethod === 'COD' && recipientEmail) {
      sendOrderConfirmationEmail(recipientEmail, createdOrder).catch((err) => {
        console.warn('Could not send COD confirmation email:', err?.message || err);
      });
    }

    // Broadcast new order event to Admin real-time stream
    sseService.broadcastToAdmin('new_order', createdOrder);

    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công!',
      order: createdOrder,
    });
  } catch (error) {
    console.error('createOrder error:', error);
    res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi tạo đơn hàng' });
  }
};

/**
 * Get My Orders (Authenticated User)
 */
export const getMyOrders = async (req, res) => {
  try {
    const queryConditions = [{ user: req.user._id }];
    if (req.user.phone && req.user.phone.trim()) {
      queryConditions.push({ 'shippingAddress.phone': req.user.phone.trim() });
    }
    const orders = await Order.find({ $or: queryConditions }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, orders });
  } catch (error) {
    console.error('getMyOrders error:', error);
    res.status(500).json({ success: false, message: 'Lỗi nạp danh sách đơn hàng' });
  }
};

/**
 * Get Order By ID / OrderCode
 * Security Hardening: IDOR Protection
 * Verifies caller is either the owner, admin, or validates guest identity via phone/email verification
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const { phone } = req.query; // Verification parameter for guest lookup
    let order;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id).populate('user', 'name email').lean();
    }
    if (!order) {
      order = await Order.findOne({ orderCode: id }).populate('user', 'name email').lean();
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    // IDOR Access Control Verification:
    // 1. If admin -> Allowed
    if (req.user && req.user.role === 'admin') {
      return res.json({ success: true, order });
    }

    // 2. If authenticated order owner -> Allowed
    if (req.user && order.user && order.user._id.toString() === req.user._id.toString()) {
      return res.json({ success: true, order });
    }

    // 3. If guest order: require verification via matching recipient phone number
    if (phone && order.shippingAddress.phone === String(phone).trim()) {
      return res.json({ success: true, order });
    }

    // If caller does not own this order and gave no matching verification -> 404 Cloaking
    return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng hoặc bạn không có quyền truy cập.' });
  } catch (error) {
    console.error('getOrderById error:', error);
    res.status(500).json({ success: false, message: 'Lỗi truy xuất thông tin đơn hàng' });
  }
};

/**
 * Get All Orders (Admin Only)
 */
export const getAllOrders = async (req, res) => {
  try {
    const { status, sort = 'newest' } = req.query;
    const query = {};
    if (status && status !== 'All') {
      query.orderStatus = status;
    }

    const sortOption = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
    const orders = await Order.find(query).populate('user', 'name email phone').sort(sortOption).lean();

    res.json({ success: true, orders });
  } catch (error) {
    console.error('getAllOrders error:', error);
    res.status(500).json({ success: false, message: 'Lỗi nạp danh sách đơn hàng toàn hệ thống' });
  }
};

/**
 * Update Order Status (Admin Only)
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, note } = req.body;
    const allowedStatuses = ['Pending', 'Processing', 'Shipping', 'Delivered', 'Cancelled', 'Refunded'];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({ success: false, message: 'Trạng thái đơn hàng không hợp lệ' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    const oldStatus = order.orderStatus;
    order.orderStatus = orderStatus;

    if (orderStatus === 'Delivered') {
      order.paymentStatus = 'Paid';
    } else if (orderStatus === 'Refunded') {
      order.paymentStatus = 'Paid'; // or Refunded
    }

    // Hoàn voucher và phục hồi tồn kho nếu chuyển sang Cancelled hoặc Refunded từ trạng thái đang hoạt động
    if (
      (orderStatus === 'Cancelled' || orderStatus === 'Refunded') &&
      oldStatus !== 'Cancelled' &&
      oldStatus !== 'Refunded'
    ) {
      // 1. Phục hồi tồn kho sản phẩm
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stockQuantity: item.quantity },
        });
      }

      // 2. Hoàn voucher nếu có dùng mã
      if (order.couponCode) {
        const coupon = await Coupon.findOne({ code: order.couponCode.toUpperCase() });
        if (coupon && coupon.usedCount > 0) {
          coupon.usedCount = Math.max(0, coupon.usedCount - 1);
          await coupon.save();
        }
      }
    }

    let statusTitle = 'Cập nhật trạng thái';
    if (orderStatus === 'Processing') statusTitle = 'Đang đóng gói và xử lý';
    if (orderStatus === 'Shipping') statusTitle = 'Đang giao hàng cho đơn vị vận chuyển';
    if (orderStatus === 'Delivered') statusTitle = 'Giao hàng thành công';
    if (orderStatus === 'Cancelled') statusTitle = 'Đơn hàng đã huỷ (Đã hoàn voucher & tồn kho)';
    if (orderStatus === 'Refunded') statusTitle = 'Đã hoàn tiền (Đã hoàn voucher & tồn kho)';

    order.timeline.push({
      status: orderStatus,
      title: statusTitle,
      description: note || `Đơn hàng chuyển sang trạng thái: ${orderStatus}`,
      time: new Date(),
    });

    const updatedOrder = await order.save();

    logSecurityEvent(SecurityEvent.ADMIN_ACTION, req, {
      adminId: req.user._id,
      action: 'UPDATE_ORDER_STATUS',
      orderId: order._id,
      newStatus: orderStatus,
    });

    // Notify real-time listeners (Customer watching tracking page + Admin dashboard)
    sseService.notifyOrderUpdate(updatedOrder.orderCode, updatedOrder);

    res.json({
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    res.status(500).json({ success: false, message: 'Lỗi cập nhật trạng thái đơn hàng' });
  }
};

/**
 * Customer Self-Cancel Order (Only for Pending or Processing orders)
 */
export const customerCancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Khách hàng yêu cầu hủy đơn' } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    // Verify ownership
    if (!order.user || order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền thao tác trên đơn hàng này' });
    }

    if (order.orderStatus !== 'Pending' && order.orderStatus !== 'Processing') {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng đã được chuyển cho đơn vị vận chuyển hoặc đã xử lý xong, không thể tự hủy.',
      });
    }

    order.orderStatus = 'Cancelled';
    order.refundReason = reason;

    // Phục hồi tồn kho sản phẩm
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: item.quantity },
      });
    }

    // Hoàn voucher
    if (order.couponCode) {
      const coupon = await Coupon.findOne({ code: order.couponCode.toUpperCase() });
      if (coupon && coupon.usedCount > 0) {
        coupon.usedCount = Math.max(0, coupon.usedCount - 1);
        await coupon.save();
      }
    }

    order.timeline.push({
      status: 'Cancelled',
      title: 'Khách hàng đã hủy đơn hàng',
      description: `Lý do: ${reason}. Mã giảm giá và kho hàng đã được hoàn lại.`,
      time: new Date(),
    });

    await order.save();

    // Notify real-time tracking that order is cancelled
    sseService.notifyOrderUpdate(order.orderCode, order);

    res.json({
      success: true,
      message: 'Hủy đơn hàng thành công! Mã giảm giá (nếu có) đã được hoàn lại vào tài khoản của bạn.',
      order,
    });
  } catch (error) {
    console.error('customerCancelOrder error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi hủy đơn hàng' });
  }
};

/**
 * Apply Coupon
 */
export const applyCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập mã giảm giá' });
    }

    const numTotal = Number(cartTotal);
    if (isNaN(numTotal) || numTotal <= 0) {
      return res.status(400).json({ success: false, message: 'Giá trị giỏ hàng không hợp lệ' });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Mã giảm giá không tồn tại hoặc đã bị vô hiệu' });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ success: false, message: 'Mã khuyến mãi này đã hết hạn sử dụng' });
    }

    if (numTotal < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Mã này chỉ áp dụng cho đơn hàng tối thiểu ${coupon.minOrderValue.toLocaleString('vi-VN')}₫`,
      });
    }

    let discount = 0;
    if (coupon.discountType === 'percent') {
      discount = Math.round((numTotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    res.json({
      success: true,
      message: `Áp dụng mã ${coupon.code} thành công! Giảm ${discount.toLocaleString('vi-VN')}₫`,
      discount,
      couponCode: coupon.code,
    });
  } catch (error) {
    console.error('applyCoupon error:', error);
    res.status(500).json({ success: false, message: 'Lỗi áp dụng mã khuyến mãi' });
  }
};

/**
 * Admin: Trigger manual expired order scan
 */
export const triggerManualExpiryCheck = async (req, res) => {
  try {
    const result = await checkExpiredOrders();
    res.json({
      success: true,
      message: `Đã quét và xử lý ${result.count || 0} đơn hàng quá hạn thanh toán.`,
      result,
    });
  } catch (error) {
    console.error('triggerManualExpiryCheck error:', error);
    res.status(500).json({ success: false, message: 'Lỗi quét đơn hàng quá hạn' });
  }
};
