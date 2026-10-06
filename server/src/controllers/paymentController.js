import Order from '../models/Order.js';
import User from '../models/User.js';
import { createVNPayPaymentUrl, verifyVNPayReturn } from '../services/vnpayService.js';
import { createMoMoPaymentUrl, verifyMoMoReturn } from '../services/momoService.js';
import { sendOrderConfirmationEmail } from '../services/emailService.js';
import { getClientIp } from '../middleware/securityShield.js';
import { logSecurityEvent, SecurityEvent } from '../utils/auditLogger.js';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

/**
 * Create VNPay Checkout URL for an existing order
 */
export const createVNPayUrl = async (req, res) => {
  try {
    const { orderCode } = req.body;
    if (!orderCode) {
      return res.status(400).json({ success: false, message: 'Thiếu mã đơn hàng' });
    }

    const order = await Order.findOne({ orderCode });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    const ipAddr = getClientIp(req);
    const paymentUrl = createVNPayPaymentUrl({
      orderCode: order.orderCode,
      amount: order.totalPrice,
      orderInfo: `AURA Thanh toan don hang ${order.orderCode}`,
      ipAddr,
    });

    res.json({
      success: true,
      paymentUrl,
      orderCode: order.orderCode,
      amount: order.totalPrice,
    });
  } catch (error) {
    console.error('Error creating VNPay URL:', error);
    res.status(500).json({ success: false, message: 'Lỗi tạo liên kết thanh toán VNPay' });
  }
};

/**
 * Create MoMo Checkout URL for an existing order
 */
export const createMoMoUrl = async (req, res) => {
  try {
    const { orderCode } = req.body;
    if (!orderCode) {
      return res.status(400).json({ success: false, message: 'Thiếu mã đơn hàng' });
    }

    const order = await Order.findOne({ orderCode });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    const result = await createMoMoPaymentUrl({
      orderCode: order.orderCode,
      amount: order.totalPrice,
      orderInfo: `AURA Thanh toan don hang ${order.orderCode}`,
    });

    if (result.success && result.payUrl) {
      return res.json({
        success: true,
        paymentUrl: result.payUrl,
        qrCodeUrl: result.qrCodeUrl,
        orderCode: order.orderCode,
        amount: order.totalPrice,
      });
    }

    // Fallback: If sandbox MoMo gateway is under maintenance, generate simulated checkout link
    const fallbackUrl = `${CLIENT_URL}?momoPaySimulation=true&orderCode=${order.orderCode}&amount=${order.totalPrice}`;
    res.json({
      success: true,
      paymentUrl: fallbackUrl,
      isSimulated: true,
      message: 'Đang chuyển hướng cổng thanh toán MoMo',
      orderCode: order.orderCode,
      amount: order.totalPrice,
    });
  } catch (error) {
    console.error('Error creating MoMo URL:', error);
    res.status(500).json({ success: false, message: 'Lỗi tạo liên kết thanh toán MoMo' });
  }
};

/**
 * Handle VNPay Return Callback (Customer redirected back)
 */
export const vnpayReturn = async (req, res) => {
  try {
    const verification = verifyVNPayReturn(req.query);
    const { isSuccess, orderCode, amount, transactionNo, bankCode } = verification;

    if (!orderCode) {
      return res.redirect(`${CLIENT_URL}?paymentSuccess=false&error=invalid_order`);
    }

    const order = await Order.findOne({ orderCode });
    if (order && isSuccess) {
      order.paymentStatus = 'Paid';
      order.orderStatus = 'Processing';
      order.timeline.push({
        status: 'Processing',
        title: 'Thanh toán VNPay thành công',
        description: `Giao dịch VNPay #${transactionNo || ''} (Ngân hàng: ${bankCode || 'VNPAY'}) hoàn tất.`,
        time: new Date(),
      });
      await order.save();

      // Trigger order confirmation email
      let recipientEmail = order.shippingAddress?.email;
      if (!recipientEmail && order.user) {
        const u = await User.findById(order.user);
        if (u) recipientEmail = u.email;
      }
      if (recipientEmail) {
        sendOrderConfirmationEmail(recipientEmail, order).catch(() => {});
      }

      logSecurityEvent(SecurityEvent.ORDER_CREATED, req, {
        orderCode,
        method: 'VNPAY',
        status: 'PAID',
        amount,
      });

      return res.redirect(`${CLIENT_URL}?paymentSuccess=true&orderCode=${orderCode}&method=VNPAY`);
    }

    return res.redirect(`${CLIENT_URL}?paymentSuccess=false&orderCode=${orderCode}&method=VNPAY`);
  } catch (error) {
    console.error('VNPay return error:', error);
    res.redirect(`${CLIENT_URL}?paymentSuccess=false&error=server_error`);
  }
};

/**
 * Handle MoMo Return Callback (Customer redirected back)
 */
export const momoReturn = async (req, res) => {
  try {
    const verification = verifyMoMoReturn(req.query);
    const { isSuccess, orderCode, amount, transId } = verification;

    if (!orderCode) {
      return res.redirect(`${CLIENT_URL}?paymentSuccess=false&error=invalid_order`);
    }

    const order = await Order.findOne({ orderCode });
    if (order && isSuccess) {
      order.paymentStatus = 'Paid';
      order.orderStatus = 'Processing';
      order.timeline.push({
        status: 'Processing',
        title: 'Thanh toán MoMo thành công',
        description: `Giao dịch Ví MoMo #${transId || ''} hoàn tất.`,
        time: new Date(),
      });
      await order.save();

      // Trigger order confirmation email
      let recipientEmail = order.shippingAddress?.email;
      if (!recipientEmail && order.user) {
        const u = await User.findById(order.user);
        if (u) recipientEmail = u.email;
      }
      if (recipientEmail) {
        sendOrderConfirmationEmail(recipientEmail, order).catch(() => {});
      }

      logSecurityEvent(SecurityEvent.ORDER_CREATED, req, {
        orderCode,
        method: 'MOMO',
        status: 'PAID',
        amount,
      });

      return res.redirect(`${CLIENT_URL}?paymentSuccess=true&orderCode=${orderCode}&method=MOMO`);
    }

    return res.redirect(`${CLIENT_URL}?paymentSuccess=false&orderCode=${orderCode}&method=MOMO`);
  } catch (error) {
    console.error('MoMo return error:', error);
    res.redirect(`${CLIENT_URL}?paymentSuccess=false&error=server_error`);
  }
};

/**
 * Handle MoMo Webhook IPN
 */
export const momoIPN = async (req, res) => {
  try {
    const verification = verifyMoMoReturn(req.body);
    const { isSuccess, orderCode } = verification;

    if (orderCode && isSuccess) {
      const order = await Order.findOne({ orderCode });
      if (order && order.paymentStatus !== 'Paid') {
        order.paymentStatus = 'Paid';
        order.orderStatus = 'Processing';
        order.timeline.push({
          status: 'Processing',
          title: 'Xác nhận thanh toán MoMo (IPN)',
          description: `Giao dịch #${verification.transId || ''} đã được MoMo xác nhận.`,
          time: new Date(),
        });
        await order.save();
      }
    }

    res.status(200).json({ resultCode: 0, message: 'Acknowledged' });
  } catch (error) {
    console.error('MoMo IPN error:', error);
    res.status(500).json({ resultCode: 99, message: 'Error processing IPN' });
  }
};
