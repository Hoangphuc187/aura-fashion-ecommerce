import React, { useState, useEffect } from 'react';
import {
  X,
  User as UserIcon,
  MapPin,
  Package,
  Star,
  Ticket,
  Heart,
  Shield,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Truck,
  RotateCcw,
  LogOut,
  Camera,
  Copy,
  ChevronRight,
  Eye,
  KeyRound,
  Laptop,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export const CustomerAccountModal = ({ isOpen, onClose, initialTab = 'profile', onOpenOrderTracking }) => {
  const { user, token, logout, updateUser, refreshUserProfile } = useAuth();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);

  // Tab: Profile Form
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'other',
    avatar: '',
  });

  // Tab: Address Book
  const [addresses, setAddresses] = useState([]);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressFormData, setAddressFormData] = useState({
    fullName: '',
    phone: '',
    street: '',
    ward: '',
    district: '',
    city: 'Hồ Chí Minh',
    isDefault: false,
  });

  // Tab: Orders
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState('All'); // All, Pending, Processing, Shipping, Delivered, Cancelled, Refunded
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  // Tab: Reviews
  const [reviewsSummary, setReviewsSummary] = useState({ pendingReviews: [], completedReviews: [] });
  const [reviewSubTab, setReviewSubTab] = useState('pending'); // 'pending' | 'completed'
  const [submittingReview, setSubmittingReview] = useState(null); // Product object to review
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', image: '' });

  // Tab: Vouchers
  const [vouchersData, setVouchersData] = useState({ available: [], used: [], expired: [] });
  const [voucherSubTab, setVoucherSubTab] = useState('available');

  // Tab: Wishlist
  const [wishlistProducts, setWishlistProducts] = useState([]);

  // Tab: Security
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [activeDevices, setActiveDevices] = useState([]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (!isOpen || !token) return;

    // Load initial user state
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        dob: user.dob ? user.dob.split('T')[0] : '',
        gender: user.gender || 'other',
        avatar: user.avatar || '',
      });
      setAddresses(user.addresses || []);
      setActiveDevices(user.activeDevices || []);
    }

    fetchFullProfileData();
    fetchOrders();
    fetchReviewsData();
    fetchVouchersData();
    fetchWishlistProducts();
  }, [isOpen, token]);

  const fetchFullProfileData = async () => {
    try {
      const res = await fetch('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.user) {
        updateUser(data.user);
        setAddresses(data.user.addresses || []);
        setActiveDevices(data.user.activeDevices || []);
      }
    } catch (err) {
      console.error('fetchFullProfileData err:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders/myorders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('fetchOrders err:', err);
    }
  };

  const fetchReviewsData = async () => {
    try {
      const res = await fetch('/api/auth/my-reviews-summary', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setReviewsSummary({
          pendingReviews: data.pendingReviews || [],
          completedReviews: data.completedReviews || [],
        });
      }
    } catch (err) {
      console.error('fetchReviewsData err:', err);
    }
  };

  const fetchVouchersData = async () => {
    try {
      const res = await fetch('/api/auth/my-vouchers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setVouchersData({
          available: data.available || [],
          used: data.used || [],
          expired: data.expired || [],
        });
      }
    } catch (err) {
      console.error('fetchVouchersData err:', err);
    }
  };

  const fetchWishlistProducts = async () => {
    try {
      const res = await fetch('/api/products?limit=50');
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        const wishIds = (user?.wishlist || []).map((w) => (typeof w === 'object' ? w._id : w));
        const matched = data.products.filter((p) => wishIds.includes(p._id));
        setWishlistProducts(matched);
      }
    } catch (err) {
      console.error('fetchWishlistProducts err:', err);
    }
  };

  // 1. UPDATE PROFILE
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi cập nhật hồ sơ');

      updateUser(data.user);
      addToast('Cập nhật thông tin cá nhân thành công!', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 2. ADDRESS BOOK CRUD
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressFormData.fullName || !addressFormData.phone || !addressFormData.street) {
      addToast('Vui lòng nhập đầy đủ họ tên, SĐT và địa chỉ đường phố', 'error');
      return;
    }

    setLoading(true);
    try {
      const url = editingAddress
        ? `/api/auth/addresses/${editingAddress._id}`
        : '/api/auth/addresses';
      const method = editingAddress ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addressFormData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi lưu địa chỉ');

      setAddresses(data.addresses);
      updateUser({ addresses: data.addresses });
      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressFormData({
        fullName: user?.name || '',
        phone: user?.phone || '',
        street: '',
        ward: '',
        district: '',
        city: 'Hồ Chí Minh',
        isDefault: false,
      });
      addToast(editingAddress ? 'Đã cập nhật địa chỉ!' : 'Đã thêm địa chỉ mới thành công!', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;
    try {
      const res = await fetch(`/api/auth/addresses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setAddresses(data.addresses);
      updateUser({ addresses: data.addresses });
      addToast('Đã xóa địa chỉ', 'info');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      const res = await fetch(`/api/auth/addresses/${id}/default`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setAddresses(data.addresses);
      updateUser({ addresses: data.addresses, address: data.defaultAddress, phone: data.defaultAddress.phone });
      addToast('Đã đặt làm địa chỉ giao hàng mặc định!', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // 3. CANCEL ORDER (Pending only)
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này? Mã giảm giá (nếu có) sẽ được hoàn lại.')) {
      return;
    }
    setCancellingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: 'Khách hàng yêu cầu hủy đơn' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi hủy đơn');

      addToast(data.message, 'success');
      fetchOrders();
      fetchVouchersData(); // Refresh refunded coupons
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setCancellingOrderId(null);
    }
  };

  // 4. SUBMIT REVIEW
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!submittingReview) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${submittingReview.productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: reviewForm.rating,
          comment: reviewForm.comment,
          images: reviewForm.image ? [reviewForm.image] : [],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi gửi đánh giá');

      addToast('Cảm ơn bạn! Đánh giá đã được gửi thành công.', 'success');
      setSubmittingReview(null);
      setReviewForm({ rating: 5, comment: '', image: '' });
      fetchReviewsData();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 5. CHANGE PASSWORD
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      addToast('Xác nhận mật khẩu mới không khớp!', 'error');
      return;
    }
    if (passwords.newPassword.length < 6) {
      addToast('Mật khẩu mới phải có tối thiểu 6 ký tự', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi đổi mật khẩu');

      addToast('Đổi mật khẩu thành công! Vui lòng ghi nhớ mật khẩu mới.', 'success');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 6. LOGOUT ALL SESSIONS
  const handleLogoutAll = async () => {
    if (!window.confirm('Bạn có chắc muốn đăng xuất khỏi tất cả các thiết bị? Phiên đăng nhập hiện tại cũng sẽ kết thúc.')) {
      return;
    }
    try {
      await fetch('/api/auth/logout-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      addToast('Đã đăng xuất khỏi tất cả các thiết bị an toàn!', 'success');
      logout();
      onClose();
    } catch (err) {
      addToast('Lỗi đăng xuất tất cả', 'error');
    }
  };

  if (!isOpen) return null;

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'All') return true;
    return o.orderStatus === orderFilter;
  });

  const getOrderStatusBadge = (status) => {
    const config = {
      Pending: { label: 'Chờ xác nhận', bg: 'rgba(234, 179, 8, 0.15)', text: '#facc15' },
      Processing: { label: 'Đang xử lý', bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa' },
      Shipping: { label: 'Đang giao', bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc' },
      Delivered: { label: 'Đã giao', bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399' },
      Cancelled: { label: 'Đã hủy', bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171' },
      Refunded: { label: 'Hoàn tiền', bg: 'rgba(249, 115, 22, 0.15)', text: '#fb923c' },
    };
    const c = config[status] || { label: status, bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8' };
    return (
      <span
        style={{
          background: c.bg,
          color: c.text,
          padding: '4px 10px',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 700,
          border: `1px solid ${c.text}33`,
        }}
      >
        {c.label}
      </span>
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="animate-scale-in"
        style={{
          width: '100%',
          maxWidth: '1080px',
          maxHeight: '90vh',
          background: '#0d0e15',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(250, 204, 21, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#f8fafc',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 28px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, transparent 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt={user?.name}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #facc15',
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>
                  {user?.name || 'Tài khoản cá nhân'}
                </h2>
                <span
                  style={{
                    background: 'rgba(250, 204, 21, 0.15)',
                    color: '#facc15',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(250, 204, 21, 0.3)',
                  }}
                >
                  {user?.role === 'admin' ? 'QUẢN TRỊ VIÊN' : 'VIP MEMBER'}
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                {user?.email} • {addresses.length} địa chỉ đã lưu
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#cbd5e1',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body with Side Navigation & Main Tab Content */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar Tabs */}
          <div
            style={{
              width: '240px',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '16px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              background: 'rgba(0, 0, 0, 0.25)',
              overflowY: 'auto',
            }}
          >
            {[
              { id: 'profile', label: 'Hồ sơ cá nhân', icon: UserIcon },
              { id: 'addresses', label: 'Sổ địa chỉ', icon: MapPin, count: addresses.length },
              { id: 'orders', label: 'Đơn mua', icon: Package, count: orders.length },
              { id: 'reviews', label: 'Đánh giá sản phẩm', icon: Star, count: reviewsSummary.pendingReviews.length },
              { id: 'vouchers', label: 'Kho Voucher', icon: Ticket, count: vouchersData.available.length },
              { id: 'wishlist', label: 'Sản phẩm yêu thích', icon: Heart, count: wishlistProducts.length },
              { id: 'security', label: 'Bảo mật & Thiết bị', icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: isActive ? 'linear-gradient(135deg, rgba(250, 204, 21, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)' : 'transparent',
                    color: isActive ? '#facc15' : '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: isActive ? 700 : 500,
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    borderLeft: isActive ? '3px solid #facc15' : '3px solid transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={17} color={isActive ? '#facc15' : '#64748b'} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      style={{
                        background: isActive ? '#facc15' : 'rgba(255, 255, 255, 0.1)',
                        color: isActive ? '#000' : '#e2e8f0',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: '9999px',
                      }}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}

            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  background: 'rgba(239, 68, 68, 0.08)',
                  color: '#f87171',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <LogOut size={16} />
                <span>Đăng xuất tài khoản</span>
              </button>
            </div>
          </div>

          {/* Tab Content Panel */}
          <div
            style={{
              flex: 1,
              padding: '24px 32px',
              overflowY: 'auto',
              background: '#0a0b10',
            }}
          >
            {/* TAB 1: PROFILE */}
            {activeTab === 'profile' && (
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 6px' }}>Hồ Sơ Của Tôi</h3>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>
                    Quản lý thông tin hồ sơ để bảo mật tài khoản và tự động điền khi mua hàng.
                  </p>
                </div>

                <form onSubmit={handleUpdateProfile} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '0.88rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                      Địa chỉ Email
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      disabled
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '10px',
                        color: '#64748b',
                        fontSize: '0.88rem',
                        cursor: 'not-allowed',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="VD: 0912345678"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '0.88rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      value={profileForm.dob}
                      onChange={(e) => setProfileForm({ ...profileForm, dob: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '0.88rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
                      Giới tính
                    </label>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      {[
                        { id: 'male', label: 'Nam' },
                        { id: 'female', label: 'Nữ' },
                        { id: 'other', label: 'Khác' },
                      ].map((g) => (
                        <label key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', color: '#cbd5e1', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="gender"
                            value={g.id}
                            checked={profileForm.gender === g.id}
                            onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                            style={{ accentColor: '#facc15' }}
                          />
                          <span>{g.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                      Avatar URL
                    </label>
                    <input
                      type="url"
                      value={profileForm.avatar}
                      onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                      placeholder="https://..."
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '0.88rem',
                      }}
                    />
                  </div>

                  <div style={{ gridColumn: 'span 2', marginTop: '12px' }}>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        padding: '12px 28px',
                        background: 'linear-gradient(135deg, #facc15 0%, #eab308 100%)',
                        color: '#000',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(250, 204, 21, 0.3)',
                      }}
                    >
                      {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: ADDRESS BOOK */}
            {activeTab === 'addresses' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 6px' }}>Địa Chỉ Của Tôi</h3>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>
                      Địa chỉ mặc định sẽ tự động được điền khi thanh toán đơn hàng.
                    </p>
                  </div>

                  {!showAddressForm && (
                    <button
                      onClick={() => {
                        setEditingAddress(null);
                        setAddressFormData({
                          fullName: user?.name || '',
                          phone: user?.phone || '',
                          street: '',
                          ward: '',
                          district: '',
                          city: 'Hồ Chí Minh',
                          isDefault: addresses.length === 0,
                        });
                        setShowAddressForm(true);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#facc15',
                        color: '#000',
                        border: 'none',
                        padding: '9px 16px',
                        borderRadius: '10px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <Plus size={16} />
                      <span>Thêm Địa Chỉ Mới</span>
                    </button>
                  )}
                </div>

                {/* Address Form (Add / Edit) */}
                {showAddressForm && (
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '16px',
                      padding: '20px',
                      marginBottom: '24px',
                    }}
                  >
                    <h4 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 700 }}>
                      {editingAddress ? 'Chỉnh Sửa Địa Chỉ' : 'Thêm Địa Chỉ Giao Hàng Mới'}
                    </h4>

                    <form onSubmit={handleSaveAddress} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>Họ và tên</label>
                        <input
                          type="text"
                          value={addressFormData.fullName}
                          onChange={(e) => setAddressFormData({ ...addressFormData, fullName: e.target.value })}
                          required
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '0.85rem',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>Số điện thoại</label>
                        <input
                          type="tel"
                          value={addressFormData.phone}
                          onChange={(e) => setAddressFormData({ ...addressFormData, phone: e.target.value })}
                          required
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '0.85rem',
                          }}
                        />
                      </div>

                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>
                          Địa chỉ cụ thể (Số nhà, tên đường, tòa nhà)
                        </label>
                        <input
                          type="text"
                          value={addressFormData.street}
                          onChange={(e) => setAddressFormData({ ...addressFormData, street: e.target.value })}
                          required
                          placeholder="VD: 123 Nguyễn Thị Minh Khai"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '0.85rem',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>Phường / Xã</label>
                        <input
                          type="text"
                          value={addressFormData.ward}
                          onChange={(e) => setAddressFormData({ ...addressFormData, ward: e.target.value })}
                          placeholder="VD: Phường Bến Nghé"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '0.85rem',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>Quận / Huyện</label>
                        <input
                          type="text"
                          value={addressFormData.district}
                          onChange={(e) => setAddressFormData({ ...addressFormData, district: e.target.value })}
                          placeholder="VD: Quận 1"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '0.85rem',
                          }}
                        />
                      </div>

                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>Tỉnh / Thành phố</label>
                        <input
                          type="text"
                          value={addressFormData.city}
                          onChange={(e) => setAddressFormData({ ...addressFormData, city: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '0.85rem',
                          }}
                        />
                      </div>

                      <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          id="isDefaultCheck"
                          checked={addressFormData.isDefault}
                          onChange={(e) => setAddressFormData({ ...addressFormData, isDefault: e.target.checked })}
                          style={{ accentColor: '#facc15' }}
                        />
                        <label htmlFor="isDefaultCheck" style={{ fontSize: '0.82rem', color: '#cbd5e1', cursor: 'pointer' }}>
                          Đặt làm địa chỉ nhận hàng mặc định
                        </label>
                      </div>

                      <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', marginTop: '6px' }}>
                        <button
                          type="submit"
                          disabled={loading}
                          style={{
                            padding: '10px 20px',
                            background: '#facc15',
                            color: '#000',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                          }}
                        >
                          {editingAddress ? 'Cập Nhật Địa Chỉ' : 'Lưu Địa Chỉ'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddressForm(false);
                            setEditingAddress(null);
                          }}
                          style={{
                            padding: '10px 16px',
                            background: 'transparent',
                            color: '#94a3b8',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                          }}
                        >
                          Hủy
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Address Cards List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {addresses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                      <MapPin size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
                      <p>Bạn chưa thêm địa chỉ nào. Hãy thêm địa chỉ để thanh toán nhanh hơn!</p>
                    </div>
                  ) : (
                    addresses.map((addr) => (
                      <div
                        key={addr._id}
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: addr.isDefault ? '1px solid #facc15' : '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '14px',
                          padding: '18px 20px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                            <strong style={{ fontSize: '0.92rem', color: '#fff' }}>{addr.fullName}</strong>
                            <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>| {addr.phone}</span>
                            {addr.isDefault && (
                              <span
                                style={{
                                  background: 'rgba(250, 204, 21, 0.15)',
                                  color: '#facc15',
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid rgba(250, 204, 21, 0.3)',
                                }}
                              >
                                MẶC ĐỊNH
                              </span>
                            )}
                          </div>
                          <p style={{ margin: '0 0 6px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                            {addr.street}
                          </p>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                            {[addr.ward, addr.district, addr.city].filter(Boolean).join(', ')}
                          </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                              onClick={() => {
                                setEditingAddress(addr);
                                setAddressFormData({
                                  fullName: addr.fullName,
                                  phone: addr.phone,
                                  street: addr.street,
                                  ward: addr.ward || '',
                                  district: addr.district || '',
                                  city: addr.city || 'Hồ Chí Minh',
                                  isDefault: addr.isDefault,
                                });
                                setShowAddressForm(true);
                              }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#facc15',
                                cursor: 'pointer',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                              }}
                            >
                              Sửa
                            </button>
                            {!addr.isDefault && (
                              <button
                                onClick={() => handleDeleteAddress(addr._id)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#f87171',
                                  cursor: 'pointer',
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                }}
                              >
                                Xóa
                              </button>
                            )}
                          </div>

                          {!addr.isDefault && (
                            <button
                              onClick={() => handleSetDefaultAddress(addr._id)}
                              style={{
                                background: 'rgba(255, 255, 255, 0.06)',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                color: '#cbd5e1',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Thiết lập mặc định
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: ORDERS */}
            {activeTab === 'orders' && (
              <div>
                <div style={{ marginBottom: '18px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 6px' }}>Đơn Mua Của Tôi</h3>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>
                    Theo dõi trạng thái, chi tiết các đơn hàng đã đặt và hủy đơn khi đang chờ duyệt.
                  </p>
                </div>

                {/* Status Tabs */}
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    paddingBottom: '12px',
                    marginBottom: '20px',
                    overflowX: 'auto',
                  }}
                >
                  {[
                    { id: 'All', label: 'Tất cả' },
                    { id: 'Pending', label: 'Chờ xác nhận' },
                    { id: 'Processing', label: 'Đang xử lý' },
                    { id: 'Shipping', label: 'Đang giao' },
                    { id: 'Delivered', label: 'Đã giao' },
                    { id: 'Cancelled', label: 'Đã hủy' },
                    { id: 'Refunded', label: 'Hoàn tiền' },
                  ].map((filter) => {
                    const active = orderFilter === filter.id;
                    const count = orders.filter((o) => filter.id === 'All' || o.orderStatus === filter.id).length;
                    return (
                      <button
                        key={filter.id}
                        onClick={() => setOrderFilter(filter.id)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          border: 'none',
                          background: active ? '#facc15' : 'rgba(255, 255, 255, 0.05)',
                          color: active ? '#000' : '#94a3b8',
                          fontSize: '0.8rem',
                          fontWeight: active ? 700 : 500,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.2s',
                        }}
                      >
                        {filter.label} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Orders List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {filteredOrders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
                      <Package size={44} style={{ opacity: 0.3, marginBottom: '12px' }} />
                      <p>Không có đơn hàng nào trong mục này</p>
                    </div>
                  ) : (
                    filteredOrders.map((order) => (
                      <div
                        key={order._id}
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '16px',
                          padding: '18px 22px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                            paddingBottom: '12px',
                            marginBottom: '14px',
                          }}
                        >
                          <div>
                            <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#facc15' }}>
                              #{order.orderCode}
                            </span>
                            <span style={{ fontSize: '0.78rem', color: '#64748b', marginLeft: '12px' }}>
                              {new Date(order.createdAt).toLocaleString('vi-VN')}
                            </span>
                          </div>
                          <div>{getOrderStatusBadge(order.orderStatus)}</div>
                        </div>

                        {/* Order Items */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                          {order.orderItems?.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <img
                                src={item.image}
                                alt={item.name}
                                style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                              />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#e2e8f0' }}>{item.name}</div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                  Phân loại: {item.color} / {item.size} • SL: x{item.quantity}
                                </div>
                              </div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                                {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Footer & Actions */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                            paddingTop: '12px',
                          }}
                        >
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            <span>PTTT: <strong>{order.paymentMethod}</strong></span>
                            {order.couponCode && (
                              <span style={{ marginLeft: '10px', color: '#facc15' }}>
                                Mã giảm: <strong>{order.couponCode}</strong> (-{order.discountAmount?.toLocaleString('vi-VN')}₫)
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Tổng tiền: </span>
                              <strong style={{ fontSize: '1.05rem', color: '#facc15' }}>
                                {order.totalPrice?.toLocaleString('vi-VN')}₫
                              </strong>
                            </div>

                            {/* Customer self-cancel for Pending orders */}
                            {order.orderStatus === 'Pending' && (
                              <button
                                onClick={() => handleCancelOrder(order._id)}
                                disabled={cancellingOrderId === order._id}
                                style={{
                                  background: 'rgba(239, 68, 68, 0.15)',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  color: '#f87171',
                                  padding: '7px 14px',
                                  borderRadius: '8px',
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                {cancellingOrderId === order._id ? 'Đang hủy...' : 'Hủy Đơn Hàng'}
                              </button>
                            )}

                            {onOpenOrderTracking && (
                              <button
                                onClick={() => {
                                  onClose();
                                  onOpenOrderTracking(order.orderCode);
                                }}
                                style={{
                                  background: 'rgba(255, 255, 255, 0.08)',
                                  border: '1px solid rgba(255, 255, 255, 0.15)',
                                  color: '#cbd5e1',
                                  padding: '7px 14px',
                                  borderRadius: '8px',
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Tra cứu vận chuyển
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: REVIEWS */}
            {activeTab === 'reviews' && (
              <div>
                <div style={{ marginBottom: '18px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 6px' }}>Đánh Giá Của Tôi</h3>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>
                    Chỉ khách hàng đã nhận hàng thành công mới có thể đánh giá và tải ảnh nhận xét.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <button
                    onClick={() => setReviewSubTab('pending')}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '8px',
                      border: 'none',
                      background: reviewSubTab === 'pending' ? '#facc15' : 'rgba(255, 255, 255, 0.05)',
                      color: reviewSubTab === 'pending' ? '#000' : '#94a3b8',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                    }}
                  >
                    Chưa đánh giá ({reviewsSummary.pendingReviews.length})
                  </button>
                  <button
                    onClick={() => setReviewSubTab('completed')}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '8px',
                      border: 'none',
                      background: reviewSubTab === 'completed' ? '#facc15' : 'rgba(255, 255, 255, 0.05)',
                      color: reviewSubTab === 'completed' ? '#000' : '#94a3b8',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                    }}
                  >
                    Đã đánh giá ({reviewsSummary.completedReviews.length})
                  </button>
                </div>

                {/* Review Modal / Inline Form */}
                {submittingReview && (
                  <div
                    style={{
                      background: 'rgba(250, 204, 21, 0.05)',
                      border: '1px solid rgba(250, 204, 21, 0.3)',
                      borderRadius: '16px',
                      padding: '20px',
                      marginBottom: '20px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#facc15' }}>
                        Đánh giá sản phẩm: {submittingReview.name}
                      </h4>
                      <button
                        onClick={() => setSubmittingReview(null)}
                        style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleSubmitReview}>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '6px' }}>
                          Mức độ hài lòng
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0,
                              }}
                            >
                              <Star
                                size={24}
                                fill={star <= reviewForm.rating ? '#facc15' : 'none'}
                                color={star <= reviewForm.rating ? '#facc15' : '#64748b'}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ marginBottom: '14px' }}>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '6px' }}>
                          Cảm nhận thực tế về chất vải, form dáng và dịch vụ
                        </label>
                        <textarea
                          rows={3}
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          required
                          placeholder="Chia sẻ trải nghiệm thực tế của bạn để giúp khách hàng khác chọn mua dễ hơn..."
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '0.85rem',
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '6px' }}>
                          Ảnh thực tế sản phẩm (URL ảnh)
                        </label>
                        <input
                          type="url"
                          value={reviewForm.image}
                          onChange={(e) => setReviewForm({ ...reviewForm, image: e.target.value })}
                          placeholder="https://images.unsplash.com/..."
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '0.85rem',
                          }}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        style={{
                          padding: '10px 24px',
                          background: '#facc15',
                          color: '#000',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                        }}
                      >
                        {loading ? 'Đang gửi...' : 'Gửi Đánh Giá Ngay'}
                      </button>
                    </form>
                  </div>
                )}

                {/* SubTab 1: Chưa đánh giá */}
                {reviewSubTab === 'pending' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {reviewsSummary.pendingReviews.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                        <CheckCircle2 size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
                        <p>Tuyệt vời! Bạn không có sản phẩm nào chưa đánh giá.</p>
                      </div>
                    ) : (
                      reviewsSummary.pendingReviews.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '14px',
                            padding: '16px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <img
                              src={item.image}
                              alt={item.name}
                              style={{ width: '52px', height: '52px', borderRadius: '10px', objectFit: 'cover' }}
                            />
                            <div>
                              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>{item.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                Đơn hàng: #{item.orderCode} • Đã giao:{' '}
                                {item.deliveredAt ? new Date(item.deliveredAt).toLocaleDateString('vi-VN') : 'Gần đây'}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setSubmittingReview(item);
                              setReviewForm({ rating: 5, comment: '', image: '' });
                            }}
                            style={{
                              background: '#facc15',
                              color: '#000',
                              border: 'none',
                              padding: '8px 16px',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Viết Đánh Giá
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* SubTab 2: Đã đánh giá */}
                {reviewSubTab === 'completed' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {reviewsSummary.completedReviews.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                        <Star size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
                        <p>Bạn chưa gửi đánh giá nào</p>
                      </div>
                    ) : (
                      reviewsSummary.completedReviews.map((rev, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '14px',
                            padding: '16px 20px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <strong style={{ fontSize: '0.88rem', color: '#fff' }}>{rev.productName}</strong>
                            <div style={{ display: 'flex', gap: '2px' }}>
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  fill={i < rev.rating ? '#facc15' : 'none'}
                                  color={i < rev.rating ? '#facc15' : '#64748b'}
                                />
                              ))}
                            </div>
                          </div>
                          <p style={{ margin: '0 0 8px', fontSize: '0.84rem', color: '#cbd5e1' }}>{rev.comment}</p>
                          {rev.images && rev.images.length > 0 && (
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                              {rev.images.map((imgUrl, i) => (
                                <img
                                  key={i}
                                  src={imgUrl}
                                  alt="review"
                                  style={{ width: '50px', height: '50px', borderRadius: '6px', objectFit: 'cover' }}
                                />
                              ))}
                            </div>
                          )}
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {new Date(rev.createdAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: VOUCHERS */}
            {activeTab === 'vouchers' && (
              <div>
                <div style={{ marginBottom: '18px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 6px' }}>Ví Voucher Của Tôi</h3>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>
                    Áp dụng mã giảm giá khi thanh toán để nhận ưu đãi tốt nhất.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  {[
                    { id: 'available', label: 'Khả dụng', list: vouchersData.available },
                    { id: 'used', label: 'Đã dùng', list: vouchersData.used },
                    { id: 'expired', label: 'Hết hạn', list: vouchersData.expired },
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setVoucherSubTab(sub.id)}
                      style={{
                        padding: '8px 18px',
                        borderRadius: '8px',
                        border: 'none',
                        background: voucherSubTab === sub.id ? '#facc15' : 'rgba(255, 255, 255, 0.05)',
                        color: voucherSubTab === sub.id ? '#000' : '#94a3b8',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                      }}
                    >
                      {sub.label} ({sub.list.length})
                    </button>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                  {(vouchersData[voucherSubTab] || []).length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                      <Ticket size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
                      <p>Không có voucher nào trong danh mục này</p>
                    </div>
                  ) : (
                    vouchersData[voucherSubTab].map((voucher) => (
                      <div
                        key={voucher.code}
                        style={{
                          background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                          border: '1px dashed rgba(250, 204, 21, 0.35)',
                          borderRadius: '14px',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          position: 'relative',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span
                              style={{
                                background: '#facc15',
                                color: '#000',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                letterSpacing: '0.5px',
                              }}
                            >
                              {voucher.code}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                              HSD: {voucher.expiresAt ? new Date(voucher.expiresAt).toLocaleDateString('vi-VN') : 'Vô thời hạn'}
                            </span>
                          </div>
                          <h4 style={{ margin: '0 0 4px', fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>
                            {voucher.discountType === 'percent'
                              ? `Giảm ${voucher.discountValue}%`
                              : voucher.discountType === 'freeship'
                              ? 'Miễn Phí Vận Chuyển'
                              : `Giảm ${voucher.discountValue?.toLocaleString('vi-VN')}₫`}
                          </h4>
                          <p style={{ margin: 0, fontSize: '0.76rem', color: '#94a3b8' }}>
                            Đơn tối thiểu: {voucher.minOrderAmount?.toLocaleString('vi-VN')}₫
                            {voucher.maxDiscountAmount && ` • Tối đa: ${voucher.maxDiscountAmount.toLocaleString('vi-VN')}₫`}
                          </p>
                        </div>

                        {voucherSubTab === 'available' && (
                          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(voucher.code);
                                addToast(`Đã sao chép mã ${voucher.code}!`, 'success');
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                color: '#cbd5e1',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              <Copy size={13} />
                              <span>Sao chép</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 6: WISHLIST */}
            {activeTab === 'wishlist' && (
              <div>
                <div style={{ marginBottom: '18px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 6px' }}>Sản Phẩm Yêu Thích</h3>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>
                    Những món đồ bạn đã lưu để theo dõi giá và mua sắm sau.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                  {wishlistProducts.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
                      <Heart size={44} style={{ opacity: 0.3, marginBottom: '12px' }} />
                      <p>Danh sách yêu thích đang trống</p>
                    </div>
                  ) : (
                    wishlistProducts.map((prod) => (
                      <div
                        key={prod._id}
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '14px',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <img
                          src={prod.images?.[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80'}
                          alt={prod.name}
                          style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                        />
                        <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                              {prod.name}
                            </div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#facc15' }}>
                              {prod.price?.toLocaleString('vi-VN')}₫
                            </div>
                          </div>

                          <div style={{ marginTop: '12px' }}>
                            <button
                              onClick={() => {
                                addToCart(prod, prod.sizes?.[0] || 'L', prod.colors?.[0] || 'Đen', 1);
                                addToast(`Đã thêm ${prod.name} vào giỏ hàng`, 'success');
                              }}
                              style={{
                                width: '100%',
                                background: '#facc15',
                                color: '#000',
                                border: 'none',
                                padding: '8px',
                                borderRadius: '8px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Thêm Vào Giỏ
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 7: SECURITY & DEVICES */}
            {activeTab === 'security' && (
              <div>
                <div style={{ marginBottom: '22px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 6px' }}>Bảo Mật Tài Khoản</h3>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>
                    Quản lý mật khẩu và các thiết bị đang đăng nhập để giữ an toàn tuyệt đối.
                  </p>
                </div>

                {/* Change Password Box */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '20px',
                    marginBottom: '24px',
                  }}
                >
                  <h4 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <KeyRound size={17} color="#facc15" />
                    <span>Đổi Mật Khẩu</span>
                  </h4>

                  <form onSubmit={handleChangePassword} style={{ maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>
                        Mật khẩu hiện tại
                      </label>
                      <input
                        type="password"
                        value={passwords.currentPassword}
                        onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '0.85rem',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>
                        Mật khẩu mới (tối thiểu 6 ký tự)
                      </label>
                      <input
                        type="password"
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '0.85rem',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>
                        Xác nhận mật khẩu mới
                      </label>
                      <input
                        type="password"
                        value={passwords.confirmPassword}
                        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '0.85rem',
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        padding: '10px 20px',
                        background: '#facc15',
                        color: '#000',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        marginTop: '4px',
                      }}
                    >
                      {loading ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
                    </button>
                  </form>
                </div>

                {/* Active Sessions & Logout All */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '20px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 700 }}>Thiết Bị Đăng Nhập</h4>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
                        Các phiên đăng nhập gần đây trên thiết bị của bạn.
                      </p>
                    </div>

                    <button
                      onClick={handleLogoutAll}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Đăng Xuất Khỏi Tất Cả Thiết Bị
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {activeDevices.length === 0 ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 14px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          borderRadius: '10px',
                        }}
                      >
                        <Laptop size={20} color="#facc15" />
                        <div>
                          <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#fff' }}>
                            Trình duyệt hiện tại (Thiết bị này)
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Đang hoạt động</div>
                        </div>
                      </div>
                    ) : (
                      activeDevices.map((dev, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 14px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderRadius: '10px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {dev.device?.toLowerCase().includes('mobile') ? (
                              <Smartphone size={20} color="#facc15" />
                            ) : (
                              <Laptop size={20} color="#facc15" />
                            )}
                            <div>
                              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#fff' }}>
                                {dev.device || 'Trình duyệt Web'}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                IP: {dev.ip || 'Localhost'} • Hoạt động:{' '}
                                {new Date(dev.lastLogin).toLocaleString('vi-VN')}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default CustomerAccountModal;
