import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Truck,
  CreditCard,
  Banknote,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  MapPin,
  Store,
  Tag,
  AlertCircle,
  Clock,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export const CheckoutModal = ({ onOpenOrderTracking }) => {
  const { user } = useAuth();
  const {
    cart,
    clearCart,
    itemsPrice,
    shippingPrice,
    discountAmount,
    totalPrice,
    coupon,
    applyCoupon,
    checkoutModalOpen,
    setCheckoutModalOpen,
  } = useCart();
  const { addToast } = useToast();

  const [step, setStep] = useState(1); // 1: Shipping & Order Details, 2: Payment Confirmation, 3: Success Celebration
  const [loading, setLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [couponInput, setCouponInput] = useState('');

  // Form info
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    address: user?.address?.street || '',
    ward: user?.address?.ward || '',
    district: user?.address?.district || '',
    city: user?.address?.city || 'Hồ Chí Minh',
    note: '',
    shippingMethod: 'standard', // 'standard' | 'express'
    paymentMethod: 'MOMO', // Default to MOMO or COD
  });

  if (!checkoutModalOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Strict Shopee-style validation
  const validateShippingInfo = () => {
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      addToast('Vui lòng nhập họ và tên người nhận hàng (tối thiểu 2 ký tự)', 'error');
      return false;
    }

    const cleanPhone = formData.phone.trim().replace(/\s+/g, '');
    const phoneRegex = /^(03|05|07|08|09|01[2|6|8|9])([0-9]{8})$/;
    if (!cleanPhone || cleanPhone.length < 10 || !phoneRegex.test(cleanPhone)) {
      addToast('Số điện thoại không hợp lệ. Vui lòng nhập số di động 10 số (bắt đầu bằng 0)', 'error');
      return false;
    }

    if (!formData.address || formData.address.trim().length < 5) {
      addToast('Vui lòng nhập địa chỉ nhận hàng chi tiết (số nhà, tên đường, ngõ/hẻm)', 'error');
      return false;
    }

    return true;
  };

  const handleNextToPayment = (e) => {
    e?.preventDefault();
    if (!validateShippingInfo()) return;
    setStep(2);
  };

  const handleApplyVoucher = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    applyCoupon(couponInput.trim());
    setCouponInput('');
  };

  const handlePlaceOrder = async () => {
    // Re-verify strictly before sending
    if (!validateShippingInfo()) {
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        orderItems: cart,
        shippingAddress: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          ward: formData.ward.trim(),
          district: formData.district.trim(),
          city: formData.city,
          note: formData.note.trim(),
        },
        shippingMethod: formData.shippingMethod,
        paymentMethod: formData.paymentMethod,
        itemsPrice,
        shippingPrice,
        discountAmount,
        totalPrice,
        couponCode: coupon?.code || '',
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Đặt hàng thất bại');

      // Save order code into localStorage so it is always retrievable on this browser
      try {
        const stored = JSON.parse(localStorage.getItem('aura_placed_orders') || '[]');
        stored.unshift({
          orderCode: data.order.orderCode,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem('aura_placed_orders', JSON.stringify(stored.slice(0, 20)));
      } catch (err) {
        console.error('Error saving local order code:', err);
      }

      setCreatedOrder(data.order);
      clearCart();
      setStep(3);

      // Trigger Celebration Confetti!
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore if not supported
      }

      addToast('Chúc mừng! Bạn đã đặt hàng thành công.', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={() => setCheckoutModalOpen(false)}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#0d0f17',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '840px',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 30px 70px rgba(0, 0, 0, 0.9)',
          position: 'relative',
          padding: '0 0 28px 0',
          animation: 'fadeIn 0.25s ease-out',
        }}
      >
        {/* Shopee-style Postal Envelope Top Border */}
        <div
          style={{
            height: '4px',
            width: '100%',
            background:
              'repeating-linear-gradient(45deg, #ef4444 0, #ef4444 20px, #ffffff 20px, #ffffff 35px, #3b82f6 35px, #3b82f6 55px, #ffffff 55px, #ffffff 70px)',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
          }}
        />

        <div style={{ padding: '24px 32px 0' }}>
          {/* Close Button */}
          <button
            onClick={() => setCheckoutModalOpen(false)}
            style={{
              position: 'absolute',
              top: '18px',
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
              zIndex: 10,
            }}
          >
            <X size={18} />
          </button>

          {/* Steps Breadcrumb */}
          {step < 3 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                paddingBottom: '16px',
              }}
            >
              <div
                onClick={() => setStep(1)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: step === 1 ? '#facc15' : 'var(--text-dim)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: step === 1 ? '#facc15' : 'rgba(255,255,255,0.1)',
                    color: step === 1 ? '#000' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                  }}
                >
                  1
                </span>
                <span>Thông Tin Đặt Hàng & Giao Nhận</span>
              </div>

              <ChevronRight size={16} color="var(--text-dim)" />

              <div
                onClick={() => {
                  if (validateShippingInfo()) setStep(2);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: step === 2 ? '#facc15' : 'var(--text-dim)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: step === 2 ? '#facc15' : 'rgba(255,255,255,0.1)',
                    color: step === 2 ? '#000' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                  }}
                >
                  2
                </span>
                <span>Phương Thức Thanh Toán</span>
              </div>
            </div>
          )}

          {/* STEP 1: SHOPEE-STYLE SHIPPING & ORDER DETAILS */}
          {step === 1 && (
            <div>
              {/* SHOPEE BLOCK 1: ĐỊA CHỈ NHẬN HÀNG */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <MapPin size={20} color="#ef4444" />
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Địa Chỉ Nhận Hàng
                  </h4>
                  <span
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#f87171',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      marginLeft: 'auto',
                    }}
                  >
                    BẮT BUỘC
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '14px',
                    marginBottom: '14px',
                  }}
                >
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                      Họ và tên người nhận <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="Ví dụ: Tiêu Hoàng Phúc"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: !formData.fullName.trim() ? '1px solid rgba(255,255,255,0.15)' : '1px solid #10b981',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.88rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                      Số điện thoại nhận hàng <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      maxLength={11}
                      placeholder="Ví dụ: 0901234567"
                      value={formData.phone}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: !formData.phone.trim() ? '1px solid rgba(255,255,255,0.15)' : '1px solid #10b981',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.88rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                    Địa chỉ chi tiết (Số nhà, ngõ/tòa nhà, tên đường) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    placeholder="Ví dụ: Số 88, Đường Võ Văn Ngân, Phường Linh Chiểu"
                    value={formData.address}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: !formData.address.trim() ? '1px solid rgba(255,255,255,0.15)' : '1px solid #10b981',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '14px',
                  }}
                >
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                      Tỉnh / Thành phố
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        background: '#181a24',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.88rem',
                        outline: 'none',
                      }}
                    >
                      <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                      <option value="Hà Nội">TP. Hà Nội</option>
                      <option value="Đà Nẵng">TP. Đà Nẵng</option>
                      <option value="Cần Thơ">TP. Cần Thơ</option>
                      <option value="Hải Phòng">TP. Hải Phòng</option>
                      <option value="Bình Dương">Bình Dương</option>
                      <option value="Đồng Nai">Đồng Nai</option>
                      <option value="Khác">Tỉnh thành khác</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                      Lời nhắn cho shipper / Shop (tuỳ chọn)
                    </label>
                    <input
                      type="text"
                      name="note"
                      placeholder="Giao giờ hành chính, gọi trước khi đến..."
                      value={formData.note}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.88rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* SHOPEE BLOCK 2: SẢN PHẨM & ĐƠN HÀNG */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <Store size={18} color="#facc15" />
                  <span style={{ fontWeight: 800, fontSize: '0.94rem', color: '#fff' }}>AURA Official Store</span>
                  <span
                    style={{
                      background: '#ef4444',
                      color: '#fff',
                      fontSize: '0.66rem',
                      fontWeight: 900,
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    Mall
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    {cart.length} món hàng
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                  {cart.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 12px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '10px',
                        border: '1px solid rgba(255, 255, 255, 0.04)',
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '48px', height: '60px', borderRadius: '6px', objectFit: 'cover' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}>{item.name}</div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Phân loại: <strong style={{ color: '#cbd5e1' }}>Size {item.size}</strong>
                          {item.color && <> | Màu: <strong style={{ color: '#cbd5e1' }}>{item.color}</strong></>}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          {item.price.toLocaleString('vi-VN')}₫ x {item.quantity}
                        </div>
                        <div style={{ fontWeight: 800, color: '#facc15', fontFamily: 'var(--font-mono)', fontSize: '0.92rem' }}>
                          {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* SHOPEE BLOCK 3: ĐƠN VỊ VẬN CHUYỂN */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '12px',
                    padding: '14px',
                    border: '1px dashed rgba(255, 255, 255, 0.15)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <Truck size={17} color="#60a5fa" />
                    <span style={{ fontWeight: 700, fontSize: '0.86rem', color: '#fff' }}>
                      Phương thức vận chuyển:
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                    <div
                      onClick={() => setFormData((p) => ({ ...p, shippingMethod: 'standard' }))}
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        background:
                          formData.shippingMethod === 'standard' ? 'rgba(250, 204, 21, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                        border:
                          formData.shippingMethod === 'standard' ? '2px solid #facc15' : '1px solid rgba(255, 255, 255, 0.08)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#fff' }}>Nhanh (AURA Express)</div>
                        <div style={{ fontWeight: 800, fontSize: '0.84rem', color: '#facc15' }}>
                          {itemsPrice >= 500000 ? 'Miễn Phí' : '30.000₫'}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#10b981', marginTop: '4px' }}>
                        Dự kiến nhận hàng trong 2 - 3 ngày tới
                      </div>
                    </div>

                    <div
                      onClick={() => setFormData((p) => ({ ...p, shippingMethod: 'express' }))}
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        background:
                          formData.shippingMethod === 'express' ? 'rgba(250, 204, 21, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                        border:
                          formData.shippingMethod === 'express' ? '2px solid #facc15' : '1px solid rgba(255, 255, 255, 0.08)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#fff' }}>Hỏa Tốc (2 Giờ)</div>
                        <div style={{ fontWeight: 800, fontSize: '0.84rem', color: '#facc15' }}>50.000₫</div>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#a855f7', marginTop: '4px' }}>
                        Nhận hàng siêu tốc trong 2 giờ nội thành
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={14} color="#10b981" />
                    <span>Được đồng kiểm khi nhận hàng • Đổi trả miễn phí 15 ngày</span>
                  </div>
                </div>
              </div>

              {/* SHOPEE BLOCK 4: VOUCHER & TỔNG KẾT */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Tag size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#facc15' }} />
                    <input
                      type="text"
                      placeholder="Nhập mã Shopee / AURA Voucher (FREESHIP, AURA10...)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        padding: '10px 14px 10px 38px',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.86rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyVoucher}
                    className="btn-secondary"
                    style={{ padding: '0 18px', borderRadius: '8px', fontSize: '0.84rem' }}
                  >
                    Áp Dụng
                  </button>
                </div>

                {coupon && (
                  <div style={{ fontSize: '0.8rem', color: '#10b981', marginBottom: '12px' }}>
                    ✓ Đã áp dụng mã <strong>{coupon.code}</strong> (giảm {coupon.discountPercent}%)
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Tổng tiền hàng:</span>
                    <span>{itemsPrice.toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Phí vận chuyển:</span>
                    <span>{shippingPrice.toLocaleString('vi-VN')}₫</span>
                  </div>
                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                      <span>Giảm giá Voucher:</span>
                      <span>-{discountAmount.toLocaleString('vi-VN')}₫</span>
                    </div>
                  )}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      paddingTop: '10px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <span>Tổng thanh toán:</span>
                    <span style={{ color: '#facc15', fontFamily: 'var(--font-mono)' }}>
                      {totalPrice.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <button
                type="button"
                onClick={handleNextToPayment}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <span>Tiếp Tục Chọn Phương Thức Thanh Toán</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* STEP 2: SHOPEE PAYMENT METHODS & FINAL CONFIRMATION */}
          {step === 2 && (
            <div>
              {/* Receiver preview card */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <MapPin size={16} color="#ef4444" />
                    <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#fff' }}>
                      {formData.fullName} ({formData.phone})
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '24px' }}>
                    {formData.address}, {formData.city}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(250, 204, 21, 0.3)',
                    color: '#facc15',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Thay Đổi
                </button>
              </div>

              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '16px' }}>
                Chọn Phương Thức Thanh Toán
              </h4>

              {/* Payment methods list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {/* 1. MoMo */}
                <div
                  onClick={() => setFormData((p) => ({ ...p, paymentMethod: 'MOMO' }))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    borderRadius: '14px',
                    background:
                      formData.paymentMethod === 'MOMO' ? 'rgba(216, 45, 139, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border:
                      formData.paymentMethod === 'MOMO' ? '2px solid #d82d8b' : '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #d82d8b 0%, #a50064 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 900,
                      fontSize: '0.85rem',
                    }}
                  >
                    MoMo
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>Ví Điện Tử MoMo (Quét QR MoMo)</span>
                      <span style={{ fontSize: '0.66rem', padding: '2px 6px', borderRadius: '4px', background: '#d82d8b', color: '#fff', fontWeight: 800 }}>PHỔ BIẾN</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Mã QR MoMo tự động xác nhận số tiền, thanh toán nhanh trong 1 chạm.
                    </div>
                  </div>
                </div>

                {/* 2. VNPAY-QR */}
                <div
                  onClick={() => setFormData((p) => ({ ...p, paymentMethod: 'VNPAY' }))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    borderRadius: '14px',
                    background:
                      formData.paymentMethod === 'VNPAY' ? 'rgba(0, 91, 170, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                    border:
                      formData.paymentMethod === 'VNPAY' ? '2px solid #005baa' : '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #005baa 0%, #ed1c24 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 900,
                      fontSize: '0.72rem',
                    }}
                  >
                    VNPAY
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>Cổng VNPAY-QR (35+ Ứng Dụng Ngân Hàng & Thẻ ATM)</span>
                      <span style={{ fontSize: '0.66rem', padding: '2px 6px', borderRadius: '4px', background: '#005baa', color: '#fff', fontWeight: 800 }}>35+ NGÂN HÀNG</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Vietcombank, MB, Techcombank, BIDV, ACB, VietinBank... hoặc thẻ ATM nội địa.
                    </div>
                  </div>
                </div>

                {/* 3. VietQR Chuyển khoản */}
                <div
                  onClick={() => setFormData((p) => ({ ...p, paymentMethod: 'VIETQR' }))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    borderRadius: '14px',
                    background:
                      formData.paymentMethod === 'VIETQR' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border:
                      formData.paymentMethod === 'VIETQR' ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: '#3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 900,
                      fontSize: '0.72rem',
                    }}
                  >
                    VietQR
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#fff' }}>
                      Chuyển Khoản Ngân Hàng Qua Mã VietQR
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Quét mã QR qua mọi ứng dụng ngân hàng di động 24/7.
                    </div>
                  </div>
                </div>

                {/* 4. COD */}
                <div
                  onClick={() => setFormData((p) => ({ ...p, paymentMethod: 'COD' }))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    borderRadius: '14px',
                    background:
                      formData.paymentMethod === 'COD' ? 'rgba(250, 204, 21, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border:
                      formData.paymentMethod === 'COD' ? '2px solid #facc15' : '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: '#22c55e',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#000',
                    }}
                  >
                    <Banknote size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#fff' }}>
                      Thanh Toán Khi Nhận Hàng (COD)
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Kiểm tra hàng đồng kiểm trước khi trả tiền mặt cho shipper.
                    </div>
                  </div>
                </div>

                {/* 5. Card */}
                <div
                  onClick={() => setFormData((p) => ({ ...p, paymentMethod: 'CARD' }))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    borderRadius: '14px',
                    background:
                      formData.paymentMethod === 'CARD' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border:
                      formData.paymentMethod === 'CARD' ? '2px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: '#a855f7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                    }}
                  >
                    <CreditCard size={22} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#fff' }}>
                      Thẻ Tín Dụng / Ghi Nợ Quốc Tế (Visa / Mastercard)
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Bảo mật chuẩn quốc tế SSL 256-bit.
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Preview if MoMo or VNPAY or VietQR */}
              {formData.paymentMethod === 'MOMO' && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(216, 45, 139, 0.12) 0%, rgba(18, 20, 29, 0.95) 100%)',
                    borderRadius: '16px',
                    padding: '20px',
                    marginBottom: '20px',
                    border: '1px solid rgba(216, 45, 139, 0.4)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '20px',
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=2|99|0901234567|CONG%20TY%20TNHH%20THOI%20TRANG%20AURA||0|0|${totalPrice}|AURA%20PAYMENT|transfer_myqr`}
                      alt="Mã QR MoMo"
                      style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '10px',
                        backgroundColor: '#fff',
                        padding: '6px',
                        border: '2px solid #d82d8b',
                      }}
                    />
                    <div style={{ fontSize: '0.72rem', color: '#f472b6', fontWeight: 700, marginTop: '4px' }}>
                      Quét bằng app MoMo
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f472b6' }}>
                      THANH TOÁN QUA VÍ ĐIỆN TỬ MOMO
                    </div>
                    <div style={{ fontSize: '0.82rem', marginTop: '6px', color: '#cbd5e1' }}>
                      Số ví MoMo: <strong style={{ color: '#fff' }}>0901 234 567</strong>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                      Tên chủ ví: <strong style={{ color: '#fff' }}>CÔNG TY TNHH THỜI TRANG AURA</strong>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                      Cú pháp: <strong style={{ color: '#facc15' }}>AURA {formData.phone}</strong>
                    </div>
                    <div style={{ fontSize: '0.95rem', color: '#f472b6', fontWeight: 800, marginTop: '6px' }}>
                      Số tiền: {totalPrice.toLocaleString('vi-VN')}₫
                    </div>
                  </div>
                </div>
              )}

              {formData.paymentMethod === 'VNPAY' && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 91, 170, 0.15) 0%, rgba(18, 20, 29, 0.95) 100%)',
                    borderRadius: '16px',
                    padding: '20px',
                    marginBottom: '20px',
                    border: '1px solid rgba(0, 91, 170, 0.4)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '20px',
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=VNPAY_QR_AURA_STORE_${totalPrice}_VND`}
                      alt="Mã VNPAY-QR"
                      style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '10px',
                        backgroundColor: '#fff',
                        padding: '6px',
                        border: '2px solid #005baa',
                      }}
                    />
                    <div style={{ fontSize: '0.72rem', color: '#60a5fa', fontWeight: 700, marginTop: '4px' }}>
                      Quét bằng App Ngân Hàng
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#60a5fa' }}>
                      CỔNG THANH TOÁN QUỐC GIA VNPAY-QR
                    </div>
                    <div style={{ fontSize: '0.82rem', marginTop: '6px', color: '#cbd5e1' }}>
                      Hỗ trợ: Vietcombank, Techcombank, MB, BIDV, VPBank, ACB, TPBank...
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                      Đơn vị thụ hưởng: <strong style={{ color: '#fff' }}>AURA STORE VNPAY</strong>
                    </div>
                    <div style={{ fontSize: '0.95rem', color: '#60a5fa', fontWeight: 800, marginTop: '6px' }}>
                      Tổng tiền: {totalPrice.toLocaleString('vi-VN')}₫
                    </div>
                  </div>
                </div>
              )}

              {/* Order Final Summary */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Tổng thanh toán đơn hàng:</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#facc15', fontFamily: 'var(--font-mono)' }}>
                    {totalPrice.toLocaleString('vi-VN')}₫
                  </div>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#10b981', textAlign: 'right' }}>
                  ✓ Đã bao gồm thuế GTGT & phí vận chuyển
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary"
                  style={{ padding: '14px 24px', borderRadius: '12px' }}
                >
                  Quay Lại
                </button>

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="btn-primary"
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: 900,
                    letterSpacing: '0.5px',
                  }}
                >
                  {loading ? 'Đang Xử Lý Đơn Hàng...' : 'XÁC NHẬN ĐẶT HÀNG NGAY'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ORDER SUCCESS CELEBRATION */}
          {step === 3 && createdOrder && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div
                style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '2px solid #10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}
              >
                <CheckCircle2 size={44} color="#10b981" />
              </div>

              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.8rem',
                  fontWeight: 800,
                  marginBottom: '8px',
                  color: '#fff',
                }}
              >
                Đặt Hàng Thành Công!
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', marginBottom: '24px' }}>
                Cảm ơn bạn đã lựa chọn AURA. Đơn hàng của bạn đã được chuyển vào hệ thống và đang <strong>chờ xác nhận</strong>.
              </p>

              {/* Order Code Box */}
              <div
                style={{
                  display: 'inline-block',
                  background: 'rgba(250, 204, 21, 0.1)',
                  border: '1px dashed #facc15',
                  padding: '14px 32px',
                  borderRadius: '14px',
                  marginBottom: '28px',
                }}
              >
                <div style={{ fontSize: '0.76rem', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  MÃ ĐƠN HÀNG CỦA BẠN
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.7rem',
                    fontWeight: 900,
                    color: '#facc15',
                    letterSpacing: '2px',
                    marginTop: '4px',
                  }}
                >
                  {createdOrder.orderCode}
                </div>
              </div>

              {/* Order Info Recap */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '16px',
                  padding: '20px',
                  maxWidth: '520px',
                  margin: '0 auto 28px',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontSize: '0.86rem', fontWeight: 700, marginBottom: '12px', color: '#cbd5e1' }}>
                  Chi tiết giao nhận:
                </div>
                <div style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: '1.6' }}>
                  <div>Người nhận: <strong style={{ color: '#fff' }}>{createdOrder.shippingAddress?.fullName}</strong> ({createdOrder.shippingAddress?.phone})</div>
                  <div>Địa chỉ: <strong style={{ color: '#fff' }}>{createdOrder.shippingAddress?.address}, {createdOrder.shippingAddress?.city}</strong></div>
                  <div>Phương thức thanh toán: <strong style={{ color: '#facc15' }}>{createdOrder.paymentMethod}</strong></div>
                  <div>Tổng thanh toán: <strong style={{ color: '#facc15' }}>{createdOrder.totalPrice?.toLocaleString('vi-VN')}₫</strong></div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    setCheckoutModalOpen(false);
                    onOpenOrderTracking(createdOrder.orderCode);
                  }}
                  className="btn-primary"
                  style={{ padding: '12px 26px', borderRadius: '10px' }}
                >
                  <Truck size={17} />
                  <span>Tra Cứu Tiến Độ Đơn Hàng</span>
                </button>

                <button
                  onClick={() => setCheckoutModalOpen(false)}
                  className="btn-secondary"
                  style={{ padding: '12px 26px', borderRadius: '10px' }}
                >
                  Tiếp Tục Mua Sắm
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
