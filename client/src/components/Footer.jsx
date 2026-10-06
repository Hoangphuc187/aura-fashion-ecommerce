import React from 'react';
import { Zap, Heart, Shield, RefreshCw, Truck, Mail, Phone, MapPin, HelpCircle, MessageSquare, Ticket } from 'lucide-react';

export const Footer = ({ onSelectCategory, onOpenSupport }) => {
  return (
    <footer
      style={{
        background: '#07080c',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        color: '#94a3b8',
        padding: '60px 24px 30px',
        marginTop: '80px',
      }}
    >
      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '40px',
          marginBottom: '50px',
        }}
      >
        {/* Col 1: Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #facc15 0%, #ff5722 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Zap size={18} color="#000" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
              AURA STUDIO
            </span>
          </div>

          <p style={{ fontSize: '0.86rem', lineHeight: 1.6, marginBottom: '20px' }}>
            Thương hiệu thời trang đường phố đương đại mang phong cách Streetwear & Unisex. Chất lượng định lượng cao cấp, chuẩn form dáng giới trẻ hiện đại.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1' }}>
              <MapPin size={16} color="#facc15" />
              <span>Flagship Store: 88 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1' }}>
              <Phone size={16} color="#facc15" />
              <span>Hotline hỗ trợ: 1900 8888 (08:30 - 22:00)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1' }}>
              <Mail size={16} color="#facc15" />
              <span>Email: contact@aurastudio.vn</span>
            </div>
          </div>
        </div>

        {/* Col 2: Categories */}
        <div>
          <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 800, marginBottom: '18px' }}>
            Danh Mục Sản Phẩm
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem' }}>
            {['Áo thun', 'Áo khoác', 'Sơ mi', 'Quần & Shorts', 'Váy & Đầm', 'Phụ kiện'].map((cat) => (
              <li key={cat}>
                <span
                  onClick={() => onSelectCategory(cat)}
                  style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => (e.target.style.color = '#facc15')}
                  onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
                >
                  {cat}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Customer Care Policies */}
        <div>
          <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 800, marginBottom: '18px' }}>
            Chính Sách & Hỗ Trợ
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem' }}>
            <li
              onClick={() => onOpenSupport && onOpenSupport('faq')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#facc15')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
            >
              <RefreshCw size={14} color="#10b981" />
              <span>Chính sách đổi trả trong 30 ngày</span>
            </li>
            <li
              onClick={() => onOpenSupport && onOpenSupport('faq')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#facc15')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
            >
              <Truck size={14} color="#facc15" />
              <span>Vận chuyển hỏa tốc trong 2H & Đồng kiểm</span>
            </li>
            <li
              onClick={() => onOpenSupport && onOpenSupport('faq')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#facc15')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
            >
              <Shield size={14} color="#3b82f6" />
              <span>Bảo hành hình in và đường may 6 tháng</span>
            </li>
            <li
              onClick={() => onOpenSupport && onOpenSupport('chat')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#facc15')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
            >
              <MessageSquare size={14} color="#a855f7" />
              <span>Tư vấn chọn size chuẩn xác (Live Chat)</span>
            </li>
            <li
              onClick={() => onOpenSupport && onOpenSupport('contact')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#facc15')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
            >
              <Ticket size={14} color="#ec4899" />
              <span>Gửi yêu cầu hỗ trợ / Tạo Ticket (#TK)</span>
            </li>
            <li
              onClick={() => onOpenSupport && onOpenSupport('lookup')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#facc15')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
            >
              <HelpCircle size={14} color="#38bdf8" />
              <span>Tra cứu tiến độ xử lý khiếu nại</span>
            </li>
          </ul>
        </div>

        {/* Col 4: Newsletter */}
        <div>
          <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 800, marginBottom: '14px' }}>
            Nhận Thông Báo Drop Mới
          </h4>
          <p style={{ fontSize: '0.84rem', lineHeight: 1.5, marginBottom: '14px' }}>
            Đăng ký nhận mã giảm giá 50.000₫ cho đơn hàng đầu tiên và thông tin bộ sưu tập giới hạn.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="email"
              placeholder="Email của bạn..."
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                padding: '10px 14px',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.84rem',
                flex: 1,
                outline: 'none',
              }}
            />
            <button
              className="btn-primary"
              style={{ padding: '10px 16px', borderRadius: '8px', fontSize: '0.84rem' }}
              onClick={() => alert('Cảm ơn bạn đã đăng ký nhận tin từ AURA!')}
            >
              Gửi
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          paddingTop: '24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          gap: '12px',
        }}
      >
        <div>© 2026 AURA STUDIO. All rights reserved. Nền tảng Thương mại điện tử Thời trang.</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Thiết kế và phát triển với</span>
          <Heart size={14} color="#f43f5e" fill="#f43f5e" />
          <span>Fullstack Node.js + Express + MongoDB & React</span>
        </div>
      </div>
    </footer>
  );
};
