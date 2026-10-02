import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, CheckCircle, X } from 'lucide-react';
import { fetchRecentSalesActivity } from '../services/orderService';
import { useLocation } from 'react-router-dom';

export default function LiveSalesPopup() {
  const location = useLocation();
  const [activities, setActivities] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissedByUser, setIsDismissedByUser] = useState(false);

  // Do not show on Checkout page or Admin portal to prevent distraction
  const isExcludedPage = location.pathname.startsWith('/checkout') || location.pathname.startsWith('/admin');

  useEffect(() => {
    fetchRecentSalesActivity().then((res) => {
      if (res && res.success && res.activities?.length > 0) {
        setActivities(res.activities);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (isDismissedByUser || isExcludedPage || activities.length === 0) {
      setIsVisible(false);
      return;
    }

    // Initial popup after 6 seconds
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 6000);

    // Auto rotate every 18 seconds
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % activities.length);
        setIsVisible(true);
      }, 4000);
    }, 20000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [activities, isDismissedByUser, isExcludedPage]);

  if (isExcludedPage || isDismissedByUser || activities.length === 0) return null;

  const currentItem = activities[currentIndex] || activities[0];

  return (
    <div className="fixed bottom-4 left-4 z-50 pointer-events-none select-none max-w-[340px] sm:max-w-[360px]">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="pointer-events-auto bg-white/95 backdrop-blur-md border border-neutral-200/90 shadow-lg rounded-xs p-3 flex items-center gap-3 relative overflow-hidden ring-1 ring-black/5"
          >
            {/* Left Image / Product Icon */}
            <div className="relative h-12 w-10 shrink-0 overflow-hidden bg-neutral-100 rounded-xs border border-neutral-200 flex items-center justify-center">
              {currentItem.productImage ? (
                <img
                  src={currentItem.productImage}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <ShoppingBag className="h-5 w-5 text-neutral-600" />
              )}
              <span className="absolute -bottom-1 -right-1 grid h-3.5 w-3.5 place-items-center rounded-full bg-emerald-500 text-white">
                <CheckCircle className="h-2.5 w-2.5" />
              </span>
            </div>

            {/* Notification Content */}
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded-2xs border border-emerald-200">
                  Verified Order
                </span>
                <span className="text-[10px] text-neutral-400 font-normal">
                  {currentItem.timeAgo || 'Just now'}
                </span>
              </div>
              <p className="text-xs font-semibold text-neutral-900 truncate mt-0.5">
                {currentItem.customerName}
              </p>
              <p className="text-[11px] text-neutral-500 truncate font-normal">
                Purchased <span className="font-medium text-neutral-800">{currentItem.productTitle}</span>
              </p>
            </div>

            {/* Dismiss Button */}
            <button
              type="button"
              onClick={() => setIsDismissedByUser(true)}
              className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-700 p-0.5 rounded-full transition-colors cursor-pointer"
              title="Close notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
