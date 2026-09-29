import React, { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';

import spotlightFront from '../assets/spotlight_front.jpg';
import heroCompression from '../assets/hero_compression.jpg';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([
    {
      id: 'cart-1',
      title: 'Acid Wash Heavyweight Oversized Tee',
      price: 1499,
      originalPrice: 2299,
      size: 'L',
      color: 'Washed Onyx',
      quantity: 1,
      image: spotlightFront,
    },
    {
      id: 'cart-2',
      title: 'Pro Muscle-Lock Compression Shirt',
      price: 1299,
      originalPrice: 1899,
      size: 'M',
      color: 'Stealth Black',
      quantity: 1,
      image: heroCompression,
    },
  ]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (product, size = 'L') => {
    const existingIndex = cartItems.findIndex(
      (item) => item.id === product.id && item.size === size
    );

    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += 1;
      setCartItems(updated);
    } else {
      const newItem = {
        id: product.id,
        title: product.title,
        price: parseInt(product.price.replace(/[^0-9]/g, ''), 10) || 1299,
        originalPrice: parseInt(product.originalPrice?.replace(/[^0-9]/g, ''), 10) || 1899,
        size: size,
        color: 'Selected Color',
        quantity: 1,
        image: product.imageFront || product.image || spotlightFront,
      };
      setCartItems((prev) => [newItem, ...prev]);
    }

    toast.success('Added to Bag', {
      description: `${product.title} (Size: ${size})`,
    });
    openCart();
  };

  const updateQuantity = (id, size, change) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id && item.size === size) {
            const newQty = item.quantity + change;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (id, size) => {
    setCartItems((prev) => prev.filter((item) => !(item.id === id && item.size === size)));
    toast('Item removed from Bag');
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const freeShippingGoal = 999;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingGoal) * 100);

  return (
    <CartContext.Provider
      value={{
        isCartOpen,
        openCart,
        closeCart,
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        subtotal,
        totalItemsCount,
        freeShippingGoal,
        progressToFreeShipping,
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
