import React, { useRef } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Sparkles, Flame, Zap } from 'lucide-react';

export const FeaturedCategories = ({ onSelectCategory, selectedCategory }) => {
  const scrollRef = useRef(null);

  const categoryCards = [
    {
      name: 'Áo Khoác & Hoodie',
      category: 'Áo khoác',
      count: '18+ mẫu',
      badge: 'TRENDING',
      badgeIcon: Flame,
      badgeColor: '#ff5722',
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=700&q=80',
      floatDelay: '0s',
      floatAnim: 'float-item-1',
    },
    {
      name: 'Áo Thun Heavyweight',
      category: 'Áo thun',
      count: '24+ mẫu',
      badge: 'BESTSELLER',
      badgeIcon: Zap,
      badgeColor: '#facc15',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80',
      floatDelay: '0.6s',
      floatAnim: 'float-item-2',
    },
    {
      name: 'Quần Cargo & Denim',
      category: 'Quần & Shorts',
      count: '16+ mẫu',
      badge: 'HOT DROP',
      badgeIcon: Sparkles,
      badgeColor: '#10b981',
      image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=700&q=80',
      floatDelay: '1.2s',
      floatAnim: 'float-item-3',
    },
    {
      name: 'Sơ Mi Cổ Cuba',
      category: 'Sơ mi',
      count: '12+ mẫu',
      badge: 'SUMMER VIBE',
      badgeIcon: Sparkles,
      badgeColor: '#38bdf8',
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=700&q=80',
      floatDelay: '1.8s',
      floatAnim: 'float-item-1',
    },
    {
      name: 'Phụ Kiện Đường Phố',
      category: 'Phụ kiện',
      count: '15+ mẫu',
      badge: 'ESSENTIALS',
      badgeIcon: Zap,
      badgeColor: '#e879f9',
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=700&q=80',
      floatDelay: '2.4s',
      floatAnim: 'float-item-2',
    },
  ];

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section
      style={{
        maxWidth: '1360px',
        margin: '50px auto 30px',
        padding: '0 24px',
        position: 'relative',
      }}
    >
      {/* Header with Title and Scroll Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '26px',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              color: '#facc15',
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            <Sparkles size={14} />
            <span>DANH MỤC NỔI BẬT</span>
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              marginTop: '4px',
              color: '#fff',
            }}
          >
            Khám Phá Theo Dòng Sản Phẩm
          </h2>
        </div>

        {/* Scroll Arrows */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleScroll('left')}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#facc15';
              e.currentTarget.style.color = '#000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = '#fff';
            }}
            title="Cuộn sang trái"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={() => handleScroll('right')}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#facc15';
              e.currentTarget.style.color = '#000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = '#fff';
            }}
            title="Cuộn sang phải"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Horizontal Runway / Responsive 5-column Grid */}
      <div
        ref={scrollRef}
        className="category-runway"
        style={{
          display: 'grid',
          gridAutoFlow: 'column',
          gridAutoColumns: 'minmax(250px, 1fr)',
          gap: '20px',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          paddingBottom: '20px',
          paddingTop: '10px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {categoryCards.map((cat, index) => {
          const isActive = selectedCategory === cat.category;
          const BadgeIcon = cat.badgeIcon;

          return (
            <div
              key={cat.category}
              onClick={() => onSelectCategory(cat.category)}
              className={`cat-float-card ${cat.floatAnim}`}
              style={{
                scrollSnapAlign: 'start',
                position: 'relative',
                height: '340px',
                borderRadius: '22px',
                overflow: 'hidden',
                cursor: 'pointer',
                border: isActive
                  ? '2px solid #facc15'
                  : '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: isActive
                  ? '0 0 30px rgba(250, 204, 21, 0.4), 0 15px 35px rgba(0,0,0,0.7)'
                  : '0 12px 30px rgba(0, 0, 0, 0.5)',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                background: '#12141c',
              }}
            >
              {/* Background Image */}
              <img
                src={cat.image}
                alt={cat.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className="cat-img"
              />

              {/* Gradient Dark Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(180deg, rgba(9, 10, 15, 0.15) 0%, rgba(9, 10, 15, 0.4) 45%, rgba(9, 10, 15, 0.95) 100%)',
                }}
              />

              {/* Floating Top Badge */}
              <div
                className="cat-badge-3d"
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  zIndex: 2,
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    background: 'rgba(9, 10, 15, 0.75)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${cat.badgeColor}`,
                    color: cat.badgeColor,
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    letterSpacing: '0.5px',
                  }}
                >
                  <BadgeIcon size={12} />
                  <span>{cat.badge}</span>
                </span>
              </div>

              {/* Bottom Info Card */}
              <div
                className="cat-info-3d"
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '18px',
                  right: '18px',
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '0.78rem',
                      color: '#facc15',
                      fontWeight: 700,
                      marginBottom: '4px',
                    }}
                  >
                    {cat.count}
                  </div>
                  <h3
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: '#fff',
                      fontFamily: 'var(--font-display)',
                      lineHeight: 1.25,
                    }}
                  >
                    {cat.name}
                  </h3>
                </div>

                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: isActive ? '#facc15' : 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isActive ? '#000' : '#fff',
                    transition: 'all 0.25s',
                    flexShrink: 0,
                  }}
                  className="arrow-circle"
                >
                  <ArrowUpRight size={18} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .category-runway::-webkit-scrollbar {
          display: none;
        }
        @media (min-width: 1100px) {
          .category-runway {
            grid-auto-flow: initial !important;
            grid-template-columns: repeat(5, 1fr) !important;
          }
        }
        .category-runway {
          perspective: 1200px;
        }
        .cat-float-card {
          transform-style: preserve-3d;
          will-change: transform;
        }
        .cat-float-card:hover {
          transform: translateY(-12px) rotateX(5deg) scale(1.03) !important;
          animation-play-state: paused !important;
          border-color: rgba(250, 204, 21, 0.8) !important;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(250, 204, 21, 0.4) !important;
        }
        .cat-float-card .cat-badge-3d {
          transform: translateZ(25px);
          transition: transform 0.35s ease;
        }
        .cat-float-card .cat-info-3d {
          transform: translateZ(30px);
          transition: transform 0.35s ease;
        }
        .cat-float-card:hover .cat-badge-3d {
          transform: translateZ(35px) scale(1.05);
        }
        .cat-float-card:hover .cat-info-3d {
          transform: translateZ(42px);
        }
        .cat-float-card:hover .cat-img {
          transform: scale(1.1) !important;
        }
        .cat-float-card:hover .arrow-circle {
          background: #facc15 !important;
          color: #000 !important;
          transform: rotate(45deg);
        }
      `}</style>
    </section>
  );
};
