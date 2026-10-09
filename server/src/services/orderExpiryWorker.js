import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { invalidateProductCache } from '../controllers/productController.js';
import { sseService } from './sseService.js';
import { logSecurityEvent, SecurityEvent } from '../utils/auditLogger.js';

export const ORDER_EXPIRY_TIMEOUT_MINUTES = 15;

/**
 * Scan and automatically cancel pending online payment orders (VNPay/MoMo)
 * that exceeded the 15-minute checkout window, restoring their inventory and coupons.
 */
export const checkExpiredOrders = async () => {
  try {
    const cutoffTime = new Date(Date.now() - ORDER_EXPIRY_TIMEOUT_MINUTES * 60 * 1000);

    // Find orders placed via online gateway still pending after timeout
    const expiredOrders = await Order.find({
      paymentMethod: { $in: ['VNPAY', 'MOMO'] },
      orderStatus: 'Pending',
      paymentStatus: 'Pending',
      createdAt: { $lte: cutoffTime },
    });

    if (expiredOrders.length === 0) {
      return { success: true, count: 0, orders: [] };
    }

    const processedOrders = [];

    for (const order of expiredOrders) {
      order.orderStatus = 'Cancelled';
      order.refundReason = `Tự động hủy do quá hạn thanh toán ${ORDER_EXPIRY_TIMEOUT_MINUTES} phút`;

      // 1. Restock physical inventory
      for (const item of order.orderItems) {
        if (item.product && item.quantity) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stockQuantity: item.quantity },
          });
        }
      }

      // 2. Restore coupon voucher usage count
      if (order.couponCode) {
        const coupon = await Coupon.findOne({ code: order.couponCode.toUpperCase() });
        if (coupon && coupon.usedCount > 0) {
          coupon.usedCount = Math.max(0, coupon.usedCount - 1);
          await coupon.save();
        }
      }

      // 3. Append to timeline
      order.timeline.push({
        status: 'Cancelled',
        title: 'Tự động hủy đơn do quá thời hạn thanh toán',
        description: `Đơn hàng thanh toán qua ${order.paymentMethod} không nhận được xác nhận thanh toán sau ${ORDER_EXPIRY_TIMEOUT_MINUTES} phút. Hệ thống tự động hủy đơn và hoàn trả sản phẩm về kho.`,
        time: new Date(),
      });

      const savedOrder = await order.save();
      processedOrders.push(savedOrder);

      // 4. Log audit trail
      logSecurityEvent(SecurityEvent.ORDER_EXPIRED, null, {
        orderId: savedOrder._id,
        orderCode: savedOrder.orderCode,
        paymentMethod: savedOrder.paymentMethod,
        totalPrice: savedOrder.totalPrice,
      });

      // 5. Broadcast live SSE events to customer & Admin portal
      sseService.notifyOrderUpdate(savedOrder.orderCode, savedOrder);
      sseService.broadcastToAdmin('order_expired', {
        orderCode: savedOrder.orderCode,
        orderId: savedOrder._id,
        itemsCount: savedOrder.orderItems.length,
        totalPrice: savedOrder.totalPrice,
        cancelledAt: new Date(),
      });
    }

    // Invalidate product cache so customer view immediately shows restocked inventory
    invalidateProductCache();

    console.log(`[OrderExpiryWorker] Đã tự động hủy và hoàn trả tồn kho cho ${expiredOrders.length} đơn hàng quá hạn thanh toán.`);

    return {
      success: true,
      count: expiredOrders.length,
      orders: processedOrders,
    };
  } catch (error) {
    console.error('[OrderExpiryWorker] Lỗi khi quét đơn hàng quá hạn:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Start the background worker running every 60 seconds
 */
export const startOrderExpiryWorker = (intervalSeconds = 60) => {
  console.log(`[OrderExpiryWorker] Đã khởi động background worker (quét mỗi ${intervalSeconds}s, thời gian hết hạn: ${ORDER_EXPIRY_TIMEOUT_MINUTES} phút)...`);

  // Run immediate initial scan on boot
  checkExpiredOrders();

  // Schedule interval
  const intervalId = setInterval(() => {
    checkExpiredOrders();
  }, intervalSeconds * 1000);

  return intervalId;
};
