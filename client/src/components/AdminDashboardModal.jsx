import React, { useState, useEffect } from 'react';
import {
  X,
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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AdminDashboardModal = ({ onClose, onProductUpdated }) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'products' | 'orders'
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // New product form
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

  // Edit product state
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
    if (!user?.token) return;
    setLoading(true);
    try {
      // 1. Stats
      const resStats = await fetch('/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const dataStats = await resStats.json();
      if (dataStats.success) setStats(dataStats.stats);

      // 2. Products
      const resProducts = await fetch('/api/products?limit=50');
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
    fetchData();
  }, [user]);

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

      addToast('Thêm sản phẩm mới thành công!', 'success');
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
      onProductUpdated?.();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi cơ sở dữ liệu?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      addToast('Đã xóa sản phẩm thành công', 'success');
      fetchData();
      onProductUpdated?.();
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

      addToast(`Đã lưu thay đổi cho sản phẩm: "${editForm.name}"`, 'success');
      setEditingProduct(null);
      fetchData();
      onProductUpdated?.();
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
      onProductUpdated?.();
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
          : `Đã bỏ Nổi Bật cho ${prod.name}`,
        'success'
      );
      fetchData();
      onProductUpdated?.();
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
          ? `🔴 Đã chuyển sang trạng thái: [HẾT HÀNG] cho ${prod.name}`
          : `🟢 Đã chuyển sang trạng thái: [CÒN HÀNG - 50 cái] cho ${prod.name}`,
        'success'
      );
      fetchData();
      onProductUpdated?.();
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

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#0d0f17',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '1080px',
          maxHeight: '92vh',
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

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#facc15',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
            }}
          >
            <LayoutDashboard size={22} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800 }}>
              Trung Tâm Quản Trị Store (Admin Hub)
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Quản lý sản phẩm, đơn hàng và xem báo cáo tài chính cửa hàng
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '12px',
            marginBottom: '24px',
          }}
        >
          <button
            onClick={() => setActiveTab('stats')}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              background: activeTab === 'stats' ? 'rgba(250, 204, 21, 0.15)' : 'transparent',
              color: activeTab === 'stats' ? '#facc15' : '#cbd5e1',
              border: activeTab === 'stats' ? '1px solid #facc15' : '1px solid transparent',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
            }}
          >
            Tổng Quan Thống Kê
          </button>

          <button
            onClick={() => setActiveTab('products')}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              background: activeTab === 'products' ? 'rgba(250, 204, 21, 0.15)' : 'transparent',
              color: activeTab === 'products' ? '#facc15' : '#cbd5e1',
              border: activeTab === 'products' ? '1px solid #facc15' : '1px solid transparent',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
            }}
          >
            Quản Lý Sản Phẩm ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              background: activeTab === 'orders' ? 'rgba(250, 204, 21, 0.15)' : 'transparent',
              color: activeTab === 'orders' ? '#facc15' : '#cbd5e1',
              border: activeTab === 'orders' ? '1px solid #facc15' : '1px solid transparent',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
            }}
          >
            Quản Lý Đơn Hàng ({orders.length})
          </button>
        </div>

        {/* TAB 1: STATS */}
        {activeTab === 'stats' && stats && (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '28px',
              }}
            >
              {/* Revenue */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(250, 204, 21, 0.3)',
                  padding: '20px',
                  borderRadius: '16px',
                }}
              >
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  TỔNG DOANH THU
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    color: '#facc15',
                  }}
                >
                  {stats.totalRevenue.toLocaleString('vi-VN')}₫
                </div>
                <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '6px' }}>
                  +18% so với tuần trước
                </div>
              </div>

              {/* Total Orders */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '20px',
                  borderRadius: '16px',
                }}
              >
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  TỔNG ĐƠN HÀNG
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    color: '#fff',
                  }}
                >
                  {stats.totalOrders}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#60a5fa', marginTop: '6px' }}>
                  {stats.pendingOrders} đơn đang chờ duyệt
                </div>
              </div>

              {/* Products */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '20px',
                  borderRadius: '16px',
                }}
              >
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  SẢN PHẨM HOẠT ĐỘNG
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    color: '#fff',
                  }}
                >
                  {stats.totalProducts}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '6px' }}>
                  Đầy đủ size & màu sắc
                </div>
              </div>

              {/* Customers */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '20px',
                  borderRadius: '16px',
                }}
              >
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  KHÁCH HÀNG ĐĂNG KÝ
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    color: '#fff',
                  }}
                >
                  {stats.totalUsers}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#a855f7', marginTop: '6px' }}>
                  Tương tác cao
                </div>
              </div>
            </div>

            {/* Recent Orders quick list */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>
                Đơn Hàng Mới Nhất
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {orders.slice(0, 5).map((ord) => (
                  <div
                    key={ord._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 18px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '12px',
                    }}
                  >
                    <div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#facc15' }}>
                        {ord.orderCode}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '10px' }}>
                        {ord.shippingAddress?.fullName} ({ord.shippingAddress?.phone})
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        {ord.totalPrice.toLocaleString('vi-VN')}₫
                      </span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: '#facc15',
                        }}
                      >
                        {ord.orderStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Danh Sách Sản Phẩm Trong Cửa Hàng</h4>
              <button
                onClick={() => setShowAddProduct(!showAddProduct)}
                className="btn-primary"
                style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '0.84rem' }}
              >
                <Plus size={16} />
                <span>{showAddProduct ? 'Đóng Form' : 'Thêm Sản Phẩm Mới'}</span>
              </button>
            </div>

            {/* Add Product Form */}
            {showAddProduct && (
              <form
                onSubmit={handleCreateProduct}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '24px',
                  borderRadius: '16px',
                  border: '1px solid rgba(250, 204, 21, 0.3)',
                  marginBottom: '28px',
                }}
              >
                <h5 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '16px', color: '#facc15' }}>
                  Thông Tin Sản Phẩm Mới
                </h5>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '14px',
                    marginBottom: '14px',
                  }}
                >
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>
                      Tên sản phẩm *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Áo Thun Streetwear Matrix Tee"
                      value={productForm.name}
                      onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))}
                      style={{
                        width: '100%',
                        background: '#161925',
                        border: '1px solid rgba(255,255,255,0.15)',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>
                      Danh mục *
                    </label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))}
                      style={{
                        width: '100%',
                        background: '#161925',
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
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>
                      Giá bán (₫) *
                    </label>
                    <input
                      type="number"
                      required
                      value={productForm.price}
                      onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))}
                      style={{
                        width: '100%',
                        background: '#161925',
                        border: '1px solid rgba(255,255,255,0.15)',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>
                      Giá gốc (₫)
                    </label>
                    <input
                      type="number"
                      value={productForm.originalPrice}
                      onChange={(e) => setProductForm((p) => ({ ...p, originalPrice: e.target.value }))}
                      style={{
                        width: '100%',
                        background: '#161925',
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
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>
                    Link Ảnh chính (URL Unsplash hoặc image hosting)
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={productForm.image1}
                    onChange={(e) => setProductForm((p) => ({ ...p, image1: e.target.value }))}
                    style={{
                      width: '100%',
                      background: '#161925',
                      border: '1px solid rgba(255,255,255,0.15)',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>
                    Mô tả sản phẩm
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Mô tả chất liệu, thiết kế..."
                    value={productForm.description}
                    onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))}
                    style={{
                      width: '100%',
                      background: '#161925',
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
                  className="btn-primary"
                  style={{ padding: '10px 24px', borderRadius: '8px', fontSize: '0.88rem' }}
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
                  background: 'rgba(0, 0, 0, 0.8)',
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
                      <X size={16} />
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
                        className="btn-primary"
                        style={{
                          padding: '10px 24px',
                          borderRadius: '8px',
                          fontSize: '0.88rem',
                          fontWeight: 800,
                        }}
                      >
                        Lưu Cập Nhật Vào Database
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Product table list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {products.map((prod) => {
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
                      padding: '14px 18px',
                      borderRadius: '14px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: isOutOfStock
                        ? '1px solid rgba(239, 68, 68, 0.3)'
                        : '1px solid rgba(255, 255, 255, 0.07)',
                    }}
                  >
                    {/* Thumbnail with Out of stock overlay */}
                    <div style={{ position: 'relative', width: '52px', height: '66px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
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
                            background: 'rgba(0, 0, 0, 0.7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ef4444',
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            textAlign: 'center',
                            lineHeight: 1.1,
                          }}
                        >
                          HẾT HÀNG
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.72rem', color: '#facc15', textTransform: 'uppercase', fontWeight: 700 }}>
                          {prod.category}
                        </span>

                        {prod.isBestSeller && (
                          <span
                            style={{
                              background: '#facc15',
                              color: '#000',
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              padding: '1px 6px',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                            }}
                          >
                            <Zap size={10} fill="#000" /> HOT
                          </span>
                        )}

                        {prod.featured && (
                          <span
                            style={{
                              background: 'rgba(245, 158, 11, 0.2)',
                              color: '#f59e0b',
                              border: '1px solid rgba(245, 158, 11, 0.4)',
                              fontSize: '0.65rem',
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
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              padding: '1px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            -{discountPercent}%
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>
                        {prod.name}
                      </div>

                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        Đánh giá: {prod.rating}★ ({prod.numReviews}) • {prod.sizes?.map((s) => s.size).join('/')}
                      </div>
                    </div>

                    {/* Price column */}
                    <div style={{ minWidth: '120px', textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.05rem', color: '#facc15' }}>
                        {prod.price.toLocaleString('vi-VN')}₫
                      </div>
                      {hasDiscount && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                          {prod.originalPrice.toLocaleString('vi-VN')}₫
                        </div>
                      )}
                    </div>

                    {/* Quick Toggles */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {/* Stock Toggle Button */}
                      <button
                        onClick={() => handleToggleStock(prod)}
                        title="Bấm để bật/tắt nhanh tình trạng Hết Hàng hoặc Còn Hàng"
                        style={{
                          background: isOutOfStock ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          border: isOutOfStock ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
                          color: isOutOfStock ? '#ef4444' : '#10b981',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
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
                          padding: '6px 10px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
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
                        title="Bấm để Bật hoặc Tắt huy hiệu Sản Phẩm Nổi Bật"
                        style={{
                          background: prod.featured ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                          border: prod.featured ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.12)',
                          color: prod.featured ? '#f59e0b' : '#94a3b8',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
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
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        title="Chỉnh sửa chi tiết: Giá bán, Giá gốc, Tồn kho, Ảnh, Tên..."
                      >
                        <Edit2 size={13} />
                        <span>Sửa</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteProduct(prod._id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#ef4444',
                          padding: '6px 8px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                        }}
                        title="Xóa sản phẩm khỏi database"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '18px' }}>
              Quản Lý Toàn Bộ Đơn Hàng Của Khách Hàng
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {orders.map((ord) => (
                <div
                  key={ord._id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '18px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '1.1rem',
                          fontWeight: 800,
                          color: '#facc15',
                        }}
                      >
                        {ord.orderCode}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginLeft: '10px' }}>
                        {new Date(ord.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>

                    {/* Change Status Dropdown */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Trạng thái:</span>
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                        style={{
                          background: '#161925',
                          border: '1px solid #facc15',
                          color: '#facc15',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          outline: 'none',
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

                  <div style={{ fontSize: '0.84rem', color: '#cbd5e1', marginBottom: '8px' }}>
                    Khách: <strong>{ord.shippingAddress?.fullName}</strong> - SĐT: {ord.shippingAddress?.phone} - ĐC: {ord.shippingAddress?.address}, {ord.shippingAddress?.city}
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    {ord.orderItems?.length} sản phẩm • Thanh toán: {ord.paymentMethod} ({ord.paymentStatus}) • Tổng tiền: <strong style={{ color: '#fff' }}>{ord.totalPrice.toLocaleString('vi-VN')}₫</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
