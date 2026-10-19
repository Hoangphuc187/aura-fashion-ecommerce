import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[AURA ErrorBoundary] Uncaught runtime UI error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#090a0f',
            color: '#f8fafc',
            padding: '24px',
            textAlign: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              marginBottom: '16px',
            }}
          >
            ⚡
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>
            AURA STUDIO đang làm mới phiên làm việc
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '480px', marginBottom: '24px' }}>
            Hệ thống phát hiện bản cập nhật giao diện mới. Vui lòng bấm làm mới để tải lại trang mượt mà nhất.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              padding: '12px 28px',
              borderRadius: '10px',
              background: '#facc15',
              color: '#000',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.92rem',
            }}
          >
            Tải lại trang (Reload)
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
