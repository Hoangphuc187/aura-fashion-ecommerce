import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Truck,
  Tag,
  Check,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer = () => {
  const {
    cart,
    cartDrawerOpen,
    setCartDrawerOpen,
    updateQuantity,
    removeFromCart,
    itemsPrice,
    shippingPrice,
    discountAmount,
    totalPrice,
    isFreeShipping,
    freeShippingRemaining,
    freeShippingProgress,
    coupon,
    applyCoupon,
    removeCoupon,
    setCheckoutModalOpen,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');

  if (!cartDrawerOpen) return null;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (inputCoupon.trim()) {
      applyCoupon(inputCoupon.trim());
      setInputCoupon('');
    }
  };

  const handleProceedCheckout = () => {
    setCartDrawerOpen(false);
    setCheckoutModalOpen(true);
  };

  return (
    <div
      className="modal-backdrop"
      onClick={() => setCartDrawerOpen(false)}
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        padding: 0,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '100vh',
          background: '#0d0f17',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.8)',
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={20} color="#facc15" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800 }}>
              Giỏ Hàng Của Bạn
            </h3>
            <span
              style={{
                background: 'rgba(250, 204, 21, 0.15)',
                color: '#facc15',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '9999px',
              }}
            >
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </div>

          <button
            onClick={() => setCartDrawerOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div
          style={{
            padding: '14px 24px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.78rem',
              marginBottom: '8px',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
              <Truck size={15} color={isFreeShipping ? '#10b981' : '#facc15'} />
              {isFreeShipping ? (
                <strong style={{ color: '#10b981' }}>Bạn đã được Miễn Phí Giao Hàng!</strong>
              ) : (
                <span>
                  Mua thêm{' '}
                  <strong style={{ color: '#facc15' }}>
                    {freeShippingRemaining.toLocaleString('vi-VN')}₫
                  </strong>{' '}
                  để được Free Ship
                </span>
              )}
            </span>
            <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>
              {freeShippingProgress}%
            </span>
          </div>

          {/* Progress Bar */}
          <div
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${freeShippingProgress}%`,
                height: '100%',
                background: isFreeShipping
                  ? 'linear-gradient(90deg, #10b981, #34d399)'
                  : 'linear-gradient(90deg, #facc15, #f59e0b)',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {cart.length === 0 ? (
            <div
              style={{
                margin: 'auto',
                textAlign: 'center',
                color: 'var(--text-muted)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <ShoppingBag size={48} color="#334155" />
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>Giỏ hàng của bạn đang trống</div>
              <p style={{ fontSize: '0.84rem', maxWidth: '280px' }}>
                Khám phá các mẫu Streetwear mới nhất và thêm sản phẩm yêu thích ngay thôi!
              </p>
              <button
                onClick={() => setCartDrawerOpen(false)}
                className="btn-primary"
                style={{ marginTop: '10px', fontSize: '0.85rem' }}
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={`${item.product}-${item.size}-${item.color}`}
                style={{
                  display: 'flex',
                  gap: '14px',
                  padding: '12px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  style={{
                    width: '74px',
                    height: '92px',
                    borderRadius: '10px',
                    objectFit: 'cover',
                    backgroundColor: '#1e2230',
                  }}
                />

                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '8px',
                      }}
                    >
                      <h4
                        style={{
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          lineHeight: 1.3,
                          color: '#fff',
                        }}
                      >
                        {item.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.product, item.size, item.color)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          padding: '2px',
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        marginTop: '4px',
                      }}
                    >
                      Size: <strong style={{ color: '#fff' }}>{item.size}</strong> | Màu:{' '}
                      <strong style={{ color: '#fff' }}>{item.color}</strong>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '10px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.96rem',
                        fontWeight: 800,
                        color: '#facc15',
                      }}
                    >
                      {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                    </span>

                    {/* Stepper */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                      }}
                    >
                      <button
                        onClick={() =>
                          updateQuantity(item.product, item.size, item.color, item.quantity - 1)
                        }
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#fff',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                        }}
                      >
                        -
                      </button>
                      <span
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          padding: '0 6px',
                          minWidth: '20px',
                          textAlign: 'center',
                        }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product, item.size, item.color, item.quantity + 1)
                        }
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#fff',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: Coupon & Summary & Checkout */}
        {cart.length > 0 && (
          <div
            style={{
              padding: '20px 24px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              background: '#090a0f',
            }}
          >
            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Tag
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-dim)',
                  }}
                />
                <input
                  type="text"
                  placeholder="Mã giảm giá (STREETWEAR20...)"
                  value={inputCoupon}
                  onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '8px 12px 8px 34px',
                    color: '#fff',
                    fontSize: '0.84rem',
                    fontFamily: 'var(--font-mono)',
                    outline: 'none',
                  }}
                />
              </div>
              <button
                type="submit"
                className="btn-secondary"
                style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.82rem' }}
              >
                Áp Dụng
              </button>
            </form>

            {/* Active Coupon Badge */}
            {coupon && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  marginBottom: '14px',
                  fontSize: '0.82rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399' }}>
                  <Sparkles size={14} />
                  <span>
                    Mã <strong>{coupon.code}</strong>: -{discountAmount.toLocaleString('vi-VN')}₫
                  </span>
                </div>
                <button
                  onClick={removeCoupon}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#f87171',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  Gỡ
                </button>
              </div>
            )}

            {/* Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tạm tính:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>
                  {itemsPrice.toLocaleString('vi-VN')}₫
                </span>
              </div>

              {discountAmount > 0 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem',
                    color: '#34d399',
                  }}
                >
                  <span>Giảm giá khuyến mãi:</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>
                    -{discountAmount.toLocaleString('vi-VN')}₫
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Phí vận chuyển:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>
                  {shippingPrice === 0 ? (
                    <strong style={{ color: '#10b981' }}>Miễn phí</strong>
                  ) : (
                    `${shippingPrice.toLocaleString('vi-VN')}₫`
                  )}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  paddingTop: '10px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <span style={{ fontWeight: 800, fontSize: '1rem' }}>Tổng cộng:</span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.45rem',
                    fontWeight: 800,
                    color: '#facc15',
                  }}
                >
                  {totalPrice.toLocaleString('vi-VN')}₫
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleProceedCheckout}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                fontSize: '0.98rem',
              }}
            >
              <span>Tiến Hành Thanh Toán</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
