import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  Star, 
  ChevronRight, 
  Sparkles,
  Check,
  Zap,
  Eye,
  X
} from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

export default function WishlistPage() {
  const { wishlist, wishlistCount, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart, openCart } = useCart();

  const [selectedSizes, setSelectedSizes] = useState({});
  const [selectedColors, setSelectedColors] = useState({});
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewSize, setQuickViewSize] = useState('M');
  const [quickViewColor, setQuickViewColor] = useState('');

  const handleSelectSize = (productId, size) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  };

  const handleSelectColor = (productId, colorName) => {
    setSelectedColors(prev => ({ ...prev, [productId]: colorName }));
  };

  const handleMoveToBag = (product) => {
    const size = selectedSizes[product.id] || product.sizes?.[0] || 'M';
    const color = selectedColors[product.id] || product.colors?.[0]?.name || 'Standard';

    addToCart(product, size, 1, color);
    removeFromWishlist(product.id, product.title);
    openCart();
    toast.success(`Moved to Bag: ${product.title} (${size})`);
  };

  const handleMoveAllToBag = () => {
    if (wishlist.length === 0) return;
    wishlist.forEach((product) => {
      const size = selectedSizes[product.id] || product.sizes?.[0] || 'M';
      const color = selectedColors[product.id] || product.colors?.[0]?.name || 'Standard';
      addToCart(product, size, 1, color);
    });
    clearWishlist();
    openCart();
    toast.success('All saved items moved to your cart!');
  };

  const openQuickViewModal = (product) => {
    setQuickViewProduct(product);
    setQuickViewSize(selectedSizes[product.id] || product.sizes?.[0] || 'M');
    setQuickViewColor(selectedColors[product.id] || product.colors?.[0]?.name || 'Standard');
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white pb-20">
      
      {/* 1. BREADCRUMB BAR */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
            <Link to="/" className="hover:text-neutral-900 transition-colors">Home</Link>
            <span className="text-neutral-300">/</span>
            <span className="font-medium text-neutral-900">Wishlist</span>
          </div>
          <span className="text-[11px] font-mono text-neutral-500">
            {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'} saved
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-[1240px] px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        
        {/* 2. HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-neutral-200">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-500 uppercase tracking-widest mb-1">
              <Heart className="w-3.5 h-3.5 text-red-600 fill-red-600" />
              <span>Saved Items</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold uppercase tracking-tight text-neutral-900">
              My Wishlist
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Review your favorite gym wear and training cuts. Move items directly into your bag.
            </p>
          </div>

          {wishlistCount > 0 && (
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={clearWishlist}
                className="h-9 px-3.5 text-xs font-medium text-neutral-600 hover:text-red-600 hover:bg-neutral-50 border border-neutral-300 transition-colors cursor-pointer rounded-xs"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={handleMoveAllToBag}
                className="h-9 px-4 bg-neutral-900 hover:bg-black text-white text-xs font-medium uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer rounded-xs shadow-xs"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Move All to Bag</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. EMPTY STATE */}
        {wishlistCount === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
              <Heart className="w-7 h-7 stroke-[1.5]" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold text-neutral-900 uppercase tracking-wide">
                Your wishlist is currently empty
              </h2>
              <p className="text-xs text-neutral-500 leading-relaxed max-w-sm mx-auto">
                Explore our compression wear, dropcut tees, and gym joggers. Click the heart icon to save items here.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <Link
                to="/collections"
                className="w-full sm:w-auto h-10 px-6 bg-neutral-900 hover:bg-black text-white text-xs font-medium uppercase tracking-wider transition-all flex items-center justify-center gap-2 rounded-xs"
              >
                <span>Explore Collections</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/bestsellers"
                className="w-full sm:w-auto h-10 px-5 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 text-xs font-medium uppercase tracking-wider transition-all flex items-center justify-center gap-2 rounded-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Bestsellers</span>
              </Link>
            </div>
          </div>
        ) : (
          /* 4. PRODUCT CARDS GRID (2 cols on mobile, 3 on tablet, 4 on desktop) */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6 pt-6 sm:pt-8">
            {wishlist.map((item) => {
              const activeSize = selectedSizes[item.id] || item.sizes?.[0] || 'M';
              const activeColor = selectedColors[item.id] || item.colors?.[0]?.name || 'Standard';
              const activeColorObj = item.colors?.find(c => c.name === activeColor);
              const frontImage = activeColorObj?.image || item.imageFront || (item.gallery && item.gallery[0]);
              const backImage = item.imageBack || (item.gallery && item.gallery[1]) || frontImage;
              const unitPrice = Number(item.price || 0);
              const originalPrice = Number(item.originalPrice || unitPrice);
              const productUrl = `/product/${item.slug || item.id}`;

              return (
                <div 
                  key={item.id}
                  className="group relative flex flex-col justify-between bg-white border border-neutral-200 hover:border-neutral-400 transition-all duration-200 rounded-none overflow-hidden shadow-2xs"
                >
                  {/* Top Image Section */}
                  <div className="relative aspect-[3/4] w-full bg-neutral-100 overflow-hidden">
                    <Link to={productUrl} className="block w-full h-full">
                      <img
                        src={frontImage}
                        alt={item.title}
                        className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      {backImage && backImage !== frontImage && (
                        <img
                          src={backImage}
                          alt={`${item.title} back`}
                          className="absolute inset-0 h-full w-full object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          loading="lazy"
                        />
                      )}
                    </Link>

                    {/* Top Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none z-10">
                      {item.discount && (
                        <span className="bg-neutral-900 text-white text-[9px] font-semibold px-1.5 py-0.5 uppercase tracking-wider">
                          {item.discount}
                        </span>
                      )}
                    </div>

                    {/* Rating Pill */}
                    <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-xs px-1.5 py-0.5 text-[10px] font-semibold text-neutral-800 shadow-xs">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{item.rating || 4.9}</span>
                    </div>

                    {/* Top Action Buttons (Remove from Wishlist & Quick View) */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
                      <button
                        type="button"
                        onClick={() => removeFromWishlist(item.id, item.title)}
                        className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/90 hover:bg-red-50 text-neutral-500 hover:text-red-600 backdrop-blur-xs border border-neutral-200 shadow-xs flex items-center justify-center transition-all cursor-pointer"
                        title="Remove from wishlist"
                        aria-label="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openQuickViewModal(item)}
                        className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/90 hover:bg-neutral-900 text-neutral-600 hover:text-white backdrop-blur-xs border border-neutral-200 shadow-xs flex items-center justify-center transition-all cursor-pointer hidden sm:flex"
                        title="Quick View"
                        aria-label="Quick View"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      {/* Category & Color Swatches */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 truncate">
                          {item.categoryName || item.category || 'Apparel'}
                        </span>
                        {item.colors && item.colors.length > 1 && (
                          <div className="flex items-center gap-1 shrink-0">
                            {item.colors.slice(0, 4).map((c, cIdx) => (
                              <button
                                key={cIdx}
                                type="button"
                                onClick={() => handleSelectColor(item.id, c.name)}
                                className={`w-2.5 h-2.5 rounded-full border transition-transform ${
                                  activeColor === c.name 
                                    ? 'ring-1 ring-neutral-900 scale-125 border-white' 
                                    : 'border-neutral-300 opacity-70 hover:opacity-100'
                                }`}
                                style={{ backgroundColor: c.hex || '#000' }}
                                title={c.name}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <Link 
                        to={productUrl}
                        className="block font-medium text-xs sm:text-[13px] text-neutral-900 hover:text-black line-clamp-1 transition-colors"
                      >
                        {item.title}
                      </Link>

                      {/* Pricing */}
                      <div className="flex items-baseline gap-2 pt-0.5">
                        <span className="text-xs sm:text-sm font-semibold text-neutral-950 font-mono">
                          ₹{unitPrice.toLocaleString('en-IN')}.00
                        </span>
                        {originalPrice > unitPrice && (
                          <span className="text-[11px] text-neutral-400 line-through font-mono">
                            ₹{originalPrice.toLocaleString('en-IN')}.00
                          </span>
                        )}
                      </div>

                      {/* Size Selector Strip */}
                      <div className="pt-1.5">
                        <div className="flex items-center justify-between text-[10px] text-neutral-500 mb-1">
                          <span>Size: <strong>{activeSize}</strong></span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {(item.sizes || ['S', 'M', 'L', 'XL']).map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => handleSelectSize(item.id, sz)}
                              className={`min-w-6 h-6 px-1.5 text-[10px] font-medium border transition-all cursor-pointer ${
                                activeSize === sz
                                  ? 'border-neutral-900 bg-neutral-900 text-white shadow-2xs font-semibold'
                                  : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-400'
                              }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Move to Bag Button */}
                    <button
                      type="button"
                      onClick={() => handleMoveToBag(item)}
                      className="w-full h-9 bg-neutral-900 hover:bg-black text-white text-[11px] font-medium uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer rounded-none active:scale-[0.99] shadow-2xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Move to Bag</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* QUICK VIEW MODAL */}
      {quickViewProduct && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setQuickViewProduct(null)}
        >
          <div 
            className="relative w-full max-w-lg bg-white p-5 sm:p-6 border border-neutral-200 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Quick Product View
              </span>
              <button
                type="button"
                onClick={() => setQuickViewProduct(null)}
                className="text-neutral-400 hover:text-neutral-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-4">
              <img
                src={quickViewProduct.imageFront || (quickViewProduct.colors?.[0]?.image)}
                alt={quickViewProduct.title}
                className="w-24 h-32 object-cover bg-neutral-100 border border-neutral-200 shrink-0"
              />
              <div className="space-y-1.5 min-w-0">
                <h3 className="font-semibold text-sm text-neutral-900">{quickViewProduct.title}</h3>
                <div className="text-xs font-semibold text-neutral-950 font-mono">
                  ₹{Number(quickViewProduct.price || 0).toLocaleString('en-IN')}.00
                </div>
                <p className="text-[11px] text-neutral-500 line-clamp-2">
                  {quickViewProduct.description || 'Engineered athletic performance wear.'}
                </p>

                {/* Size options */}
                <div className="pt-2">
                  <span className="text-[10px] uppercase font-semibold text-neutral-600 block mb-1">
                    Select Size:
                  </span>
                  <div className="flex gap-1.5">
                    {(quickViewProduct.sizes || ['S', 'M', 'L', 'XL']).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setQuickViewSize(sz)}
                        className={`h-7 px-2.5 text-xs font-medium border ${
                          quickViewSize === sz
                            ? 'bg-neutral-900 text-white border-neutral-900'
                            : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-900'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setQuickViewProduct(null)}
                className="flex-1 h-10 border border-neutral-300 text-xs font-medium uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleMoveToBag({ ...quickViewProduct, selectedSize: quickViewSize });
                  setQuickViewProduct(null);
                }}
                className="flex-1 h-10 bg-neutral-900 hover:bg-black text-white text-xs font-medium uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Move to Bag</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
