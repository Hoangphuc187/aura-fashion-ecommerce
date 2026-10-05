import React, { useState, useEffect } from 'react';
import { X, Package, Clock, Truck, ChevronRight, Search, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const UserOrdersModal = ({ onClose, onSelectOrderCode }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadAllOrders = async () => {
      setLoading(true);
      const combinedMap = new Map();

      // 1. Fetch from server if authenticated
      if (user?.token) {
        try {
          const res = await fetch('/api/orders/myorders', {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          const data = await res.json();
          if (data.success && Array.isArray(data.orders)) {
            data.orders.forEach((o) => combinedMap.set(o.orderCode, o));
          }
        } catch (err) {
          console.error('Error fetching my orders:', err);
        }
      }

      // 2. Fetch locally stored order codes (guest or past orders on this browser)
      try {
        const stored = JSON.parse(localStorage.getItem('aura_placed_orders') || '[]');
        const codesToFetch = stored
          .map((item) => (typeof item === 'string' ? item : item.orderCode))
          .filter((code) => code && !combinedMap.has(code));

        if (codesToFetch.length > 0) {
          const fetchPromises = codesToFetch.slice(0, 10).map(async (code) => {
            try {
              const res = await fetch(`/api/orders/${code}`);
              const data = await res.json();
              if (data.success && data.order) {
                return data.order;
              }
            } catch {
              return null;
            }
          });

          const localResults = await Promise.all(fetchPromises);
          localResults.forEach((ord) => {
            if (ord) combinedMap.set(ord.orderCode, ord);
          });
        }
      } catch (err) {
        console.error('Error reading local orders:', err);
      }

      if (isMounted) {
        // Sort descending by date
        const sortedList = Array.from(combinedMap.values()).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sortedList);
        setLoading(false);
      }
    };

    loadAllOrders();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#facc15';
      case 'Processing':
        return '#60a5fa';
      case 'Shipping':
        return '#a855f7';
      case 'Delivered':
        return '#10b981';
      case 'Cancelled':
        return '#ef4444';
      default:
        return '#94a3b8';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Pending':
        return 'Chờ xác nhận';
      case 'Processing':
        return 'Đang đóng gói';
      case 'Shipping':
        return 'Đang giao hàng';
      case 'Delivered':
        return 'Đã giao thành công';
      case 'Cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    onClose();
    onSelectOrderCode(searchCode.trim().toUpperCase());
  };

  const filteredOrders = searchCode.trim()
    ? orders.filter((o) => o.orderCode?.toLowerCase().includes(searchCode.trim().toLowerCase()))
    : orders;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#0d0f17',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '740px',
          maxHeight: '88vh',
          overflowY: 'auto',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
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
          <Package size={24} color="#facc15" />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800 }}>
            Lịch Sử Đơn Hàng Của Bạn
          </h3>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginBottom: '20px' }}>
          Theo dõi trạng thái giao hàng, kiểm tra lộ trình và bấm vào đơn để xem chi tiết.
        </p>

        {/* Quick Search bar */}
        <form onSubmit={handleManualSearch} style={{ display: 'flex', gap: '10px', marginBottom: '22px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={16}
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
              placeholder="Nhập mã đơn hàng (ví dụ: AURA-568109)..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                padding: '11px 14px 11px 40px',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '0.88rem',
                outline: 'none',
              }}
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            style={{ padding: '0 20px', borderRadius: '10px', fontSize: '0.86rem', whiteSpace: 'nowrap' }}
          >
            Tra Cứu
          </button>
        </form>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginBottom: '10px' }}>
              <Package size={32} color="#facc15" />
            </div>
            <div>Đang tải danh sách đơn hàng...</div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <Package size={48} color="#334155" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#fff' }}>
              {searchCode ? 'Không tìm thấy đơn hàng phù hợp' : 'Bạn chưa có đơn hàng nào'}
            </div>
            <p style={{ fontSize: '0.84rem', marginTop: '6px' }}>
              {searchCode
                ? 'Hãy kiểm tra lại mã đơn hàng hoặc nhấn Tra Cứu trực tiếp.'
                : 'Các đơn hàng bạn đặt sẽ tự động lưu và hiển thị tại đây để bạn tiện theo dõi.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredOrders.map((ord) => (
              <div
                key={ord._id || ord.orderCode}
                onClick={() => {
                  onClose();
                  onSelectOrderCode(ord.orderCode);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '18px 20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(250, 204, 21, 0.5)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 800,
                        fontSize: '1.05rem',
                        color: '#facc15',
                      }}
                    >
                      {ord.orderCode}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      • {new Date(ord.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>

                  <span
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: getStatusColor(ord.orderStatus),
                      border: `1px solid ${getStatusColor(ord.orderStatus)}`,
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {getStatusText(ord.orderStatus)}
                  </span>
                </div>

                {/* Items Preview */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  {ord.orderItems?.slice(0, 4).map((it, idx) => (
                    <img
                      key={idx}
                      src={it.image}
                      alt={it.name}
                      style={{ width: '44px', height: '54px', borderRadius: '6px', objectFit: 'cover' }}
                    />
                  ))}
                  {ord.orderItems?.length > 4 && (
                    <div
                      style={{
                        width: '44px',
                        height: '54px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        color: '#94a3b8',
                      }}
                    >
                      +{ord.orderItems.length - 4}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '10px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    fontSize: '0.84rem',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>
                    {ord.orderItems?.length} sản phẩm • {ord.paymentMethod === 'MOMO' ? 'Ví MoMo' : ord.paymentMethod === 'VNPAY' ? 'VNPAY-QR' : ord.paymentMethod}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 800,
                        fontSize: '1.05rem',
                        color: '#fff',
                      }}
                    >
                      {ord.totalPrice?.toLocaleString('vi-VN')}₫
                    </span>
                    <ChevronRight size={16} color="var(--text-dim)" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
