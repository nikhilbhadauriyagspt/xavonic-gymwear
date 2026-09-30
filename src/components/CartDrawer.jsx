import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const navigate = useNavigate();
  const {
    isCartOpen,
    closeCart,
    cartItems,
    updateQuantity,
    removeFromCart,
    subtotal,
    totalItemsCount,
    freeShippingGoal,
    progressToFreeShipping,
    bundleDiscountAmount,
    cartTierDiscount,
    couponDiscount,
    prepaidDiscount,
    finalTotal,
    appliedCoupon,
    applyCouponCode,
    removeAppliedCoupon,
  } = useCart();

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  const amountNeeded = freeShippingGoal - subtotal;
  const isFreeShippingUnlocked = amountNeeded <= 0;

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end font-sans select-none">
          
          {/* Subtle Dim Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCart}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] cursor-pointer"
          />

          {/* Slide-over Minimal Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full max-w-[400px] h-full bg-white text-zinc-900 shadow-xl flex flex-col z-10 rounded-none overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* 1. Ultra Clean Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-zinc-100 bg-white shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-tight text-zinc-950">
                  Cart
                </span>
                <span className="text-[11px] font-medium text-zinc-400">
                  ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
                </span>
              </div>

              <button
                onClick={closeCart}
                className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-950 transition-colors cursor-pointer rounded-none -mr-2"
                aria-label="Close Bag"
              >
                <X className="w-4 h-4 stroke-[1.8]" />
              </button>
            </div>

            {/* 2. Micro Free Shipping Indicator (Clean & Minimal) */}
            <div className="px-6 py-2.5 bg-zinc-50/80 border-b border-zinc-100 shrink-0 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-zinc-600">
                  <Truck className="w-3.5 h-3.5 text-zinc-800 shrink-0" />
                  {isFreeShippingUnlocked ? (
                    <span className="font-medium text-emerald-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      Free Express Shipping unlocked
                    </span>
                  ) : (
                    <span>
                      Add <span className="font-semibold text-zinc-950">₹{amountNeeded}</span> for free delivery
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium text-zinc-400">
                  ₹{freeShippingGoal}
                </span>
              </div>

              {/* Minimal Line Meter */}
              <div className="w-full h-[3px] bg-zinc-200/80 overflow-hidden rounded-none">
                <div
                  className={`h-full transition-all duration-500 ease-out ${
                    isFreeShippingUnlocked ? 'bg-emerald-600' : 'bg-zinc-950'
                  }`}
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>

            {/* 3. Products List (Frameless, Non-bulky Cards) */}
            <div className="flex-1 overflow-y-auto px-6 py-2 divide-y divide-zinc-100">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <p className="text-sm font-medium text-zinc-900">Your bag is currently empty.</p>
                  <p className="text-xs text-zinc-400 max-w-[220px] leading-relaxed">
                    Discover new drops and premium pump cover essentials.
                  </p>
                  <button
                    onClick={closeCart}
                    className="mt-3 px-6 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer rounded-none"
                  >
                    Explore Drops
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="py-4 flex gap-3.5 items-start">
                    
                    {/* Item Thumbnail (Sharp & Crisp) */}
                    <div className="relative w-16 h-20 bg-zinc-100 shrink-0 overflow-hidden rounded-none">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      
                      {/* Title & Delete button */}
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-normal text-zinc-900 leading-snug line-clamp-1">
                          {item.title}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id, item.size)}
                          className="text-zinc-300 hover:text-red-600 p-0.5 transition-colors cursor-pointer shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                        </button>
                      </div>

                      {/* Size pill text */}
                      <p className="text-[11px] text-zinc-400">
                        Size: <span className="text-zinc-700 font-medium">{item.size}</span>
                      </p>

                      {/* Quantity & Price Row */}
                      <div className="flex items-center justify-between pt-1.5">
                        
                        {/* Minimal Stepper */}
                        <div className="flex items-center border border-zinc-200 bg-white">
                          <button
                            onClick={() => updateQuantity(item.id, item.size, -1)}
                            className="w-5 h-5 flex items-center justify-center text-zinc-500 hover:text-black hover:bg-zinc-100 cursor-pointer transition-colors"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="w-6 text-center text-[11px] font-medium text-zinc-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.size, 1)}
                            className="w-5 h-5 flex items-center justify-center text-zinc-500 hover:text-black hover:bg-zinc-100 cursor-pointer transition-colors"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right flex items-center gap-1.5">
                          {item.originalPrice > item.price && (
                            <span className="text-[10px] text-zinc-300 line-through">
                              ₹{item.originalPrice * item.quantity}
                            </span>
                          )}
                          <span className="text-xs font-semibold text-zinc-950">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>

                      </div>

                    </div>

                  </div>
                ))
              )}
            </div>

            {/* 4. Drawer Footer / Clean Checkout Area with Global Offers Breakdown */}
            {cartItems.length > 0 && (
              <div className="border-t border-zinc-200 p-5 bg-[#fafafa] shrink-0 space-y-3 font-sans">
                
                {/* Coupon Code Input */}
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Enter Coupon Code (e.g. VIP10)"
                    id="cart-coupon-input"
                    className="flex-1 bg-white border border-zinc-200 focus:border-zinc-900 px-3 py-1.5 text-xs uppercase font-mono outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = e.target.value;
                        if (val) applyCouponCode(val);
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('cart-coupon-input');
                      if (input && input.value) applyCouponCode(input.value);
                    }}
                    className="px-3.5 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-none cursor-pointer"
                  >
                    Apply
                  </button>
                </div>

                {appliedCoupon && (
                  <div className="flex items-center justify-between text-[11px] bg-emerald-50 text-emerald-800 px-2.5 py-1 border border-emerald-200">
                    <span>Coupon <strong>{appliedCoupon.code}</strong> Applied</span>
                    <button onClick={removeAppliedCoupon} className="underline text-emerald-900 font-medium">Remove</button>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="space-y-1.5 text-xs pt-1 border-t border-zinc-200 text-zinc-600">
                  <div className="flex items-center justify-between">
                    <span>Subtotal ({totalItemsCount} items)</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}.00</span>
                  </div>

                  {bundleDiscountAmount > 0 && (
                    <div className="flex items-center justify-between text-emerald-700 font-medium">
                      <span>Volume Bundle Savings</span>
                      <span>-₹{bundleDiscountAmount.toLocaleString('en-IN')}.00</span>
                    </div>
                  )}

                  {cartTierDiscount > 0 && (
                    <div className="flex items-center justify-between text-emerald-700 font-medium">
                      <span>Order Value Tier Discount</span>
                      <span>-₹{cartTierDiscount.toLocaleString('en-IN')}.00</span>
                    </div>
                  )}

                  {couponDiscount > 0 && (
                    <div className="flex items-center justify-between text-emerald-700 font-medium">
                      <span>Coupon Discount</span>
                      <span>-₹{couponDiscount.toLocaleString('en-IN')}.00</span>
                    </div>
                  )}

                  {prepaidDiscount > 0 && (
                    <div className="flex items-center justify-between text-emerald-700 font-medium">
                      <span>Prepaid Instant Savings</span>
                      <span>-₹{prepaidDiscount.toLocaleString('en-IN')}.00</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-200 text-zinc-950 font-semibold text-sm">
                    <span>Final Total</span>
                    <span>₹{finalTotal.toLocaleString('en-IN')}.00</span>
                  </div>
                </div>

                {/* Main Minimal Checkout Button */}
                <button
                  onClick={() => {
                    closeCart();
                    navigate('/checkout');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-950 hover:bg-red-600 text-white text-xs font-medium uppercase tracking-[0.15em] transition-colors rounded-none cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {/* Subtle Trust Line */}
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-400">
                  <ShieldCheck className="w-3 h-3 text-zinc-400" />
                  <span>Extra 10% OFF on UPI & Card Payments</span>
                </div>

              </div>
            )}

          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
}
