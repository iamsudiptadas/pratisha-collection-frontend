import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart, addToCart, updateCart, removeFromCart, clearCart } from '../api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setItems([]); setTotal(0); return; }
    try {
      setLoading(true);
      const res = await getCart();
      setItems(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addItem = async (product_id, quantity = 1) => {
    if (!user) { toast.error('Please login to add to cart'); return; }
    try {
      await addToCart({ product_id, quantity });
      toast.success('Added to cart!');
      fetchCart();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add to cart');
    }
  };

  const updateItem = async (cartItemId, quantity) => {
    try {
      await updateCart(cartItemId, { quantity });
      fetchCart();
    } catch (err) {
      toast.error('Failed to update cart');
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      await removeFromCart(cartItemId);
      toast.success('Item removed');
      fetchCart();
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const emptyCart = async () => {
    try {
      await clearCart();
      setItems([]);
      setTotal(0);
    } catch (err) { /* silent */ }
  };

  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, total, loading, cartCount, addItem, updateItem, removeItem, emptyCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
