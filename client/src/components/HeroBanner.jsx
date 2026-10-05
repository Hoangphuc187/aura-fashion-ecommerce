import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, RefreshCw, Zap } from 'lucide-react';

export const HeroBanner = ({ onExploreClick, onPromoClick }) => {
  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, rgba(18, 20, 29, 0.9) 0%, rgba(9, 10, 15, 1) 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        padding: '60px 24px 80px',
      }}
    >
      {/* Background glow orbs */}
      <div
        style={{
          position: 'absolute',
          top: '-150px',
          left: '20%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(250, 204, 21, 0.12) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-100px',
          right: '10%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 87, 34, 0.1) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          alignItems: 'center',
          gap: '48px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Left Column: Text & CTAs */}
        <div>
          {/* Badge Tag */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'rgba(250, 204, 21, 0.12)',
              border: '1px solid rgba(250, 204, 21, 0.3)',
              color: '#facc15',
              fontSize: '0.82rem',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '20px',
            }}
          >
            <Sparkles size={15} />
            <span>SPRING / SUMMER 2026 DROP</span>
          </div>

          {/* Main Title */}
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)',
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: '-0.5px',
              marginBottom: '20px',
            }}
          >
            Định Hình <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #facc15 0%, #ff7849 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Phong Cách Đường Phố
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '1.05rem',
              lineHeight: 1.6,
              maxWidth: '540px',
              marginBottom: '32px',
            }}
          >
            Thời trang Streetwear & Unisex mang đậm tinh thần phóng khoáng, nổi loạn nhưng không kém phần thanh lịch. Chất liệu Cotton chải kỹ 260-420gsm giữ form Boxy chuẩn quốc tế.
          </p>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '14px',
              marginBottom: '40px',
            }}
          >
            <button
              onClick={onExploreClick}
              className="btn-primary"
              style={{ padding: '14px 28px', fontSize: '0.96rem' }}
            >
              <span>Khám Phá Ngay</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={onPromoClick}
              className="btn-secondary"
              style={{ padding: '14px 26px', fontSize: '0.96rem' }}
            >
              <Zap size={18} color="#facc15" />
              <span>Săn Sale -30%</span>
            </button>
          </div>

          {/* Feature Badges */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '16px',
              paddingTop: '24px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={20} color="#10b981" />
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700 }}>100% Chính Hãng</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Chất vải cao cấp</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <RefreshCw size={20} color="#facc15" />
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700 }}>Đổi Trả 30 Ngày</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Hỗ trợ tận nơi</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Zap size={20} color="#ff5722" />
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700 }}>Giao Hỏa Tốc</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Nội thành trong 2H</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Showcase */}
        <div style={{ position: 'relative' }}>
          {/* Main Visual Image Card */}
          <div
            style={{
              position: 'relative',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85"
              alt="AURA Streetwear Collection"
              style={{
                width: '100%',
                height: '520px',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, transparent 40%, rgba(9, 10, 15, 0.95) 100%)',
              }}
            />

            {/* Bottom Caption on Image */}
            <div
              style={{
                position: 'absolute',
                bottom: '24px',
                left: '24px',
                right: '24px',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span
                  style={{
                    background: '#facc15',
                    color: '#000',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                  }}
                >
                  BESTSELLER LOOKBOOK
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    marginTop: '6px',
                  }}
                >
                  Acid Wash Cyberpunk Series
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Từ 360.000₫ • Đang bán rất chạy
                </p>
              </div>

              <button
                onClick={onExploreClick}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: '#fff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                }}
              >
                <ArrowRight size={20} color="#000" />
              </button>
            </div>
          </div>

          {/* Floating Floating Promo Pill */}
          <div
            className="animate-float"
            style={{
              position: 'absolute',
              top: '30px',
              left: '-20px',
              background: 'rgba(18, 20, 29, 0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(250, 204, 21, 0.4)',
              borderRadius: '16px',
              padding: '12px 18px',
              boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #facc15 0%, #ff5722 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.8rem',
                color: '#000',
              }}
            >
              -30%
            </div>
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 800 }}>Flash Sale Giờ Vàng</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Mã: STREETWEAR20</div>
            </div>
          </div>

          {/* Floating Trust Badge */}
          <div
            className="float-item-2"
            style={{
              position: 'absolute',
              bottom: '-18px',
              left: '16px',
              background: 'rgba(18, 20, 29, 0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '16px',
              padding: '10px 16px',
              boxShadow: '0 15px 35px rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              zIndex: 3,
            }}
          >
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 10px #10b981',
              }}
            />
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>
              1.250+ Khách mua tuần này • <span style={{ color: '#facc15' }}>★ 4.9/5</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
