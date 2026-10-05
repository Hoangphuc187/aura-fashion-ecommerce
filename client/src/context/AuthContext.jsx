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

      setUser(data.user);
      addToast(`Xin chào trở lại, ${data.user.name}!`, 'success');
      setAuthModalOpen(false);
      return data.user;
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
