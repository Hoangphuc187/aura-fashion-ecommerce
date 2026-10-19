import React, { useState } from 'react';
import { Sparkles, ShoppingBag, ArrowRight, Eye, Check, Tag } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export const LookbookSection = ({ products = [], onOpenProduct }) => {
  const { addToCart, setCartDrawerOpen } = useCart();
  const { addToast } = useToast();

  const [activeLookIndex, setActiveLookIndex] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState(null);

  // Match real seeded products by keyword or fallback
  const findProduct = (keyword, fallbackName, price, img) => {
    const found = products.find((p) =>
      p.name.toLowerCase().includes(keyword.toLowerCase())
    );
    if (found) return found;
    return {
      _id: `look_${keyword}`,
      name: fallbackName,
      price: price,
      originalPrice: Math.round(price * 1.25),
      images: [img],
      sizes: [{ size: 'M', stock: 20 }, { size: 'L', stock: 15 }],
      colors: [{ name: 'Đen', hex: '#111' }],
      category: 'Thời trang',
    };
  };

  const looks = [
    {
      id: 'look-01',
      title: 'LOOK 01 • CYBERPUNK NIGHTWALKER',
      subtitle: 'Phong cách Darkwear công nghệ tương lai kết hợp tiện ích tactical',
      modelImage:
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
      badge: 'BỘ PHỐI HOT TREND #1',
      discountNote: 'Tiết kiệm 10% khi mua trọn bộ 3 món',
      items: [
        {
          keyword: 'Hoodie',
          fallbackName: 'Áo Hoodie Cyberpunk Acid Wash Oversized',
          price: 680000,
          img: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
          position: { top: '35%', left: '46%' },
          label: 'Áo Hoodie Acid Wash',
        },
        {
          keyword: 'Tactical',
          fallbackName: 'Túi Đeo Chéo Tactical Crossbody Bag Chống Nước',
          price: 290000,
          img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
          position: { top: '48%', left: '32%' },
          label: 'Túi Tactical Chống Nước',
        },
        {
          keyword: 'Parachute',
          fallbackName: 'Quần Cargo Nhiều Túi Parachute Trousers',
          price: 520000,
          img: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
          position: { top: '74%', left: '55%' },
          label: 'Quần Cargo Parachute',
        },
      ],
    },
    {
      id: 'look-02',
      title: 'LOOK 02 • TOKYO RETRO MINIMALIST',
      subtitle: 'Sự pha trộn giữa sơ mi họa tiết hoài cổ và phong cách đường phố năng động',
      modelImage:
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
      badge: 'PHỐI ĐỒ MÙA HÈ 2026',
      discountNote: 'Tiết kiệm 10% khi mua trọn bộ 3 món',
      items: [
        {
          keyword: 'Cap',
          fallbackName: 'Mũ Lưỡi Trai Vintage Washed Cap Thêu Nổi',
          price: 190000,
          img: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
          position: { top: '15%', left: '48%' },
          label: 'Mũ Washed Cap',
        },
        {
          keyword: 'Cubian',
          fallbackName: 'Áo Sơ Mi Cubian Collar Họa Tiết Retro Abstract',
          price: 420000,
          img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
          position: { top: '42%', left: '50%' },
          label: 'Sơ Mi Retro Abstract',
        },
        {
          keyword: 'Raw Cut',
          fallbackName: 'Quần Short Nỉ Thể Thao Raw Cut Hem Sweatshorts',
          price: 280000,
          img: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80',
          position: { top: '70%', left: '46%' },
          label: 'Short Nỉ Raw Cut',
        },
      ],
    },
  ];

  const currentLook = looks[activeLookIndex];

  // Resolve real products for current look
  const resolvedItems = currentLook.items.map((item) => ({
    ...item,
    product: findProduct(item.keyword, item.fallbackName, item.price, item.img),
  }));

  const totalOriginalPrice = resolvedItems.reduce(
    (sum, i) => sum + (i.product.price || i.price),
    0
  );
  const bundleDiscountPrice = Math.round(totalOriginalPrice * 0.9); // 10% bundle discount

  const handleBuyBundle = () => {
    resolvedItems.forEach((item) => {
      const prod = item.product;
      const size = prod.sizes?.[0]?.size || 'M';
      const color = prod.colors?.[0]?.name || 'Tiêu chuẩn';
      addToCart(prod, size, color, 1);
    });

    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}

    addToast(
      `🎉 Đã thêm trọn bộ ${currentLook.title} vào giỏ hàng với giá ưu đãi!`,
      'success'
    );
    setCartDrawerOpen(true);
  };

  return (
    <section
      style={{
        maxWidth: '1360px',
        margin: '60px auto 40px',
        padding: '0 24px',
      }}
    >
      {/* Header Title */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: '32px',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(250, 204, 21, 0.12)',
            color: 'var(--accent-gold)',
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '1px',
            padding: '6px 14px',
            borderRadius: '9999px',
            border: '1px solid rgba(250, 204, 21, 0.3)',
            marginBottom: '12px',
            textTransform: 'uppercase',
          }}
        >
          <Sparkles size={14} />
          <span>Interactive Editorial Lookbook</span>
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
            fontWeight: 900,
            letterSpacing: '-0.5px',
            marginBottom: '10px',
            color: 'var(--text-main)',
          }}
        >
          SHOP THE LOOK • GỢI Ý PHỐI ĐỒ CHUẨN GU
        </h2>
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.95rem',
            maxWidth: '650px',
          }}
        >
          Khám phá các outfit được phối sẵn bởi Stylist AURA. Rê chuột lên các điểm tròn trên người mẫu để khám phá từng món đồ hoặc mua trọn set với giá ưu đãi!
        </p>

        {/* Lookbook Switcher Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginTop: '24px',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '6px',
            borderRadius: '9999px',
            border: '1px solid var(--border-color)',
          }}
        >
          {looks.map((look, idx) => (
            <button
              key={look.id}
              onClick={() => {
                setActiveLookIndex(idx);
                setActiveHotspot(null);
              }}
              style={{
                background:
                  activeLookIndex === idx
                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                    : 'transparent',
                color: activeLookIndex === idx ? '#000' : 'var(--text-main)',
                fontWeight: activeLookIndex === idx ? 800 : 600,
                fontSize: '0.84rem',
                padding: '9px 20px',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow:
                  activeLookIndex === idx
                    ? '0 4px 15px rgba(250, 204, 21, 0.35)'
                    : 'none',
              }}
            >
              {look.title.split('•')[1] || look.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Lookbook Showcase Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '32px',
          background: 'var(--bg-card)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '28px',
          padding: '32px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-md)',
          alignItems: 'center',
        }}
      >
        {/* Left: Model Interactive Canvas */}
        <div
          style={{
            position: 'relative',
            borderRadius: '22px',
            overflow: 'hidden',
            aspectRatio: '3/4',
            background: '#161824',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--border-color)',
          }}
        >
          <img
            src={currentLook.modelImage}
            alt={currentLook.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.95)',
              display: 'block',
            }}
          />

          {/* Badge over model */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(8px)',
              color: '#facc15',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(250, 204, 21, 0.4)',
              letterSpacing: '0.5px',
            }}
          >
            {currentLook.badge}
          </div>

          {/* Interactive Pulsing Hotspots */}
          {resolvedItems.map((item, idx) => {
            const isHovered = activeHotspot === idx;
            return (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  top: item.position.top,
                  left: item.position.left,
                  transform: 'translate(-50%, -50%)',
                  zIndex: isHovered ? 40 : 25,
                }}
                onMouseEnter={() => setActiveHotspot(idx)}
                onMouseLeave={() => setActiveHotspot(null)}
              >
                {/* Hotspot Outer Ping Wave */}
                <div
                  style={{
                    position: 'absolute',
                    inset: '-8px',
                    borderRadius: '50%',
                    background: 'rgba(250, 204, 21, 0.4)',
                    animation: 'hotspotPulse 2s cubic-bezier(0, 0, 0.2, 1) infinite',
                    pointerEvents: 'none',
                  }}
                />

                {/* Hotspot Center Trigger Dot */}
                <button
                  type="button"
                  onClick={() => onOpenProduct && onOpenProduct(item.product)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#facc15',
                    color: '#000',
                    border: '3px solid #fff',
                    boxShadow: '0 0 15px rgba(250, 204, 21, 0.6), 0 4px 10px rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    transform: isHovered ? 'scale(1.2)' : 'scale(1)',
                  }}
                  title={`Xem ${item.label}`}
                >
                  {idx + 1}
                </button>

                {/* Hover Popover Card */}
                {isHovered && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '42px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '240px',
                      background: 'rgba(15, 23, 42, 0.95)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      border: '1px solid rgba(250, 204, 21, 0.4)',
                      borderRadius: '16px',
                      padding: '12px',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)',
                      animation: 'fadeIn 0.2s ease-out forwards',
                      pointerEvents: 'auto',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <img
                        src={item.product.images?.[0] || item.img}
                        alt={item.product.name}
                        style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: '10px',
                          objectFit: 'cover',
                          background: '#1e293b',
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            color: '#fff',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.product.name}
                        </div>
                        <div
                          style={{
                            color: '#facc15',
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            marginTop: '2px',
                          }}
                        >
                          {item.product.price.toLocaleString('vi-VN')}₫
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        gap: '6px',
                        marginTop: '10px',
                      }}
                    >
                      <button
                        onClick={() => onOpenProduct && onOpenProduct(item.product)}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: 'none',
                          color: '#fff',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                        }}
                      >
                        <Eye size={12} />
                        Chi tiết
                      </button>
                      <button
                        onClick={() => {
                          const size = item.product.sizes?.[0]?.size || 'M';
                          const color = item.product.colors?.[0]?.name || 'Tiêu chuẩn';
                          addToCart(item.product, size, color, 1);
                          addToast(`Đã thêm ${item.product.name} vào giỏ!`, 'success');
                        }}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          borderRadius: '8px',
                          background: '#facc15',
                          border: 'none',
                          color: '#000',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                        }}
                      >
                        <ShoppingBag size={12} />
                        Thêm
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Breakdown of Outfits & 1-Click Buy Set */}
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--accent-gold)',
              fontSize: '0.8rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '6px',
            }}
          >
            <Tag size={14} />
            <span>Set Đồ Đầy Đủ (3 Món Phối Sẵn)</span>
          </div>

          <h3
            style={{
              fontSize: '1.6rem',
              fontWeight: 900,
              color: 'var(--text-main)',
              marginBottom: '8px',
            }}
          >
            {currentLook.title}
          </h3>

          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.88rem',
              marginBottom: '24px',
              lineHeight: 1.5,
            }}
          >
            {currentLook.subtitle}
          </p>

          {/* List of Items in the Look */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
            {resolvedItems.map((item, idx) => (
              <div
                key={idx}
                onClick={() => onOpenProduct && onOpenProduct(item.product)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(250, 204, 21, 0.4)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                  setActiveHotspot(idx);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.transform = 'translateX(0)';
                  setActiveHotspot(null);
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'rgba(250, 204, 21, 0.2)',
                    color: 'var(--accent-gold)',
                    fontWeight: 900,
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </div>

                <img
                  src={item.product.images?.[0] || item.img}
                  alt={item.product.name}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '10px',
                    objectFit: 'cover',
                    background: '#161824',
                    flexShrink: 0,
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      color: 'var(--text-main)',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.product.name}
                  </div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.76rem', marginTop: '2px' }}>
                    {item.label}
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ color: 'var(--accent-gold)', fontWeight: 800, fontSize: '0.92rem' }}>
                    {item.product.price.toLocaleString('vi-VN')}₫
                  </div>
                  {item.product.originalPrice > item.product.price && (
                    <div
                      style={{
                        color: 'var(--text-dim)',
                        fontSize: '0.74rem',
                        textDecoration: 'line-through',
                      }}
                    >
                      {item.product.originalPrice.toLocaleString('vi-VN')}₫
                    </div>
                  )}
                </div>

                <ArrowRight size={16} color="var(--text-dim)" />
              </div>
            ))}
          </div>

          {/* Pricing Box & Bundle Button */}
          <div
            style={{
              background: 'rgba(250, 204, 21, 0.06)',
              border: '1px solid rgba(250, 204, 21, 0.25)',
              borderRadius: '20px',
              padding: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginBottom: '16px',
              }}
            >
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '2px' }}>
                  Tổng giá trị lẻ 3 món:
                </div>
                <div
                  style={{
                    color: 'var(--text-dim)',
                    fontSize: '1rem',
                    textDecoration: 'line-through',
                    fontWeight: 600,
                  }}
                >
                  {totalOriginalPrice.toLocaleString('vi-VN')}₫
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    display: 'inline-block',
                    marginBottom: '4px',
                  }}
                >
                  TIẾT KIỆM 10%
                </span>
                <div
                  style={{
                    color: 'var(--accent-gold)',
                    fontSize: '1.6rem',
                    fontWeight: 900,
                    lineHeight: 1,
                  }}
                >
                  {bundleDiscountPrice.toLocaleString('vi-VN')}₫
                </div>
              </div>
            </div>

            <button
              onClick={handleBuyBundle}
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)',
                color: '#000',
                border: 'none',
                fontFamily: 'var(--font-sans)',
                fontWeight: 700,
                fontSize: '0.94rem',
                letterSpacing: '0.01em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(250, 204, 21, 0.4)',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(250, 204, 21, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(250, 204, 21, 0.4)';
              }}
            >
              <ShoppingBag size={18} strokeWidth={2.2} />
              <span>Mua trọn bộ phối này (Tiết kiệm 10%)</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes hotspotPulse {
          0% { transform: scale(0.95); opacity: 0.9; }
          50% { transform: scale(1.55); opacity: 0; }
          100% { transform: scale(1.55); opacity: 0; }
        }
      `}</style>
    </section>
  );
};
