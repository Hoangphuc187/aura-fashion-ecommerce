import React, { useState, useEffect } from 'react';
import { Sparkles, Flame, AlertCircle, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const SmartNotificationAlert = ({ onSelectProduct }) => {
  const { wishlist } = useAuth();
  const { cart } = useCart();
  const [notification, setNotification] = useState(null);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Candidates for smart alerts: items from wishlist or cart
    const timer = setInterval(() => {
      // 30% chance to trigger an alert if not already showing
      if (notification) return;

      const randomAlerts = [
        {
          id: 'sale-discount',
          type: 'sale',
          icon: Sparkles,
          title: '🔥 Ưu Đãi Độc Quyền!',
          message: 'Sản phẩm trong danh sách yêu thích của bạn vừa giảm thêm 20%.',
          highlight: 'Áp dụng hôm nay',
        },
        {
          id: 'low-stock-m',
          type: 'stock',
          icon: Flame,
          title: '⚡ Cảnh Báo Hết Hàng!',
          message: 'Sản phẩm trong giỏ hàng (Size M) chỉ còn 3 chiếc cuối cùng trong kho!',
          highlight: 'Nhanh tay kẻo lỡ',
        },
        {
          id: 'flash-freeship',
          type: 'freeship',
          icon: Sparkles,
          title: '🚚 Miễn Phí Giao Hàng!',
          message: 'Đơn hàng của bạn đủ điều kiện nhận Freeship toàn quốc.',
          highlight: 'Áp dụng mã FREESHIP',
        },
      ];

      // Pick one randomly
      const selected = randomAlerts[Math.floor(Math.random() * randomAlerts.length)];
      setNotification(selected);
      setProgress(100);
    }, 28000); // Trigger every 28 seconds

    return () => clearInterval(timer);
  }, [notification, wishlist, cart]);

  // Handle countdown progress bar & auto-dismiss after 5s
  useEffect(() => {
    if (!notification) return;

    const interval = 50; // update every 50ms
    const totalDuration = 5000; // 5 seconds
    const decrement = (interval / totalDuration) * 100;

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(progressTimer);
          setNotification(null);
          return 0;
        }
        return prev - decrement;
      });
    }, interval);

    return () => clearInterval(progressTimer);
  }, [notification]);

  if (!notification) return null;

  const Icon = notification.icon;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9990,
        maxWidth: '380px',
        width: 'calc(100% - 48px)',
        background: 'linear-gradient(135deg, rgba(17, 18, 27, 0.95) 0%, rgba(26, 27, 38, 0.95) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(250, 204, 21, 0.35)',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(250, 204, 21, 0.15)',
        overflow: 'hidden',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #facc15 0%, #eab308 100%)',
            color: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={20} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#facc15' }}>
              {notification.title}
            </span>
            <button
              onClick={() => setNotification(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={15} />
            </button>
          </div>

          <p style={{ margin: '4px 0 6px', fontSize: '0.8rem', color: '#e2e8f0', lineHeight: 1.4 }}>
            {notification.message}
          </p>

          <span
            style={{
              display: 'inline-block',
              background: 'rgba(250, 204, 21, 0.15)',
              color: '#facc15',
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '6px',
            }}
          >
            {notification.highlight}
          </span>
        </div>
      </div>

      {/* Progress Bar indicating auto-dismiss timer */}
      <div style={{ width: '100%', height: '3px', background: 'rgba(255, 255, 255, 0.08)' }}>
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #facc15 0%, #f59e0b 100%)',
            transition: 'width 0.05s linear',
          }}
        />
      </div>
    </div>
  );
};

export default SmartNotificationAlert;
