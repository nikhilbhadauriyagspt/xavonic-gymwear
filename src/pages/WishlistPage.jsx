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
  ShoppingBasket
} from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

export default function WishlistPage() {
  const { wishlist, wishlistCount, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart, openCart } = useCart();

  const [selectedSizes, setSelectedSizes] = useState({});
  const [selectedColors, setSelectedColors] = useState({});

  const handleSelectSize = (productId, size) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  };

  const handleSelectColor = (productId, color) => {
    setSelectedColors(prev => ({ ...prev, [productId]: color }));
  };

  const handleMoveToBag = (product) => {
    const size = selectedSizes[product.id] || product.sizes?.[0] || 'M';
    const color = selectedColors[product.id] || product.colors?.[0]?.name || 'Standard';

    addToCart(product, size, 1, color);
    removeFromWishlist(product.id, product.title);
    openCart();
    toast.success('Moved to Bag!', {
      description: `${product.title} (${size} / ${color})`,
    });
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
    toast.success('All items moved to your shopping bag!');
  };

  return (
    <div className="w-full bg-black text-zinc-100 font-sans min-h-screen selection:bg-red-600 selection:text-white pb-24">
      
      {/* 1. TOP BREADCRUMB & BANNER */}
      <div className="w-full border-b border-zinc-900 bg-zinc-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs text-zinc-400">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-white font-medium">My Wishlist</span>
          </nav>
          <span className="text-xs text-zinc-500 font-mono tracking-tight">
            {wishlistCount} {wishlistCount === 1 ? 'item saved' : 'items saved'}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        
        {/* 2. PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-zinc-900">
          <div>
            <div className="flex items-center gap-2 text-red-600 text-xs font-semibold uppercase tracking-widest mb-1.5">
              <Heart className="w-4 h-4 fill-red-600" />
              <span>Personal Vault</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white uppercase font-heading">
              My Saved Fits
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
              Items saved in your wishlist are saved locally on your device. Grab your favourite cuts before they run out of stock.
            </p>
          </div>

          {wishlistCount > 0 && (
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={clearWishlist}
                className="px-3.5 py-2 text-xs font-medium text-zinc-400 hover:text-red-500 hover:bg-zinc-900 border border-zinc-800 transition-all cursor-pointer"
              >
                Clear All
              </button>
              <button
                onClick={handleMoveAllToBag}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-red-900/20"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Move All to Bag</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. WISHLIST ITEMS GRID OR EMPTY STATE */}
        {wishlistCount === 0 ? (
          /* EMPTY STATE */
          <div className="py-24 text-center max-w-md mx-auto space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-500">
              <Heart className="w-9 h-9 stroke-[1.4] text-zinc-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Your wishlist is empty
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                You haven't saved any fits to your wishlist yet. Explore our high-performance activewear collection and pick your gear.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/collections"
                className="w-full sm:w-auto px-6 py-3 bg-white text-black hover:bg-zinc-200 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <span>Explore Collections</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/bestsellers"
                className="w-full sm:w-auto px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-medium uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-red-500" />
                <span>Shop Bestsellers</span>
              </Link>
            </div>
          </div>
        ) : (
          /* POPULATED WISHLIST GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-8">
            {wishlist.map((item) => {
              const activeSize = selectedSizes[item.id] || item.sizes?.[0] || 'M';
              const activeColor = selectedColors[item.id] || item.colors?.[0]?.name || 'Standard';
              const activeColorObj = item.colors?.find(c => c.name === activeColor);
              const displayImage = activeColorObj?.image || item.imageFront || (item.gallery && item.gallery[0]);

              return (
                <div 
                  key={item.id}
                  className="group relative bg-zinc-950 border border-zinc-850 hover:border-zinc-700 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Top Image Box */}
                  <div className="relative aspect-3/4 w-full bg-zinc-900 overflow-hidden">
                    <Link to={`/product/${item.slug || item.id}`} className="block w-full h-full">
                      <img
                        src={displayImage}
                        alt={item.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </Link>

                    {/* Discount & Rating Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 pointer-events-none">
                      {item.discount && (
                        <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                          {item.discount}
                        </span>
                      )}
                      <span className="bg-black/70 backdrop-blur-md text-zinc-200 text-[10px] font-semibold px-1.5 py-0.5 flex items-center gap-1 border border-zinc-800">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        <span>{item.rating || 4.9}</span>
                      </span>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromWishlist(item.id, item.title)}
                      className="absolute top-2.5 right-2.5 p-2 bg-black/70 backdrop-blur-md hover:bg-red-600 text-zinc-400 hover:text-white transition-all cursor-pointer border border-zinc-800 group/del"
                      title="Remove from wishlist"
                      aria-label="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Info & Options Box */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        <span className="uppercase tracking-wider font-mono">{item.categoryName || item.category}</span>
                      </div>

                      <Link 
                        to={`/product/${item.slug || item.id}`}
                        className="block font-semibold text-sm text-zinc-100 hover:text-red-500 transition-colors line-clamp-1"
                      >
                        {item.title}
                      </Link>

                      {/* Pricing */}
                      <div className="flex items-baseline gap-2 pt-0.5">
                        <span className="text-base font-bold text-white font-mono">
                          ₹{Number(item.price).toLocaleString('en-IN')}
                        </span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-xs text-zinc-500 line-through font-mono">
                            ₹{Number(item.originalPrice).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      {/* Color Options */}
                      {item.colors && item.colors.length > 1 && (
                        <div className="pt-2">
                          <span className="text-[10px] uppercase font-mono text-zinc-400 block mb-1.5">
                            Color: <span className="text-white">{activeColor}</span>
                          </span>
                          <div className="flex items-center gap-1.5">
                            {item.colors.map((c, cIdx) => (
                              <button
                                key={cIdx}
                                onClick={() => handleSelectColor(item.id, c.name)}
                                className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                                  activeColor === c.name 
                                    ? 'ring-2 ring-red-600 scale-110 border-white' 
                                    : 'border-zinc-700 opacity-70 hover:opacity-100'
                                }`}
                                style={{ backgroundColor: c.hex || '#111' }}
                                title={c.name}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Size Selector Pills */}
                      <div className="pt-1">
                        <span className="text-[10px] uppercase font-mono text-zinc-400 block mb-1.5">
                          Select Size: <span className="text-white">{activeSize}</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          {(item.sizes || ['S', 'M', 'L', 'XL']).map((size) => (
                            <button
                              key={size}
                              onClick={() => handleSelectSize(item.id, size)}
                              className={`flex-1 py-1 text-[11px] font-mono font-medium border transition-all cursor-pointer ${
                                activeSize === size
                                  ? 'bg-white text-black border-white font-bold'
                                  : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Move To Bag CTA */}
                    <button
                      onClick={() => handleMoveToBag(item)}
                      className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-red-950/40"
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
    </div>
  );
}
