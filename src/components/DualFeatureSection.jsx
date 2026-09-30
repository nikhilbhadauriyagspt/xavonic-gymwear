import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Heart, Eye, ArrowRight, ChevronLeft, ChevronRight, X, ShoppingBag, Plus, Minus } from 'lucide-react';

import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { fetchLiveProducts, fetchDualFeaturedCategories } from '../services/productService';
import { allProducts as fallbackProducts, allCategories as fallbackCategories } from '../data/productsData';

// Reusable Dynamic Category Product Slider Row
function CategoryProductSliderRow({
  category,
  products,
  openQuickView,
  handleQuickAdd,
}) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const sliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -360, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 360, behavior: 'smooth' });
    }
  };

  const categoryName = category.name || category.title || 'Collection';
  const categoryKicker = category.kicker_title || category.subtitle || 'Featured Line';
  const categorySlug = category.slug || 'all';

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Dynamic Left-Aligned Category Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 pb-5">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-red-600">
            {categoryKicker}
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-medium tracking-tight text-zinc-950">
            Shop {categoryName}
          </h2>
        </div>

        <Link
          to={`/collections/${categorySlug}`}
          className="group inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-zinc-700 hover:text-red-600 transition-colors cursor-pointer"
        >
          <span>View All {categoryName}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Product Horizontal Slider Container */}
      <div className="group/slider relative w-full">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/85 hover:bg-zinc-950 text-zinc-900 hover:text-white backdrop-blur-md border border-white/80 shadow-md flex items-center justify-center opacity-0 group-hover/slider:opacity-100 -translate-x-3 group-hover/slider:translate-x-0 transition-all duration-300 cursor-pointer"
            aria-label={`Previous ${categoryName}`}
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
          </button>
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/85 hover:bg-zinc-950 text-zinc-900 hover:text-white backdrop-blur-md border border-white/80 shadow-md flex items-center justify-center opacity-0 group-hover/slider:opacity-100 translate-x-3 group-hover/slider:translate-x-0 transition-all duration-300 cursor-pointer"
            aria-label={`Next ${categoryName}`}
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
          </button>
        )}

        {/* Horizontal Slider Track */}
        <div
          ref={sliderRef}
          onScroll={checkScroll}
          className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth pb-4 pt-1 px-1 scrollbar-none snap-x snap-mandatory"
        >
          {products.map((product) => {
            const wishlisted = isWishlisted(product.id || product.slug);
            const frontImg = product.imageFront || product.colors?.[0]?.image || product.gallery?.[0];
            const backImg = product.imageBack || product.gallery?.[1] || frontImg;
            const priceFormatted = typeof product.price === 'number' ? `₹${product.price.toLocaleString('en-IN')}` : product.price;
            const origPriceFormatted = product.originalPrice ? (typeof product.originalPrice === 'number' ? `₹${product.originalPrice.toLocaleString('en-IN')}` : product.originalPrice) : null;
            const productUrl = `/product/${product.slug || product.id}`;

            return (
              <div
                key={product.id || product.slug}
                className="group/card relative flex flex-col shrink-0 w-[270px] sm:w-[300px] lg:w-[320px] bg-transparent rounded-none overflow-hidden snap-start"
              >
                {/* Image Container with Seamless Dual Hover */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-100">
                  {/* Clickable Image Link to PDP */}
                  <Link to={productUrl} className="block w-full h-full">
                    <img
                      src={frontImg}
                      alt={product.title}
                      className="absolute inset-0 h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <img
                      src={backImg}
                      alt={`${product.title} Alternate`}
                      className="absolute inset-0 h-full w-full object-cover object-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 ease-out"
                    />
                  </Link>

                  {/* Wishlist & Quick View Icons on Hover */}
                  <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1.5 opacity-0 translate-x-2 group-hover/card:opacity-100 group-hover/card:translate-x-0 transition-all duration-200">
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all cursor-pointer ${
                        wishlisted
                          ? 'bg-red-600 text-white'
                          : 'bg-white/90 text-zinc-700 hover:text-red-600 hover:bg-white shadow-xs'
                      }`}
                      title="Save to Wishlist"
                      aria-label="Save to Wishlist"
                    >
                      <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-white' : ''}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => openQuickView(product)}
                      className="w-8 h-8 rounded-full bg-white/90 text-zinc-700 hover:text-red-600 hover:bg-white flex items-center justify-center backdrop-blur-sm shadow-xs transition-all cursor-pointer"
                      title="Quick View"
                      aria-label="Quick View"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Quick Size Bar (Slide up on hover) */}
                  <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full group-hover/card:translate-y-0 transition-transform duration-200 bg-white/95 p-2">
                    <div className="flex items-center justify-center gap-1">
                      {(product.sizes || ['S', 'M', 'L', 'XL']).map((size) => (
                        <button
                          key={size}
                          onClick={() => handleQuickAdd(product, size)}
                          className="flex-1 py-1 bg-zinc-100 hover:bg-zinc-950 text-zinc-800 hover:text-white text-[10px] font-medium transition-colors cursor-pointer rounded-none"
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="pt-3 pb-1 space-y-1.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    {product.colors && product.colors.length > 0 && (
                      <div className="flex items-center gap-1">
                        {product.colors.map((hexOrObj, cIdx) => {
                          const hex = typeof hexOrObj === 'string' ? hexOrObj : hexOrObj.hex;
                          return (
                            <span
                              key={cIdx}
                              className="w-2.5 h-2.5 rounded-full border border-zinc-300 inline-block"
                              style={{ backgroundColor: hex }}
                            />
                          );
                        })}
                      </div>
                    )}

                    {/* Clickable Title */}
                    <Link to={productUrl} className="block">
                      <h3 className="text-[13px] font-normal text-zinc-900 group-hover/card:text-red-600 transition-colors line-clamp-1">
                        {product.title}
                      </h3>
                    </Link>
                  </div>

                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-[13px] font-semibold text-zinc-950">
                      {priceFormatted}
                    </span>
                    {origPriceFormatted && (
                      <span className="text-[11px] text-zinc-400 line-through">
                        {origPriceFormatted}
                      </span>
                    )}
                    {product.discount && (
                      <span className="text-[10px] font-medium text-red-600 ml-auto">
                        {product.discount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function DualFeatureSection() {
  const { addToCart, openCart } = useCart();
  const [allLiveProducts, setAllLiveProducts] = useState(fallbackProducts);
  const [featuredCategories, setFeaturedCategories] = useState([]);

  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewSize, setQuickViewSize] = useState('L');
  const [quickViewQty, setQuickViewQty] = useState(1);
  const [quickViewActiveImg, setQuickViewActiveImg] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [liveProds, dualCats] = await Promise.all([
          fetchLiveProducts(),
          fetchDualFeaturedCategories(),
        ]);
        if (isMounted) {
          if (liveProds && liveProds.length > 0) setAllLiveProducts(liveProds);
          if (dualCats && dualCats.length > 0) {
            setFeaturedCategories(dualCats);
          } else {
            // Default 2 categories if none marked
            setFeaturedCategories([
              { name: '5" Training Shorts', slug: 'shorts', kicker_title: 'Bottomwear Line' },
              { name: 'Oversized T-Shirts', slug: 'oversized', kicker_title: 'Heavyweight Fits' },
            ]);
          }
        }
      } catch (err) {
        console.warn('Could not load dynamic DualFeatureSection data:', err);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  const handleQuickAdd = (product, size) => {
    addToCart(product, size, 1, product.colors?.[0]?.name || 'Standard');
    openCart();
  };

  const openQuickView = (product) => {
    setQuickViewProduct(product);
    setQuickViewSize(product.sizes?.[0] || 'M');
    setQuickViewQty(1);
    setQuickViewActiveImg(0);
  };

  const closeQuickView = () => {
    setQuickViewProduct(null);
  };

  // Group products for each featured category
  const categoriesWithProducts = useMemo(() => {
    const list = featuredCategories.length > 0 ? featuredCategories : [
      { name: '5" Training Shorts', slug: 'shorts', kicker_title: 'Bottomwear Line' },
      { name: 'Oversized T-Shirts', slug: 'oversized', kicker_title: 'Heavyweight Fits' },
    ];

    return list.map((cat) => {
      const prods = allLiveProducts.filter(
        (p) => p.category === cat.slug || p.category_slug === cat.slug
      );
      return {
        category: cat,
        products: prods.length > 0 ? prods : allLiveProducts.slice(0, 5),
      };
    });
  }, [featuredCategories, allLiveProducts]);

  return (
    <section className="w-full bg-white text-zinc-950 py-14 sm:py-20 px-4 sm:px-8 lg:px-12 border-b border-zinc-200">
      <div className="w-full space-y-16 sm:space-y-24">
        {categoriesWithProducts.map(({ category, products }, idx) => (
          <CategoryProductSliderRow
            key={category.id || category.slug || idx}
            category={category}
            products={products}
            openQuickView={openQuickView}
            handleQuickAdd={handleQuickAdd}
          />
        ))}
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeQuickView}
        >
          <div 
            className="relative w-full max-w-2xl bg-white rounded-none overflow-hidden p-6 sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeQuickView}
              className="absolute top-4 right-4 p-1.5 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded-none transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 items-center">
              <div className="space-y-2">
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-100 rounded-none">
                  <img
                    src={quickViewActiveImg === 0 ? (quickViewProduct.imageFront || quickViewProduct.gallery?.[0]) : (quickViewProduct.imageBack || quickViewProduct.gallery?.[1] || quickViewProduct.imageFront)}
                    alt={quickViewProduct.title}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                {quickViewProduct.gallery && quickViewProduct.gallery.length > 1 && (
                  <div className="flex gap-2">
                    {quickViewProduct.gallery.slice(0, 4).map((imgUrl, gIdx) => (
                      <button
                        key={gIdx}
                        onClick={() => setQuickViewActiveImg(gIdx)}
                        className={`h-14 w-11 border overflow-hidden cursor-pointer ${
                          quickViewActiveImg === gIdx ? 'border-red-600 ring-1 ring-red-600' : 'border-zinc-200'
                        }`}
                      >
                        <img src={imgUrl} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3.5">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-semibold text-red-600 uppercase tracking-widest">
                    Quick View
                  </span>
                  <h3 className="text-lg sm:text-xl font-semibold text-zinc-950 leading-snug">
                    {quickViewProduct.title}
                  </h3>
                  <div className="flex items-center gap-2.5 pt-0.5">
                    <span className="text-xl font-bold text-zinc-950">
                      ₹{Number(quickViewProduct.price).toLocaleString('en-IN')}
                    </span>
                    {quickViewProduct.originalPrice && (
                      <span className="text-xs text-zinc-400 line-through">
                        ₹{Number(quickViewProduct.originalPrice).toLocaleString('en-IN')}
                      </span>
                    )}
                    {quickViewProduct.discount && (
                      <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5">
                        {quickViewProduct.discount}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed line-clamp-3">
                  {quickViewProduct.description || quickViewProduct.desc || 'High-performance gymwear built for heavy workouts and aesthetic streetwear.'}
                </p>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-zinc-900">Select Size: {quickViewSize}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(quickViewProduct.sizes || ['S', 'M', 'L', 'XL']).map((size) => (
                      <button
                        key={size}
                        onClick={() => setQuickViewSize(size)}
                        className={`h-8 min-w-[34px] px-2 text-xs font-medium transition-colors cursor-pointer rounded-none ${
                          quickViewSize === size
                            ? 'bg-zinc-950 text-white'
                            : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-b border-zinc-100 py-2.5">
                  <span className="text-xs font-semibold text-zinc-900">Quantity</span>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setQuickViewQty(Math.max(1, quickViewQty - 1))}
                      className="w-6 h-6 flex items-center justify-center bg-zinc-100 text-zinc-600 hover:text-black cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-semibold min-w-3 text-center">{quickViewQty}</span>
                    <button
                      onClick={() => setQuickViewQty(quickViewQty + 1)}
                      className="w-6 h-6 flex items-center justify-center bg-zinc-100 text-zinc-600 hover:text-black cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      handleQuickAdd(quickViewProduct, quickViewSize);
                      closeQuickView();
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wider transition-colors rounded-none cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add To Bag</span>
                  </button>
                  <Link
                    to={`/product/${quickViewProduct.slug || quickViewProduct.id}`}
                    onClick={closeQuickView}
                    className="px-4 flex items-center justify-center border border-zinc-900 hover:bg-zinc-900 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors"
                  >
                    Details
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </section>
  );
}
