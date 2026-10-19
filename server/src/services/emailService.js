/**
 * AURA STUDIO - High-Performance SMTP Email Service (Nodemailer)
 * Hỗ trợ gửi Email HTML cao cấp qua Gmail SMTP cho Xác Thực 2 Lớp (2FA),
 * Đặt lại mật khẩu và Hóa đơn đơn hàng thời gian thực.
 */

import nodemailer from 'nodemailer';

/**
 * Send an email via Gmail SMTP
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER || '';
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
  const from = process.env.SMTP_FROM || user;

  if (!user || !pass || !to) {
    console.warn('⚠️ SMTP not fully configured or recipient missing. Skipping email dispatch.');
    return { success: false, message: 'SMTP not configured' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const info = await transporter.sendMail({
      from: `"AURA Studio" <${from}>`,
      to,
      subject,
      text,
      html,
    });

    console.log(`✉️ [SMTP SUCCESS] Đã gửi email tới "${to}" thành công! (ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.warn(`⚠️ [SMTP ERROR] Gửi email thất bại: ${err.message}`);
    return { success: false, message: err.message };
  }
};

/**
 * Send 2FA Two-Factor Authentication OTP Email Template
 */
export const sendTwoFactorOtpEmail = async (toEmail, otp, userName = 'Khách hàng') => {
  console.log(`\n======================================================`);
  console.log(`🔐 [2FA SECURITY SHIELD] GỬI MÃ OTP 2 LỚP ĐĂNG NHẬP:`);
  console.log(`👤 Người nhận: ${userName} <${toEmail}>`);
  console.log(`🔑 Mã OTP 6 số: ${otp} (Hiệu lực: 5 phút)`);
  console.log(`======================================================\n`);

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #090a0f; color: #f8fafc; padding: 40px 20px; border-radius: 16px; max-width: 540px; margin: 0 auto; border: 1px solid #27272a;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #facc15; font-size: 24px; margin: 0; letter-spacing: 1px;">⚡ AURA STUDIO</h1>
        <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0;">Hệ Thống Xác Thực Bảo Mật Đa Lớp (2FA)</p>
      </div>
      <div style="background: #12141c; padding: 28px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.08);">
        <h2 style="font-size: 18px; color: #ffffff; margin-top: 0;">
          🛡️ Mã Xác Minh Bảo Mật Đăng Nhập
        </h2>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
          Xin chào <strong>${userName}</strong>,<br>
          Hệ thống bảo vệ AURA Shield phát hiện một yêu cầu đăng nhập vào tài khoản của bạn. Vui lòng nhập mã bảo mật 6 số dưới đây để hoàn tất đăng nhập:
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <div style="display: inline-block; font-family: monospace; font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #000; background: linear-gradient(135deg, #facc15 0%, #f59e0b 100%); padding: 14px 28px; border-radius: 10px; box-shadow: 0 8px 25px rgba(250, 204, 21, 0.4);">
            ${otp}
          </div>
        </div>
        <div style="background: rgba(239, 68, 68, 0.08); border-left: 3px solid #ef4444; padding: 10px 14px; border-radius: 4px; margin-bottom: 16px;">
          <p style="color: #f87171; font-size: 12px; margin: 0; line-height: 1.5;">
            ⚠️ Mã này có hiệu lực trong <strong>5 phút</strong>. Tuyệt đối không chia sẻ mã này cho bất kỳ ai, kể cả nhân viên AURA Studio.
          </p>
        </div>
        <p style="color: #64748b; font-size: 11px; line-height: 1.5; margin-bottom: 0;">
          Nếu bạn không thực hiện yêu cầu đăng nhập này, vui lòng đổi mật khẩu ngay lập tức để bảo vệ tài khoản.
        </p>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #64748b; font-size: 11px;">
        © 2026 AURA STUDIO Inc. All rights reserved.
      </div>
    </div>
  `;

  return sendEmail({
    to: toEmail,
    subject: `[AURA Studio] Mã OTP xác thực 2 lớp: ${otp}`,
    text: `Mã OTP xác thực 2 lớp AURA Studio của bạn là: ${otp} (Hiệu lực: 5 phút).`,
    html,
  });
};

/**
 * Send OTP Password Reset Email Template
 */
export const sendPasswordResetEmail = async (toEmail, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; background: #090a0f; color: #f8fafc; padding: 40px 20px; border-radius: 16px; max-width: 540px; margin: 0 auto; border: 1px solid #27272a;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #facc15; font-size: 24px; margin: 0;">⚡ AURA STUDIO</h1>
        <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0;">Thời Trang Streetwear & Unisex Cao Cấp</p>
      </div>
      <div style="background: #12141c; padding: 24px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);">
        <h2 style="font-size: 18px; color: #ffffff; margin-top: 0;">Yêu Cầu Đặt Lại Mật Khẩu</h2>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
          Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại AURA Studio. Sử dụng mã OTP dưới đây để hoàn tất:
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #facc15; background: rgba(250, 204, 21, 0.12); padding: 12px 24px; border-radius: 8px; border: 1px solid rgba(250, 204, 21, 0.3);">
            ${otp}
          </span>
        </div>
        <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin-bottom: 0;">
          * Mã này có hiệu lực trong <strong>10 phút</strong>. Nếu bạn không yêu cầu hành động này, vui lòng bỏ qua email và tài khoản của bạn vẫn an toàn.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: toEmail,
    subject: `[AURA Studio] Mã OTP đặt lại mật khẩu: ${otp}`,
    text: `Mã OTP đặt lại mật khẩu AURA Studio của bạn là: ${otp} (Hiệu lực 10 phút).`,
    html,
  });
};

/**
 * Send Order Confirmation Email Template
 */
export const sendOrderConfirmationEmail = async (toEmail, order) => {
  const itemsHtml = (order.orderItems || [])
    .map(
      (item) => `
      <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 13px;">
        <span style="color: #cbd5e1;">${item.name} (${item.size} / ${item.color}) x ${item.quantity}</span>
        <span style="color: #facc15; font-weight: 700;">${(item.price * item.quantity).toLocaleString('vi-VN')}₫</span>
      </div>
    `
    )
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; background: #090a0f; color: #f8fafc; padding: 40px 20px; border-radius: 16px; max-width: 580px; margin: 0 auto; border: 1px solid #27272a;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #facc15; font-size: 24px; margin: 0;">⚡ AURA STUDIO</h1>
        <p style="color: #10b981; font-size: 14px; font-weight: 700; margin: 6px 0 0;">✓ XÁC NHẬN ĐƠN HÀNG THÀNH CÔNG</p>
      </div>
      <div style="background: #12141c; padding: 24px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);">
        <p style="color: #cbd5e1; font-size: 14px; margin-top: 0;">
          Xin chào <strong>${order.shippingAddress?.fullName}</strong>, cảm ơn bạn đã đặt hàng tại AURA Studio!
        </p>
        <div style="background: rgba(255,255,255,0.04); padding: 12px 16px; border-radius: 8px; margin: 16px 0; font-size: 13px;">
          <div>Mã đơn hàng: <strong style="color: #38bdf8;">${order.orderCode}</strong></div>
          <div>Phương thức thanh toán: <strong>${order.paymentMethod}</strong></div>
          <div>Trạng thái: <strong style="color: #10b981;">${order.orderStatus}</strong></div>
        </div>

        <h3 style="font-size: 14px; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px;">Chi tiết sản phẩm</h3>
        ${itemsHtml}

        <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 15px; display: flex; justify-content: space-between;">
          <span>Tổng thanh toán:</span>
          <strong style="color: #facc15; font-size: 18px;">${order.totalPrice?.toLocaleString('vi-VN')}₫</strong>
        </div>

        <div style="margin-top: 20px; font-size: 12px; color: #94a3b8;">
          <div>Địa chỉ giao: ${order.shippingAddress?.address}, ${order.shippingAddress?.ward}, ${order.shippingAddress?.district}, ${order.shippingAddress?.city}</div>
          <div>Số điện thoại: ${order.shippingAddress?.phone}</div>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: toEmail,
    subject: `[AURA Studio] Xác nhận đơn hàng ${order.orderCode} thành công`,
    text: `Cảm ơn bạn đã đặt hàng tại AURA Studio. Mã đơn: ${order.orderCode}. Tổng thanh toán: ${order.totalPrice?.toLocaleString('vi-VN')}₫`,
    html,
  });
};
