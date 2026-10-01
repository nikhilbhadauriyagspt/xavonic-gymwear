import React, { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';
import { ADMIN_API_BASE } from '../config/api';

import spotlightFront from '../assets/spotlight_front.jpg';
import heroCompression from '../assets/hero_compression.jpg';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('xavonic_cart_items');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  // Persist cart to localStorage whenever it changes
  React.useEffect(() => {
    try {
      localStorage.setItem('xavonic_cart_items', JSON.stringify(cartItems));
    } catch (_) {}
  }, [cartItems]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const clearCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem('xavonic_cart_items');
    } catch (_) {}
  };

  const addToCart = (product, size = 'L', qty = 1, color = '') => {
    const numericPrice = typeof product.price === 'number' 
      ? product.price 
      : parseInt(String(product.price).replace(/[^0-9]/g, ''), 10) || 1299;

    const numericOriginalPrice = product.originalPrice 
      ? (typeof product.originalPrice === 'number' 
          ? product.originalPrice 
          : parseInt(String(product.originalPrice).replace(/[^0-9]/g, ''), 10) || 0)
      : 0;

    const productImage = product.imageFront || product.image || product.src || spotlightFront;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.id === product.id && item.size === size
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + qty,
        };
        return updated;
      }

      return [
        {
          id: product.id,
          title: product.title || 'Performance Apparel',
          price: numericPrice,
          originalPrice: numericOriginalPrice,
          size: size,
          color: color || 'Core Drop',
          quantity: qty,
          image: productImage,
        },
        ...prev,
      ];
    });

    toast.success('Added to Bag', {
      description: `${product.title || 'Product'} · Size ${size}`,
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
  };

  // Global Offers Config State
  const [offersConfig, setOffersConfig] = useState({
    bundle_offers_enabled: true,
    bundle_buy_2_discount: 5,
    bundle_buy_3_discount: 10,
    bundle_buy_4_discount: 15,
    prepaid_discount_enabled: true,
    prepaid_discount_percent: 10,
    prepaid_discount_label: 'Extra 10% OFF on prepaid orders',
    new_user_discount_enabled: true,
    new_user_discount_amount: 150,
    free_shipping_threshold: 999,
    cart_tier_1_min: 1999,
    cart_tier_1_discount: 200,
    cart_tier_2_min: 2999,
    cart_tier_2_discount: 500,
    coupons: [
      { code: 'VIP10', discount_type: 'percent', value: 10, min_cart: 999 },
      { code: 'PUMP200', discount_type: 'flat', value: 200, min_cart: 1499 }
    ]
  });

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isPrepaidSelected, setIsPrepaidSelected] = useState(true);

  // Fetch live global offers from backend
  React.useEffect(() => {
    fetch(`${ADMIN_API_BASE}/settings/offers`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.config) setOffersConfig(data.config);
      })
      .catch(() => {});
  }, []);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const freeShippingGoal = offersConfig.free_shipping_threshold || 999;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingGoal) * 100);

  // Dynamic Volume Bundle Discount (Buy 2 = 5% off, Buy 3 = 10% off)
  let bundleDiscountAmount = 0;
  if (offersConfig.bundle_offers_enabled && totalItemsCount >= 2) {
    const percent = totalItemsCount === 2 
      ? offersConfig.bundle_buy_2_discount 
      : totalItemsCount === 3 
      ? offersConfig.bundle_buy_3_discount 
      : offersConfig.bundle_buy_4_discount;
    bundleDiscountAmount = Math.round((subtotal * (percent || 5)) / 100);
  }

  // Dynamic Cart Value Tier Discount (Above 1999/2999)
  let cartTierDiscount = 0;
  if (subtotal >= offersConfig.cart_tier_2_min) {
    cartTierDiscount = offersConfig.cart_tier_2_discount;
  } else if (subtotal >= offersConfig.cart_tier_1_min) {
    cartTierDiscount = offersConfig.cart_tier_1_discount;
  }

  // Coupon Discount
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percent') {
      couponDiscount = Math.round((subtotal * appliedCoupon.value) / 100);
    } else {
      couponDiscount = appliedCoupon.value;
    }
  }

  // Prepaid Discount (10% extra savings)
  let prepaidDiscount = 0;
  if (isPrepaidSelected && offersConfig.prepaid_discount_enabled) {
    const afterDiscounts = Math.max(0, subtotal - bundleDiscountAmount - cartTierDiscount - couponDiscount);
    prepaidDiscount = Math.round((afterDiscounts * (offersConfig.prepaid_discount_percent || 10)) / 100);
  }

  const totalDiscount = bundleDiscountAmount + cartTierDiscount + couponDiscount + prepaidDiscount;
  const finalTotal = Math.max(0, subtotal - totalDiscount);

  const applyCouponCode = (codeStr) => {
    const clean = codeStr.trim().toUpperCase();
    const found = (offersConfig.coupons || []).find(c => c.code === clean);
    if (!found) {
      toast.error('Invalid coupon code');
      return false;
    }
    if (subtotal < found.min_cart) {
      toast.error(`Coupon valid on orders above ₹${found.min_cart}`);
      return false;
    }
    setAppliedCoupon(found);
    toast.success(`Coupon ${found.code} applied!`);
    return true;
  };

  const removeAppliedCoupon = () => {
    setAppliedCoupon(null);
    toast.info('Coupon removed');
  };

  return (
    <CartContext.Provider
      value={{
        isCartOpen,
        openCart,
        closeCart,
        clearCart,
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        subtotal,
        totalItemsCount,
        freeShippingGoal,
        progressToFreeShipping,
        offersConfig,
        bundleDiscountAmount,
        cartTierDiscount,
        couponDiscount,
        prepaidDiscount,
        totalDiscount,
        finalTotal,
        appliedCoupon,
        applyCouponCode,
        removeAppliedCoupon,
        isPrepaidSelected,
        setIsPrepaidSelected,
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
