import { createContext, useEffect, useState } from 'react';

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem('cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  function addToCart(product, quantity = 1) {
    console.log('[Cart] addToCart:', product, quantity);
    setCartItems((prev) => {
      const existing = prev.find((item) => item.PK === product.PK);
      if (existing) {
        return prev.map((item) =>
          item.PK === product.PK
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        );
      }
      return [...prev, { ...product, quantity: Math.min(quantity, product.stock) }];
    });
  }

  function updateQuantity(productPK, newQuantity) {
    setCartItems((prev) =>
      prev.map((item) =>
        item.PK === productPK
          ? { ...item, quantity: Math.min(Math.max(1, newQuantity), item.stock) }
          : item
      )
    );
  }

  function removeFromCart(productPK) {
    setCartItems((prev) => prev.filter((item) => item.PK !== productPK));
  }

  function clearCart() {
    setCartItems([]);
  }

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}
