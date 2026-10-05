import React, { useState } from 'react';
import { Heart, Star, ShoppingBag, Eye, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const ProductCard = ({ product, onProductClick }) => {
  const { wishlist, toggleWishlist } = useAuth();
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0]?.size || 'M');

  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const isWishlisted = wishlist.includes(product._id);
  const displayImage =
    isHovered && product.images?.[1] ? product.images[1] : product.images?.[0] || '';

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    addToCart(product, selectedSize, product.colors?.[0]?.name, 1);
  };

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product._id);
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * 8;
    const rotateX = -((y - centerY) / centerY) * 8;
    setRotate({ x: rotateX, y: rotateY });
    setGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100, opacity: 0.18 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  return (
    <div
      style={{ perspective: '1000px' }}
    >
      <div
        onClick={() => onProductClick(product)}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="card-3d-interactive"
        style={{
          background: 'var(--bg-card)',
          borderRadius: '18px',
          overflow: 'hidden',
          border: isHovered ? '1px solid rgba(250, 204, 21, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: isHovered
            ? '0 25px 45px -12px rgba(0, 0, 0, 0.75), 0 0 25px rgba(250, 204, 21, 0.25)'
            : 'var(--shadow-sm)',
          transform: isHovered
            ? `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateY(-8px) scale(1.02)`
            : 'none',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        {/* Dynamic 3D Specular Glare Reflection */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, ${glare.opacity}) 0%, transparent 60%)`,
            pointerEvents: 'none',
            zIndex: 10,
            transition: 'opacity 0.2s ease',
          }}
        />
      {/* Product Image Box */}
      <div
        style={{
          position: 'relative',
          paddingTop: '125%', // 4:5 aspect ratio
          overflow: 'hidden',
          backgroundColor: '#161922',
        }}
      >
        <img
          src={displayImage}
          alt={product.name}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
            transform: isHovered ? 'scale(1.06)' : 'scale(1)',
          }}
        />

        {/* Badges Overlay */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            zIndex: 2,
          }}
        >
          {product.stockQuantity <= 0 && (
            <span
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 900,
                padding: '3px 8px',
                borderRadius: '6px',
                letterSpacing: '0.5px',
                boxShadow: '0 2px 10px rgba(239, 68, 68, 0.5)',
              }}
            >
              HẾT HÀNG
            </span>
          )}

          {product.discountPercent > 0 && product.stockQuantity > 0 && (
            <span
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#fff',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '6px',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
              }}
            >
              -{product.discountPercent}%
            </span>
          )}

          {product.isBestSeller && (
            <span
              style={{
                background: '#facc15',
                color: '#000',
                fontSize: '0.7rem',
                fontWeight: 900,
                padding: '3px 8px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                boxShadow: '0 2px 10px rgba(250, 204, 21, 0.4)',
              }}
            >
              <Zap size={11} fill="#000" />
              BEST SELLER
            </span>
          )}

          {product.featured && !product.isBestSeller && (
            <span
              style={{
                background: 'rgba(245, 158, 11, 0.9)',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '6px',
              }}
            >
              ★ NỔI BẬT
            </span>
          )}

          {product.isNewArrival && !product.isBestSeller && !product.featured && (
            <span
              style={{
                background: 'rgba(59, 130, 246, 0.9)',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '6px',
              }}
            >
              NEW DROP
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={handleToggleWishlist}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(9, 10, 15, 0.7)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isWishlisted ? '#f43f5e' : '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s',
            zIndex: 2,
          }}
        >
          <Heart size={18} fill={isWishlisted ? '#f43f5e' : 'none'} />
        </button>

        {/* Quick View Button on Hover */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            right: '12px',
            display: 'flex',
            justifyContent: 'center',
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.25s ease',
            zIndex: 2,
          }}
        >
          <div
            style={{
              background: 'rgba(9, 10, 15, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              fontSize: '0.78rem',
              fontWeight: 700,
              padding: '6px 14px',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Eye size={14} />
            <span>Xem nhanh</span>
          </div>
        </div>
      </div>

      {/* Product Content Details */}
      <div
        style={{
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'space-between',
        }}
      >
        <div>
          {/* Category & Rating */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px',
            }}
          >
            <span
              style={{
                fontSize: '0.72rem',
                color: 'var(--accent-gold)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {product.category}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={13} fill="#facc15" color="#facc15" />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>
                {product.rating?.toFixed(1) || '5.0'}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                ({product.numReviews || 0})
              </span>
            </div>
          </div>

          {/* Product Name */}
          <h4
            style={{
              fontSize: '0.94rem',
              fontWeight: 700,
              lineHeight: 1.35,
              color: '#f8fafc',
              marginBottom: '10px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.6em',
            }}
          >
            {product.name}
          </h4>

          {/* Color preview dots */}
          {product.colors && product.colors.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              {product.colors.map((c, i) => (
                <span
                  key={i}
                  title={c.name}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: c.hex,
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    display: 'inline-block',
                  }}
                />
              ))}
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginLeft: '4px' }}>
                {product.colors.length} màu
              </span>
            </div>
          )}
        </div>

        {/* Price and Add-to-cart row */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '8px',
              marginBottom: '12px',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.15rem',
                fontWeight: 800,
                color: '#facc15',
              }}
            >
              {product.price.toLocaleString('vi-VN')}₫
            </span>
            {product.originalPrice > product.price && (
              <span
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--text-dim)',
                  textDecoration: 'line-through',
                }}
              >
                {product.originalPrice.toLocaleString('vi-VN')}₫
              </span>
            )}
          </div>

          {/* Size picker & Quick Add button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {product.sizes && product.sizes.length > 0 && (
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '8px 6px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {product.sizes.map((s) => (
                  <option
                    key={s.size}
                    value={s.size}
                    style={{ background: '#181926', color: '#fff' }}
                  >
                    Size {s.size}
                  </option>
                ))}
              </select>
            )}

            {product.stockQuantity <= 0 ? (
              <button
                disabled
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#64748b',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'not-allowed',
                }}
              >
                <span>Hết hàng</span>
              </button>
            ) : (
              <button
                onClick={handleQuickAdd}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  background: 'rgba(250, 204, 21, 0.15)',
                  border: '1px solid rgba(250, 204, 21, 0.35)',
                  color: '#facc15',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#facc15';
                  e.currentTarget.style.color = '#000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(250, 204, 21, 0.15)';
                  e.currentTarget.style.color = '#facc15';
                }}
              >
                <ShoppingBag size={15} />
                <span>Thêm nhanh</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
};
