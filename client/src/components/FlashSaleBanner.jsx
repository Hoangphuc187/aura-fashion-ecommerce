import React, { useState, useEffect } from 'react';
import { Flame, Clock, Copy, Check, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export const FlashSaleBanner = ({ onShowSaleOnly }) => {
  const { applyCoupon } = useCart();
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);

  // Countdown timer: 14 hours 28 mins
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 28,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    applyCoupon(code);
    addToast(`Đã sao chép & áp dụng mã ${code}!`, 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      style={{
        maxWidth: '1360px',
        margin: '20px auto 40px',
        padding: '0 24px',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #181926 0%, #201815 50%, #151821 100%)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 87, 34, 0.3)',
          padding: '24px 32px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          boxShadow: '0 10px 30px rgba(255, 87, 34, 0.12)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(250, 204, 21, 0.6)';
          e.currentTarget.style.boxShadow = '0 15px 40px rgba(255, 87, 34, 0.25), 0 0 35px rgba(250, 204, 21, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 87, 34, 0.3)';
          e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 87, 34, 0.12)';
        }}
      >
        {/* Glow corner */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(255, 87, 34, 0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Left text */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', zIndex: 1 }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #ff5722 0%, #facc15 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(255, 87, 34, 0.4)',
            }}
          >
            <Flame size={30} color="#000" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  background: '#ff5722',
                  color: '#fff',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  letterSpacing: '1px',
                }}
              >
                FLASH DEAL
              </span>
              <span style={{ fontSize: '0.84rem', color: '#facc15', fontWeight: 700 }}>
                Ưu Đãi Độc Quyền Hôm Nay
              </span>
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                fontWeight: 800,
                marginTop: '4px',
              }}
            >
              Giảm Đến 30% Các Mẫu Bestseller & New Drop
            </h3>
          </div>
        </div>

        {/* Center Countdown Timer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.85rem' }}>
            <Clock size={16} color="#facc15" />
            <span>Kết thúc sau:</span>
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <div
              style={{
                background: '#090a0f',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                color: '#fff',
                minWidth: '45px',
                textAlign: 'center',
              }}
            >
              {String(timeLeft.hours).padStart(2, '0')}
            </div>
            <span style={{ fontWeight: 800, color: '#facc15' }}>:</span>
            <div
              style={{
                background: '#090a0f',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                color: '#fff',
                minWidth: '45px',
                textAlign: 'center',
              }}
            >
              {String(timeLeft.minutes).padStart(2, '0')}
            </div>
            <span style={{ fontWeight: 800, color: '#facc15' }}>:</span>
            <div
              style={{
                background: '#090a0f',
                border: '1px solid rgba(255, 87, 34, 0.4)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                color: '#ff5722',
                minWidth: '45px',
                textAlign: 'center',
              }}
            >
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Right Coupon Copy Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', zIndex: 1 }}>
          <div
            onClick={() => copyCode('STREETWEAR20')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px dashed rgba(250, 204, 21, 0.5)',
              padding: '8px 16px',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>MÃ GIẢM 20%</div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.98rem',
                  fontWeight: 800,
                  color: '#facc15',
                  letterSpacing: '1px',
                }}
              >
                STREETWEAR20
              </div>
            </div>
            {copied ? <Check size={18} color="#10b981" /> : <Copy size={18} color="#cbd5e1" />}
          </div>

          <button
            onClick={onShowSaleOnly}
            className="btn-primary"
            style={{ padding: '10px 18px', fontSize: '0.86rem' }}
          >
            <Sparkles size={16} />
            <span>Xem Các Mẫu Sale</span>
          </button>
        </div>
      </div>
    </div>
  );
};
