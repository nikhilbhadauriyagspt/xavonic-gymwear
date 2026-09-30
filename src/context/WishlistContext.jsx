import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const WishlistContext = createContext(null);

const STORAGE_KEY = 'xavonic_wishlist_items_v1';

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    } catch (err) {
      console.warn('Could not save wishlist to localStorage:', err);
    }
  }, [wishlist]);

  const isWishlisted = (productId) => {
    if (!productId) return false;
    const strId = String(productId);
    return wishlist.some((item) => String(item.id) === strId || item.slug === strId);
  };

  const toggleWishlist = (product) => {
    if (!product) return;
    const strId = String(product.id || product.slug);

    setWishlist((prev) => {
      const exists = prev.some((item) => String(item.id) === strId || item.slug === strId);
      if (exists) {
        toast.info('Removed from Wishlist', {
          description: product.title || 'Product removed',
        });
        return prev.filter((item) => String(item.id) !== strId && item.slug !== strId);
      } else {
        toast.success('Saved to Wishlist ❤️', {
          description: product.title || 'Added to your favorites',
        });
        return [
          {
            id: product.id ? String(product.id) : product.slug,
            dbId: product.dbId || product.id,
            title: product.title,
            slug: product.slug,
            price: Number(product.price || 0),
            originalPrice: Number(product.originalPrice || product.price || 0),
            discount: product.discount || '',
            imageFront: product.imageFront || (product.gallery && product.gallery[0]) || '',
            imageBack: product.imageBack || (product.gallery && product.gallery[1]) || '',
            category: product.category || 'oversized',
            categoryName: product.categoryName || 'Activewear',
            sizes: product.sizes || ['S', 'M', 'L', 'XL'],
            colors: product.colors || [],
            rating: Number(product.rating || 4.9),
            reviewsCount: Number(product.reviewsCount || 36),
          },
          ...prev,
        ];
      }
    });
  };

  const removeFromWishlist = (productId, title) => {
    const strId = String(productId);
    setWishlist((prev) => prev.filter((item) => String(item.id) !== strId && item.slug !== strId));
    toast.info('Removed from Wishlist', {
      description: title || 'Item removed',
    });
  };

  const clearWishlist = () => {
    setWishlist([]);
    toast.info('Wishlist cleared');
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isWishlisted,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
