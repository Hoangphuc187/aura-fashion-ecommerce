import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, Shield, Sparkles, Check, ArrowRight, Eye, EyeOff, KeyRound, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AuthModal = () => {
  const {
    authModalOpen,
    setAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    login,
    register,
    loginWithOAuth,
    loginAsDemoCustomer,
    loginAsDemoAdmin,
  } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [googlePromptOpen, setGooglePromptOpen] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('demo.customer@gmail.com');
  const [googleName, setGoogleName] = useState('Demo Customer');

  const [facebookPromptOpen, setFacebookPromptOpen] = useState(false);
  const [facebookEmail, setFacebookEmail] = useState('khachhang.fb@gmail.com');
  const [facebookName, setFacebookName] = useState('Nguyễn Văn Phúc (Facebook)');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: send OTP, 2: verify & reset

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  if (!authModalOpen) return null;

  // Handle Google OAuth 2.0 Sign In
  const handleGoogleOAuthLogin = async (customEmail, customName) => {
    setLoading(true);
    try {
      const email = customEmail || googleEmail;
      const name = customName || googleName;
      const googleId = 'google_' + Math.floor(1000000000 + Math.random() * 9000000000);
      const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=facc15,10b981,3b82f6`;

      await loginWithOAuth({
        provider: 'google',
        providerId: googleId,
        email,
        name,
        avatar,
      });
      setGooglePromptOpen(false);
    } catch {
      // handled in context
    } finally {
      setLoading(false);
    }
  };

  // Handle Facebook OAuth 2.0 Sign In
  const handleFacebookOAuthLogin = async (customEmail, customName) => {
    setLoading(true);
    try {
      const email = customEmail || facebookEmail;
      const name = customName || facebookName;
      const facebookId = 'fb_' + Math.floor(1000000000 + Math.random() * 9000000000);
      const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=1877f2`;

      await loginWithOAuth({
        provider: 'facebook',
        providerId: facebookId,
        email,
        name,
        avatar,
      });
      setFacebookPromptOpen(false);
    } catch {
      // handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
    } catch {
      // error handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(registerForm);
    } catch {
      // error handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      addToast('Vui lòng nhập địa chỉ email của bạn', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Không thể tạo mã xác thực');
      if (data.otp) setForgotOtp(data.otp);
      addToast(data.message, 'success');
      setForgotStep(2);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!forgotOtp || !forgotNewPassword) {
      addToast('Vui lòng nhập mã OTP và mật khẩu mới', 'error');
      return;
    }
    if (forgotNewPassword.length < 6) {
      addToast('Mật khẩu mới phải có tối thiểu 6 ký tự', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, otp: forgotOtp, newPassword: forgotNewPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Đặt lại mật khẩu thất bại');
      addToast(data.message, 'success');
      setAuthModalTab('login');
      setForgotStep(1);
      setLoginForm((p) => ({ ...p, email: forgotEmail, password: '' }));
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={() => setAuthModalOpen(false)}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#0d0f17',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '460px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
          position: 'relative',
          padding: '32px',
          animation: 'fadeIn 0.25s ease-out',
        }}
      >
        <button
          onClick={() => setAuthModalOpen(false)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            color: '#fff',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#fff',
            }}
          >
            Chào Mừng Đến AURA
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '4px' }}>
            Đăng nhập để lưu giỏ hàng, theo dõi đơn và nhận ưu đãi độc quyền.
          </p>
        </div>

        {/* ================= OAUTH 2.0 BUTTONS (FEATURED) ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {/* Google OAuth 2.0 */}
          <button
            type="button"
            onClick={() => setGooglePromptOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '12px 18px',
              borderRadius: '12px',
              background: '#ffffff',
              color: '#1f2937',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
          >
            {/* Official Google G Logo */}
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>Đăng nhập với Google</span>
          </button>

          {/* Facebook Sign In */}
          <button
            type="button"
            onClick={() => setFacebookPromptOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '11px 18px',
              borderRadius: '12px',
              background: '#1877F2',
              border: '1px solid #1877F2',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 15px rgba(24, 119, 242, 0.35)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
          >
            {/* Facebook Official SVG */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>Đăng nhập với Facebook</span>
          </button>
        </div>

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
            color: 'var(--text-dim)',
            fontSize: '0.78rem',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          <span>Hoặc dùng tài khoản mật khẩu</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* Tab switch */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '20px',
          }}
        >
          <button
            onClick={() => setAuthModalTab('login')}
            style={{
              flex: 1,
              padding: '9px',
              borderRadius: '8px',
              background: authModalTab === 'login' ? 'rgba(250, 204, 21, 0.2)' : 'transparent',
              color: authModalTab === 'login' ? '#facc15' : 'var(--text-muted)',
              border: authModalTab === 'login' ? '1px solid rgba(250,204,21,0.4)' : 'none',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Đăng Nhập
          </button>
          <button
            onClick={() => setAuthModalTab('register')}
            style={{
              flex: 1,
              padding: '9px',
              borderRadius: '8px',
              background: authModalTab === 'register' ? 'rgba(250, 204, 21, 0.2)' : 'transparent',
              color: authModalTab === 'register' ? '#facc15' : 'var(--text-muted)',
              border: authModalTab === 'register' ? '1px solid rgba(250,204,21,0.4)' : 'none',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Đăng Ký
          </button>
        </div>

        {/* LOGIN FORM */}
        {authModalTab === 'login' ? (
          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-dim)',
                  }}
                />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm((p) => ({ ...p, email: e.target.value }))}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    padding: '10px 14px 10px 38px',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                Mật khẩu
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-dim)',
                  }}
                />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    padding: '10px 40px 10px 38px',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword((prev) => !prev)}
                  title={showLoginPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: showLoginPassword ? '#facc15' : 'var(--text-dim)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                  }}
                >
                  {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-10px', marginBottom: '18px' }}>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(loginForm.email || '');
                  setForgotStep(1);
                  setAuthModalTab('forgot');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#facc15',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                  fontWeight: 600,
                }}
              >
                Quên mật khẩu?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', borderRadius: '10px', fontSize: '0.94rem' }}
            >
              {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
            </button>
          </form>
        ) : authModalTab === 'register' ? (
          /* REGISTER FORM */
          <form onSubmit={handleRegisterSubmit}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                Họ và tên
              </label>
              <div style={{ position: 'relative' }}>
                <UserIcon
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-dim)',
                  }}
                />
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm((p) => ({ ...p, name: e.target.value }))}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    padding: '10px 14px 10px 38px',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-dim)',
                  }}
                />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm((p) => ({ ...p, email: e.target.value }))}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    padding: '10px 14px 10px 38px',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                Số điện thoại
              </label>
              <div style={{ position: 'relative' }}>
                <Phone
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-dim)',
                  }}
                />
                <input
                  type="tel"
                  placeholder="0901234567"
                  value={registerForm.phone}
                  onChange={(e) => setRegisterForm((p) => ({ ...p, phone: e.target.value }))}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    padding: '10px 14px 10px 38px',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                Mật khẩu (tối thiểu 6 ký tự)
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-dim)',
                  }}
                />
                <input
                  type={showRegisterPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm((p) => ({ ...p, password: e.target.value }))}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    padding: '10px 40px 10px 38px',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword((prev) => !prev)}
                  title={showRegisterPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: showRegisterPassword ? '#facc15' : 'var(--text-dim)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                  }}
                >
                  {showRegisterPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', borderRadius: '10px', fontSize: '0.94rem' }}
            >
              {loading ? 'Đang tạo tài khoản...' : 'Tạo Tài Khoản Ngay'}
            </button>
          </form>
        ) : (
          /* FORGOT PASSWORD FORM */
          <div>
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'rgba(250, 204, 21, 0.15)',
                  color: '#facc15',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px',
                }}
              >
                <KeyRound size={22} />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                {forgotStep === 1 ? 'Khôi Phục Mật Khẩu' : 'Nhập Mã OTP & Mật Khẩu Mới'}
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
                {forgotStep === 1
                  ? 'Nhập email đã đăng ký để nhận mã OTP xác thực khôi phục tài khoản.'
                  : `Mã OTP đã được gửi đến ${forgotEmail}. Vui lòng nhập mã và mật khẩu mới.`}
              </p>
            </div>

            {forgotStep === 1 ? (
              <form onSubmit={handleSendOtp}>
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                    Email đăng ký
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-dim)',
                      }}
                    />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        padding: '10px 14px 10px 38px',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.88rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', fontSize: '0.94rem', marginBottom: '12px' }}
                >
                  {loading ? 'Đang gửi mã...' : 'Nhận Mã Xác Thực OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                    Mã xác thực OTP (6 chữ số)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid #facc15',
                      padding: '12px',
                      borderRadius: '8px',
                      color: '#facc15',
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      letterSpacing: '4px',
                      textAlign: 'center',
                      outline: 'none',
                    }}
                  />
                  <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '4px', textAlign: 'center' }}>
                    Mã OTP có hiệu lực trong vòng 10 phút
                  </div>
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                    Mật khẩu mới (tối thiểu 6 ký tự)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-dim)',
                      }}
                    />
                    <input
                      type={showForgotNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        padding: '10px 40px 10px 38px',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.88rem',
                        outline: 'none',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotNewPassword((prev) => !prev)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: showForgotNewPassword ? '#facc15' : 'var(--text-dim)',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      {showForgotNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', fontSize: '0.94rem', marginBottom: '12px' }}
                >
                  {loading ? 'Đang đổi mật khẩu...' : 'Xác Nhận Đổi Mật Khẩu'}
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => {
                setAuthModalTab('login');
                setForgotStep(1);
              }}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.84rem',
                cursor: 'pointer',
                padding: '8px',
                textAlign: 'center',
              }}
            >
              ← Quay lại Đăng Nhập
            </button>
          </div>
        )}
      </div>

      {/* Interactive Google OAuth 2.0 Account Selection Modal */}
      {googlePromptOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setGooglePromptOpen(false)}
          style={{ zIndex: 1200 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              color: '#202124',
              borderRadius: '16px',
              maxWidth: '400px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            {/* Google Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 600 }}>Đăng nhập bằng Google</div>
                <div style={{ fontSize: '0.78rem', color: '#5f6368' }}>Chọn tài khoản để tiếp tục tới AURA STUDIO</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #dadce0', margin: '14px 0' }} />

            {/* Account List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
              <div
                onClick={() => handleGoogleOAuthLogin('demo.customer@gmail.com', 'Khách Hàng Google (Demo)')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #dadce0',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
              >
                <img
                  src="https://api.dicebear.com/7.x/initials/svg?seed=AuraUser&backgroundColor=facc15"
                  alt=""
                  style={{ width: '38px', height: '38px', borderRadius: '50%' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#202124' }}>
                    Khách Hàng Google (Demo)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#5f6368' }}>
                    demo.customer@gmail.com
                  </div>
                </div>
                <ArrowRight size={16} color="#1a73e8" />
              </div>
            </div>

            {/* Custom Google Email input */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#5f6368', marginBottom: '4px' }}>
                Hoặc nhập tài khoản Google khác:
              </label>
              <input
                type="email"
                placeholder="youremail@gmail.com"
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #dadce0',
                  fontSize: '0.86rem',
                  outline: 'none',
                  color: '#202124',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setGooglePromptOpen(false)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  background: 'transparent',
                  color: '#5f6368',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Hủy
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleGoogleOAuthLogin()}
                style={{
                  padding: '9px 20px',
                  borderRadius: '8px',
                  background: '#1a73e8',
                  color: '#fff',
                  border: 'none',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Facebook OAuth Selection Prompt Modal */}
      {facebookPromptOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setFacebookPromptOpen(false)}
          style={{ zIndex: 1200, background: 'rgba(0,0,0,0.65)' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              color: '#1c1e21',
              borderRadius: '16px',
              maxWidth: '400px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            {/* Facebook Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1877F2' }}>Đăng nhập với Facebook</div>
                <div style={{ fontSize: '0.78rem', color: '#65676b' }}>Ủy quyền đăng nhập nhanh vào AURA STUDIO</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #ced0d4', margin: '14px 0' }} />

            {/* Account List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
              <div
                onClick={() => handleFacebookOAuthLogin('khachhang.fb@gmail.com', 'Nguyễn Văn Phúc (Facebook)')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #dadce0',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f2f5')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
              >
                <img
                  src="https://api.dicebear.com/7.x/initials/svg?seed=FacebookUser&backgroundColor=1877F2"
                  alt=""
                  style={{ width: '38px', height: '38px', borderRadius: '50%' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1c1e21' }}>
                    Nguyễn Văn Phúc (Facebook)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#65676b' }}>
                    khachhang.fb@gmail.com
                  </div>
                </div>
                <ArrowRight size={16} color="#1877F2" />
              </div>
            </div>

            {/* Custom Facebook Account input */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#65676b', marginBottom: '4px' }}>
                Hoặc nhập email/tên Facebook khác:
              </label>
              <input
                type="text"
                placeholder="Tên hoặc email Facebook"
                value={facebookEmail}
                onChange={(e) => setFacebookEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #ced0d4',
                  fontSize: '0.86rem',
                  outline: 'none',
                  color: '#1c1e21',
                  marginBottom: '8px',
                }}
              />
              <input
                type="text"
                placeholder="Họ và tên hiển thị"
                value={facebookName}
                onChange={(e) => setFacebookName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #ced0d4',
                  fontSize: '0.86rem',
                  outline: 'none',
                  color: '#1c1e21',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setFacebookPromptOpen(false)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  background: 'transparent',
                  color: '#65676b',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Hủy
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleFacebookOAuthLogin()}
                style={{
                  padding: '9px 20px',
                  borderRadius: '8px',
                  background: '#1877F2',
                  color: '#fff',
                  border: 'none',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {loading ? 'Đang kết nối...' : 'Tiếp Tục Với Facebook'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
