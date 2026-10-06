import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  Sparkles,
  Zap,
  Tag,
  Flame,
  Check,
  ShieldAlert,
  ShieldCheck,
  Lock,
  ArrowLeft,
  LogOut,
  ExternalLink,
  Users,
  Search,
  RefreshCw,
  AlertTriangle,
  Ticket,
  Printer,
  HelpCircle,
  MessageSquare,
  KeyRound,
  Ban,
  Star,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AdminPortalPage = ({ onNavigateHome }) => {
  const { user, logout, loading: authLoading } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('products'); // 'stats' | 'products' | 'orders' | 'customers' | 'coupons' | 'inventory' | 'tickets' | 'reviews' | 'security'
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchProduct, setSearchProduct] = useState('');

  // Extended Admin States
  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [couponsList, setCouponsList] = useState([]);
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'percent',
    discountValue: 20,
    minOrderAmount: 200000,
    maxDiscountAmount: 100000,
    usageLimit: 100,
    perUserLimit: 1,
    expiresAt: '',
  });
  const [inventoryData, setInventoryData] = useState(null);
  const [ticketsList, setTicketsList] = useState([]);
  const [ticketFilter, setTicketFilter] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  // Customer Reviews & Feedback Moderation States
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewFilterRating, setReviewFilterRating] = useState('All');

  // Add Product Form Toggle & State
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Áo thun',
    price: 350000,
    originalPrice: 450000,
    description: '',
    image1: '',
    image2: '',
    stockQuantity: 50,
    featured: true,
  });

  // Edit Product State
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    category: 'Áo thun',
    price: 0,
    originalPrice: 0,
    description: '',
    image1: '',
    image2: '',
    stockQuantity: 50,
    featured: false,
    isBestSeller: false,
    isNewArrival: false,
  });

  const fetchData = async () => {
    if (!user?.token || user?.role !== 'admin') return;
    setLoading(true);
    try {
      // 1. Stats
      const resStats = await fetch('/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const dataStats = await resStats.json();
      if (dataStats.success) setStats(dataStats.stats);

      // 2. Products
      const resProducts = await fetch('/api/products?limit=100');
      const dataProducts = await resProducts.json();
      if (dataProducts.success) setProducts(dataProducts.products);

      // 3. Orders
      const resOrders = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const dataOrders = await resOrders.json();
      if (dataOrders.success) setOrders(dataOrders.orders);

      // 4. Users List
      try {
        const resUsers = await fetch('/api/dashboard/users', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const dataUsers = await resUsers.json();
        if (dataUsers.success) setUsersList(dataUsers.users || []);
      } catch {}

      // 5. Coupons
      try {
        const resCoupons = await fetch('/api/coupons', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const dataCoupons = await resCoupons.json();
        if (dataCoupons.success) setCouponsList(dataCoupons.coupons || []);
      } catch {}

      // 6. Inventory Data
      try {
        const resInv = await fetch('/api/dashboard/inventory', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const dataInv = await resInv.json();
        if (dataInv.success) setInventoryData(dataInv);
      } catch {}

      // 7. Support Tickets
      try {
        const resTickets = await fetch('/api/support/tickets', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const dataTickets = await resTickets.json();
        if (dataTickets.success) setTicketsList(dataTickets.tickets || []);
      } catch {}

      // 8. Customer Reviews & Feedback
      try {
        const resReviews = await fetch('/api/products/admin/reviews', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const dataReviews = await resReviews.json();
        if (dataReviews.success) setReviewsList(dataReviews.reviews || []);
      } catch {}
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchData();
    }
  }, [user]);

  // ==========================================
  // 1. CHẶN VÀ BLOCK NGAY NẾU KHÔNG PHẢI ADMIN
  // ==========================================
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#090a0f', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw className="animate-spin" size={36} color="#facc15" style={{ margin: '0 auto 16px' }} />
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Đang kiểm tra quyền hạn hệ thống...</div>
        </div>
      </div>
    );
  }

  const isAdmin = user && user.role === 'admin';

  if (!isAdmin) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#090a0f',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <div
          style={{
            fontSize: '5.5rem',
            fontWeight: 900,
            color: '#334155',
            lineHeight: 1,
            letterSpacing: '-2px',
            fontFamily: 'var(--font-display)',
          }}
        >
          404
        </div>
        <h1
          style={{
            fontSize: '1.45rem',
            fontWeight: 700,
            margin: '18px 0 10px',
            color: '#f8fafc',
          }}
        >
          Trang không tồn tại
        </h1>
        <p
          style={{
            color: '#64748b',
            fontSize: '0.92rem',
            maxWidth: '400px',
            lineHeight: 1.6,
            marginBottom: '26px',
          }}
        >
          Đường dẫn bạn yêu cầu không tồn tại, đã bị xóa hoặc tạm thời không khả dụng.
        </p>
        <button
          onClick={() => {
            if (onNavigateHome) onNavigateHome();
            else window.location.href = '/';
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)',
            color: '#000',
            fontWeight: 700,
            fontSize: '0.88rem',
            padding: '10px 22px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(250, 204, 21, 0.25)',
          }}
        >
          <ArrowLeft size={16} />
          <span>Về trang chủ</span>
        </button>
      </div>
    );
  }

  // ==========================================
  // 2. PRODUCT ACTIONS & HANDLERS
  // ==========================================
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const images = [];
      if (productForm.image1) images.push(productForm.image1);
      if (productForm.image2) images.push(productForm.image2);
      if (images.length === 0) {
        images.push('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80');
      }

      const payload = {
        name: productForm.name,
        category: productForm.category,
        price: Number(productForm.price),
        originalPrice: Number(productForm.originalPrice),
        description: productForm.description || 'Sản phẩm mới của AURA Studio.',
        images,
        stockQuantity: Number(productForm.stockQuantity),
        featured: productForm.featured,
        sizes: [
          { size: 'S', inStock: true },
          { size: 'M', inStock: true },
          { size: 'L', inStock: true },
          { size: 'XL', inStock: true },
        ],
        colors: [
          { name: 'Đen Tuyển', hex: '#18181b', inStock: true },
          { name: 'Trắng Ngà', hex: '#f4f4f5', inStock: true },
        ],
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi thêm sản phẩm');

      addToast('Thêm sản phẩm mới vào database thành công!', 'success');
      setShowAddProduct(false);
      setProductForm({
        name: '',
        category: 'Áo thun',
        price: 350000,
        originalPrice: 450000,
        description: '',
        image1: '',
        image2: '',
        stockQuantity: 50,
        featured: true,
      });
      fetchData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleStartEdit = (prod) => {
    setEditingProduct(prod);
    setEditForm({
      name: prod.name || '',
      category: prod.category || 'Áo thun',
      price: prod.price || 0,
      originalPrice: prod.originalPrice || prod.price || 0,
      description: prod.description || '',
      image1: prod.images?.[0] || '',
      image2: prod.images?.[1] || '',
      stockQuantity: prod.stockQuantity ?? 50,
      featured: Boolean(prod.featured),
      isBestSeller: Boolean(prod.isBestSeller),
      isNewArrival: Boolean(prod.isNewArrival),
    });
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const images = [];
      if (editForm.image1) images.push(editForm.image1);
      if (editForm.image2) images.push(editForm.image2);
      if (images.length === 0) {
        images.push('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80');
      }

      const payload = {
        name: editForm.name,
        category: editForm.category,
        price: Number(editForm.price),
        originalPrice: Number(editForm.originalPrice),
        description: editForm.description,
        images,
        stockQuantity: Number(editForm.stockQuantity),
        featured: editForm.featured,
        isBestSeller: editForm.isBestSeller,
        isNewArrival: editForm.isNewArrival,
      };

      const res = await fetch(`/api/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi cập nhật sản phẩm');

      addToast(`Đã lưu thay đổi cho: "${editForm.name}"`, 'success');
      setEditingProduct(null);
      fetchData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm này khỏi MongoDB Atlas?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      addToast('Đã xóa sản phẩm khỏi cơ sở dữ liệu', 'success');
      fetchData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleToggleBestSeller = async (prod) => {
    const nextStatus = !prod.isBestSeller;
    try {
      const res = await fetch(`/api/products/${prod._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ isBestSeller: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi cập nhật');

      addToast(
        nextStatus
          ? `Đã BẬT huy hiệu [🔥 Best Seller] cho ${prod.name}`
          : `Đã TẮT Best Seller cho ${prod.name}`,
        'success'
      );
      fetchData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleToggleFeatured = async (prod) => {
    const nextStatus = !prod.featured;
    try {
      const res = await fetch(`/api/products/${prod._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ featured: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi cập nhật');

      addToast(
        nextStatus
          ? `Đã đánh dấu [⭐ Nổi Bật] cho ${prod.name}`
          : `Đã hủy Nổi Bật cho ${prod.name}`,
        'success'
      );
      fetchData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleToggleStock = async (prod) => {
    const isCurrentlyInStock = (prod.stockQuantity || 0) > 0;
    const nextStock = isCurrentlyInStock ? 0 : 50;
    try {
      const res = await fetch(`/api/products/${prod._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ stockQuantity: nextStock }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi cập nhật');

      addToast(
        nextStock === 0
          ? `🔴 Đã chuyển sang: [HẾT HÀNG] cho ${prod.name}`
          : `🟢 Đã chuyển sang: [CÒN HÀNG - 50 cái] cho ${prod.name}`,
        'success'
      );
      fetchData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      addToast(`Đã chuyển trạng thái đơn hàng sang: ${newStatus}`, 'success');
      fetchData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleToggleUserBan = async (userId) => {
    try {
      const res = await fetch(`/api/dashboard/users/${userId}/ban`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      addToast(data.message, 'success');
      fetchData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleResetUserPassword = async (userId) => {
    const newPass = prompt('Nhập mật khẩu mới cho người dùng (tối thiểu 6 ký tự):', 'User@123456');
    if (!newPass || newPass.length < 6) return;
    try {
      const res = await fetch(`/api/dashboard/users/${userId}/reset-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ newPassword: newPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      addToast(data.message, 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(couponForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      addToast('Tạo Voucher / Coupon thành công!', 'success');
      setShowAddCoupon(false);
      setCouponForm({
        code: '',
        discountType: 'percent',
        discountValue: 20,
        minOrderAmount: 200000,
        maxDiscountAmount: 100000,
        usageLimit: 100,
        perUserLimit: 1,
        expiresAt: '',
      });
      fetchData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleToggleCoupon = async (couponId) => {
    try {
      const res = await fetch(`/api/coupons/${couponId}/toggle`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      addToast(data.message, 'success');
      fetchData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) return;
    try {
      const res = await fetch(`/api/coupons/${couponId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      addToast('Đã xóa mã coupon', 'info');
      fetchData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleReplyTicket = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !ticketReplyText.trim()) return;
    try {
      const res = await fetch(`/api/support/tickets/${selectedTicket._id}/reply`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          status: 'Resolved',
          replyMessage: ticketReplyText.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      addToast('Đã gửi phản hồi và cập nhật trạng thái Ticket!', 'success');
      setSelectedTicket(null);
      setTicketReplyText('');
      fetchData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteReview = async (productId, reviewId) => {
    if (!confirm('Bạn có chắc chắn muốn gỡ bỏ đánh giá này của khách hàng?')) return;
    try {
      const res = await fetch(`/api/products/${productId}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi gỡ bỏ đánh giá');
      addToast('Đã gỡ bỏ đánh giá thành công', 'success');
      fetchData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Filtered products
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
      p.category.toLowerCase().includes(searchProduct.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: '#090a0f', color: '#f8fafc', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-sans)' }}>
      {/* Top Header Bar */}
      <header
        style={{
          height: '70px',
          background: '#0d0f17',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #facc15 0%, #ff5722 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              boxShadow: '0 0 20px rgba(250, 204, 21, 0.3)',
            }}
          >
            <Zap size={22} color="#000" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>AURA STUDIO</span>
              <span
                style={{
                  background: '#facc15',
                  color: '#000',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                ADMIN PORTAL
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Trang Quản Trị Hệ Thống Riêng Biệt (URL: <span style={{ color: '#facc15', fontFamily: 'monospace' }}>/admin</span>)
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a
            href="http://localhost:5000/admin-portal?key=aura_hoangphuc_secure_admin_2026"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#cbd5e1',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <ExternalLink size={14} />
            <span>Cổng Backend (Port 5000)</span>
          </a>

          <button
            onClick={() => {
              if (onNavigateHome) onNavigateHome();
              else window.location.href = '/';
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)',
              border: '1px solid rgba(250, 204, 21, 0.4)',
              color: '#facc15',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <ShoppingBag size={15} />
            <span>Xem Web Cửa Hàng</span>
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '6px 12px',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={user.name}
              style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{user.email}</span>
          </div>

          <button
            onClick={logout}
            title="Đăng xuất"
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Layout Body */}
      <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 70px)' }}>
        {/* Left Sidebar */}
        <aside
          style={{
            width: '260px',
            background: '#0d0f17',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800, padding: '0 12px 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Menu Quản Trị
          </div>

          <button
            onClick={() => setActiveTab('products')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '10px',
              background: activeTab === 'products' ? 'rgba(250, 204, 21, 0.15)' : 'transparent',
              color: activeTab === 'products' ? '#facc15' : '#cbd5e1',
              border: activeTab === 'products' ? '1px solid rgba(250, 204, 21, 0.4)' : '1px solid transparent',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'all 0.2s',
            }}
          >
            <Package size={18} />
            <span>Quản Lý Sản Phẩm</span>
            <span
              style={{
                marginLeft: 'auto',
                fontSize: '0.72rem',
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '2px 8px',
                borderRadius: '9999px',
                color: '#fff',
              }}
            >
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '10px',
              background: activeTab === 'orders' ? 'rgba(250, 204, 21, 0.15)' : 'transparent',
              color: activeTab === 'orders' ? '#facc15' : '#cbd5e1',
              border: activeTab === 'orders' ? '1px solid rgba(250, 204, 21, 0.4)' : '1px solid transparent',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'all 0.2s',
            }}
          >
            <ShoppingBag size={18} />
            <span>Quản Lý Đơn Hàng</span>
            <span
              style={{
                marginLeft: 'auto',
                fontSize: '0.72rem',
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '2px 8px',
                borderRadius: '9999px',
                color: '#fff',
              }}
            >
              {orders.length}
            </span>
          </button>

          {/* Quản lý khách hàng */}
          <button
            onClick={() => setActiveTab('customers')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '10px',
              background: activeTab === 'customers' ? 'rgba(250, 204, 21, 0.15)' : 'transparent',
              color: activeTab === 'customers' ? '#facc15' : '#cbd5e1',
              border: activeTab === 'customers' ? '1px solid rgba(250, 204, 21, 0.4)' : '1px solid transparent',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'all 0.2s',
            }}
          >
            <Users size={18} />
            <span>Khách Hàng</span>
            <span
              style={{
                marginLeft: 'auto',
                fontSize: '0.72rem',
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '2px 8px',
                borderRadius: '9999px',
                color: '#fff',
              }}
            >
              {usersList.length}
            </span>
          </button>

          {/* Quản lý Coupon */}
          <button
            onClick={() => setActiveTab('coupons')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '10px',
              background: activeTab === 'coupons' ? 'rgba(250, 204, 21, 0.15)' : 'transparent',
              color: activeTab === 'coupons' ? '#facc15' : '#cbd5e1',
              border: activeTab === 'coupons' ? '1px solid rgba(250, 204, 21, 0.4)' : '1px solid transparent',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'all 0.2s',
            }}
          >
            <Ticket size={18} />
            <span>Mã Giảm Giá / Coupon</span>
            <span
              style={{
                marginLeft: 'auto',
                fontSize: '0.72rem',
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '2px 8px',
                borderRadius: '9999px',
                color: '#fff',
              }}
            >
              {couponsList.length}
            </span>
          </button>

          {/* Quản lý kho hàng & Hết hàng */}
          <button
            onClick={() => setActiveTab('inventory')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '10px',
              background: activeTab === 'inventory' ? 'rgba(250, 204, 21, 0.15)' : 'transparent',
              color: activeTab === 'inventory' ? '#facc15' : '#cbd5e1',
              border: activeTab === 'inventory' ? '1px solid rgba(250, 204, 21, 0.4)' : '1px solid transparent',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'all 0.2s',
            }}
          >
            <AlertTriangle size={18} color={inventoryData?.lowStockItems?.length > 0 ? '#facc15' : 'currentColor'} />
            <span>Kho Hàng & Cảnh Báo</span>
            {(inventoryData?.summary?.lowStockCount > 0 || inventoryData?.summary?.outOfStockCount > 0) && (
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: '0.72rem',
                  background: 'rgba(239, 68, 68, 0.25)',
                  border: '1px solid #ef4444',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  color: '#f87171',
                  fontWeight: 800,
                }}
              >
                !
              </span>
            )}
          </button>

          {/* Hỗ trợ & Ticket */}
          <button
            onClick={() => setActiveTab('tickets')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '10px',
              background: activeTab === 'tickets' ? 'rgba(250, 204, 21, 0.15)' : 'transparent',
              color: activeTab === 'tickets' ? '#facc15' : '#cbd5e1',
              border: activeTab === 'tickets' ? '1px solid rgba(250, 204, 21, 0.4)' : '1px solid transparent',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'all 0.2s',
            }}
          >
            <HelpCircle size={18} />
            <span>Hỗ Trợ & Ticket CSKH</span>
            {ticketsList.filter((t) => t.status === 'Pending').length > 0 && (
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: '0.72rem',
                  background: '#facc15',
                  color: '#000',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontWeight: 800,
                }}
              >
                {ticketsList.filter((t) => t.status === 'Pending').length}
              </span>
            )}
          </button>

          {/* Quản lý Đánh Giá & Phản Hồi */}
          <button
            onClick={() => setActiveTab('reviews')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '10px',
              background: activeTab === 'reviews' ? 'rgba(250, 204, 21, 0.15)' : 'transparent',
              color: activeTab === 'reviews' ? '#facc15' : '#cbd5e1',
              border: activeTab === 'reviews' ? '1px solid rgba(250, 204, 21, 0.4)' : '1px solid transparent',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'all 0.2s',
            }}
          >
            <Star size={18} color={activeTab === 'reviews' ? '#facc15' : 'currentColor'} />
            <span>Đánh Giá & Phản Hồi</span>
            <span
              style={{
                marginLeft: 'auto',
                fontSize: '0.72rem',
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '2px 8px',
                borderRadius: '9999px',
                color: '#fff',
              }}
            >
              {reviewsList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '10px',
              background: activeTab === 'stats' ? 'rgba(250, 204, 21, 0.15)' : 'transparent',
              color: activeTab === 'stats' ? '#facc15' : '#cbd5e1',
              border: activeTab === 'stats' ? '1px solid rgba(250, 204, 21, 0.4)' : '1px solid transparent',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'all 0.2s',
            }}
          >
            <TrendingUp size={18} />
            <span>Tổng Quan Báo Cáo</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '10px',
              background: activeTab === 'security' ? 'rgba(250, 204, 21, 0.15)' : 'transparent',
              color: activeTab === 'security' ? '#facc15' : '#cbd5e1',
              border: activeTab === 'security' ? '1px solid rgba(250, 204, 21, 0.4)' : '1px solid transparent',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'all 0.2s',
            }}
          >
            <ShieldCheck size={18} />
            <span>Bảo Mật & Anti-Scam</span>
          </button>

          <div style={{ marginTop: 'auto', background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
              <span>MongoDB Atlas Online</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Cluster0 • clothing_store</div>
          </div>
        </aside>

        {/* Content Area */}
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          {/* TAB 1: PRODUCT MANAGEMENT */}
          {activeTab === 'products' && (
            <div>
              {/* Header and Controls */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800 }}>
                    Quản Lý Danh Mục Sản Phẩm
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Chỉnh sửa giá, giảm giá, bật/tắt Best Seller, chuyển Hết hàng / Còn hàng trực tiếp trên database.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ position: 'relative', width: '260px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                      type="text"
                      placeholder="Tìm kiếm sản phẩm..."
                      value={searchProduct}
                      onChange={(e) => setSearchProduct(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#12141c',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '9px 12px 9px 36px',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '0.84rem',
                      }}
                    />
                  </div>

                  <button
                    onClick={() => setShowAddProduct(!showAddProduct)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)',
                      color: '#000',
                      fontWeight: 800,
                      padding: '10px 18px',
                      borderRadius: '10px',
                      border: 'none',
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(250, 204, 21, 0.3)',
                    }}
                  >
                    <Plus size={16} />
                    <span>{showAddProduct ? 'Đóng Form' : '+ Thêm Sản Phẩm Mới'}</span>
                  </button>
                </div>
              </div>

              {/* Add Product Form */}
              {showAddProduct && (
                <form
                  onSubmit={handleCreateProduct}
                  style={{
                    background: '#12141c',
                    padding: '24px',
                    borderRadius: '16px',
                    border: '1px solid rgba(250, 204, 21, 0.35)',
                    marginBottom: '28px',
                  }}
                >
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px', color: '#facc15' }}>
                    Thêm Mới Sản Phẩm Vào Database MongoDB Atlas
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Tên sản phẩm *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Áo Thun Streetwear Matrix Tee"
                        value={productForm.name}
                        onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))}
                        style={{
                          width: '100%',
                          background: '#1a1d29',
                          border: '1px solid rgba(255,255,255,0.15)',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          color: '#fff',
                          fontSize: '0.85rem',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Danh mục *</label>
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))}
                        style={{
                          width: '100%',
                          background: '#1a1d29',
                          border: '1px solid rgba(255,255,255,0.15)',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          color: '#fff',
                          fontSize: '0.85rem',
                        }}
                      >
                        <option value="Áo thun">Áo thun</option>
                        <option value="Áo khoác">Áo khoác</option>
                        <option value="Sơ mi">Sơ mi</option>
                        <option value="Quần & Shorts">Quần & Shorts</option>
                        <option value="Váy & Đầm">Váy & Đầm</option>
                        <option value="Phụ kiện">Phụ kiện</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Giá bán (₫) *</label>
                      <input
                        type="number"
                        required
                        value={productForm.price}
                        onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))}
                        style={{
                          width: '100%',
                          background: '#1a1d29',
                          border: '1px solid rgba(255,255,255,0.15)',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          color: '#fff',
                          fontSize: '0.85rem',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Giá gốc (₫)</label>
                      <input
                        type="number"
                        value={productForm.originalPrice}
                        onChange={(e) => setProductForm((p) => ({ ...p, originalPrice: e.target.value }))}
                        style={{
                          width: '100%',
                          background: '#1a1d29',
                          border: '1px solid rgba(255,255,255,0.15)',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          color: '#fff',
                          fontSize: '0.85rem',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Link Ảnh chính (URL)</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={productForm.image1}
                      onChange={(e) => setProductForm((p) => ({ ...p, image1: e.target.value }))}
                      style={{
                        width: '100%',
                        background: '#1a1d29',
                        border: '1px solid rgba(255,255,255,0.15)',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Mô tả sản phẩm</label>
                    <textarea
                      rows={2}
                      placeholder="Mô tả chất liệu, thiết kế..."
                      value={productForm.description}
                      onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))}
                      style={{
                        width: '100%',
                        background: '#1a1d29',
                        border: '1px solid rgba(255,255,255,0.15)',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '0.85rem',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      background: 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)',
                      color: '#000',
                      fontWeight: 800,
                      padding: '10px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                    }}
                  >
                    Lưu Sản Phẩm Vào Database
                  </button>
                </form>
              )}

              {/* Edit Product Modal */}
              {editingProduct && (
                <div
                  style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.85)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 1100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                  }}
                  onClick={() => setEditingProduct(null)}
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      background: '#12141c',
                      border: '1px solid rgba(250, 204, 21, 0.4)',
                      borderRadius: '20px',
                      width: '100%',
                      maxWidth: '680px',
                      maxHeight: '90vh',
                      overflowY: 'auto',
                      padding: '28px',
                      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.9)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: '#facc15',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#000',
                          }}
                        >
                          <Edit2 size={18} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Chỉnh Sửa Sản Phẩm</h4>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            ID: {editingProduct._id}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: 'none',
                          color: '#fff',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleUpdateProduct}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', fontWeight: 700 }}>
                            Tên sản phẩm *
                          </label>
                          <input
                            type="text"
                            required
                            value={editForm.name}
                            onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                            style={{
                              width: '100%',
                              background: '#1a1d29',
                              border: '1px solid rgba(255,255,255,0.15)',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              color: '#fff',
                              fontSize: '0.85rem',
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', fontWeight: 700 }}>
                            Danh mục *
                          </label>
                          <select
                            value={editForm.category}
                            onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}
                            style={{
                              width: '100%',
                              background: '#1a1d29',
                              border: '1px solid rgba(255,255,255,0.15)',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              color: '#fff',
                              fontSize: '0.85rem',
                            }}
                          >
                            <option value="Áo thun">Áo thun</option>
                            <option value="Áo khoác">Áo khoác</option>
                            <option value="Sơ mi">Sơ mi</option>
                            <option value="Quần & Shorts">Quần & Shorts</option>
                            <option value="Váy & Đầm">Váy & Đầm</option>
                            <option value="Phụ kiện">Phụ kiện</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', fontWeight: 700 }}>
                            Giá bán khuyến mãi (₫) *
                          </label>
                          <input
                            type="number"
                            required
                            value={editForm.price}
                            onChange={(e) => setEditForm((p) => ({ ...p, price: Number(e.target.value) }))}
                            style={{
                              width: '100%',
                              background: '#1a1d29',
                              border: '1px solid rgba(250,204,21,0.4)',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              color: '#facc15',
                              fontWeight: 700,
                              fontSize: '0.9rem',
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', fontWeight: 700 }}>
                            Giá gốc niêm yết (₫)
                          </label>
                          <input
                            type="number"
                            value={editForm.originalPrice}
                            onChange={(e) => setEditForm((p) => ({ ...p, originalPrice: Number(e.target.value) }))}
                            style={{
                              width: '100%',
                              background: '#1a1d29',
                              border: '1px solid rgba(255,255,255,0.15)',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              color: '#fff',
                              fontSize: '0.85rem',
                            }}
                          />
                        </div>
                      </div>

                      {/* Discount Preview banner */}
                      {editForm.originalPrice > editForm.price && (
                        <div
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            color: '#fca5a5',
                            marginBottom: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <Tag size={16} />
                          <span>
                            Sản phẩm đang được giảm giá: <strong>-{Math.round(((editForm.originalPrice - editForm.price) / editForm.originalPrice) * 100)}%</strong> (Khách tiết kiệm {(editForm.originalPrice - editForm.price).toLocaleString('vi-VN')}₫)
                          </span>
                        </div>
                      )}

                      {/* Stock quantity and Toggles */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', fontWeight: 700 }}>
                            Số lượng tồn kho (Nhập 0 = Hết hàng) *
                          </label>
                          <input
                            type="number"
                            required
                            min={0}
                            value={editForm.stockQuantity}
                            onChange={(e) => setEditForm((p) => ({ ...p, stockQuantity: Number(e.target.value) }))}
                            style={{
                              width: '100%',
                              background: '#1a1d29',
                              border: editForm.stockQuantity === 0 ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.15)',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              color: editForm.stockQuantity === 0 ? '#ef4444' : '#fff',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                            }}
                          />
                          {editForm.stockQuantity === 0 && (
                            <div style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '4px' }}>
                              ⚠️ Sản phẩm này sẽ hiển thị nhãn HẾT HÀNG trên web và khách không thể mua.
                            </div>
                          )}
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '8px', fontWeight: 700 }}>
                            Huy hiệu & Nhãn đặc biệt
                          </label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={editForm.isBestSeller}
                                onChange={(e) => setEditForm((p) => ({ ...p, isBestSeller: e.target.checked }))}
                              />
                              <span style={{ color: editForm.isBestSeller ? '#facc15' : '#cbd5e1', fontWeight: editForm.isBestSeller ? 700 : 400 }}>
                                🔥 Đánh dấu là Best Seller (Bán chạy nhất)
                              </span>
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={editForm.featured}
                                onChange={(e) => setEditForm((p) => ({ ...p, featured: e.target.checked }))}
                              />
                              <span style={{ color: editForm.featured ? '#f59e0b' : '#cbd5e1', fontWeight: editForm.featured ? 700 : 400 }}>
                                ⭐ Đánh dấu là Sản phẩm Nổi bật (Featured)
                              </span>
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={editForm.isNewArrival}
                                onChange={(e) => setEditForm((p) => ({ ...p, isNewArrival: e.target.checked }))}
                              />
                              <span style={{ color: editForm.isNewArrival ? '#60a5fa' : '#cbd5e1', fontWeight: editForm.isNewArrival ? 700 : 400 }}>
                                ✨ Hàng mới về (New Drop)
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div style={{ marginBottom: '14px' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', fontWeight: 700 }}>
                          Link ảnh sản phẩm chính (URL)
                        </label>
                        <input
                          type="url"
                          value={editForm.image1}
                          onChange={(e) => setEditForm((p) => ({ ...p, image1: e.target.value }))}
                          style={{
                            width: '100%',
                            background: '#1a1d29',
                            border: '1px solid rgba(255,255,255,0.15)',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '0.85rem',
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: '18px' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', fontWeight: 700 }}>
                          Mô tả sản phẩm
                        </label>
                        <textarea
                          rows={3}
                          value={editForm.description}
                          onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                          style={{
                            width: '100%',
                            background: '#1a1d29',
                            border: '1px solid rgba(255,255,255,0.15)',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '0.85rem',
                            resize: 'vertical',
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => setEditingProduct(null)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: '#fff',
                            padding: '10px 18px',
                            borderRadius: '8px',
                            fontSize: '0.86rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Hủy Bỏ
                        </button>

                        <button
                          type="submit"
                          style={{
                            background: 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)',
                            color: '#000',
                            padding: '10px 24px',
                            borderRadius: '8px',
                            fontSize: '0.88rem',
                            fontWeight: 800,
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          Lưu Cập Nhật Vào Database
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Products Table List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredProducts.map((prod) => {
                  const isOutOfStock = (prod.stockQuantity || 0) <= 0;
                  const hasDiscount = prod.originalPrice > prod.price;
                  const discountPercent = hasDiscount
                    ? Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)
                    : 0;

                  return (
                    <div
                      key={prod._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '14px',
                        padding: '16px 20px',
                        borderRadius: '14px',
                        background: '#12141c',
                        border: isOutOfStock
                          ? '1px solid rgba(239, 68, 68, 0.3)'
                          : '1px solid rgba(255, 255, 255, 0.07)',
                      }}
                    >
                      {/* Thumbnail */}
                      <div style={{ position: 'relative', width: '56px', height: '70px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                        <img
                          src={prod.images?.[0]}
                          alt={prod.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {isOutOfStock && (
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'rgba(0, 0, 0, 0.75)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ef4444',
                              fontSize: '0.65rem',
                              fontWeight: 900,
                              textAlign: 'center',
                              lineHeight: 1.1,
                            }}
                          >
                            HẾT HÀNG
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: '1 1 220px', minWidth: '180px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.74rem', color: '#facc15', textTransform: 'uppercase', fontWeight: 700 }}>
                            {prod.category}
                          </span>

                          {prod.isBestSeller && (
                            <span
                              style={{
                                background: '#facc15',
                                color: '#000',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                padding: '1px 6px',
                                borderRadius: '4px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '2px',
                              }}
                            >
                              <Zap size={10} fill="#000" /> HOT BEST SELLER
                            </span>
                          )}

                          {prod.featured && (
                            <span
                              style={{
                                background: 'rgba(245, 158, 11, 0.2)',
                                color: '#f59e0b',
                                border: '1px solid rgba(245, 158, 11, 0.4)',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                padding: '1px 6px',
                                borderRadius: '4px',
                              }}
                            >
                              ★ NỔI BẬT
                            </span>
                          )}

                          {hasDiscount && (
                            <span
                              style={{
                                background: 'rgba(239, 68, 68, 0.2)',
                                color: '#f87171',
                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                padding: '1px 6px',
                                borderRadius: '4px',
                              }}
                            >
                              -{discountPercent}%
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.96rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                          {prod.name}
                        </div>

                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          ID: <span style={{ fontFamily: 'monospace' }}>{prod._id}</span> • Đánh giá: {prod.rating}★ ({prod.numReviews})
                        </div>
                      </div>

                      {/* Price column */}
                      <div style={{ minWidth: '130px', textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.1rem', color: '#facc15' }}>
                          {prod.price.toLocaleString('vi-VN')}₫
                        </div>
                        {hasDiscount && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                            {prod.originalPrice.toLocaleString('vi-VN')}₫
                          </div>
                        )}
                      </div>

                      {/* Action Toggles */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {/* Stock Toggle Button */}
                        <button
                          onClick={() => handleToggleStock(prod)}
                          title="Bấm để chuyển nhanh trạng thái Còn Hàng / Hết Hàng"
                          style={{
                            background: isOutOfStock ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            border: isOutOfStock ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
                            color: isOutOfStock ? '#ef4444' : '#10b981',
                            padding: '7px 12px',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {isOutOfStock ? '🔴 HẾT HÀNG' : `🟢 Còn: ${prod.stockQuantity}`}
                        </button>

                        {/* Best Seller Toggle Button */}
                        <button
                          onClick={() => handleToggleBestSeller(prod)}
                          title="Bấm để Bật hoặc Tắt huy hiệu Best Seller"
                          style={{
                            background: prod.isBestSeller ? '#facc15' : 'rgba(255, 255, 255, 0.06)',
                            border: prod.isBestSeller ? '1px solid #facc15' : '1px solid rgba(255, 255, 255, 0.12)',
                            color: prod.isBestSeller ? '#000' : '#94a3b8',
                            padding: '7px 12px',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Flame size={13} fill={prod.isBestSeller ? '#000' : 'none'} />
                          <span>{prod.isBestSeller ? 'Best Seller' : '+ Best Seller'}</span>
                        </button>

                        {/* Featured Toggle Button */}
                        <button
                          onClick={() => handleToggleFeatured(prod)}
                          title="Bấm để Bật hoặc Tắt huy hiệu Nổi Bật"
                          style={{
                            background: prod.featured ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                            border: prod.featured ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.12)',
                            color: prod.featured ? '#f59e0b' : '#94a3b8',
                            padding: '7px 12px',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {prod.featured ? '⭐ Nổi Bật' : '+ Nổi Bật'}
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleStartEdit(prod)}
                          style={{
                            background: 'rgba(59, 130, 246, 0.15)',
                            border: '1px solid rgba(59, 130, 246, 0.4)',
                            color: '#60a5fa',
                            padding: '7px 14px',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                          title="Sửa chi tiết sản phẩm: giá khuyến mãi, giá gốc, tồn kho..."
                        >
                          <Edit2 size={14} />
                          <span>Sửa</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteProduct(prod._id)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#ef4444',
                            padding: '7px 10px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                          }}
                          title="Xóa vĩnh viễn sản phẩm"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800 }}>
                  Quản Lý Đơn Hàng Khách Hàng ({orders.length} đơn)
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Kiểm tra thông tin giao nhận, địa chỉ, phương thức thanh toán và cập nhật trạng thái đơn hàng.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {orders.map((ord) => (
                  <div
                    key={ord._id}
                    style={{
                      background: '#12141c',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '16px',
                      padding: '20px',
                    }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 800, color: '#facc15' }}>
                          {ord.orderCode}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                          {new Date(ord.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Cập nhật trạng thái:</span>
                        <select
                          value={ord.orderStatus}
                          onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                          style={{
                            background: '#1a1d29',
                            border: '1px solid #facc15',
                            color: '#facc15',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontSize: '0.84rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          <option value="Pending">Chờ xác nhận (Pending)</option>
                          <option value="Processing">Đang đóng gói (Processing)</option>
                          <option value="Shipping">Đang giao hàng (Shipping)</option>
                          <option value="Delivered">Đã giao thành công (Delivered)</option>
                          <option value="Cancelled">Đã hủy (Cancelled - Hoàn kho & voucher)</option>
                          <option value="Refunded">Đã hoàn tiền (Refunded)</option>
                        </select>

                        <button
                          onClick={() => setSelectedInvoiceOrder(ord)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: '#cbd5e1',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <Printer size={14} />
                          <span>In Hóa Đơn</span>
                        </button>
                      </div>
                    </div>

                    {/* Customer & Address Details */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', fontSize: '0.86rem', color: '#cbd5e1' }}>
                      <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px' }}>
                        <div style={{ fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Thông Tin Người Nhận:</div>
                        <div>Họ tên: <strong>{ord.shippingAddress?.fullName}</strong></div>
                        <div>Số điện thoại: <strong>{ord.shippingAddress?.phone}</strong></div>
                        <div>Địa chỉ: {ord.shippingAddress?.address}, {ord.shippingAddress?.city}</div>
                      </div>

                      <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px' }}>
                        <div style={{ fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Thanh Toán & Vận Chuyển:</div>
                        <div>Hình thức: <strong>{ord.paymentMethod}</strong> ({ord.paymentStatus})</div>
                        <div>Tổng thanh toán: <strong style={{ color: '#facc15', fontSize: '1rem', fontFamily: 'monospace' }}>{ord.totalPrice.toLocaleString('vi-VN')}₫</strong></div>
                        <div>Số món: {ord.orderItems?.length} sản phẩm</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: STATS OVERVIEW */}
          {activeTab === 'stats' && stats && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800 }}>
                  Báo Cáo Tổng Quan & Doanh Thu
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Dữ liệu trực tiếp đồng bộ từ MongoDB Atlas của cửa hàng AURA Studio.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div style={{ background: '#12141c', border: '1px solid rgba(250, 204, 21, 0.35)', padding: '24px', borderRadius: '16px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>TỔNG DOANH THU</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: '#facc15' }}>
                    {stats.totalRevenue.toLocaleString('vi-VN')}₫
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '6px' }}>✓ Đã tính toàn bộ đơn thành công</div>
                </div>

                <div style={{ background: '#12141c', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '24px', borderRadius: '16px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>TỔNG ĐƠN HÀNG</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
                    {stats.totalOrders}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#60a5fa', marginTop: '6px' }}>{stats.pendingOrders} đơn đang chờ duyệt</div>
                </div>

                <div style={{ background: '#12141c', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '24px', borderRadius: '16px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>SẢN PHẨM TRÊN HỆ THỐNG</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
                    {stats.totalProducts}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '6px' }}>Đầy đủ size & màu sắc</div>
                </div>

                <div style={{ background: '#12141c', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '24px', borderRadius: '16px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>KHÁCH HÀNG ĐĂNG KÝ</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
                    {stats.totalUsers}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#a855f7', marginTop: '6px' }}>Tài khoản xác thực</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY & ANTI-SCAM */}
          {activeTab === 'security' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800 }}>
                  Trung Tâm An Ninh & Chống Giả Mạo (Anti-Scam Shield)
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Kiểm soát an toàn mã nguồn, ngăn chặn hành vi trích xuất dữ liệu và sao chép thương hiệu AURA Studio.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                <div style={{ background: '#12141c', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: '16px', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', fontWeight: 800, fontSize: '1.1rem', marginBottom: '14px' }}>
                    <ShieldCheck size={22} />
                    <span>Khiên Chắn Chống Xem Nguồn Đang BẬT</span>
                  </div>
                  <ul style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: '1.8', marginLeft: '18px' }}>
                    <li><strong>Chuột phải (Context Menu):</strong> Bị khóa 100% trên toàn website.</li>
                    <li><strong>Phím F12 (Inspect):</strong> Bị chặn và vô hiệu hóa.</li>
                    <li><strong>Ctrl+U (Xem nguồn trang):</strong> Bị chặn ngay khi người dùng bấm phím.</li>
                    <li><strong>Ctrl+S & Ctrl+Shift+I/J/C:</strong> Chặn tải xuống website và mở bảng Inspector.</li>
                    <li><strong>Kéo thả ảnh:</strong> Vô hiệu hóa tính năng kéo trộm hình ảnh sản phẩm/logo.</li>
                  </ul>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: CUSTOMER MANAGEMENT */}
          {activeTab === 'customers' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800 }}>
                    Quản Lý Khách Hàng ({usersList.length} tài khoản)
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Theo dõi hoạt động, tổng chi tiêu, lịch sử đơn hàng và phân quyền tài khoản khách hàng.
                  </p>
                </div>

                <div style={{ position: 'relative', width: '280px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Tìm theo tên, email, sđt..."
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      background: '#12141c',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.84rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {usersList
                  .filter(
                    (u) =>
                      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
                      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
                      u.phone?.toLowerCase().includes(userSearch.toLowerCase())
                  )
                  .map((usr) => (
                    <div
                      key={usr._id}
                      style={{
                        background: '#12141c',
                        border: usr.isBanned ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '14px',
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '14px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <img
                          src={usr.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                          alt={usr.name}
                          style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ fontSize: '0.94rem', color: '#fff' }}>{usr.name}</strong>
                            <span
                              style={{
                                background: usr.role === 'admin' ? 'rgba(250, 204, 21, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                                color: usr.role === 'admin' ? '#facc15' : '#cbd5e1',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '4px',
                              }}
                            >
                              {usr.role === 'admin' ? 'ADMIN' : 'KHÁCH HÀNG'}
                            </span>
                            {usr.isBanned && (
                              <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                                BỊ KHÓA
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                            {usr.email} • SĐT: {usr.phone || 'Chưa cập nhật'} • Đăng ký: {new Date(usr.createdAt).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Đơn hàng / Chi tiêu:</div>
                          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#facc15' }}>
                            {usr.orderCount || 0} đơn • {(usr.totalSpent || 0).toLocaleString('vi-VN')}₫
                          </div>
                        </div>

                        {usr.role !== 'admin' && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleResetUserPassword(usr._id)}
                              title="Đặt lại mật khẩu mới cho khách hàng"
                              style={{
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                color: '#cbd5e1',
                                padding: '7px 12px',
                                borderRadius: '8px',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <KeyRound size={14} />
                              <span>Reset MK</span>
                            </button>

                            <button
                              onClick={() => handleToggleUserBan(usr._id)}
                              style={{
                                background: usr.isBanned ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                border: usr.isBanned ? '1px solid #10b981' : '1px solid rgba(239, 68, 68, 0.4)',
                                color: usr.isBanned ? '#34d399' : '#f87171',
                                padding: '7px 12px',
                                borderRadius: '8px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Ban size={14} />
                              <span>{usr.isBanned ? 'Mở Khóa' : 'Khóa Nick'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 6: COUPON MANAGEMENT */}
          {activeTab === 'coupons' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800 }}>
                    Quản Lý Mã Giảm Giá & Voucher ({couponsList.length} mã)
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Tạo mã khuyến mãi %, giảm tiền mặt, miễn phí vận chuyển và kiểm soát hạn sử dụng.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddCoupon(!showAddCoupon)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#facc15',
                    color: '#000',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={16} />
                  <span>{showAddCoupon ? 'Đóng Form' : 'Tạo Coupon Mới'}</span>
                </button>
              </div>

              {/* Add Coupon Form */}
              {showAddCoupon && (
                <div style={{ background: '#12141c', border: '1px solid rgba(250, 204, 21, 0.3)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 800, color: '#facc15' }}>
                    Thêm Mã Giảm Giá Mới
                  </h4>
                  <form onSubmit={handleCreateCoupon} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>Mã Code (In hoa) *</label>
                      <input
                        type="text"
                        required
                        value={couponForm.code}
                        onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                        placeholder="VD: VIP2026"
                        style={{ width: '100%', padding: '9px 12px', background: '#1a1d29', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>Loại giảm *</label>
                      <select
                        value={couponForm.discountType}
                        onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', background: '#1a1d29', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                      >
                        <option value="percent">Phần trăm (%)</option>
                        <option value="fixed">Số tiền cố định (₫)</option>
                        <option value="freeship">Miễn phí vận chuyển (Freeship)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>Giá trị giảm *</label>
                      <input
                        type="number"
                        required
                        value={couponForm.discountValue}
                        onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                        placeholder="VD: 20 (cho 20%)"
                        style={{ width: '100%', padding: '9px 12px', background: '#1a1d29', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>Đơn tối thiểu (₫)</label>
                      <input
                        type="number"
                        value={couponForm.minOrderAmount}
                        onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: Number(e.target.value) })}
                        style={{ width: '100%', padding: '9px 12px', background: '#1a1d29', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>Giảm tối đa (₫)</label>
                      <input
                        type="number"
                        value={couponForm.maxDiscountAmount}
                        onChange={(e) => setCouponForm({ ...couponForm, maxDiscountAmount: Number(e.target.value) })}
                        style={{ width: '100%', padding: '9px 12px', background: '#1a1d29', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>Số lượt dùng tối đa</label>
                      <input
                        type="number"
                        value={couponForm.usageLimit}
                        onChange={(e) => setCouponForm({ ...couponForm, usageLimit: Number(e.target.value) })}
                        style={{ width: '100%', padding: '9px 12px', background: '#1a1d29', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>Hạn sử dụng</label>
                      <input
                        type="date"
                        value={couponForm.expiresAt}
                        onChange={(e) => setCouponForm({ ...couponForm, expiresAt: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', background: '#1a1d29', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                      <button
                        type="submit"
                        style={{
                          width: '100%',
                          padding: '11px',
                          background: '#facc15',
                          color: '#000',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                        }}
                      >
                        Lưu Mã Vào Database
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Coupons List */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {couponsList.map((c) => (
                  <div
                    key={c._id}
                    style={{
                      background: '#12141c',
                      border: c.isActive ? '1px solid rgba(250, 204, 21, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '16px',
                      padding: '18px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ background: '#facc15', color: '#000', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 800 }}>
                          {c.code}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: c.isActive ? '#10b981' : '#f87171', fontWeight: 700 }}>
                          ● {c.isActive ? 'Đang kích hoạt' : 'Tạm tắt'}
                        </span>
                      </div>

                      <h4 style={{ margin: '8px 0 4px', fontSize: '1rem', color: '#fff' }}>
                        {c.discountType === 'percent'
                          ? `Giảm ${c.discountValue}%`
                          : c.discountType === 'freeship'
                          ? 'Miễn phí vận chuyển'
                          : `Giảm ${c.discountValue?.toLocaleString('vi-VN')}₫`}
                      </h4>
                      <p style={{ margin: '0 0 6px', fontSize: '0.78rem', color: '#94a3b8' }}>
                        Đơn tối thiểu: {c.minOrderAmount?.toLocaleString('vi-VN')}₫
                        {c.maxDiscountAmount ? ` • Tối đa: ${c.maxDiscountAmount?.toLocaleString('vi-VN')}₫` : ''}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                        Đã dùng: <strong>{c.usedCount || 0}</strong> / {c.usageLimit || '∞'} lượt
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '12px' }}>
                      <button
                        onClick={() => handleToggleCoupon(c._id)}
                        style={{
                          flex: 1,
                          padding: '7px',
                          borderRadius: '6px',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: '#fff',
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {c.isActive ? 'Tạm tắt' : 'Kích hoạt'}
                      </button>

                      <button
                        onClick={() => handleDeleteCoupon(c._id)}
                        style={{
                          padding: '7px 12px',
                          borderRadius: '6px',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#f87171',
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: INVENTORY MANAGEMENT & LOW STOCK */}
          {activeTab === 'inventory' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800 }}>
                  Quản Lý Kho Hàng & Cảnh Báo Sắp Hết Hàng
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Hệ thống tự động theo dõi số lượng tồn kho thực tế trong MongoDB Atlas và cảnh báo khi sản phẩm còn ít hơn 5 chiếc.
                </p>
              </div>

              {/* Warning Banner if Low Stock exists */}
              {inventoryData?.lowStockItems?.length > 0 && (
                <div
                  style={{
                    background: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid #f59e0b',
                    borderRadius: '14px',
                    padding: '16px 20px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <AlertTriangle size={24} color="#f59e0b" />
                  <div>
                    <strong style={{ fontSize: '0.92rem', color: '#facc15' }}>
                      CẢNH BÁO KHO: Có {inventoryData.lowStockItems.length} sản phẩm sắp hết hàng (tồn kho ≤ 5)!
                    </strong>
                    <div style={{ fontSize: '0.8rem', color: '#e2e8f0', marginTop: '2px' }}>
                      Ví dụ: <strong>{inventoryData.lowStockItems[0]?.name}</strong> chỉ còn {inventoryData.lowStockItems[0]?.stockQuantity || 3} sản phẩm. Cần bổ sung nguồn cung cấp!
                    </div>
                  </div>
                </div>
              )}

              {/* Inventory Summary Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#12141c', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '18px', borderRadius: '14px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>TỔNG SẢN PHẨM</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                    {inventoryData?.summary?.totalProducts || products.length}
                  </div>
                </div>

                <div style={{ background: '#12141c', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '18px', borderRadius: '14px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>CÒN HÀNG DỒI DÀO (&gt; 5)</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                    {inventoryData?.summary?.healthyCount || 0}
                  </div>
                </div>

                <div style={{ background: '#12141c', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '18px', borderRadius: '14px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>SẮP HẾT HÀNG (≤5)</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
                    {inventoryData?.summary?.lowStockCount || 0}
                  </div>
                </div>

                <div style={{ background: '#12141c', border: '1px solid rgba(239, 68, 68, 0.35)', padding: '18px', borderRadius: '14px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>ĐÃ HẾT HÀNG (0)</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>
                    {inventoryData?.summary?.outOfStockCount || 0}
                  </div>
                </div>
              </div>

              {/* Product Stock Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {products.map((p) => {
                  const stock = p.stockQuantity ?? 50;
                  const isLow = stock <= 5 && stock > 0;
                  const isOut = stock === 0;

                  return (
                    <div
                      key={p._id}
                      style={{
                        background: '#12141c',
                        border: isOut
                          ? '1px solid rgba(239, 68, 68, 0.3)'
                          : isLow
                          ? '1px solid rgba(245, 158, 11, 0.3)'
                          : '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '12px',
                        padding: '14px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <img
                          src={p.images?.[0]}
                          alt={p.name}
                          style={{ width: '44px', height: '54px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: '#fff' }}>{p.name}</strong>
                          <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>{p.category} • {p.price?.toLocaleString('vi-VN')}₫</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <span
                          style={{
                            background: isOut
                              ? 'rgba(239, 68, 68, 0.2)'
                              : isLow
                              ? 'rgba(245, 158, 11, 0.2)'
                              : 'rgba(16, 185, 129, 0.15)',
                            color: isOut ? '#f87171' : isLow ? '#fbbf24' : '#34d399',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            padding: '4px 10px',
                            borderRadius: '6px',
                          }}
                        >
                          Tồn kho: {stock} cái
                        </span>

                        <button
                          onClick={() => handleToggleStock(p)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: '#cbd5e1',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {isOut ? 'Nhập thêm 50 cái' : 'Đánh dấu hết hàng'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 8: SUPPORT DESK & TICKETS */}
          {activeTab === 'tickets' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800 }}>
                    Hỗ Trợ Khách Hàng & Ticket CSKH ({ticketsList.length} yêu cầu)
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Phản hồi các khiếu nại, yêu cầu đổi size, hoàn tiền hoặc tư vấn từ khách hàng.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {['All', 'Pending', 'In Progress', 'Resolved'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setTicketFilter(st)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '8px',
                        border: 'none',
                        background: ticketFilter === st ? '#facc15' : 'rgba(255, 255, 255, 0.06)',
                        color: ticketFilter === st ? '#000' : '#94a3b8',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {st === 'All' ? 'Tất cả' : st === 'Pending' ? 'Chờ xử lý' : st === 'In Progress' ? 'Đang xử lý' : 'Đã giải quyết'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tickets List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {ticketsList
                  .filter((t) => ticketFilter === 'All' || t.status === ticketFilter)
                  .map((t) => (
                    <div
                      key={t._id}
                      style={{
                        background: '#12141c',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '16px',
                        padding: '18px 22px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div>
                          <strong style={{ fontSize: '0.95rem', color: '#facc15' }}>#{t.ticketCode}</strong>
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: '10px' }}>
                            {t.name} ({t.email}) • {new Date(t.createdAt).toLocaleString('vi-VN')}
                          </span>
                        </div>

                        <span
                          style={{
                            background:
                              t.status === 'Resolved'
                                ? 'rgba(16, 185, 129, 0.15)'
                                : t.status === 'In Progress'
                                ? 'rgba(59, 130, 246, 0.15)'
                                : 'rgba(234, 179, 8, 0.15)',
                            color:
                              t.status === 'Resolved'
                                ? '#34d399'
                                : t.status === 'In Progress'
                                ? '#60a5fa'
                                : '#facc15',
                            padding: '3px 10px',
                            borderRadius: '9999px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                          }}
                        >
                          {t.status === 'Resolved' ? 'Đã giải quyết' : t.status === 'In Progress' ? 'Đang xử lý' : 'Chờ phản hồi'}
                        </span>
                      </div>

                      <h4 style={{ margin: '0 0 6px', fontSize: '0.95rem', color: '#fff' }}>
                        [{t.category}] {t.subject}
                      </h4>
                      <p style={{ margin: '0 0 14px', fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                        {t.message}
                      </p>

                      {/* Reply Box */}
                      {selectedTicket?._id === t._id ? (
                        <form onSubmit={handleReplyTicket} style={{ marginTop: '12px', background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px' }}>
                          <label style={{ display: 'block', fontSize: '0.78rem', color: '#facc15', fontWeight: 700, marginBottom: '6px' }}>
                            Nội dung phản hồi khách hàng:
                          </label>
                          <textarea
                            rows={3}
                            required
                            value={ticketReplyText}
                            onChange={(e) => setTicketReplyText(e.target.value)}
                            placeholder="Nhập câu trả lời từ đội ngũ CSKH..."
                            style={{
                              width: '100%',
                              padding: '10px',
                              background: '#1a1d29',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              borderRadius: '8px',
                              color: '#fff',
                              fontSize: '0.84rem',
                              marginBottom: '10px',
                            }}
                          />
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="submit"
                              style={{
                                background: '#10b981',
                                color: '#000',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                              }}
                            >
                              Gửi Phản Hồi & Đóng Ticket
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedTicket(null)}
                              style={{
                                background: 'transparent',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                color: '#94a3b8',
                                padding: '8px 14px',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                              }}
                            >
                              Hủy
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => {
                              setSelectedTicket(t);
                              setTicketReplyText('');
                            }}
                            style={{
                              background: 'rgba(250, 204, 21, 0.15)',
                              border: '1px solid rgba(250, 204, 21, 0.3)',
                              color: '#facc15',
                              padding: '6px 14px',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Viết Phản Hồi CSKH
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 8: CUSTOMER REVIEWS & FEEDBACK MODERATION */}
          {activeTab === 'reviews' && (
            <div>
              {/* Header and Controls */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Star size={24} color="#facc15" fill="#facc15" />
                    <span>Quản Lý Đánh Giá & Phản Hồi Khách Hàng</span>
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Giám sát ý kiến đánh giá từ người mua thực tế, xem ảnh feedback khách chụp và gỡ bỏ nội dung không phù hợp.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', width: '260px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                      type="text"
                      placeholder="Tìm theo khách, sản phẩm, nội dung..."
                      value={reviewSearch}
                      onChange={(e) => setReviewSearch(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#12141c',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '10px 14px 10px 38px',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '0.84rem',
                      }}
                    />
                  </div>

                  <select
                    value={reviewFilterRating}
                    onChange={(e) => setReviewFilterRating(e.target.value)}
                    style={{
                      background: '#12141c',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="All">Tất cả số sao</option>
                    <option value="5">⭐⭐⭐⭐⭐ (5 sao)</option>
                    <option value="4">⭐⭐⭐⭐ (4 sao)</option>
                    <option value="3">⭐⭐⭐ (3 sao)</option>
                    <option value="2">⭐⭐ (2 sao)</option>
                    <option value="1">⭐ (1 sao)</option>
                  </select>

                  <button
                    onClick={fetchData}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#cbd5e1',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                    }}
                  >
                    <RefreshCw size={15} />
                    <span>Làm mới</span>
                  </button>
                </div>
              </div>

              {/* Metrics Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                <div style={{ background: '#12141c', padding: '18px 20px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Tổng Phản Hồi
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#facc15' }}>
                    {reviewsList.length}
                  </div>
                </div>

                <div style={{ background: '#12141c', padding: '18px 20px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Điểm Đánh Giá TB
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {reviewsList.length > 0
                      ? (reviewsList.reduce((acc, r) => acc + (r.rating || 5), 0) / reviewsList.length).toFixed(1)
                      : '5.0'}
                    <span style={{ fontSize: '1rem', color: '#94a3b8' }}>/ 5.0</span>
                  </div>
                </div>

                <div style={{ background: '#12141c', padding: '18px 20px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Feedback Có Ảnh Thật
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>
                    {reviewsList.filter((r) => r.images && r.images.length > 0).length}
                  </div>
                </div>

                <div style={{ background: '#12141c', padding: '18px 20px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Tỉ Lệ Hài Lòng (4-5★)
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a855f7' }}>
                    {reviewsList.length > 0
                      ? `${Math.round((reviewsList.filter((r) => (r.rating || 5) >= 4).length / reviewsList.length) * 100)}%`
                      : '100%'}
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {reviewsList
                  .filter((r) => {
                    const q = reviewSearch.toLowerCase().trim();
                    const matchSearch =
                      !q ||
                      (r.userName || '').toLowerCase().includes(q) ||
                      (r.productName || '').toLowerCase().includes(q) ||
                      (r.comment || '').toLowerCase().includes(q);
                    const matchRating = reviewFilterRating === 'All' || String(r.rating) === String(reviewFilterRating);
                    return matchSearch && matchRating;
                  })
                  .map((rev) => (
                    <div
                      key={rev._id}
                      style={{
                        background: '#12141c',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '16px',
                        padding: '20px 24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {/* Top Header of Card */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                        {/* User Profile & Product Info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <img
                            src={rev.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                            alt={rev.userName}
                            style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(250, 204, 21, 0.4)' }}
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{rev.userName || 'Khách hàng'}</span>
                              <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '2px 8px', borderRadius: '9999px', fontWeight: 700 }}>
                                Đã mua hàng
                              </span>
                            </div>
                            <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                              {rev.createdAt ? new Date(rev.createdAt).toLocaleString('vi-VN') : 'Vừa xong'}
                            </div>
                          </div>
                        </div>

                        {/* Product Thumbnail & Delete Button */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 255, 255, 0.04)', padding: '6px 12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                            {rev.productImage && (
                              <img
                                src={rev.productImage}
                                alt={rev.productName}
                                style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }}
                              />
                            )}
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {rev.productName}
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteReview(rev.productId, rev._id)}
                            title="Gỡ bỏ đánh giá này"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: 'rgba(239, 68, 68, 0.12)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#ef4444',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                          >
                            <Trash2 size={14} />
                            <span>Gỡ Bỏ</span>
                          </button>
                        </div>
                      </div>

                      {/* Stars Rating */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '3px' }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={16}
                              color="#facc15"
                              fill={s <= (rev.rating || 5) ? '#facc15' : 'none'}
                            />
                          ))}
                        </div>
                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#facc15' }}>
                          {rev.rating || 5}.0 / 5
                        </span>
                      </div>

                      {/* Comment text */}
                      <div style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.6, background: 'rgba(0, 0, 0, 0.2)', padding: '12px 16px', borderRadius: '10px', fontStyle: 'italic' }}>
                        "{rev.comment}"
                      </div>

                      {/* Customer Photo Attachments */}
                      {rev.images && rev.images.length > 0 && (
                        <div>
                          <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase' }}>
                            Ảnh feedback khách chụp thực tế ({rev.images.length} ảnh):
                          </div>
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {rev.images.map((img, imgIdx) => (
                              <a
                                key={imgIdx}
                                href={img}
                                target="_blank"
                                rel="noreferrer"
                                title="Bấm để xem ảnh phóng to"
                                style={{ display: 'block', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.15)' }}
                              >
                                <img
                                  src={img}
                                  alt={`feedback-${imgIdx}`}
                                  style={{ width: '70px', height: '70px', objectFit: 'cover', transition: 'transform 0.2s' }}
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                {reviewsList.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                    <Star size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#94a3b8' }}>Chưa có phản hồi nào</div>
                    <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>
                      Các đánh giá sau khi khách hàng mua và hoàn tất đơn hàng sẽ xuất hiện tại đây.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* PRINT INVOICE MODAL */}
      {selectedInvoiceOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={(e) => e.target === e.currentTarget && setSelectedInvoiceOrder(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '680px',
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: '20px',
              padding: '36px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Invoice Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0 0 4px', letterSpacing: '1px' }}>AURA STUDIO</h1>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                  Streetwear Clothing Official Store • Hotline: 0901.234.567
                </p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                  Địa chỉ: 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 4px', color: '#0f172a' }}>HÓA ĐƠN BÁN HÀNG</h2>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f59e0b' }}>#{selectedInvoiceOrder.orderCode}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Ngày: {new Date(selectedInvoiceOrder.createdAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontSize: '0.86rem' }}>
              <div style={{ fontWeight: 700, marginBottom: '6px', color: '#1e293b' }}>Thông tin khách hàng:</div>
              <div>Họ tên: <strong>{selectedInvoiceOrder.shippingAddress?.fullName}</strong></div>
              <div>Số điện thoại: {selectedInvoiceOrder.shippingAddress?.phone}</div>
              <div>Địa chỉ: {selectedInvoiceOrder.shippingAddress?.address}, {selectedInvoiceOrder.shippingAddress?.city}</div>
              <div>Phương thức thanh toán: <strong>{selectedInvoiceOrder.paymentMethod}</strong></div>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                  <th style={{ padding: '8px 0' }}>Sản phẩm</th>
                  <th style={{ padding: '8px 0', textAlign: 'center' }}>Phân loại</th>
                  <th style={{ padding: '8px 0', textAlign: 'center' }}>SL</th>
                  <th style={{ padding: '8px 0', textAlign: 'right' }}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoiceOrder.orderItems?.map((it, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px 0', fontWeight: 600 }}>{it.name}</td>
                    <td style={{ padding: '10px 0', textAlign: 'center', color: '#64748b' }}>{it.color} / {it.size}</td>
                    <td style={{ padding: '10px 0', textAlign: 'center' }}>{it.quantity}</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 700 }}>
                      {(it.price * it.quantity).toLocaleString('vi-VN')}₫
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Invoice Total */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', fontSize: '0.9rem', marginBottom: '28px' }}>
              <div>Tổng tiền hàng: <strong>{selectedInvoiceOrder.itemsPrice?.toLocaleString('vi-VN') || selectedInvoiceOrder.totalPrice?.toLocaleString('vi-VN')}₫</strong></div>
              {selectedInvoiceOrder.discountAmount > 0 && (
                <div style={{ color: '#ef4444' }}>
                  Mã giảm giá ({selectedInvoiceOrder.couponCode}): -{selectedInvoiceOrder.discountAmount.toLocaleString('vi-VN')}₫
                </div>
              )}
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', borderTop: '2px solid #0f172a', paddingTop: '8px', marginTop: '4px' }}>
                Tổng thanh toán: {selectedInvoiceOrder.totalPrice?.toLocaleString('vi-VN')}₫
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => setSelectedInvoiceOrder(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  color: '#475569',
                }}
              >
                Đóng
              </button>

              <button
                onClick={() => window.print()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#0f172a',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                }}
              >
                <Printer size={16} />
                <span>In Hóa Đơn / Lưu PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
