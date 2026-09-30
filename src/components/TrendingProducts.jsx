import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Eye, X, ShoppingBag, Plus, Minus, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import { fetchLiveProducts, fetchLiveCategories } from '../services/productService';
import { allProducts as defaultLocalProducts, allCategories as defaultLocalCategories } from '../data/productsData';

export default function TrendingProducts() {
  const [activeTab, setActiveTab] = useState('all');
  const [wishlist, setWishlist] = useState([]);
  const [productsList, setProductsList] = useState(defaultLocalProducts);
  const [categoriesList, setCategoriesList] = useState(defaultLocalCategories);
  const [loading, setLoading] = useState(true);

  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewSize, setQuickViewSize] = useState('L');
  const [quickViewQty, setQuickViewQty] = useState(1);
  const [quickViewActiveImg, setQuickViewActiveImg] = useState(0);

  const sliderRef = useRef(null);
  const tabsSliderRef = useRef(null);

  const [canScrollTabsLeft, setCanScrollTabsLeft] = useState(false);
  const [canScrollTabsRight, setCanScrollTabsRight] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [liveProds, liveCats] = await Promise.all([
          fetchLiveProducts(),
          fetchLiveCategories(),
        ]);
        if (isMounted) {
          if (liveProds && liveProds.length > 0) setProductsList(liveProds);
          if (liveCats && liveCats.length > 0) setCategoriesList(liveCats);
        }
      } catch (err) {
        console.warn('Could not load dynamic products in TrendingProducts:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  // Construct dynamic category tabs
  const tabs = useMemo(() => {
    const list = [{ id: 'all', label: 'All Drops' }];
    const uniqueSlugs = new Set();

    categoriesList.forEach((c) => {
      const slug = c.slug;
      if (slug && !uniqueSlugs.has(slug) && slug !== 'men' && slug !== 'women') {
        uniqueSlugs.add(slug);
        list.push({
          id: slug,
          label: c.name || c.title || slug,
        });
      }
    });

    return list;
  }, [categoriesList]);

  // Check tabs slider scroll state
  const checkTabsScrollState = () => {
    if (tabsSliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsSliderRef.current;
      setCanScrollTabsLeft(scrollLeft > 5);
      setCanScrollTabsRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkTabsScrollState();
    window.addEventListener('resize', checkTabsScrollState);
    return () => window.removeEventListener('resize', checkTabsScrollState);
  }, [tabs]);

  const scrollTabsLeft = () => {
    if (tabsSliderRef.current) {
      tabsSliderRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollTabsRight = () => {
    if (tabsSliderRef.current) {
      tabsSliderRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const filteredProducts = useMemo(() => {
    if (activeTab === 'all') return productsList;
    return productsList.filter(
      (p) => p.category === activeTab || p.category_slug === activeTab
    );
  }, [activeTab, productsList]);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollState = () => {
    if (sliderRef.current) {
      const { scrollLeft: sLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(sLeft > 10);
      setCanScrollRight(sLeft < scrollWidth - clientWidth - 10);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCanScrollLeft(false);
    setCanScrollRight(true);
    if (sliderRef.current) {
      sliderRef.current.scrollLeft = 0;
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

  const toggleWishlist = (id, title) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter(item => item !== id));
      toast('Removed from Wishlist', { description: title });
    } else {
      setWishlist([...wishlist, id]);
      toast.success('Added to Wishlist', { description: title });
    }
  };

  const { addToCart, openCart } = useCart();

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

  return (
    <section className="group/section relative w-full bg-white text-zinc-950 py-14 sm:py-20 px-4 sm:px-8 lg:px-12 select-none font-sans border-b border-zinc-200 overflow-hidden">
      
      {/* Centered Clean Header & Single-Height Horizontal Scrollable Filter Tabs */}
      <div className="w-full max-w-4xl mx-auto text-center mb-10 sm:mb-14 space-y-3">
        
        {/* Subtle Top Kicker */}
        <div className="flex items-center justify-center gap-2">
          <span className="w-6 h-[1px] bg-red-600"></span>
          <span className="text-[11px] font-semibold text-red-600 uppercase tracking-[0.2em]">
            Curated Performance
          </span>
          <span className="w-6 h-[1px] bg-red-600"></span>
        </div>

        {/* Main Clean Heading */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-zinc-950 tracking-tight">
          Explore Our Bestselling Fits
        </h2>
        
        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-zinc-500 font-normal leading-relaxed max-w-lg mx-auto">
          Precision-cut gymwear designed for heavy lifting, athletic performance, and everyday aesthetic streetwear.
        </p>

        {/* ============================================================== */}
        {/* SINGLE-HEIGHT HORIZONTAL SLIDER TABS CONTAINER (NO WRAP) */}
        {/* ============================================================== */}
        <div className="relative w-full max-w-3xl mx-auto mt-4 px-6 sm:px-8">
          
          {/* Left Tab Arrow (When tabs overflow) */}
          {canScrollTabsLeft && (
            <button
              type="button"
              onClick={scrollTabsLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white shadow-sm border border-zinc-200 flex items-center justify-center text-zinc-700 hover:text-black cursor-pointer hover:bg-zinc-100"
              aria-label="Scroll tabs left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Right Tab Arrow (When tabs overflow) */}
          {canScrollTabsRight && (
            <button
              type="button"
              onClick={scrollTabsRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white shadow-sm border border-zinc-200 flex items-center justify-center text-zinc-700 hover:text-black cursor-pointer hover:bg-zinc-100"
              aria-label="Scroll tabs right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Single-Height Horizontal Scrollable Track */}
          <div
            ref={tabsSliderRef}
            onScroll={checkTabsScrollState}
            className="flex items-center gap-1.5 p-1 bg-zinc-100/90 border border-zinc-200/70 overflow-x-auto scroll-smooth scrollbar-none w-full flex-nowrap"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`shrink-0 h-8 sm:h-9 px-3.5 sm:px-4 text-[11px] sm:text-xs font-medium transition-all duration-200 cursor-pointer rounded-none whitespace-nowrap tracking-wide flex items-center justify-center select-none ${
                    isActive
                      ? 'bg-zinc-950 text-white font-semibold shadow-xs'
                      : 'bg-transparent text-zinc-600 hover:text-zinc-950 hover:bg-white/70'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

        </div>

      </div>

      {/* ============================================================== */}
      {/* HORIZONTAL PRODUCT SLIDER CONTAINER */}
      {/* ============================================================== */}
      <div className="group/slider relative w-full">

        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/85 hover:bg-zinc-950 text-zinc-900 hover:text-white backdrop-blur-md border border-white/80 shadow-md flex items-center justify-center opacity-0 group-hover/slider:opacity-100 -translate-x-3 group-hover/slider:translate-x-0 transition-all duration-300 cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
          </button>
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/85 hover:bg-zinc-950 text-zinc-900 hover:text-white backdrop-blur-md border border-white/80 shadow-md flex items-center justify-center opacity-0 group-hover/slider:opacity-100 translate-x-3 group-hover/slider:translate-x-0 transition-all duration-300 cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
          </button>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -15, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
            className="w-full"
          >
            {filteredProducts.length === 0 ? (
              <div className="w-full py-16 text-center text-zinc-500 text-xs">
                No products found in this category.
              </div>
            ) : (
              <div
                ref={sliderRef}
                onScroll={checkScrollState}
                className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth pb-4 pt-1 px-1 scrollbar-none snap-x snap-mandatory"
              >
                {filteredProducts.map((product) => {
                  const isWishlisted = wishlist.includes(product.id);
                  const frontImg = product.imageFront || (product.colors?.[0]?.image) || (product.gallery?.[0]);
                  const backImg = product.imageBack || (product.gallery?.[1]) || frontImg;
                  const priceFormatted = typeof product.price === 'number' ? `₹${product.price.toLocaleString('en-IN')}` : product.price;
                  const origPriceFormatted = product.originalPrice ? (typeof product.originalPrice === 'number' ? `₹${product.originalPrice.toLocaleString('en-IN')}` : product.originalPrice) : null;
                  const productUrl = `/product/${product.slug || product.id}`;

                  return (
                    <div
                      key={product.id || product.slug}
                      className="group/card relative flex flex-col shrink-0 w-[270px] sm:w-[300px] lg:w-[320px] bg-transparent rounded-none overflow-hidden snap-start"
                    >
                      {/* Product Image Container with Seamless Dual Hover */}
                      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-100">
                        
                        {/* Front Image Link */}
                        <Link to={productUrl} className="block w-full h-full">
                          <img
                            src={frontImg}
                            alt={product.title}
                            className="absolute inset-0 h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          />

                          {/* Back Image (Smooth hover swap) */}
                          <img
                            src={backImg}
                            alt={`${product.title} Alternate`}
                            className="absolute inset-0 h-full w-full object-cover object-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 ease-out"
                          />
                        </Link>

                        {/* Action Buttons: Wishlist & Eye Quick View */}
                        <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1.5 opacity-0 translate-x-2 group-hover/card:opacity-100 group-hover/card:translate-x-0 transition-all duration-200">
                          <button
                            type="button"
                            onClick={() => toggleWishlist(product.id, product.title)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all cursor-pointer ${
                              isWishlisted
                                ? 'bg-red-600 text-white'
                                : 'bg-white/90 text-zinc-700 hover:text-red-600 hover:bg-white shadow-xs'
                            }`}
                            title="Save to Wishlist"
                            aria-label="Save to Wishlist"
                          >
                            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-white' : ''}`} />
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

                        {/* Lightweight Quick Size Bar */}
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

                      {/* Product Info Section */}
                      <div className="pt-3 pb-1 space-y-1.5 flex-1 flex flex-col justify-between">
                        
                        {/* Title & Color Dots */}
                        <div className="space-y-1">
                          {product.colors && product.colors.length > 0 && (
                            <div className="flex items-center gap-1">
                              {product.colors.map((c, cIdx) => (
                                <span
                                  key={cIdx}
                                  className="w-2.5 h-2.5 rounded-full border border-zinc-300 inline-block"
                                  style={{ backgroundColor: typeof c === 'string' ? c : c.hex }}
                                  title={c.name || ''}
                                />
                              ))}
                            </div>
                          )}

                          <Link to={productUrl} className="block">
                            <h3 className="text-[13px] font-normal text-zinc-900 hover:text-red-600 transition-colors line-clamp-1">
                              {product.title}
                            </h3>
                          </Link>
                        </div>

                        {/* Price Line */}
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
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* "Shop All Fits" Button */}
      <div className="w-full flex justify-center items-center mt-10 sm:mt-12">
        <Link
          to="/collections"
          className="group/btn inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-transparent text-zinc-950 text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] border border-zinc-900 hover:border-red-600 hover:text-red-600 transition-colors duration-200 cursor-pointer rounded-none shadow-none"
        >
          <span>Shop All Drops</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
        </Link>
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
                  {quickViewProduct.description || quickViewProduct.desc || 'Engineered gymwear crafted for high performance, muscular taper, and durability.'}
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
                      addToCart(quickViewProduct, quickViewSize, quickViewQty, quickViewProduct.colors?.[0]?.name || 'Standard');
                      closeQuickView();
                      openCart();
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
