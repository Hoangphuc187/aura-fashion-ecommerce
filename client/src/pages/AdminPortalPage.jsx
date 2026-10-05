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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AdminPortalPage = ({ onNavigateHome }) => {
  const { user, logout, loading: authLoading } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('products'); // 'stats' | 'products' | 'orders' | 'security'
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchProduct, setSearchProduct] = useState('');

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
                          <option value="Cancelled">Đã hủy (Cancelled)</option>
                        </select>
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

                <div style={{ background: '#12141c', border: '1px solid rgba(250, 204, 21, 0.35)', borderRadius: '16px', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#facc15', fontWeight: 800, fontSize: '1.1rem', marginBottom: '14px' }}>
                    <Lock size={22} />
                    <span>Bảo Mật Cơ Sở Dữ Liệu & Backend</span>
                  </div>
                  <ul style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: '1.8', marginLeft: '18px' }}>
                    <li><strong>MongoDB Atlas:</strong> Kết nối qua giao thức bảo mật mã hóa SSL/TLS trên đám mây.</li>
                    <li><strong>Đường dẫn /admin (Stealth Mode):</strong> Kiểm tra nghiêm ngặt <em>Role: 'admin'</em>. Nếu không phải admin, website tự động hiển thị trang <strong>404 Không tìm thấy trang</strong>, hoàn toàn tàng hình trước hacker và công cụ quét.</li>
                    <li><strong>Cổng Backend /admin-portal:</strong> Tàng hình dưới mã phản hồi HTTP 404 đối với mọi người ngoài hoặc scanner. Chỉ mở khi có đúng khóa bí mật <code>key=aura_hoangphuc_secure_admin_2026</code>.</li>
                    <li><strong>Tường lửa Honeypot & Anti-Fuzzing:</strong> Tự động bẫy và khóa IP (Auto-Ban IP) vĩnh viễn với bất kỳ bot/scanner nào (Gobuster, ffuf, Nikto, sqlmap...) dò tìm các file nhạy cảm (.env, .git, wp-admin, phpmyadmin...) hoặc dò quá 8 URL sai trong 30 giây.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
