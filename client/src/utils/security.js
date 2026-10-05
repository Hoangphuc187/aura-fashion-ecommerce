/**
 * AURA STUDIO - Brand Protection & Anti-Scraping Security Shield
 * Chống sao chép mã nguồn, ngăn chặn hành vi xem nguồn trang (View Source)
 * và sao chép giao diện để tạo website giả mạo (Scam / Phishing).
 */

export const initSecurityProtections = (onBlockedAction) => {
  if (typeof window === 'undefined') return;

  // 1. Chặn chuột phải (Context Menu)
  window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (onBlockedAction) {
      onBlockedAction('Bảo mật: Tính năng chuột phải đã bị khóa để bảo vệ bản quyền thương hiệu AURA Studio.');
    }
    return false;
  }, { capture: true });

  // 2. Chặn các tổ hợp phím mở Developer Tools & Xem nguồn trang
  window.addEventListener('keydown', (e) => {
    // F12 - DevTools
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      if (onBlockedAction) onBlockedAction('Phím F12 (Inspect) đã bị vô hiệu hóa.');
      return false;
    }

    const isCtrlOrMeta = e.ctrlKey || e.metaKey;

    // Ctrl+U (Xem nguồn trang / View Source)
    if (isCtrlOrMeta && (e.key === 'u' || e.key === 'U' || e.keyCode === 85)) {
      e.preventDefault();
      e.stopPropagation();
      if (onBlockedAction) onBlockedAction('Xem mã nguồn trang (Ctrl+U) đã bị chặn.');
      return false;
    }

    // Ctrl+Shift+I (Mở Element Inspector)
    if (isCtrlOrMeta && e.shiftKey && (e.key === 'i' || e.key === 'I' || e.keyCode === 73)) {
      e.preventDefault();
      e.stopPropagation();
      if (onBlockedAction) onBlockedAction('Công cụ kiểm tra phần tử (Inspect) đã bị khóa.');
      return false;
    }

    // Ctrl+Shift+J (Mở Console)
    if (isCtrlOrMeta && e.shiftKey && (e.key === 'j' || e.key === 'J' || e.keyCode === 74)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+Shift+C (Mở Inspector Picker)
    if (isCtrlOrMeta && e.shiftKey && (e.key === 'c' || e.key === 'C' || e.keyCode === 67)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+S (Lưu trang web về máy để clone)
    if (isCtrlOrMeta && (e.key === 's' || e.key === 'S' || e.keyCode === 83)) {
      e.preventDefault();
      e.stopPropagation();
      if (onBlockedAction) onBlockedAction('Tải xuống toàn bộ trang web (Ctrl+S) đã bị chặn.');
      return false;
    }
  }, { capture: true });

  // 3. Cảnh báo bảo mật trong Console
  try {
    const bannerStyle = 'color: #000; background: #facc15; font-size: 16px; font-weight: 800; padding: 6px 14px; border-radius: 4px;';
    const warningStyle = 'color: #ef4444; font-size: 13px; font-weight: 700; line-height: 1.6;';
    const subStyle = 'color: #94a3b8; font-size: 12px;';

    console.clear();
    console.log('%c⚡ AURA STUDIO SECURITY SHIELD ⚡', bannerStyle);
    console.log(
      '%c⚠️ CẢNH BÁO BẢO MẬT & BẢN QUYỀN:\n' +
      'Toàn bộ tài nguyên, thiết kế giao diện, logo và hình ảnh thuộc sở hữu độc quyền của AURA Studio.\n' +
      'Mọi hành vi trích xuất mã nguồn, dịch ngược API hoặc sao chép website nhằm mục đích lừa đảo (scam) ' +
      'sẽ bị hệ thống ghi nhận địa chỉ IP và tiến hành các biện pháp pháp lý theo quy định.',
      warningStyle
    );
    console.log('%cProtected by AURA Anti-Scam Shield 2026.', subStyle);
  } catch {
    // Ignore console restriction
  }
};
