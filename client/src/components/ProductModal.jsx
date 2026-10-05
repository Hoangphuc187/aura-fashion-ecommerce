import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  ShoppingBag,
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  Ruler,
  Send,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export const ProductModal = ({ product: initialProduct, onClose, onOpenProduct }) => {
  const { user, wishlist, toggleWishlist, setAuthModalOpen } = useAuth();
  const { addToCart, setCartDrawerOpen } = useCart();
  const { addToast } = useToast();

  const [product, setProduct] = useState(initialProduct);
  const [selectedImage, setSelectedImage] = useState(product?.images?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]?.name || '');
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0]?.size || 'M');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'reviews'
  const [sizeChartOpen, setSizeChartOpen] = useState(false);

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Load latest product details with populated reviews and related products
  useEffect(() => {
    if (initialProduct?._id) {
      fetch(`/api/products/${initialProduct._id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.product) {
            setProduct(data.product);
            setSelectedImage(data.product.images?.[0] || '');
            setSelectedColor(data.product.colors?.[0]?.name || '');
            setSelectedSize(data.product.sizes?.[0]?.size || 'M');
          }
        })
        .catch(console.error);
    }
  }, [initialProduct]);

  if (!product) return null;

  const isWishlisted = wishlist.includes(product._id);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    onClose();
    setCartDrawerOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast('Vui lòng đăng nhập để viết đánh giá', 'info');
      setAuthModalOpen(true);
      return;
    }
    if (!reviewComment.trim()) {
      addToast('Vui lòng nhập nội dung nhận xét', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${product._id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Không thể gửi đánh giá');

      setProduct((prev) => ({
        ...prev,
        rating: data.rating,
        numReviews: data.numReviews,
        reviews: data.reviews,
      }));
      setReviewComment('');
      addToast('Cảm ơn bạn đã gửi đánh giá sản phẩm!', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmittingReview(false);
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
          maxWidth: '1020px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
          position: 'relative',
          animation: 'fadeIn 0.25s ease-out',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            zIndex: 10,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
        >
          <X size={20} />
        </button>

        {/* Modal Main Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
            padding: '32px',
          }}
        >
          {/* Left Column: Image Gallery */}
          <div>
            {/* Main Preview Image */}
            <div
              style={{
                borderRadius: '18px',
                overflow: 'hidden',
                position: 'relative',
                paddingTop: '115%',
                background: '#161824',
                marginBottom: '14px',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <img
                src={selectedImage}
                alt={product.name}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />

              {product.discountPercent > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '6px',
                  }}
                >
                  GIẢM {product.discountPercent}%
                </span>
              )}
            </div>

            {/* Thumbnail selector */}
            {product.images && product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '10px' }}>
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border:
                        selectedImage === img
                          ? '2px solid #facc15'
                          : '1px solid rgba(255, 255, 255, 0.15)',
                      padding: 0,
                      cursor: 'pointer',
                      background: '#181926',
                    }}
                  >
                    <img
                      src={img}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              {/* Category & Tags */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                }}
              >
                <span
                  style={{
                    fontSize: '0.76rem',
                    color: '#facc15',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  {product.category}
                </span>
                <span style={{ color: '#475569' }}>•</span>
                <span style={{ fontSize: '0.76rem', color: '#10b981', fontWeight: 600 }}>
                  Còn {product.stockQuantity} sản phẩm trong kho
                </span>
              </div>

              {/* Title */}
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  lineHeight: 1.25,
                  marginBottom: '12px',
                }}
              >
                {product.name}
              </h2>

              {/* Rating review stats */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '18px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      fill={star <= Math.round(product.rating || 5) ? '#facc15' : 'none'}
                      color="#facc15"
                    />
                  ))}
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', marginLeft: '6px' }}>
                    {product.rating?.toFixed(1) || '5.0'}
                  </span>
                </div>
                <span style={{ color: '#475569' }}>|</span>
                <span
                  onClick={() => setActiveTab('reviews')}
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  {product.numReviews || product.reviews?.length || 0} Đánh giá từ khách hàng
                </span>
              </div>

              {/* Price display */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '12px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  marginBottom: '20px',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.7rem',
                    fontWeight: 800,
                    color: '#facc15',
                  }}
                >
                  {product.price.toLocaleString('vi-VN')}₫
                </span>
                {product.originalPrice > product.price && (
                  <span
                    style={{
                      fontSize: '1.05rem',
                      color: 'var(--text-dim)',
                      textDecoration: 'line-through',
                    }}
                  >
                    {product.originalPrice.toLocaleString('vi-VN')}₫
                  </span>
                )}
                {product.stockQuantity <= 0 ? (
                  <span
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      color: '#f87171',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '6px',
                    }}
                  >
                    🔴 TẠM HẾT HÀNG
                  </span>
                ) : (
                  product.discountPercent > 0 && (
                    <span
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#f87171',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      Tiết kiệm {(product.originalPrice - product.price).toLocaleString('vi-VN')}₫ (-{product.discountPercent}%)
                    </span>
                  )
                )}
              </div>

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '8px' }}>
                    Màu Sắc:{' '}
                    <span style={{ color: '#facc15', fontWeight: 500 }}>{selectedColor}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c.name)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: c.hex,
                          border:
                            selectedColor === c.name
                              ? '3px solid #facc15'
                              : '1px solid rgba(255, 255, 255, 0.3)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: selectedColor === c.name ? '0 0 10px #facc15' : 'none',
                        }}
                      >
                        {selectedColor === c.name && (
                          <Check size={16} color={c.hex === '#f8f8f8' ? '#000' : '#fff'} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection & Size Guide Button */}
              {product.sizes && product.sizes.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                      Kích Cỡ:{' '}
                      <span style={{ color: '#facc15', fontWeight: 500 }}>{selectedSize}</span>
                    </div>

                    <button
                      onClick={() => setSizeChartOpen(true)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '0.78rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      <Ruler size={13} />
                      <span>Bảng hướng dẫn chọn size</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {product.sizes.map((s) => (
                      <button
                        key={s.size}
                        onClick={() => setSelectedSize(s.size)}
                        style={{
                          background:
                            selectedSize === s.size
                              ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                              : 'rgba(255, 255, 255, 0.08)',
                          color: selectedSize === s.size ? '#000' : '#fff',
                          border:
                            selectedSize === s.size
                              ? 'none'
                              : '1px solid rgba(255, 255, 255, 0.15)',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          minWidth: '45px',
                        }}
                      >
                        {s.size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Stepper */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 700 }}>Số Lượng:</span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                  }}
                >
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#fff',
                      padding: '8px 14px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: 700,
                    }}
                  >
                    -
                  </button>
                  <span
                    style={{
                      padding: '0 10px',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.95rem',
                    }}
                  >
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#fff',
                      padding: '8px 14px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: 700,
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Button Actions */}
            <div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                {product.stockQuantity <= 0 ? (
                  <div
                    style={{
                      flex: 1,
                      padding: '14px',
                      borderRadius: '12px',
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#f87171',
                      textAlign: 'center',
                      fontWeight: 800,
                      fontSize: '0.92rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span>Sản phẩm hiện đang tạm hết hàng</span>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleAddToCart}
                      className="btn-secondary"
                      style={{ flex: 1, padding: '14px', borderRadius: '12px' }}
                    >
                      <ShoppingBag size={18} />
                      <span>Thêm Vào Giỏ</span>
                    </button>

                    <button
                      onClick={handleBuyNow}
                      className="btn-primary"
                      style={{ flex: 1, padding: '14px', borderRadius: '12px' }}
                    >
                      <Sparkles size={18} />
                      <span>Mua Ngay</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => toggleWishlist(product._id)}
                  style={{
                    width: '50px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: isWishlisted ? '#f43f5e' : '#cbd5e1',
                  }}
                >
                  <Heart size={20} fill={isWishlisted ? '#f43f5e' : 'none'} />
                </button>
              </div>

              {/* Guarantees info bar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '10px',
                  fontSize: '0.76rem',
                  color: 'var(--text-muted)',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Truck size={14} color="#10b981" /> Giao hàng toàn quốc
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <RotateCcw size={14} color="#facc15" /> Đổi trả 30 ngày
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <ShieldCheck size={14} color="#3b82f6" /> Kiểm tra trước khi trả tiền
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Bar: Details vs Reviews */}
        <div style={{ padding: '0 32px 32px' }}>
          <div
            style={{
              display: 'flex',
              gap: '24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              marginBottom: '20px',
            }}
          >
            <button
              onClick={() => setActiveTab('details')}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'details' ? '2px solid #facc15' : '2px solid transparent',
                color: activeTab === 'details' ? '#facc15' : 'var(--text-muted)',
                padding: '12px 0',
                fontSize: '0.94rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Mô Tả & Thông Tin Chi Tiết
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'reviews' ? '2px solid #facc15' : '2px solid transparent',
                color: activeTab === 'reviews' ? '#facc15' : 'var(--text-muted)',
                padding: '12px 0',
                fontSize: '0.94rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Đánh Giá Của Khách Hàng ({product.reviews?.length || 0})
            </button>
          </div>

          {/* Tab 1: Details */}
          {activeTab === 'details' && (
            <div style={{ lineHeight: 1.7, color: '#cbd5e1', fontSize: '0.92rem' }}>
              <p style={{ marginBottom: '16px' }}>{product.description}</p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '14px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <div>
                  <strong style={{ color: '#fff' }}>Chất liệu:</strong>
                  <div style={{ color: 'var(--text-muted)' }}>
                    {product.details?.material || '100% Premium Cotton thoáng mát'}
                  </div>
                </div>
                <div>
                  <strong style={{ color: '#fff' }}>Form dáng:</strong>
                  <div style={{ color: 'var(--text-muted)' }}>
                    {product.details?.fit || 'Form Boxy Oversized hiện đại'}
                  </div>
                </div>
                <div>
                  <strong style={{ color: '#fff' }}>Hướng dẫn bảo quản:</strong>
                  <div style={{ color: 'var(--text-muted)' }}>
                    {product.details?.care || 'Giặt máy chế độ nhẹ, không dùng chất tẩy'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Reviews */}
          {activeTab === 'reviews' && (
            <div>
              {/* Write Review Form */}
              <form
                onSubmit={handleSubmitReview}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '18px 22px',
                  borderRadius: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  marginBottom: '24px',
                }}
              >
                <div style={{ fontSize: '0.94rem', fontWeight: 700, marginBottom: '10px' }}>
                  Viết đánh giá của bạn cho sản phẩm này:
                </div>

                {/* Rating selection */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Chấm sao:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px',
                      }}
                    >
                      <Star
                        size={20}
                        fill={star <= reviewRating ? '#facc15' : 'none'}
                        color="#facc15"
                      />
                    </button>
                  ))}
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#facc15', marginLeft: '6px' }}>
                    {reviewRating} sao
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Cảm nhận của bạn về chất vải, form áo, đóng gói..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    style={{
                      flex: 1,
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.86rem',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="btn-primary"
                    style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '0.85rem' }}
                  >
                    <Send size={15} />
                    <span>{submittingReview ? 'Đang gửi...' : 'Gửi Đánh Giá'}</span>
                  </button>
                </div>
              </form>

              {/* Review list */}
              {product.reviews && product.reviews.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {product.reviews.map((rev, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '14px 18px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: '#334155',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                            }}
                          >
                            {rev.userName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>{rev.userName}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                              {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('vi-VN') : 'Gần đây'}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={13}
                              fill={s <= rev.rating ? '#facc15' : 'none'}
                              color="#facc15"
                            />
                          ))}
                        </div>
                      </div>
                      <p style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                  Chưa có đánh giá nào. Hãy là người đầu tiên trải nghiệm và để lại nhận xét!
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Size Guide Modal nested */}
      {sizeChartOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setSizeChartOpen(false)}
          style={{ zIndex: 1100 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#12141e',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              padding: '24px',
              maxWidth: '540px',
              width: '100%',
              animation: 'fadeIn 0.2s',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800 }}>
                Bảng Quy Đổi Kích Cỡ Chuẩn Streetwear
              </h3>
              <button
                onClick={() => setSizeChartOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.84rem',
                textAlign: 'center',
              }}
            >
              <thead>
                <tr style={{ background: 'rgba(250, 204, 21, 0.15)', color: '#facc15' }}>
                  <th style={{ padding: '10px' }}>Size</th>
                  <th style={{ padding: '10px' }}>Chiều cao (cm)</th>
                  <th style={{ padding: '10px' }}>Cân nặng (kg)</th>
                  <th style={{ padding: '10px' }}>Dài áo (cm)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <td style={{ padding: '10px', fontWeight: 700 }}>S</td>
                  <td>1m50 - 1m62</td>
                  <td>45 - 55 kg</td>
                  <td>68</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <td style={{ padding: '10px', fontWeight: 700 }}>M</td>
                  <td>1m63 - 1m72</td>
                  <td>55 - 65 kg</td>
                  <td>71</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <td style={{ padding: '10px', fontWeight: 700 }}>L</td>
                  <td>1m73 - 1m78</td>
                  <td>65 - 75 kg</td>
                  <td>74</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <td style={{ padding: '10px', fontWeight: 700 }}>XL</td>
                  <td>1m79 - 1m85</td>
                  <td>75 - 88 kg</td>
                  <td>77</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', fontWeight: 700 }}>XXL</td>
                  <td>&gt; 1m85</td>
                  <td>&gt; 88 kg</td>
                  <td>80</td>
                </tr>
              </tbody>
            </table>

            <div style={{ marginTop: '16px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              * Lưu ý: Form áo được thiết kế Oversized rụng vai tự nhiên. Nếu bạn muốn mặc vừa vặn cơ thể hơn, hãy cân nhắc lùi 1 size.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
