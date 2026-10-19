import React, { useState, useRef, useCallback } from 'react';
import { ZoomIn, ZoomOut, Sparkles } from 'lucide-react';

/**
 * ImageZoomLens Component
 * High-precision interactive magnifying loupe to inspect textile weave, stitching & fabric textures.
 */
export const ImageZoomLens = ({
  src,
  alt = 'Sản phẩm',
  zoomLevel = 2.8,
  lensSize = 160,
  fabricBadge = 'Vải dệt nguyên bản • 100% Cotton 280GSM',
}) => {
  const [isActive, setIsActive] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0, bgX: 0, bgY: 0 });
  const [zoomEnabled, setZoomEnabled] = useState(true);
  const containerRef = useRef(null);

  const handleMouseMove = useCallback(
    (e) => {
      if (!zoomEnabled || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      // Keep lens bounded inside the container
      const halfLens = lensSize / 2;
      const x = Math.max(0, Math.min(clientX, rect.width));
      const y = Math.max(0, Math.min(clientY, rect.height));

      const bgX = (x / rect.width) * 100;
      const bgY = (y / rect.height) * 100;

      setLensPos({
        x: clientX,
        y: clientY,
        bgX,
        bgY,
      });
    },
    [zoomEnabled, lensSize]
  );

  const handleMouseEnter = () => {
    if (zoomEnabled) setIsActive(true);
  };

  const handleMouseLeave = () => {
    setIsActive(false);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        paddingTop: '115%',
        borderRadius: '18px',
        overflow: 'hidden',
        background: '#161824',
        border: '1px solid var(--border-color)',
        cursor: zoomEnabled ? 'crosshair' : 'default',
        userSelect: 'none',
      }}
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Base Image */}
      <img
        src={src}
        alt={alt}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          transition: 'transform 0.2s ease',
        }}
        loading="lazy"
      />

      {/* Loupe Magnifier Lens */}
      {isActive && zoomEnabled && (
        <div
          style={{
            position: 'absolute',
            top: lensPos.y - lensSize / 2,
            left: lensPos.x - lensSize / 2,
            width: `${lensSize}px`,
            height: `${lensSize}px`,
            borderRadius: '50%',
            border: '2px solid #facc15',
            boxShadow:
              '0 0 0 1px rgba(0,0,0,0.4), 0 10px 30px rgba(0,0,0,0.65), 0 0 25px rgba(250,204,21,0.45)',
            backgroundImage: `url(${src})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${zoomLevel * 100}%`,
            backgroundPosition: `${lensPos.bgX}% ${lensPos.bgY}%`,
            pointerEvents: 'none',
            zIndex: 30,
            overflow: 'hidden',
          }}
        >
          {/* Subtle crosshair center mark */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '8px',
              height: '8px',
              transform: 'translate(-50%, -50%)',
              border: '1px solid rgba(250, 204, 21, 0.7)',
              borderRadius: '50%',
              boxShadow: '0 0 4px rgba(0,0,0,0.8)',
            }}
          />

          {/* Zoom badge indicator inside the lens */}
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0, 0, 0, 0.75)',
              color: '#facc15',
              fontSize: '0.62rem',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: '9999px',
              letterSpacing: '0.5px',
              backdropFilter: 'blur(4px)',
            }}
          >
            {zoomLevel}X ZOOM
          </div>
        </div>
      )}

      {/* Floating Bottom Status Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          right: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          zIndex: 20,
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#f8fafc',
            fontSize: '0.72rem',
            fontWeight: 600,
            padding: '5px 10px',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            maxWidth: 'calc(100% - 44px)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          <Sparkles size={13} color="#facc15" style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{fabricBadge}</span>
        </div>

        {/* Toggle Zoom Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setZoomEnabled((p) => !p);
            setIsActive(false);
          }}
          title={zoomEnabled ? 'Tắt kính lúp soi vải' : 'Bật kính lúp soi vải'}
          style={{
            background: zoomEnabled ? 'rgba(250, 204, 21, 0.95)' : 'rgba(15, 23, 42, 0.85)',
            color: zoomEnabled ? '#000' : '#f8fafc',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
        >
          {zoomEnabled ? <ZoomOut size={15} /> : <ZoomIn size={15} />}
        </button>
      </div>
    </div>
  );
};
