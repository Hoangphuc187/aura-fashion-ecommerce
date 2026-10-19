/**
 * AURA STUDIO - Brand Watermark & Developer Console Notice
 * Không chặn phím F12 hay chuột phải của người dùng/developer,
 * nhưng tự động làm sạch console và hiển thị thông báo bản quyền chuyên nghiệp khi xem F12.
 */

export const initSecurityProtections = () => {
  if (typeof window === 'undefined') return;

  const printBrandBanner = () => {
    try {
      console.clear();
      const titleStyle =
        'color: #000; background: linear-gradient(135deg, #facc15 0%, #f59e0b 100%); font-size: 16px; font-weight: 900; padding: 6px 16px; border-radius: 6px;';
      const warningStyle =
        'color: #ef4444; font-size: 13px; font-weight: 700; line-height: 1.6; margin-top: 8px;';
      const infoStyle =
        'color: #38bdf8; font-size: 12px; font-weight: 600; line-height: 1.5;';
      const subStyle =
        'color: #94a3b8; font-size: 11px; font-style: italic; margin-top: 4px;';

      console.log('%c⚡ AURA STUDIO • LUXURY STREETWEAR & TECHWEAR ⚡', titleStyle);
      console.log(
        '%c🔒 BẢN QUYỀN HỆ THỐNG & TÀI SẢN TRÍ TUỆ:\n' +
        'Toàn bộ giao diện, hình ảnh, mã nguồn và dữ liệu thuộc quyền sở hữu của AURA STUDIO.\n' +
        'Mọi hành vi sao chép, làm giả website (phishing) hoặc tấn công hệ thống đều bị ghi nhận IP và xử lý theo pháp luật.',
        warningStyle
      );
      console.log(
        '%c💡 Bạn là Lập trình viên / Security Researcher?\n' +
        'Nếu bạn phát hiện lỗi bảo mật có trách nhiệm, vui lòng liên hệ: security@aurastudio.vn',
        infoStyle
      );
      console.log('%c© 2026 AURA STUDIO Inc. All rights reserved. System protected by AURA Shield.', subStyle);
    } catch {
      // Ignore console error
    }
  };

  // In ngay lần đầu tải trang
  printBrandBanner();

  // Khi người dùng bấm F12, in lại thông báo sạch sẽ
  window.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || e.keyCode === 123) {
      setTimeout(printBrandBanner, 200);
    }
  });
};
