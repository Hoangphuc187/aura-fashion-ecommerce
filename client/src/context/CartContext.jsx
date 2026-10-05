import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext();

const FREE_SHIPPING_THRESHOLD = 500000;
const STANDARD_SHIPPING_FEE = 30000;

export const CartProvider = ({ children }) => {
  const { addToast } = useToast();
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [coupon, setCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('aura_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (coupon) {
      localStorage.setItem('aura_coupon', JSON.stringify(coupon));
    } else {
      localStorage.removeItem('aura_coupon');
    }
  }, [coupon]);

  const addToCart = (product, size, color, quantity = 1) => {
    const selectedSize = size || (product.sizes?.[0]?.size ?? 'M');
    const selectedColor = color || (product.colors?.[0]?.name ?? 'Mặc định');

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product === product._id &&
          item.size === selectedSize &&
          item.color === selectedColor
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            product: product._id,
            name: product.name,
            image: product.images?.[0] || '',
            price: product.price,
            originalPrice: product.originalPrice,
            size: selectedSize,
            color: selectedColor,
            quantity,
          },
        ];
      }
    });

    addToast(`Đã thêm "${product.name}" vào giỏ hàng!`, 'success');
  };

  const updateQuantity = (productId, size, color, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId, size, color);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.product === productId && item.size === size && item.color === color) {
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId, size, color) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(item.product === productId && item.size === size && item.color === color)
      )
    );
    addToast('Đã xóa sản phẩm khỏi giỏ hàng', 'info');
  };

  const clearCart = () => {
    setCart([]);
    setCoupon(null);
  };

  // Calculations
  const itemsPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isFreeShipping = itemsPrice >= FREE_SHIPPING_THRESHOLD || coupon?.code === 'FREESHIP';
  const shippingPrice = cart.length === 0 ? 0 : isFreeShipping ? 0 : STANDARD_SHIPPING_FEE;
  const discountAmount = coupon ? coupon.discount : 0;
  const totalPrice = Math.max(0, itemsPrice + shippingPrice - discountAmount);

  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - itemsPrice);
  const freeShippingProgress = Math.min(100, Math.round((itemsPrice / FREE_SHIPPING_THRESHOLD) * 100));
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const applyCoupon = async (code) => {
    if (!code.trim()) {
      addToast('Vui lòng nhập mã giảm giá', 'error');
      return;
    }

    try {
      const res = await fetch('/api/orders/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cartTotal: itemsPrice }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Mã không hợp lệ');

      setCoupon({
        code: data.couponCode,
        discount: data.discount,
      });
      addToast(data.message, 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    addToast('Đã hủy áp dụng mã giảm giá', 'info');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        totalItemsCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        coupon,
        applyCoupon,
        removeCoupon,
        itemsPrice,
        shippingPrice,
        discountAmount,
        totalPrice,
        isFreeShipping,
        freeShippingRemaining,
        freeShippingProgress,
        cartDrawerOpen,
        setCartDrawerOpen,
        checkoutModalOpen,
        setCheckoutModalOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
