import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { addToast } = useToast();
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'register'

  useEffect(() => {
    if (user) {
      localStorage.setItem('aura_user', JSON.stringify(user));
      if (user.wishlist && Array.isArray(user.wishlist)) {
        setWishlist(user.wishlist.map((item) => (typeof item === 'object' ? item._id : item)));
      }
    } else {
      localStorage.removeItem('aura_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('aura_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Đăng nhập thất bại');

      if (data.require2FA) {
        return data;
      }

      setUser(data.user);
      addToast(`Xin chào trở lại, ${data.user.name}!`, 'success');
      setAuthModalOpen(false);
      return data.user;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const verify2FA = async (tempToken, otp) => {
    try {
      const res = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Xác thực OTP thất bại');

      setUser(data.user);
      addToast(`Xin chào trở lại, ${data.user.name}!`, 'success');
      setAuthModalOpen(false);
      return data.user;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const resend2FA = async (tempToken) => {
    try {
      const res = await fetch('/api/auth/resend-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gửi lại OTP thất bại');
      addToast(data.message || 'Mã xác thực mới đã được gửi đến email!', 'info');
      return data;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const toggle2FA = async (enabled) => {
    try {
      if (!user?.token) throw new Error('Vui lòng đăng nhập');
      const res = await fetch('/api/auth/toggle-2fa', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ enabled }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Cập nhật 2FA thất bại');
      setUser((prev) => (prev ? { ...prev, twoFactorEnabled: data.twoFactorEnabled } : prev));
      addToast(data.message, 'success');
      return data.twoFactorEnabled;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const register = async (formData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Đăng ký thất bại');

      setUser(data.user);
      addToast('Tạo tài khoản thành công! Chào mừng bạn gia nhập AURA.', 'success');
      setAuthModalOpen(false);
      return data.user;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const loginWithOAuth = async (oauthData) => {
    try {
      const res = await fetch('/api/auth/oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(oauthData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi đăng nhập');

      setUser(data.user);
      addToast(`✨ ${data.message}`, 'success');
      setAuthModalOpen(false);
      return data.user;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    addToast('Đã đăng xuất thành công', 'info');
  };

  const toggleWishlist = async (productId) => {
    if (!user) {
      // Local wishlist toggle if guest
      const exists = wishlist.includes(productId);
      let updated;
      if (exists) {
        updated = wishlist.filter((id) => id !== productId);
        addToast('Đã bỏ yêu thích', 'info');
      } else {
        updated = [...wishlist, productId];
        addToast('Đã thêm vào danh sách yêu thích!', 'success');
      }
      setWishlist(updated);
      return;
    }

    try {
      const res = await fetch('/api/auth/wishlist/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const exists = wishlist.includes(productId);
      const updated = exists
        ? wishlist.filter((id) => id !== productId)
        : [...wishlist, productId];
      setWishlist(updated);
      addToast(data.message, 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const refreshUserProfile = async () => {
    if (!user?.token) return null;
    try {
      const res = await fetch('/api/auth/profile', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (data.success && data.user) {
        const merged = { ...user, ...data.user };
        setUser(merged);
        localStorage.setItem('aura_user', JSON.stringify(merged));
        return merged;
      }
    } catch (err) {
      console.error('Error refreshing user profile:', err);
    }
    return user;
  };

  const updateUser = (patch) => {
    setUser((prev) => {
      const updated = { ...prev, ...patch };
      localStorage.setItem('aura_user', JSON.stringify(updated));
      return updated;
    });
  };

  // Demo 1-click logins
  const loginAsDemoCustomer = async () => {
    await login('khachhang@gmail.com', 'user123');
  };

  const loginAsDemoAdmin = async () => {
    await login('admin@streetwear.vn', 'admin123');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token: user?.token,
        isAdmin: Boolean(user?.role === 'admin'),
        wishlist,
        login,
        register,
        loginWithOAuth,
        logout,
        toggleWishlist,
        authModalOpen,
        setAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        loginAsDemoCustomer,
        loginAsDemoAdmin,
        updateUser,
        refreshUserProfile,
        verify2FA,
        resend2FA,
        toggle2FA,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
