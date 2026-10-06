import React, { useState, useRef, useEffect } from 'react';
import {
  ShoppingBag,
  Heart,
  Search,
  User as UserIcon,
  Truck,
  ShieldCheck,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Package,
  Zap,
  Menu,
  X,
  MapPin,
  Ticket,
  Star,
  Shield,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Navbar = ({
  onSelectCategory,
  selectedCategory,
  onOpenOrderTracking,
  onOpenAdmin,
  onOpenOrders,
  onOpenWishlist,
  searchQuery,
  setSearchQuery,
  onOpenAccount,
  onOpenSupport,
}) => {
  const { user, isAdmin, logout, setAuthModalOpen, wishlist } = useAuth();
  const { totalItemsCount, setCartDrawerOpen, totalPrice } = useCart();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categories = [
    { label: 'Tất Cả', value: 'Tất cả' },
    { label: 'Áo Thun', value: 'Áo thun' },
    { label: 'Áo Khoác', value: 'Áo khoác' },
    { label: 'Sơ Mi', value: 'Sơ mi' },
    { label: 'Quần & Cargo', value: 'Quần & Shorts' },
    { label: 'Váy & Đầm', value: 'Váy & Đầm' },
    { label: 'Phụ Kiện', value: 'Phụ kiện' },
  ];

  return (
    <>
      {/* Top Notification Bar */}
      <div
        style={{
          background: 'linear-gradient(90deg, #18181b 0%, #27272a 50%, #18181b 100%)',
          color: '#e4e4e7',
          fontSize: '0.78rem',
          padding: '7px 20px',
          textAlign: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px',
          letterSpacing: '0.5px',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={14} color="#facc15" />
          <span>MÃ <strong>STREETWEAR20</strong> GIẢM 20% CHO MỌI ĐƠN HÀNG HÔM NAY</span>
        </span>
        <span style={{ color: '#52525b' }}>|</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Truck size={14} color="#10b981" />
          <span>MIỄN PHÍ GIAO HÀNG CHO ĐƠN TỪ 500K</span>
        </span>
        <span style={{ color: '#52525b' }}>|</span>
        <button
          onClick={() => onOpenSupport && onOpenSupport('faq')}
          style={{
            background: 'none',
            border: 'none',
            color: '#a1a1aa',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '0.78rem',
            fontWeight: 600,
            padding: 0,
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.target.style.color = '#facc15')}
          onMouseLeave={(e) => (e.target.style.color = '#a1a1aa')}
          title="Trung tâm Trợ giúp, FAQ và Gửi Ticket"
        >
          <HelpCircle size={13} color="#facc15" />
          <span>Hỗ trợ & FAQ</span>
        </button>
      </div>

      {/* Main Sticky Navbar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(9, 10, 15, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          transition: 'all 0.3s ease',
        }}
      >
        <div
          style={{
            maxWidth: '1360px',
            margin: '0 auto',
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
          }}
        >
          {/* Logo */}
          <div
            onClick={() => onSelectCategory('Tất cả')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #facc15 0%, #ff5722 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(250, 204, 21, 0.35)',
              }}
            >
              <Zap size={22} color="#000" />
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.45rem',
                  fontWeight: 800,
                  letterSpacing: '1px',
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>AURA</span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    background: 'rgba(250, 204, 21, 0.15)',
                    color: '#facc15',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid rgba(250, 204, 21, 0.3)',
                    letterSpacing: '1px',
                    fontWeight: 700,
                  }}
                >
                  STUDIO
                </span>
              </div>
              <div
                style={{
                  fontSize: '0.68rem',
                  color: 'var(--text-muted)',
                  letterSpacing: '1.5px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                Urban Streetwear
              </div>
            </div>
          </div>

          {/* Navigation Category Links (Desktop) */}
          <nav
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '6px',
            }}
            className="nav-desktop-links"
          >
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => onSelectCategory(cat.value)}
                style={{
                  background:
                    selectedCategory === cat.value
                      ? 'rgba(255, 255, 255, 0.12)'
                      : 'transparent',
                  color: selectedCategory === cat.value ? '#facc15' : '#cbd5e1',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.86rem',
                  fontWeight: selectedCategory === cat.value ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderBottom:
                    selectedCategory === cat.value ? '2px solid #facc15' : '2px solid transparent',
                }}
              >
                {cat.label}
              </button>
            ))}
          </nav>

          {/* Search Input Bar */}
          <div
            style={{
              position: 'relative',
              flex: 1,
              maxWidth: '320px',
            }}
          >
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
              placeholder="Tìm áo hoodie, thun, cargo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '9px 14px 9px 38px',
                borderRadius: '9999px',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none',
                transition: 'all 0.25s ease',
              }}
              onFocus={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.borderColor = 'rgba(250, 204, 21, 0.4)';
              }}
              onBlur={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.06)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Action Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Tra cứu đơn hàng */}
            <button
              onClick={onOpenOrderTracking}
              title="Tra cứu tình trạng đơn hàng"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              className="tracking-btn"
            >
              <Truck size={16} />
              <span className="tracking-text">Tra cứu đơn</span>
            </button>

            {/* Wishlist */}
            <button
              onClick={onOpenWishlist}
              title="Sản phẩm yêu thích"
              style={{
                position: 'relative',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: wishlist.length > 0 ? '#f43f5e' : '#cbd5e1',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Heart size={18} fill={wishlist.length > 0 ? '#f43f5e' : 'none'} />
              {wishlist.length > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#f43f5e',
                    color: '#fff',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--bg-primary)',
                  }}
                >
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setCartDrawerOpen(true)}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.2) 0%, rgba(245, 158, 11, 0.15) 100%)',
                border: '1px solid rgba(250, 204, 21, 0.35)',
                color: '#facc15',
                padding: '8px 14px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.85rem',
                transition: 'all 0.2s',
              }}
            >
              <ShoppingBag size={18} />
              <span className="cart-total-badge">{totalPrice.toLocaleString('vi-VN')}₫</span>
              {totalItemsCount > 0 && (
                <span
                  style={{
                    background: '#facc15',
                    color: '#000',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: '9999px',
                    marginLeft: '2px',
                  }}
                >
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* Direct Admin Dashboard Shortcut Button */}
            {isAdmin && (
              <button
                onClick={() => {
                  if (onOpenAdmin) onOpenAdmin();
                  else window.location.href = '/admin';
                }}
                title="Đến Trang Quản Trị Hệ Thống Riêng Biệt (/admin)"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.22) 0%, rgba(245, 158, 11, 0.15) 100%)',
                  border: '1px solid #facc15',
                  color: '#facc15',
                  padding: '7px 14px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 0 15px rgba(250, 204, 21, 0.25)',
                  transition: 'all 0.2s',
                }}
              >
                <LayoutDashboard size={15} />
                <span>Trang Quản Trị</span>
              </button>
            )}

            {/* User Account / Auth Dropdown */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              {user ? (
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    padding: '5px 10px 5px 6px',
                    borderRadius: '9999px',
                    cursor: 'pointer',
                    color: '#fff',
                  }}
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      maxWidth: '85px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {user.name}
                  </span>
                  <ChevronDown size={14} />
                </button>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="btn-primary"
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.84rem',
                  }}
                >
                  <UserIcon size={16} />
                  <span>Đăng nhập</span>
                </button>
              )}

              {/* Dropdown Menu */}
              {user && userDropdownOpen && (
                <div
                  className="glass-dropdown animate-fade-in"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    width: '220px',
                    borderRadius: '14px',
                    padding: '8px',
                    zIndex: 100,
                  }}
                >
                  <div
                    style={{
                      padding: '10px 12px',
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                      marginBottom: '6px',
                    }}
                  >
                    <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                    {isAdmin && (
                      <span
                        style={{
                          display: 'inline-block',
                          marginTop: '4px',
                          background: '#facc15',
                          color: '#000',
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        ADMIN STORE
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      if (onOpenAccount) onOpenAccount('profile');
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      background: 'transparent',
                      border: 'none',
                      color: '#cbd5e1',
                      fontSize: '0.84rem',
                      fontWeight: 500,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.target.style.background = 'rgba(255,255,255,0.08)')}
                    onMouseLeave={(e) => (e.target.style.background = 'transparent')}
                  >
                    <UserIcon size={15} color="#60a5fa" />
                    <span>Hồ sơ của tôi</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      if (onOpenAccount) onOpenAccount('addresses');
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      background: 'transparent',
                      border: 'none',
                      color: '#cbd5e1',
                      fontSize: '0.84rem',
                      fontWeight: 500,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.target.style.background = 'rgba(255,255,255,0.08)')}
                    onMouseLeave={(e) => (e.target.style.background = 'transparent')}
                  >
                    <MapPin size={15} color="#10b981" />
                    <span>Sổ địa chỉ nhận hàng</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      if (onOpenAccount) onOpenAccount('orders');
                      else onOpenOrders();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      background: 'transparent',
                      border: 'none',
                      color: '#cbd5e1',
                      fontSize: '0.84rem',
                      fontWeight: 500,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.target.style.background = 'rgba(255,255,255,0.08)')}
                    onMouseLeave={(e) => (e.target.style.background = 'transparent')}
                  >
                    <Package size={15} color="#f59e0b" />
                    <span>Đơn hàng của tôi</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      if (onOpenAccount) onOpenAccount('reviews');
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      background: 'transparent',
                      border: 'none',
                      color: '#cbd5e1',
                      fontSize: '0.84rem',
                      fontWeight: 500,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.target.style.background = 'rgba(255,255,255,0.08)')}
                    onMouseLeave={(e) => (e.target.style.background = 'transparent')}
                  >
                    <Star size={15} color="#eab308" />
                    <span>Đánh giá của tôi</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      if (onOpenAccount) onOpenAccount('vouchers');
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      background: 'transparent',
                      border: 'none',
                      color: '#cbd5e1',
                      fontSize: '0.84rem',
                      fontWeight: 500,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.target.style.background = 'rgba(255,255,255,0.08)')}
                    onMouseLeave={(e) => (e.target.style.background = 'transparent')}
                  >
                    <Ticket size={15} color="#ec4899" />
                    <span>Kho Voucher</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      if (onOpenAccount) onOpenAccount('wishlist');
                      else onOpenWishlist();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      background: 'transparent',
                      border: 'none',
                      color: '#cbd5e1',
                      fontSize: '0.84rem',
                      fontWeight: 500,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.target.style.background = 'rgba(255,255,255,0.08)')}
                    onMouseLeave={(e) => (e.target.style.background = 'transparent')}
                  >
                    <Heart size={15} color="#f43f5e" />
                    <span>Sản phẩm yêu thích</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      if (onOpenAccount) onOpenAccount('security');
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      background: 'transparent',
                      border: 'none',
                      color: '#cbd5e1',
                      fontSize: '0.84rem',
                      fontWeight: 500,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.target.style.background = 'rgba(255,255,255,0.08)')}
                    onMouseLeave={(e) => (e.target.style.background = 'transparent')}
                  >
                    <Shield size={15} color="#a855f7" />
                    <span>Bảo mật & Thiết bị</span>
                  </button>

                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '6px 0' }} />

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      if (onOpenSupport) onOpenSupport('faq');
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      background: 'transparent',
                      border: 'none',
                      color: '#94a3b8',
                      fontSize: '0.84rem',
                      fontWeight: 500,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.target.style.background = 'rgba(255,255,255,0.08)')}
                    onMouseLeave={(e) => (e.target.style.background = 'transparent')}
                  >
                    <HelpCircle size={15} color="#38bdf8" />
                    <span>Hỗ trợ & FAQ</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        if (onOpenAdmin) onOpenAdmin();
                        else window.location.href = '/admin';
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '9px 12px',
                        background: 'rgba(250, 204, 21, 0.08)',
                        border: '1px solid rgba(250, 204, 21, 0.25)',
                        color: '#facc15',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        margin: '4px 0',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.target.style.background = 'rgba(250,204,21,0.18)')}
                      onMouseLeave={(e) => (e.target.style.background = 'rgba(250, 204, 21, 0.08)')}
                    >
                      <LayoutDashboard size={15} />
                      <span>Trang Quản Trị (/admin)</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      background: 'transparent',
                      border: 'none',
                      color: '#f87171',
                      fontSize: '0.84rem',
                      fontWeight: 500,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      marginTop: '4px',
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.target.style.background = 'rgba(239,68,68,0.1)')}
                    onMouseLeave={(e) => (e.target.style.background = 'transparent')}
                  >
                    <LogOut size={15} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                padding: '6px',
                display: 'none',
              }}
              className="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            className="animate-fade-in"
            style={{
              padding: '12px 24px 20px',
              background: '#0e1017',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  onSelectCategory(cat.value);
                  setMobileMenuOpen(false);
                }}
                style={{
                  textAlign: 'left',
                  padding: '10px 14px',
                  background:
                    selectedCategory === cat.value
                      ? 'rgba(250, 204, 21, 0.1)'
                      : 'transparent',
                  color: selectedCategory === cat.value ? '#facc15' : '#cbd5e1',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: selectedCategory === cat.value ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                {cat.label}
              </button>
            ))}

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '8px 0' }} />

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenSupport) onOpenSupport('faq');
              }}
              style={{
                textAlign: 'left',
                padding: '10px 14px',
                background: 'rgba(56, 189, 248, 0.08)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <HelpCircle size={16} />
              <span>Hỗ trợ khách hàng & FAQ</span>
            </button>

            {user ? (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenAccount) onOpenAccount('profile');
                  }}
                  style={{
                    textAlign: 'left',
                    padding: '10px 14px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <UserIcon size={16} color="#60a5fa" />
                  <span>Tài khoản của tôi ({user.name})</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenAccount) onOpenAccount('orders');
                  }}
                  style={{
                    textAlign: 'left',
                    padding: '10px 14px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <Package size={16} color="#f59e0b" />
                  <span>Đơn hàng của tôi</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthModalOpen(true);
                }}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  justifyContent: 'center',
                  fontSize: '0.88rem',
                }}
              >
                <UserIcon size={16} />
                <span>Đăng nhập / Đăng ký</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* Responsive media query styles */}
      <style>{`
        @media (min-width: 992px) {
          .nav-desktop-links {
            display: flex !important;
          }
        }
        @media (max-width: 991px) {
          .mobile-menu-btn {
            display: block !important;
          }
        }
        @media (max-width: 640px) {
          .tracking-text {
            display: none !important;
          }
          .cart-total-badge {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};
