import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Heart, Eye, ArrowRight, ChevronLeft, ChevronRight, X, ShoppingBag, Plus, Minus } from 'lucide-react';

import catShorts from '../assets/cat_shorts.jpg';
import catTrackpants from '../assets/cat_trackpants.jpg';
import heroJoggers from '../assets/hero_joggers.jpg';
import heroOversized from '../assets/hero_oversized.jpg';
import spotlightFront from '../assets/spotlight_front.jpg';
import spotlightBack from '../assets/spotlight_back.jpg';
import catDropcut from '../assets/cat_dropcut.jpg';
import spotlightSide from '../assets/spotlight_side.jpg';

import { useCart } from '../context/CartContext';

export default function DualFeatureSection() {
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState([]);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewSize, setQuickViewSize] = useState('L');
  const [quickViewQty, setQuickViewQty] = useState(1);
  const [quickViewActiveImg, setQuickViewActiveImg] = useState(0);

  // Slider refs for each row
  const shortsSliderRef = useRef(null);
  const oversizedSliderRef = useRef(null);

  const [canScrollLeftShorts, setCanScrollLeftShorts] = useState(false);
  const [canScrollRightShorts, setCanScrollRightShorts] = useState(true);

  const [canScrollLeftOver, setCanScrollLeftOver] = useState(false);
  const [canScrollRightOver, setCanScrollRightOver] = useState(true);

  const checkShortsScroll = () => {
    if (shortsSliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = shortsSliderRef.current;
      setCanScrollLeftShorts(scrollLeft > 10);
      setCanScrollRightShorts(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const checkOversizedScroll = () => {
    if (oversizedSliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = oversizedSliderRef.current;
      setCanScrollLeftOver(scrollLeft > 10);
      setCanScrollRightOver(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollShortsLeft = () => {
    if (shortsSliderRef.current) {
      shortsSliderRef.current.scrollBy({ left: -360, behavior: 'smooth' });
    }
  };

  const scrollShortsRight = () => {
    if (shortsSliderRef.current) {
      shortsSliderRef.current.scrollBy({ left: 360, behavior: 'smooth' });
    }
  };

  const scrollOverLeft = () => {
    if (oversizedSliderRef.current) {
      oversizedSliderRef.current.scrollBy({ left: -360, behavior: 'smooth' });
    }
  };

  const scrollOverRight = () => {
    if (oversizedSliderRef.current) {
      oversizedSliderRef.current.scrollBy({ left: 360, behavior: 'smooth' });
    }
  };

  // Row 1: Training Shorts Products
  const shortsProducts = [
    {
      id: 'sh-1',
      title: '5" Tactical Inseam Gym Shorts',
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
      id: 'sh-2',
      title: '2-in-1 Compression Liner Shorts',
      price: '₹1,299',
      originalPrice: '₹1,899',
      discount: '30% Off',
      imageFront: heroJoggers,
      imageBack: catTrackpants,
      colors: ['#09090b', '#dc2626'],
      sizes: ['M', 'L', 'XL', 'XXL'],
      desc: 'High-performance running & lifting shorts with built-in compression tights for maximum hamstring support.'
    },
    {
      id: 'sh-3',
      title: 'Aesthetic Heavy Fleece Sweat Shorts',
      price: '₹1,199',
      originalPrice: '₹1,699',
      discount: '29% Off',
      imageFront: catTrackpants,
      imageBack: heroJoggers,
      colors: ['#18181b', '#3f3f46'],
      sizes: ['S', 'M', 'L', 'XL'],
      desc: 'Ultra-soft french terry heavy fleece shorts tailored for post-workout streetwear and leg day mobility.'
    },
    {
      id: 'sh-4',
      title: 'Ripstop Breathable Mesh Shorts',
      price: '₹999',
      originalPrice: '₹1,499',
      discount: '33% Off',
      imageFront: catShorts,
      imageBack: spotlightSide,
      colors: ['#000000', '#18181b'],
      sizes: ['S', 'M', 'L', 'XL'],
      desc: 'Ultra-lightweight micro-mesh gym shorts built for high-sweat endurance sessions.'
    },
    {
      id: 'sh-5',
      title: 'Pro Stretch Utility Gym Shorts',
      price: '₹1,349',
      originalPrice: '₹1,999',
      discount: '32% Off',
      imageFront: heroJoggers,
      imageBack: catShorts,
      colors: ['#262626', '#3f3f46'],
      sizes: ['M', 'L', 'XL', 'XXL'],
      desc: 'Engineered 4-way stretch utility shorts with towel loop and water-resistant phone pocket.'
    }
  ];

  // Row 2: Oversized Collection Products
  const oversizedProducts = [
    {
      id: 'ov-1',
      title: 'Acid Wash Heavyweight Oversized Tee',
      price: '₹1,499',
      originalPrice: '₹2,299',
      discount: '35% Off',
      imageFront: spotlightFront,
      imageBack: spotlightBack,
      colors: ['#262626', '#3f3f46', '#dc2626'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      desc: 'Crafted from ultra-heavy 240 GSM french terry cotton with vintage acid wash. Relaxed drop-shoulder fit.'
    },
    {
      id: 'ov-2',
      title: 'Heavyweight Vintage Distressed Graphic Tee',
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
      id: 'ov-3',
      title: 'Drop Cut Curved Hem Oversized Tee',
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
      id: 'ov-4',
      title: 'Washed Onyx Boxy Silhouette Tee',
      price: '₹1,299',
      originalPrice: '₹1,799',
      discount: '28% Off',
      imageFront: spotlightSide,
      imageBack: spotlightBack,
      colors: ['#18181b', '#dc2626'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      desc: 'Pure combed heavyweight cotton with reinforced collar ribbing for zero sag over time.'
    },
    {
      id: 'ov-5',
      title: 'Raw Hem Heavyweight Pump Cover Tee',
      price: '₹1,399',
      originalPrice: '₹1,999',
      discount: '30% Off',
      imageFront: heroOversized,
      imageBack: catDropcut,
      colors: ['#000000', '#27272a'],
      sizes: ['M', 'L', 'XL', 'XXL'],
      desc: 'Exaggerated boxy streetwear cut with raw cut edge hem for unconstrained upper body comfort.'
    }
  ];

  const toggleWishlist = (id, title) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter(item => item !== id));
      toast('Removed from Wishlist', { description: title });
    } else {
      setWishlist([...wishlist, id]);
      toast.success('Added to Wishlist', { description: title });
    }
  };

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

  const renderProductSlider = (productsList, ref, onScroll, canScrollL, canScrollR, onScrollL, onScrollR) => (
    <div className="group/slider relative w-full">
      {/* Left Glassy Circle Arrow */}
      {canScrollL && (
        <button
          onClick={onScrollL}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/75 hover:bg-zinc-950 text-zinc-900 hover:text-white backdrop-blur-md border border-white/80 shadow-md flex items-center justify-center opacity-0 group-hover/slider:opacity-100 -translate-x-3 group-hover/slider:translate-x-0 transition-all duration-300 cursor-pointer"
          aria-label="Previous Products"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
        </button>
      )}

      {/* Right Glassy Circle Arrow */}
      {canScrollR && (
        <button
          onClick={onScrollR}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/75 hover:bg-zinc-950 text-zinc-900 hover:text-white backdrop-blur-md border border-white/80 shadow-md flex items-center justify-center opacity-0 group-hover/slider:opacity-100 translate-x-3 group-hover/slider:translate-x-0 transition-all duration-300 cursor-pointer"
          aria-label="Next Products"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
        </button>
      )}

      {/* Horizontal Slider Track */}
      <div
        ref={ref}
        onScroll={onScroll}
        className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth pb-4 pt-1 px-1 scrollbar-none snap-x snap-mandatory"
      >
        {productsList.map((product) => {
          const isWishlisted = wishlist.includes(product.id);

          return (
            <div
              key={product.id}
              className="group/card relative flex flex-col shrink-0 w-[270px] sm:w-[300px] lg:w-[320px] bg-transparent rounded-none overflow-hidden snap-start"
            >
              {/* Image Container with Seamless Dual Hover */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-100">
                <img
                  src={product.imageFront}
                  alt={product.title}
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
                <img
                  src={product.imageBack}
                  alt={`${product.title} Alternate`}
                  className="absolute inset-0 h-full w-full object-cover object-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 ease-out"
                />

                {/* Wishlist & Quick View Icons on Hover */}
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

                {/* Quick Size Bar (Slide up on hover) */}
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

              {/* Product Info */}
              <div className="pt-3 pb-1 space-y-1.5 flex-1 flex flex-col justify-between">
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
    </div>
  );

  return (
    <section className="w-full bg-white text-zinc-950 py-14 sm:py-20 px-4 sm:px-8 lg:px-12 border-b border-zinc-200">
      <div className="w-full space-y-16 sm:space-y-24">

        {/* ============================================================== */}
        {/* SECTION 1: SHOP TRAINING SHORTS (SLIDER) */}
        {/* ============================================================== */}
        <div className="space-y-6 sm:space-y-8">
          {/* Left-Aligned Clean Heading Bar */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 pb-5">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-red-600">
                Bottomwear Line
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-medium tracking-tight text-zinc-950">
                Shop Training Shorts
              </h2>
            </div>

            <Link
              to="/shorts"
              className="group inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-zinc-700 hover:text-red-600 transition-colors cursor-pointer"
            >
              <span>View All Shorts</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Product Horizontal Slider */}
          {renderProductSlider(
            shortsProducts,
            shortsSliderRef,
            checkShortsScroll,
            canScrollLeftShorts,
            canScrollRightShorts,
            scrollShortsLeft,
            scrollShortsRight
          )}
        </div>

        {/* ============================================================== */}
        {/* SECTION 2: SHOP OVERSIZED COLLECTION (SLIDER) */}
        {/* ============================================================== */}
        <div className="space-y-6 sm:space-y-8">
          {/* Left-Aligned Clean Heading Bar */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 pb-5">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-red-600">
                Heavyweight Fits
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-medium tracking-tight text-zinc-950">
                Shop Oversized Collection
              </h2>
            </div>

            <Link
              to="/oversized"
              className="group inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-zinc-700 hover:text-red-600 transition-colors cursor-pointer"
            >
              <span>View All Oversized</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Product Horizontal Slider */}
          {renderProductSlider(
            oversizedProducts,
            oversizedSliderRef,
            checkOversizedScroll,
            canScrollLeftOver,
            canScrollRightOver,
            scrollOverLeft,
            scrollOverRight
          )}
        </div>

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
