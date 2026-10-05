import React from 'react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const WishlistModal = ({ products = [], onClose, onSelectProduct }) => {
  const { wishlist, toggleWishlist } = useAuth();
  const { addToCart } = useCart();

  const wishlistedProducts = products.filter((p) => wishlist.includes(p._id));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#0d0f17',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
          position: 'relative',
          padding: '32px',
          animation: 'fadeIn 0.25s ease-out',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            color: '#fff',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Heart size={22} color="#f43f5e" fill="#f43f5e" />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800 }}>
            Danh Sách Yêu Thích ({wishlist.length})
          </h3>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginBottom: '24px' }}>
          Các mẫu trang phục bạn đã lưu lại để tham khảo hoặc mua sắm sau.
        </p>

        {wishlistedProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-muted)' }}>
            <Heart size={48} color="#334155" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: '1rem', fontWeight: 600 }}>Danh sách yêu thích trống</div>
            <p style={{ fontSize: '0.84rem', marginTop: '4px' }}>
              Hãy nhấn biểu tượng trái tim ở các mẫu quần áo để lưu lại đây nhé!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {wishlistedProducts.map((p) => (
              <div
                key={p._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '12px 16px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <img
                  src={p.images?.[0]}
                  alt={p.name}
                  onClick={() => {
                    onClose();
                    onSelectProduct(p);
                  }}
                  style={{
                    width: '64px',
                    height: '80px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    cursor: 'pointer',
                  }}
                />

                <div style={{ flex: 1 }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: '#facc15',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}
                  >
                    {p.category}
                  </span>
                  <h4
                    onClick={() => {
                      onClose();
                      onSelectProduct(p);
                    }}
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      color: '#fff',
                      cursor: 'pointer',
                      marginTop: '2px',
                    }}
                  >
                    {p.name}
                  </h4>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      color: '#facc15',
                      marginTop: '4px',
                      fontSize: '0.96rem',
                    }}
                  >
                    {p.price.toLocaleString('vi-VN')}₫
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => addToCart(p, p.sizes?.[0]?.size, p.colors?.[0]?.name, 1)}
                    className="btn-primary"
                    style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '0.8rem' }}
                  >
                    <ShoppingBag size={14} />
                    <span>Thêm Vào Giỏ</span>
                  </button>

                  <button
                    onClick={() => toggleWishlist(p._id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      padding: '6px',
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
