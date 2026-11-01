import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import { logSecurityEvent, SecurityEvent } from '../utils/auditLogger.js';
import { sendOrderConfirmationEmail } from '../services/emailService.js';
import { sseService } from '../services/sseService.js';
import { checkExpiredOrders } from '../services/orderExpiryWorker.js';
import { invalidateProductCache } from './productController.js';
import {
  executeAtomicInventoryAllocationProcedure,
  executeAtomicInventoryRestitutionProcedure,
} from '../procedures/inventoryProcedure.js';
import { OrderResponseDto } from '../dtos/order.dto.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { logger } from '../config/logger.js';

/**
 * Create Order with Stored Procedure & DTO Serialization
 * - Validates authoritative server-side prices (Anti-Tampering)
 * - Invokes Atomic Inventory Allocation Procedure
 * - Sets unique order tracking UUID
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
      return ApiResponse.error(res, { message: 'Giỏ hàng của bạn đang trống', statusCode: 400 });
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
      return ApiResponse.error(res, {
        message: 'Vui lòng cung cấp đầy đủ họ tên, số điện thoại, địa chỉ và thành phố nhận hàng hợp lệ.',
        statusCode: 400,
      });
    }

    // 1. Fetch products from DB and recalculate server-side prices (Anti-Tampering)
    let calculatedItemsPrice = 0;
    const verifiedOrderItems = [];

    for (const item of orderItems) {
      if (!item.product || typeof item.quantity !== 'number' || item.quantity <= 0) {
        return ApiResponse.error(res, { message: 'Dữ liệu sản phẩm trong đơn hàng không hợp lệ', statusCode: 400 });
      }

      const dbProduct = await Product.findById(item.product);
      if (!dbProduct) {
        return ApiResponse.error(res, { message: `Sản phẩm với mã ${item.product} không tồn tại`, statusCode: 400 });
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

    // 2. ATOMIC INVENTORY ALLOCATION PROCEDURE (Chống Race Condition & Bán Âm Kho khi Flash Sale)
    const allocation = await executeAtomicInventoryAllocationProcedure(verifiedOrderItems, req.id);

    if (!allocation.success) {
      return ApiResponse.error(res, {
        statusCode: 400,
        errorCode: 'INSUFFICIENT_STOCK',
        message:
          allocation.remainingAvailable <= 0
            ? `Sản phẩm "${allocation.failedItemName}" vừa hết hàng do có nhiều người cùng đặt trong Flash Sale. Vui lòng chọn sản phẩm khác.`
            : `Sản phẩm "${allocation.failedItemName}" chỉ còn ${allocation.remainingAvailable} món trong kho. Không đủ số lượng bạn yêu cầu.`,
        meta: { insufficientStock: true },
      });
    }

    // 3. Shipping calculation
    const shippingPrice = shippingMethod === 'express' ? 45000 : 30000;

    // 4. Coupon verification
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

    // 5. User linking
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

    let createdOrder;
    try {
      createdOrder = await order.save();
    } catch (saveError) {
      // Rollback locked inventory if order save fails
      await executeAtomicInventoryRestitutionProcedure(verifiedOrderItems, 'ORDER_SAVE_FAILED', req.id);
      invalidateProductCache();
      throw saveError;
    }

    invalidateProductCache();

    if (verifiedCouponCode) {
      await Coupon.findOneAndUpdate(
        { code: verifiedCouponCode },
        { $inc: { usedCount: 1 } }
      );
    }

    logSecurityEvent(SecurityEvent.ORDER_CREATED, req, {
      orderId: createdOrder._id,
      orderCode: createdOrder.orderCode,
      trackingUuid: createdOrder.trackingUuid,
      totalPrice: calculatedTotalPrice,
      userId: assignedUserId,
    });

    // If COD, dispatch email confirmation immediately
    if (paymentMethod === 'COD' && recipientEmail) {
      sendOrderConfirmationEmail(recipientEmail, createdOrder).catch((err) => {
        logger.warn('Could not send COD confirmation email:', { error: err?.message, requestId: req.id });
      });
    }

    // Broadcast new order event & stock updates to Admin real-time stream
    sseService.broadcastToAdmin('new_order', createdOrder);
    for (const locked of allocation.lockedItems || []) {
      sseService.broadcastToAdmin('stock_updated', {
        productId: locked.product,
        stockQuantity: locked.newStock,
      });
    }

    logger.info(`Order created successfully: ${createdOrder.orderCode} [UUID: ${createdOrder.trackingUuid}]`, {
      requestId: req.id,
      orderCode: createdOrder.orderCode,
      trackingUuid: createdOrder.trackingUuid,
    });

    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Đặt hàng thành công!',
      data: {
        order: createdOrder,
        serializedOrder: OrderResponseDto.transform(createdOrder),
      },
    });
  } catch (error) {
    logger.error(`createOrder error: ${error.message}`, { requestId: req.id });
    return ApiResponse.error(res, { message: 'Đã xảy ra lỗi khi tạo đơn hàng', statusCode: 500, errors: error.message });
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

    return ApiResponse.success(res, {
      message: 'Nạp danh sách đơn hàng thành công',
      data: { orders },
    });
  } catch (error) {
    logger.error(`getMyOrders error: ${error.message}`, { requestId: req.id });
    return ApiResponse.error(res, { message: 'Lỗi nạp danh sách đơn hàng', statusCode: 500 });
  }
};

/**
 * Get Order By ID / OrderCode / Tracking UUID
 * Security Hardening: IDOR Protection
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const { phone } = req.query;
    let order;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id).populate('user', 'name email uuid').lean();
    }
    if (!order) {
      order = await Order.findOne({
        $or: [{ orderCode: id }, { trackingUuid: id }],
      }).populate('user', 'name email uuid').lean();
    }

    if (!order) {
      return ApiResponse.error(res, { message: 'Không tìm thấy đơn hàng', statusCode: 404 });
    }

    // IDOR Access Control Verification:
    if (req.user && req.user.role === 'admin') {
      return ApiResponse.success(res, { data: { order } });
    }

    if (req.user && order.user && order.user._id.toString() === req.user._id.toString()) {
      return ApiResponse.success(res, { data: { order } });
    }

    if (phone && order.shippingAddress.phone === String(phone).trim()) {
      return ApiResponse.success(res, { data: { order } });
    }

    return ApiResponse.error(res, {
      message: 'Không tìm thấy đơn hàng hoặc bạn không có quyền truy cập.',
      statusCode: 404,
    });
  } catch (error) {
    logger.error(`getOrderById error: ${error.message}`, { requestId: req.id });
    return ApiResponse.error(res, { message: 'Lỗi truy xuất thông tin đơn hàng', statusCode: 500 });
  }
};

/**
 * Public Order Tracking via UUID (No IDOR enumeration possible)
 * GET /api/orders/track/:uuid
 */
export const getOrderByTrackingUuid = async (req, res) => {
  try {
    const { uuid } = req.params;
    const order = await Order.findOne({ trackingUuid: uuid })
      .select('-user -shippingAddress.address -shippingAddress.phone') // Cloak private customer info
      .lean();

    if (!order) {
      return ApiResponse.error(res, { message: 'Mã tra cứu đơn hàng không tồn tại', statusCode: 404 });
    }

    return ApiResponse.success(res, {
      message: 'Tra cứu thông tin hành trình đơn hàng thành công',
      data: {
        order: OrderResponseDto.transform(order),
      },
    });
  } catch (error) {
    logger.error(`getOrderByTrackingUuid error: ${error.message}`, { requestId: req.id });
    return ApiResponse.error(res, { message: 'Lỗi tra cứu đơn hàng', statusCode: 500 });
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
    const orders = await Order.find(query).populate('user', 'name email phone uuid').sort(sortOption).lean();

    return ApiResponse.success(res, {
      message: 'Nạp danh sách đơn hàng toàn hệ thống thành công',
      data: { orders },
    });
  } catch (error) {
    logger.error(`getAllOrders error: ${error.message}`, { requestId: req.id });
    return ApiResponse.error(res, { message: 'Lỗi nạp danh sách đơn hàng toàn hệ thống', statusCode: 500 });
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
      return ApiResponse.error(res, { message: 'Trạng thái đơn hàng không hợp lệ', statusCode: 400 });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return ApiResponse.error(res, { message: 'Không tìm thấy đơn hàng', statusCode: 404 });
    }

    const oldStatus = order.orderStatus;
    order.orderStatus = orderStatus;

    if (orderStatus === 'Delivered') {
      order.paymentStatus = 'Paid';
    } else if (orderStatus === 'Refunded') {
      order.paymentStatus = 'Paid';
    }

    // Hoàn voucher và phục hồi tồn kho nếu chuyển sang Cancelled hoặc Refunded qua Stored Procedure
    if (
      (orderStatus === 'Cancelled' || orderStatus === 'Refunded') &&
      oldStatus !== 'Cancelled' &&
      oldStatus !== 'Refunded'
    ) {
      await executeAtomicInventoryRestitutionProcedure(order.orderItems, `ADMIN_${orderStatus.toUpperCase()}`, req.id);

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

    sseService.notifyOrderUpdate(updatedOrder.orderCode, updatedOrder);

    return ApiResponse.success(res, {
      message: 'Cập nhật trạng thái đơn hàng thành công',
      data: { order: updatedOrder },
    });
  } catch (error) {
    logger.error(`updateOrderStatus error: ${error.message}`, { requestId: req.id });
    return ApiResponse.error(res, { message: 'Lỗi cập nhật trạng thái đơn hàng', statusCode: 500 });
  }
};

/**
 * Customer Self-Cancel Order
 */
export const customerCancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Khách hàng yêu cầu hủy đơn' } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return ApiResponse.error(res, { message: 'Không tìm thấy đơn hàng', statusCode: 404 });
    }

    if (!order.user || order.user.toString() !== req.user._id.toString()) {
      return ApiResponse.error(res, { message: 'Bạn không có quyền thao tác trên đơn hàng này', statusCode: 403 });
    }

    if (order.orderStatus !== 'Pending' && order.orderStatus !== 'Processing') {
      return ApiResponse.error(res, {
        message: 'Đơn hàng đã được chuyển cho đơn vị vận chuyển hoặc đã xử lý xong, không thể tự hủy.',
        statusCode: 400,
      });
    }

    order.orderStatus = 'Cancelled';
    order.refundReason = reason;

    // Phục hồi kho hàng thông qua Stored Procedure
    await executeAtomicInventoryRestitutionProcedure(order.orderItems, 'CUSTOMER_CANCEL', req.id);

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
    sseService.notifyOrderUpdate(order.orderCode, order);

    return ApiResponse.success(res, {
      message: 'Hủy đơn hàng thành công! Mã giảm giá (nếu có) đã được hoàn lại vào tài khoản của bạn.',
      data: { order },
    });
  } catch (error) {
    logger.error(`customerCancelOrder error: ${error.message}`, { requestId: req.id });
    return ApiResponse.error(res, { message: 'Lỗi khi hủy đơn hàng', statusCode: 500 });
  }
};

/**
 * Apply Coupon
 */
export const applyCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code || typeof code !== 'string') {
      return ApiResponse.error(res, { message: 'Vui lòng nhập mã giảm giá', statusCode: 400 });
    }

    const numTotal = Number(cartTotal);
    if (isNaN(numTotal) || numTotal <= 0) {
      return ApiResponse.error(res, { message: 'Giá trị giỏ hàng không hợp lệ', statusCode: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });
    if (!coupon) {
      return ApiResponse.error(res, { message: 'Mã giảm giá không tồn tại hoặc đã bị vô hiệu', statusCode: 404 });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return ApiResponse.error(res, { message: 'Mã khuyến mãi này đã hết hạn sử dụng', statusCode: 400 });
    }

    if (numTotal < coupon.minOrderValue) {
      return ApiResponse.error(res, {
        message: `Mã này chỉ áp dụng cho đơn hàng tối thiểu ${coupon.minOrderValue.toLocaleString('vi-VN')}₫`,
        statusCode: 400,
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

    return ApiResponse.success(res, {
      message: `Áp dụng mã ${coupon.code} thành công! Giảm ${discount.toLocaleString('vi-VN')}₫`,
      data: {
        discount,
        couponCode: coupon.code,
      },
    });
  } catch (error) {
    logger.error(`applyCoupon error: ${error.message}`, { requestId: req.id });
    return ApiResponse.error(res, { message: 'Lỗi áp dụng mã khuyến mãi', statusCode: 500 });
  }
};

/**
 * Admin: Trigger manual expired order scan
 */
export const triggerManualExpiryCheck = async (req, res) => {
  try {
    const { backdateOrderId } = req.body || {};
    if (backdateOrderId) {
      await Order.collection.updateOne(
        { _id: new mongoose.Types.ObjectId(backdateOrderId) },
        {
          $set: {
            createdAt: new Date(Date.now() - 25 * 60 * 1000),
            orderStatus: 'Pending',
            paymentStatus: 'Pending',
            paymentMethod: 'VNPAY',
          },
        }
      );
    }

    const result = await checkExpiredOrders();
    return ApiResponse.success(res, {
      message: `Đã quét và xử lý ${result.count || 0} đơn hàng quá hạn thanh toán.`,
      data: { result },
    });
  } catch (error) {
    logger.error(`triggerManualExpiryCheck error: ${error.message}`, { requestId: req.id });
    return ApiResponse.error(res, { message: 'Lỗi quét đơn hàng quá hạn', statusCode: 500 });
  }
};
