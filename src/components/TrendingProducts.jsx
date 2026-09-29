import React, { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Eye, X, ShoppingBag, Plus, Minus, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

import spotlightFront from '../assets/spotlight_front.jpg';
import spotlightBack from '../assets/spotlight_back.jpg';
import spotlightSide from '../assets/spotlight_side.jpg';
import heroCompression from '../assets/hero_compression.jpg';
import prodCompressionBack from '../assets/prod_compression_back.jpg';
import heroJoggers from '../assets/hero_joggers.jpg';
import catTrackpants from '../assets/cat_trackpants.jpg';
import catDropcut from '../assets/cat_dropcut.jpg';
import catShorts from '../assets/cat_shorts.jpg';
import catStringers from '../assets/cat_stringers.jpg';
import heroOversized from '../assets/hero_oversized.jpg';

export default function TrendingProducts() {
  const [activeTab, setActiveTab] = useState('all');
  const [wishlist, setWishlist] = useState([]);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewSize, setQuickViewSize] = useState('L');
  const [quickViewQty, setQuickViewQty] = useState(1);
  const [quickViewActiveImg, setQuickViewActiveImg] = useState(0);

  const sliderRef = useRef(null);

  const tabs = [
    { id: 'all', label: 'All Drops' },
    { id: 'oversized', label: 'Oversized Tees' },
    { id: 'compression', label: 'Compression' },
    { id: 'lowers', label: 'Gym Lowers' },
  ];

  const products = [
    {
      id: 1,
      title: 'Acid Wash Heavyweight Oversized Tee',
      category: 'oversized',
      price: '₹1,499',
      originalPrice: '₹2,299',
      discount: '35% Off',
      imageFront: spotlightFront,
      imageBack: spotlightBack,
      colors: ['#262626', '#3f3f46', '#dc2626'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      desc: 'Crafted from ultra-heavy 240 GSM french terry cotton with vintage acid wash. Relaxed drop-shoulder fit for maximum pump cover comfort.'
    },
    {
      id: 2,
      title: 'Pro Muscle-Lock Compression Shirt',
      category: 'compression',
      price: '₹1,299',
      originalPrice: '₹1,899',
      discount: '30% Off',
      imageFront: heroCompression,
      imageBack: prodCompressionBack,
      colors: ['#000000', '#dc2626'],
      sizes: ['S', 'M', 'L', 'XL'],
      desc: 'Second-skin compression with 4-way stretch muscle lock fabric. Reinforced flatlock stitching for zero irritation during heavy lifting.'
    },
    {
      id: 3,
      title: 'Tapered Tactical Gym Joggers',
      category: 'lowers',
      price: '₹1,699',
      originalPrice: '₹2,499',
      discount: '32% Off',
      imageFront: catTrackpants,
      imageBack: heroJoggers,
      colors: ['#18181b', '#27272a'],
      sizes: ['M', 'L', 'XL', 'XXL'],
      desc: 'Athletic tapered joggers with deep zippered tactical pockets. Ankle cuff grip and stretch gusset for full squat mobility.'
    },
    {
      id: 4,
      title: 'Drop Cut Curved Hem Athletic Tee',
      category: 'oversized',
      price: '₹1,199',
      originalPrice: '₹1,699',
      discount: '29% Off',
      imageFront: catDropcut,
      imageBack: spotlightSide,
      colors: ['#09090b', '#3f3f46'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      desc: 'Aesthetic curved drop-cut hemline engineered to accentuate upper body v-taper while providing full coverage.'
    },
    {
      id: 5,
      title: '5" Tactical Inseam Gym Shorts',
      category: 'lowers',
      price: '₹1,099',
      originalPrice: '₹1,599',
      discount: '31% Off',
      imageFront: catShorts,
      imageBack: catDropcut,
      colors: ['#000000', '#27272a'],
      sizes: ['S', 'M', 'L', 'XL'],
      desc: 'Quad-enhancing 5-inch inseam athletic gym shorts with side slit vents and reinforced zippered stash pockets.'
    },
    {
      id: 6,
      title: 'Deep Cut Athletic Stringer Tank',
      category: 'oversized',
      price: '₹999',
      originalPrice: '₹1,499',
      discount: '33% Off',
      imageFront: catStringers,
      imageBack: prodCompressionBack,
      colors: ['#18181b', '#dc2626'],
      sizes: ['M', 'L', 'XL'],
      desc: 'Classic bodybuilding stringer cut with deep armholes and thin racerback for unhindered range of motion.'
    },
    {
      id: 7,
      title: 'Heavyweight Vintage Graphic Tee',
      category: 'oversized',
      price: '₹1,399',
      originalPrice: '₹1,999',
      discount: '30% Off',
      imageFront: heroOversized,
      imageBack: spotlightFront,
      colors: ['#262626', '#3f3f46'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      desc: 'Vintage washed aesthetic graphic tee with high-density distressed print and boxy streetwear drape.'
    },
    {
      id: 8,
      title: '2-in-1 Compression Liner Lowers',
      category: 'lowers',
      price: '₹1,599',
      originalPrice: '₹2,399',
      discount: '33% Off',
      imageFront: heroJoggers,
      imageBack: catTrackpants,
      colors: ['#000000'],
      sizes: ['M', 'L', 'XL', 'XXL'],
      desc: 'Layered athletic lower with built-in compression baselayer tights for warmth, blood circulation, and quad support.'
    },
  ];

  const filteredProducts = activeTab === 'all'
    ? products
    : products.filter(p => p.category === activeTab);

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

  const { addToCart } = useCart();

  const handleQuickAdd = (product, size) => {
    addToCart(product, size);
  };

  const openQuickView = (product) => {
    setQuickViewProduct(product);
    setQuickViewSize(product.sizes[0] || 'M');
    setQuickViewQty(1);
    setQuickViewActiveImg(0);
  };

  const closeQuickView = () => {
    setQuickViewProduct(null);
  };

  return (
    <section className="group/section relative w-full bg-white text-zinc-950 py-14 sm:py-20 px-4 sm:px-8 lg:px-12 select-none font-sans border-b border-zinc-200 overflow-hidden">
      
      {/* Centered Clean Header & Filter Tabs */}
      <div className="w-full max-w-3xl mx-auto text-center mb-10 sm:mb-14 space-y-3">
        
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

        {/* Minimal Underline Filter Tabs */}
        <div className="inline-flex items-center justify-center p-1 bg-zinc-100 border border-zinc-200/70 gap-1 mt-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2 text-xs transition-all duration-200 cursor-pointer rounded-none whitespace-nowrap tracking-wide ${
                activeTab === tab.id
                  ? 'bg-zinc-950 text-white font-medium shadow-xs'
                  : 'bg-transparent text-zinc-600 hover:text-zinc-950 hover:bg-white/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* HORIZONTAL PRODUCT SLIDER CONTAINER (WITH GLASSY CIRCULAR NAV ARROWS ON SLIDER HOVER) */}
      {/* ============================================================== */}
      <div className="group/slider relative w-full">

        {/* Left Arrow (Glassy circular, fades in on slider hover when scrolled) */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/75 hover:bg-zinc-950 text-zinc-900 hover:text-white backdrop-blur-md border border-white/80 shadow-md flex items-center justify-center opacity-0 group-hover/slider:opacity-100 -translate-x-3 group-hover/slider:translate-x-0 transition-all duration-300 cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
          </button>
        )}

        {/* Right Arrow (Glassy circular, fades in from right on slider hover) */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/75 hover:bg-zinc-950 text-zinc-900 hover:text-white backdrop-blur-md border border-white/80 shadow-md flex items-center justify-center opacity-0 group-hover/slider:opacity-100 translate-x-3 group-hover/slider:translate-x-0 transition-all duration-300 cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
          </button>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
            className="w-full"
          >
            <div
              ref={sliderRef}
              onScroll={checkScrollState}
              className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth pb-4 pt-1 px-1 scrollbar-none snap-x snap-mandatory"
            >
            {filteredProducts.map((product) => {
              const isWishlisted = wishlist.includes(product.id);

              return (
                <div
                  key={product.id}
                  className="group/card relative flex flex-col shrink-0 w-[270px] sm:w-[300px] lg:w-[320px] bg-transparent rounded-none overflow-hidden snap-start"
                >
                  {/* Product Image Container with Seamless Dual Hover */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-100">
                    
                    {/* Front Image */}
                    <img
                      src={product.imageFront}
                      alt={product.title}
                      className="absolute inset-0 h-full w-full object-cover object-center"
                    />

                    {/* Back Image (Smooth hover swap) */}
                    <img
                      src={product.imageBack}
                      alt={`${product.title} Alternate`}
                      className="absolute inset-0 h-full w-full object-cover object-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 ease-out"
                    />

                    {/* Action Buttons: Wishlist & Eye Quick View (Hidden by default, reveal on card hover) */}
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

                    {/* Lightweight Quick Size Bar (Soft slide up on hover) */}
                    <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full group-hover/card:translate-y-0 transition-transform duration-200 bg-white/95 p-2">
                      <div className="flex items-center justify-center gap-1">
                        {product.sizes.map((size) => (
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

                  {/* Product Info Section (Clean & Frameless) */}
                  <div className="pt-3 pb-1 space-y-1.5 flex-1 flex flex-col justify-between">
                    
                    {/* Title & Color Dots */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        {product.colors.map((hex, cIdx) => (
                          <span
                            key={cIdx}
                            className="w-2 h-2 rounded-full border border-zinc-300 inline-block"
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>

                      <h3 className="text-[13px] font-normal text-zinc-900 group-hover/card:text-red-600 transition-colors line-clamp-1">
                        {product.title}
                      </h3>
                    </div>

                    {/* Price Line */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-[13px] font-semibold text-zinc-950">
                        {product.price}
                      </span>
                      <span className="text-[11px] text-zinc-400 line-through">
                        {product.originalPrice}
                      </span>
                      <span className="text-[10px] font-medium text-red-600 ml-auto">
                        {product.discount}
                      </span>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
      </div>

      {/* Clean Transparent Border-Only "Shop All Fits" Button */}
      <div className="w-full flex justify-center items-center mt-10 sm:mt-12">
        <a
          href="#categories-section"
          className="group/btn inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-transparent text-zinc-950 text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] border border-zinc-900 hover:border-red-600 hover:text-red-600 transition-colors duration-200 cursor-pointer rounded-none shadow-none"
        >
          <span>Shop All Drops</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
        </a>
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
                    src={quickViewActiveImg === 0 ? quickViewProduct.imageFront : quickViewProduct.imageBack}
                    alt={quickViewProduct.title}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setQuickViewActiveImg(0)}
                    className={`h-14 w-11 border overflow-hidden cursor-pointer ${
                      quickViewActiveImg === 0 ? 'border-red-600 ring-1 ring-red-600' : 'border-zinc-200'
                    }`}
                  >
                    <img src={quickViewProduct.imageFront} alt="Front" className="h-full w-full object-cover" />
                  </button>
                  <button
                    onClick={() => setQuickViewActiveImg(1)}
                    className={`h-14 w-11 border overflow-hidden cursor-pointer ${
                      quickViewActiveImg === 1 ? 'border-red-600 ring-1 ring-red-600' : 'border-zinc-200'
                    }`}
                  >
                    <img src={quickViewProduct.imageBack} alt="Back" className="h-full w-full object-cover" />
                  </button>
                </div>
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
                    <span className="text-xl font-bold text-zinc-950">{quickViewProduct.price}</span>
                    <span className="text-xs text-zinc-400 line-through">{quickViewProduct.originalPrice}</span>
                    <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5">
                      {quickViewProduct.discount}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed">
                  {quickViewProduct.desc}
                </p>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-zinc-900">Select Size: {quickViewSize}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {quickViewProduct.sizes.map((size) => (
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

                <button
                  onClick={() => {
                    handleQuickAdd(quickViewProduct, quickViewSize);
                    closeQuickView();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wider transition-colors rounded-none cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add To Bag</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </section>
  );
}
