/**
 * Native Lightweight SMTP Email Service
 * Zero external dependencies - uses Node.js native TLS for secure SMTP delivery
 */

import tls from 'tls';

/**
 * Send an email via Gmail SMTP
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) === 465 ? 465 : 465; // Direct SSL/TLS port for Gmail
  const user = process.env.SMTP_USER || '';
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
  const from = process.env.SMTP_FROM || user;

  if (!user || !pass || !to) {
    console.warn('⚠️ SMTP not fully configured or recipient missing. Skipping email dispatch.');
    return { success: false, message: 'SMTP not configured' };
  }

  return new Promise((resolve) => {
    let step = 0;
    const socket = tls.connect(port, host, { timeout: 8000 }, () => {
      // Socket connected
    });

    socket.setEncoding('utf8');

    const finish = (result) => {
      try {
        socket.write('QUIT\r\n');
        socket.end();
      } catch {}
      resolve(result);
    };

    let buffer = '';
    socket.on('data', (chunk) => {
      buffer += chunk;
      const lines = buffer.split('\r\n').filter(Boolean);
      const lastLine = lines[lines.length - 1] || '';

      // Check if SMTP response block has finished (3 digits followed by a space)
      const match = lastLine.match(/^(\d{3})\s/);
      if (!match) return; // Incomplete response, wait for more data

      const code = match[1];
      buffer = ''; // Reset buffer for next round

      if (code.startsWith('4') || code.startsWith('5')) {
        console.warn(`⚠️ [SMTP ERROR] Server returned: ${lastLine}`);
        return finish({ success: false, message: lastLine });
      }

      if (step === 0 && code === '220') {
        step = 1;
        socket.write('EHLO localhost\r\n');
      } else if (step === 1 && code === '250') {
        step = 2;
        socket.write('AUTH LOGIN\r\n');
      } else if (step === 2 && code === '334') {
        step = 3;
        socket.write(Buffer.from(user).toString('base64') + '\r\n');
      } else if (step === 3 && code === '334') {
        step = 4;
        socket.write(Buffer.from(pass).toString('base64') + '\r\n');
      } else if (step === 4 && code === '235') {
        step = 5;
        socket.write(`MAIL FROM:<${from}>\r\n`);
      } else if (step === 5 && code === '250') {
        step = 6;
        socket.write(`RCPT TO:<${to}>\r\n`);
      } else if (step === 6 && code === '250') {
        step = 7;
        socket.write('DATA\r\n');
      } else if (step === 7 && code === '354') {
        step = 8;
        const boundary = '----=_Part_' + Date.now();
        const emailHeaders = [
          `From: "AURA Studio" <${from}>`,
          `To: <${to}>`,
          `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
          'MIME-Version: 1.0',
          `Content-Type: multipart/alternative; boundary="${boundary}"`,
          '',
          `--${boundary}`,
          'Content-Type: text/plain; charset=UTF-8',
          '',
          text || '',
          '',
          `--${boundary}`,
          'Content-Type: text/html; charset=UTF-8',
          '',
          html || text || '',
          '',
          `--${boundary}--`,
          '',
          '.',
          '',
        ].join('\r\n');

        socket.write(emailHeaders);
      } else if (step === 8 && code === '250') {
        console.log(`✉️ [SMTP SUCCESS] Đã gửi email tới "${to}" thành công!`);
        finish({ success: true });
      }
    });

    socket.on('error', (err) => {
      console.warn('⚠️ [SMTP Connection Error]:', err.message);
      finish({ success: false, message: err.message });
    });

    socket.on('timeout', () => {
      socket.destroy();
      finish({ success: false, message: 'SMTP connection timed out' });
    });
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
