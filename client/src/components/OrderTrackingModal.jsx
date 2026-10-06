import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Star,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const OrderTrackingModal = ({ initialCode = '', onClose, onOpenProduct }) => {
  const { addToast } = useToast();
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);

  const fetchOrder = async (searchCode) => {
    if (!searchCode.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${searchCode.trim()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Không tìm thấy đơn hàng');

      setOrder(data.order);
    } catch (err) {
      addToast(err.message, 'error');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      fetchOrder(initialCode);
    }
  }, [initialCode]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrder(code);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return { text: 'Chờ xác nhận', color: '#facc15', bg: 'rgba(250, 204, 21, 0.15)' };
      case 'Processing':
        return { text: 'Đang đóng gói', color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.15)' };
      case 'Shipping':
        return { text: 'Đang giao hàng', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)' };
      case 'Delivered':
        return { text: 'Giao thành công', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
      case 'Cancelled':
        return { text: 'Đã hủy', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
      default:
        return { text: status, color: '#fff', bg: 'rgba(255, 255, 255, 0.1)' };
    }
  };

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
          maxHeight: '90vh',
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
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>

        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.4rem',
            fontWeight: 800,
            marginBottom: '6px',
          }}
        >
          Tra Cứu Tình Trạng Đơn Hàng
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginBottom: '20px' }}>
          Nhập mã đơn hàng của bạn (ví dụ: AURA-839201) để xem tiến trình giao hàng theo thời gian thực.
        </p>

        {/* Search input form */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={17}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-dim)',
              }}
            />
            <input
              type="text"
              placeholder="Nhập mã đơn hàng..."
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '12px 14px 12px 40px',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-mono)',
                outline: 'none',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ padding: '0 24px', borderRadius: '10px', fontSize: '0.88rem' }}
          >
            {loading ? 'Đang tìm...' : 'Tra Cứu'}
          </button>
        </form>

        {/* Order Details Display */}
        {order && (
          <div style={{ animation: 'fadeIn 0.25s ease-out' }}>
            {/* Header info */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '24px',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MÃ ĐƠN HÀNG</div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: '#facc15',
                  }}
                >
                  {order.orderCode}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}
                </div>
              </div>

              {(() => {
                const badge = getStatusBadge(order.orderStatus);
                return (
                  <span
                    style={{
                      background: badge.bg,
                      color: badge.color,
                      border: `1px solid ${badge.color}`,
                      padding: '6px 14px',
                      borderRadius: '9999px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                    }}
                  >
                    {badge.text}
                  </span>
                );
              })()}
            </div>

            {/* Timeline */}
            <div style={{ marginBottom: '28px' }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '16px' }}>
                Hành Trình Đơn Hàng
              </h4>
              <div
                style={{
                  position: 'relative',
                  paddingLeft: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                }}
              >
                {/* Vertical line */}
                <div
                  style={{
                    position: 'absolute',
                    left: '7px',
                    top: '6px',
                    bottom: '6px',
                    width: '2px',
                    background: 'rgba(255, 255, 255, 0.12)',
                  }}
                />

                {order.timeline?.map((stepItem, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: '-24px',
                        top: '2px',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: '#facc15',
                        border: '3px solid #0d0f17',
                        boxShadow: '0 0 10px rgba(250, 204, 21, 0.5)',
                      }}
                    />
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>
                      {stepItem.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {stepItem.description}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                      {new Date(stepItem.time).toLocaleString('vi-VN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Product items in order */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '12px' }}>
                Sản Phẩm Trong Đơn
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {order.orderItems?.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '10px',
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: '45px', height: '56px', borderRadius: '6px', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Size: {item.size} | Màu: {item.color} | SL: {item.quantity}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem' }}>
                        {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                      </div>
                      {order.orderStatus === 'Delivered' && onOpenProduct && (
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              const prodId = typeof item.product === 'object' ? item.product._id : item.product;
                              const res = await fetch(`/api/products/${prodId}`);
                              const data = await res.json();
                              if (data.success && data.product) {
                                onClose();
                                onOpenProduct(data.product);
                              }
                            } catch (err) {
                              console.error('Error fetching product for review:', err);
                            }
                          }}
                          style={{
                            marginTop: '6px',
                            background: 'rgba(250, 204, 21, 0.15)',
                            color: '#facc15',
                            border: '1px solid rgba(250, 204, 21, 0.35)',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
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
                          <Star size={11} fill="#facc15" />
                          <span>Đánh giá ngay</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Payment summary */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '14px',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                fontSize: '0.84rem',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Người nhận:</span>
                <div style={{ fontWeight: 600, marginTop: '2px' }}>
                  {order.shippingAddress.fullName} ({order.shippingAddress.phone})
                </div>
                <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>
                  {order.shippingAddress.address}, {order.shippingAddress.city}
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)' }}>Thanh toán:</span>
                <div style={{ fontWeight: 600, marginTop: '2px' }}>
                  {order.paymentMethod === 'COD'
                    ? 'Tiền mặt khi nhận (COD)'
                    : order.paymentMethod === 'VIETQR'
                    ? 'Chuyển khoản VietQR'
                    : 'Thẻ Quốc Tế'}
                </div>
                <div
                  style={{
                    color: order.paymentStatus === 'Paid' ? '#10b981' : '#facc15',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                  }}
                >
                  {order.paymentStatus === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)' }}>Tổng thanh toán:</span>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: '#facc15',
                  }}
                >
                  {order.totalPrice.toLocaleString('vi-VN')}₫
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
