'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import { createOrder, type OrderItem } from '../lib/orders';
import { linkTransactionToOrder } from '../lib/transactions';
import { decrementStock } from '../lib/products';

export interface CartItem {
  cartItemId: string;
  name: string;
  variantLabel?: string;
  image?: string;
  priceNumeric: number;
  quantity: number;
  brandId?: string;
  productId?: number;
}

interface CartContextType {
  cart: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeCartItem: (cartItemId: string) => void;
  clearCart: () => void;
  totalCartCost: number;
  totalCartItemsCount: number;
  isNoCoinsModalOpen: boolean;
  closeNoCoinsModal: () => void;
  checkoutMessage: string;
  checkout: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'app_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { currentUser, spendB9chich } = useAuth();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNoCoinsModalOpen, setIsNoCoinsModalOpen] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [hydrated, setHydrated] = useState(false);

  // Load any cart left over from a previous visit, once, on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) setCart(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  // Persist on every change — but only after the initial load above, so we
  // don't immediately overwrite a saved cart with an empty array.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart, hydrated]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const closeNoCoinsModal = useCallback(() => setIsNoCoinsModalOpen(false), []);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.cartItemId === item.cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], quantity: updated[existingIndex].quantity + quantity };
        return updated;
      }
      return [...prev, { ...item, quantity }];
    });
    setIsCartOpen(true);
  }, []);

  const updateQuantity = useCallback((cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  }, []);

  const removeCartItem = useCallback((cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const totalCartCost = cart.reduce((sum, item) => sum + item.priceNumeric * item.quantity, 0);
  const totalCartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // The real checkout: works from the floating cart button on ANY page, not
  // just /services. Spends the real balance, records the order, sends the
  // client to My Orders — or shows the insufficient-balance modal on failure.
  const checkout = useCallback(() => {
    if (cart.length === 0) return;

    if (!currentUser) {
      setIsCartOpen(false);
      router.push('/login');
      return;
    }

    const result = spendB9chich(totalCartCost);

    if (!result.success) {
      setCheckoutMessage(result.message);
      setIsNoCoinsModalOpen(true);
      return;
    }

    const orderItems: OrderItem[] = cart.map((item) => ({
      productName: item.name,
      variantLabel: item.variantLabel,
      priceNumeric: item.priceNumeric,
      quantity: item.quantity,
    }));
    const order = createOrder({ email: currentUser.email, items: orderItems, totalCost: totalCartCost });
    if (order) {
      linkTransactionToOrder(currentUser.email, order.id);
    }

    // Reduce inventory for whatever was actually bought.
    for (const item of cart) {
      if (item.brandId && item.productId !== undefined) {
        void decrementStock(item.brandId, item.productId, item.quantity);
      }
    }

    setCart([]);
    setIsCartOpen(false);
    router.push('/my-orders');
  }, [cart, currentUser, spendB9chich, totalCartCost, router]);

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        openCart,
        closeCart,
        addToCart,
        updateQuantity,
        removeCartItem,
        clearCart,
        totalCartCost,
        totalCartItemsCount,
        isNoCoinsModalOpen,
        closeNoCoinsModal,
        checkoutMessage,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
