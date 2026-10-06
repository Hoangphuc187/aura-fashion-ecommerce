import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { ToastProvider, useToast } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { initSecurityProtections } from './utils/security';

import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { FeaturedCategories } from './components/FeaturedCategories';
import { FlashSaleBanner } from './components/FlashSaleBanner';
import { ProductFilters } from './components/ProductFilters';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { AuthModal } from './components/AuthModal';
import { UserOrdersModal } from './components/UserOrdersModal';
import { WishlistModal } from './components/WishlistModal';
import { CustomerAccountModal } from './components/CustomerAccountModal';
import { SupportPortalModal } from './components/SupportPortalModal';
import { SmartNotificationAlert } from './components/SmartNotificationAlert';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { AdminPortalPage } from './pages/AdminPortalPage';
import { Footer } from './components/Footer';

/**
 * Main E-Commerce Customer Store View
 * Encapsulated in its own component so its state & hooks do not conflict with the Admin Portal route.
 */
const ShopStoreView = ({ onNavigateAdmin }) => {
  // State for products and catalog
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [selectedSize, setSelectedSize] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState(1500000);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderTrackingCode, setOrderTrackingCode] = useState(null);
  const [orderTrackingOpen, setOrderTrackingOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [userOrdersOpen, setUserOrdersOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [accountInitialTab, setAccountInitialTab] = useState('profile');
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportInitialTab, setSupportInitialTab] = useState('faq');

  const { addToast } = useToast();

  // Handle gateway returns (VNPay & MoMo redirect callbacks)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentSuccess = params.get('paymentSuccess');
    const orderCode = params.get('orderCode');
    const method = params.get('method') || 'Cổng thanh toán';

    if (paymentSuccess === 'true' && orderCode) {
      addToast(`🎉 Thanh toán qua ${method} thành công cho đơn hàng ${orderCode}!`, 'success');
      setOrderTrackingCode(orderCode);
      setOrderTrackingOpen(true);
      try {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {}
      window.history.replaceState({}, '', window.location.pathname);
    } else if (paymentSuccess === 'false') {
      addToast(`⚠️ Giao dịch qua ${method} chưa thành công hoặc đã bị huỷ.`, 'error');
      if (orderCode) {
        setOrderTrackingCode(orderCode);
        setOrderTrackingOpen(true);
      }
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [addToast]);

  // Filter options
  const categories = [
    'Tất cả',
    'Áo thun',
    'Áo khoác',
    'Sơ mi',
    'Quần & Shorts',
    'Váy & Đầm',
    'Phụ kiện',
  ];
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  // Fetch products from backend API
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'Tất cả') {
        params.append('category', selectedCategory);
      }
      if (selectedSize) {
        params.append('size', selectedSize);
      }
      if (priceRange) {
        params.append('maxPrice', priceRange);
      }
      if (sortBy) {
        params.append('sort', sortBy);
      }
      if (searchQuery.trim()) {
        params.append('keyword', searchQuery.trim());
      }
      params.append('limit', '30');

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
        setTotalProducts(data.total);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedSize, priceRange, sortBy, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleResetFilters = () => {
    setSelectedCategory('Tất cả');
    setSelectedSize('');
    setSortBy('newest');
    setPriceRange(1500000);
    setSearchQuery('');
  };

  const handleOpenOrderTracking = (code = '') => {
    setOrderTrackingCode(code);
    setOrderTrackingOpen(true);
  };

  const handleScrollToProducts = () => {
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleShowSaleOnly = () => {
    setSortBy('bestseller');
    handleScrollToProducts();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Header */}
      <Navbar
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          handleScrollToProducts();
        }}
        onOpenOrderTracking={() => handleOpenOrderTracking('')}
        onOpenAdmin={onNavigateAdmin}
        onOpenOrders={() => {
          setAccountInitialTab('orders');
          setAccountModalOpen(true);
        }}
        onOpenAccount={(tab) => {
          setAccountInitialTab(tab || 'profile');
          setAccountModalOpen(true);
        }}
        onOpenSupport={(tab) => {
          setSupportInitialTab(tab || 'faq');
          setSupportModalOpen(true);
        }}
        onOpenWishlist={() => setWishlistOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Hero Section */}
      <HeroBanner
        onExploreClick={handleScrollToProducts}
        onPromoClick={handleShowSaleOnly}
      />

      {/* Featured Categories Carousel Grid */}
      <FeaturedCategories
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          handleScrollToProducts();
        }}
        products={products}
      />

      {/* Flash Sale Ticking Banner */}
      <FlashSaleBanner onShowSaleOnly={handleShowSaleOnly} />

      {/* Main Catalog Section */}
      <main id="catalog-section" style={{ flex: 1 }}>
        {/* Filter Toolbar */}
        <ProductFilters
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          sizes={sizes}
          selectedSize={selectedSize}
          onSelectSize={setSelectedSize}
          sortBy={sortBy}
          onSelectSort={setSortBy}
          priceRange={priceRange}
          onPriceChange={setPriceRange}
          maxPrice={2000000}
          onResetFilters={handleResetFilters}
          totalProducts={totalProducts}
        />

        {/* Product Cards Grid */}
        <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 24px' }}>
          {loading ? (
            <div
              style={{
                textAlign: 'center',
                padding: '80px 0',
                color: 'var(--text-muted)',
                fontSize: '1.1rem',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid rgba(250, 204, 21, 0.2)',
                  borderTop: '3px solid #facc15',
                  borderRadius: '50%',
                  margin: '0 auto 16px',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              Đang tải bộ sưu tập sản phẩm...
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : products.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '80px 20px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '20px',
                border: '1px dashed rgba(255, 255, 255, 0.1)',
              }}
            >
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px' }}>
                Không tìm thấy sản phẩm phù hợp
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                Thử đổi danh mục, mức giá hoặc bấm vào nút dưới đây để xem toàn bộ sản phẩm.
              </p>
              <button
                onClick={handleResetFilters}
                className="btn-primary"
                style={{ fontSize: '0.88rem' }}
              >
                Xem tất cả sản phẩm
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '24px',
              }}
            >
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onProductClick={(p) => setSelectedProduct(p)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Global Modals */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onOpenProduct={(p) => setSelectedProduct(p)}
        />
      )}

      <CartDrawer />

      <CheckoutModal onOpenOrderTracking={handleOpenOrderTracking} />

      {orderTrackingOpen && (
        <OrderTrackingModal
          initialCode={orderTrackingCode}
          onClose={() => setOrderTrackingOpen(false)}
          onOpenProduct={(p) => setSelectedProduct(p)}
        />
      )}

      <AuthModal />

      {userOrdersOpen && (
        <UserOrdersModal
          onClose={() => setUserOrdersOpen(false)}
          onSelectOrderCode={handleOpenOrderTracking}
        />
      )}

      {wishlistOpen && (
        <WishlistModal
          products={products}
          onClose={() => setWishlistOpen(false)}
          onSelectProduct={(p) => setSelectedProduct(p)}
        />
      )}

      {/* Customer Account Portal Modal */}
      <CustomerAccountModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        initialTab={accountInitialTab}
        onOpenOrderTracking={handleOpenOrderTracking}
      />

      {/* Support & FAQ Portal Modal */}
      <SupportPortalModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        initialTab={supportInitialTab}
      />

      {/* Smart Timed Floating Alerts (Low stock & price drops) */}
      <SmartNotificationAlert onSelectProduct={(p) => setSelectedProduct(p)} />

      {/* Footer */}
      <Footer
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          handleScrollToProducts();
        }}
        onOpenSupport={(tab) => {
          setSupportInitialTab(tab || 'faq');
          setSupportModalOpen(true);
        }}
      />
    </div>
  );
};

/**
 * Top-Level App Router & Security Guardian
 */
const AppContent = () => {
  const { addToast } = useToast();

  // Navigation Route State (Synced with Browser History & Popstate)
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  // Khởi động khiên chắn bảo mật chống xem nguồn trang & sao chép
  useEffect(() => {
    initSecurityProtections((warning) => {
      addToast(warning, 'warning');
    });
  }, [addToast]);

  // Smooth & Safe Component Switching - NEVER violates React Hook rules
  if (currentPath.startsWith('/admin')) {
    return <AdminPortalPage onNavigateHome={() => navigateTo('/')} />;
  }

  return <ShopStoreView onNavigateAdmin={() => navigateTo('/admin')} />;
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
