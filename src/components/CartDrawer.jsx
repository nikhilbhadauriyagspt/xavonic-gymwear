import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const {
    isCartOpen,
    closeCart,
    cartItems,
    updateQuantity,
    removeFromCart,
    subtotal,
    freeShippingGoal,
    progressToFreeShipping,
  } = useCart();

  // Prevent background scroll when cart drawer is open
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

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end font-sans select-none">
          
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeCart}
            className="absolute inset-0 bg-black/65 backdrop-blur-xs cursor-pointer"
          />

          {/* Slide-over Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="relative w-full max-w-[420px] h-full bg-white text-zinc-900 shadow-2xl flex flex-col z-10 rounded-none overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* 1. Header Bar */}
            <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-red-600" />
                <h2 className="text-base font-semibold text-zinc-950 tracking-tight">
                  Your Bag ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
                </h2>
              </div>

              <button
                onClick={closeCart}
                className="p-1.5 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-none transition-colors cursor-pointer"
                aria-label="Close Bag"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. Free Shipping Progress Meter */}
            <div className="px-5 py-3 bg-zinc-50 border-b border-zinc-200/80 shrink-0 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-red-600" />
                  {amountNeeded > 0 ? (
                    <span className="text-zinc-700">
                      Add <strong className="text-red-600">₹{amountNeeded}</strong> more for <strong className="text-zinc-950">Free Express Shipping</strong>
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <span>🎉 You've unlocked Free Express Shipping!</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Meter bar */}
              <div className="w-full h-1.5 bg-zinc-200 overflow-hidden rounded-none">
                <div
                  className={`h-full transition-all duration-500 ease-out ${
                    amountNeeded <= 0 ? 'bg-emerald-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>

            {/* 3. Scrollable Product Items List */}
            <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-zinc-100">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-14 h-14 bg-zinc-100 flex items-center justify-center text-zinc-400">
                    <ShoppingBag className="w-7 h-7 stroke-[1.5]" />
                  </div>
                  <h3 className="text-base font-semibold text-zinc-950">Your bag is empty</h3>
                  <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
                    Explore our engineered activewear and elevate your training fit today.
                  </p>
                  <button
                    onClick={closeCart}
                    className="mt-2 px-6 py-2.5 bg-zinc-950 hover:bg-red-600 text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer rounded-none"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="py-4 flex gap-3.5 items-start first:pt-0 last:pb-0">
                    
                    {/* Item Thumbnail */}
                    <div className="relative w-20 h-26 bg-zinc-100 shrink-0 overflow-hidden rounded-none border border-zinc-200/60">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-medium text-zinc-900 leading-snug line-clamp-2">
                          {item.title}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id, item.size)}
                          className="text-zinc-400 hover:text-red-600 p-0.5 transition-colors cursor-pointer shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Size & Color Info */}
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                        <span className="bg-zinc-100 px-1.5 py-0.5 font-medium text-zinc-800">
                          Size: {item.size}
                        </span>
                      </div>

                      {/* Price & Quantity Controls */}
                      <div className="flex items-center justify-between pt-2">
                        {/* Qty Box */}
                        <div className="flex items-center border border-zinc-200 bg-zinc-50 rounded-none">
                          <button
                            onClick={() => updateQuantity(item.id, item.size, -1)}
                            className="w-6 h-6 flex items-center justify-center text-zinc-600 hover:text-black hover:bg-zinc-200/70 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-semibold text-zinc-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.size, 1)}
                            className="w-6 h-6 flex items-center justify-center text-zinc-600 hover:text-black hover:bg-zinc-200/70 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <span className="text-xs font-semibold text-zinc-950">
                            ₹{item.price * item.quantity}
                          </span>
                          {item.originalPrice && (
                            <span className="block text-[10px] text-zinc-400 line-through">
                              ₹{item.originalPrice * item.quantity}
                            </span>
                          )}
                        </div>
                      </div>

                    </div>

                  </div>
                ))
              )}
            </div>

            {/* 4. Drawer Footer / Checkout Area */}
            {cartItems.length > 0 && (
              <div className="border-t border-zinc-200 p-5 bg-white shrink-0 space-y-3">
                {/* Subtotal */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-600">Subtotal</span>
                  <span className="text-base font-bold text-zinc-950">₹{subtotal}</span>
                </div>

                <p className="text-[11px] text-zinc-400 leading-tight">
                  Taxes and shipping calculated at checkout. Free 7-day exchange included.
                </p>

                {/* Instant Checkout Button */}
                <button
                  onClick={() => {
                    toast.success('Proceeding to Secure Checkout...', {
                      description: `Total: ₹${subtotal} · 256-bit Encrypted Checkout`,
                    });
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-[0.16em] transition-colors rounded-none cursor-pointer shadow-none"
                >
                  <span>Proceed To Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Trust Seal */}
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 pt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Guaranteed Safe & Secure Checkout</span>
                </div>
              </div>
            )}

          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
}
