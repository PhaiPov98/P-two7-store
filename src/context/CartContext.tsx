'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem } from '@/types';
import { useToast } from './ToastContext';

interface CouponState {
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  discount: number;
  total: number;
  coupon: CouponState | null;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<CouponState | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { success, error } = useToast();

  // Load from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('bozz_cart');
      const savedCoupon = localStorage.getItem('bozz_coupon');
      if (savedCart) setItems(JSON.parse(savedCart));
      if (savedCoupon) setCoupon(JSON.parse(savedCoupon));
    } catch (e) {
      console.error('Error loading cart', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('bozz_cart', JSON.stringify(items));
      if (coupon) {
        localStorage.setItem('bozz_coupon', JSON.stringify(coupon));
      } else {
        localStorage.removeItem('bozz_coupon');
      }
    } catch (e) {
      console.error('Error saving cart', e);
    }
  }, [items, coupon, isLoaded]);

  const addToCart = (product: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === product.productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    success('បានបន្ថែមទៅកន្ត្រក!', product.name);
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
    localStorage.removeItem('bozz_cart');
    localStorage.removeItem('bozz_coupon');
  };

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  let discount = 0;
  if (coupon) {
    if (coupon.discountType === 'PERCENT') {
      discount = (subtotal * coupon.discountValue) / 100;
    } else {
      discount = Math.min(coupon.discountValue, subtotal);
    }
  }

  const total = Math.max(0, subtotal - discount);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const applyCoupon = async (code: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/coupons/verify?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (res.ok && data.coupon) {
        setCoupon({
          code: data.coupon.code,
          discountType: data.coupon.discountType,
          discountValue: data.coupon.discountValue,
        });
        success('បានបញ្ចូល Coupon ជោគជ័យ!', `បញ្ចុះតម្លៃ ${data.coupon.discountValue}${data.coupon.discountType === 'PERCENT' ? '%' : '$'}`);
        return true;
      } else {
        error('Coupon មិនត្រឹមត្រូវ', data.message || 'កូដបញ្ចុះតម្លៃមិនមានសុពលភាព ឬផុតកំណត់');
        return false;
      }
    } catch (e) {
      error('មានបញ្ហា', 'មិនអាចពិនិត្យកូដបញ្ចុះតម្លៃបានទេ');
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        discount,
        total,
        coupon,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
