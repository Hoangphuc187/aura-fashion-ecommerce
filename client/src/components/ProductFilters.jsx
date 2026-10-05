import React from 'react';
import { SlidersHorizontal, RotateCcw, ArrowUpDown } from 'lucide-react';

export const ProductFilters = ({
  categories,
  selectedCategory,
  onSelectCategory,
  sizes,
  selectedSize,
  onSelectSize,
  sortBy,
  onSelectSort,
  priceRange,
  onPriceChange,
  maxPrice = 2000000,
  onResetFilters,
  totalProducts = 0,
}) => {
  return (
    <div
      style={{
        maxWidth: '1360px',
        margin: '0 auto 28px',
        padding: '0 24px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          borderRadius: '16px',
          padding: '18px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Top line: Categories & Sort & Total */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          {/* Categories Pill Selector */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  style={{
                    background: active
                      ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                      : 'rgba(255, 255, 255, 0.06)',
                    color: active ? '#000' : '#cbd5e1',
                    border: active ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '7px 16px',
                    borderRadius: '9999px',
                    fontSize: '0.84rem',
                    fontWeight: active ? 800 : 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: active ? '0 4px 15px rgba(250, 204, 21, 0.3)' : 'none',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Sort By Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowUpDown size={14} />
              Sắp xếp:
            </span>
            <select
              value={sortBy}
              onChange={(e) => onSelectSort(e.target.value)}
              style={{
                background: '#181a24',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '0.84rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="newest">Mới nhất</option>
              <option value="bestseller">Bán chạy nhất</option>
              <option value="rating">Đánh giá cao nhất</option>
              <option value="price-asc">Giá: Thấp đến Cao</option>
              <option value="price-desc">Giá: Cao đến Thấp</option>
            </select>
          </div>
        </div>

        {/* Second Line: Size Filters, Price Slider, Reset */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '18px',
            paddingTop: '14px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          {/* Sizes */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Kích cỡ:
            </span>
            <button
              onClick={() => onSelectSize('')}
              style={{
                background: !selectedSize ? 'rgba(250, 204, 21, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: !selectedSize ? '#facc15' : '#94a3b8',
                border: !selectedSize ? '1px solid #facc15' : '1px solid rgba(255,255,255,0.08)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Tất cả
            </button>
            {sizes.map((s) => {
              const active = selectedSize === s;
              return (
                <button
                  key={s}
                  onClick={() => onSelectSize(active ? '' : s)}
                  style={{
                    background: active ? 'rgba(250, 204, 21, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    color: active ? '#facc15' : '#cbd5e1',
                    border: active ? '1px solid #facc15' : '1px solid rgba(255,255,255,0.08)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    minWidth: '32px',
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>

          {/* Price Range Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Mức giá tối đa:
            </span>
            <input
              type="range"
              min={100000}
              max={maxPrice}
              step={50000}
              value={priceRange}
              onChange={(e) => onPriceChange(Number(e.target.value))}
              style={{
                accentColor: '#facc15',
                cursor: 'pointer',
                width: '120px',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.86rem',
                fontWeight: 700,
                color: '#facc15',
                minWidth: '95px',
              }}
            >
              {priceRange.toLocaleString('vi-VN')}₫
            </span>
          </div>

          {/* Product count & Reset button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
              Hiển thị: <strong style={{ color: '#fff' }}>{totalProducts}</strong> sản phẩm
            </span>

            {(selectedCategory !== 'Tất cả' || selectedSize || priceRange < maxPrice || sortBy !== 'newest') && (
              <button
                onClick={onResetFilters}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'transparent',
                  border: 'none',
                  color: '#f87171',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={13} />
                <span>Đặt lại lọc</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
