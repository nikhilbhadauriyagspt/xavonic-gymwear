import React, { useState, useMemo, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowLeft, 
  Heart, 
  ShoppingBag, 
  ChevronRight,
  SlidersHorizontal,
  Layers
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

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

// All Categories Directory Data
const allCategories = [
  {
    slug: 'oversized',
    title: 'Oversized T-Shirts',
    subtitle: '240 GSM Heavyweight French Terry',
    itemCount: '12 Fits',
    image: heroOversized,
    desc: 'Heavyweight pump cover essentials engineered with relaxed drop shoulders and vintage wash.'
  },
  {
    slug: 'compression',
    title: 'Muscle Compression',
    subtitle: 'Second-Skin 4-Way Stretch',
    itemCount: '8 Fits',
    image: heroCompression,
    desc: 'Reinforced flatlock stitched muscle-lock compression wear for zero friction and max pump.'
  },
  {
    slug: 'shorts',
    title: '5" Training Shorts',
    subtitle: 'Squat-Proof & Quad Cut',
    itemCount: '10 Fits',
    image: catShorts,
    desc: 'Lightweight performance shorts with zippered pockets and quad-accentuating 5-inch inseams.'
  },
  {
    slug: 'lowers',
    title: 'Gym Lowers & Joggers',
    subtitle: 'Tapered Heavyweight Fleece',
    itemCount: '9 Fits',
    image: heroJoggers,
    desc: 'Engineered aesthetic joggers with ankle ribbing and moisture-wicking athletic fabric.'
  },
  {
    slug: 'tanks',
    title: 'Tanks & Stringers',
    subtitle: 'Deep Cut Bodybuilding Fit',
    itemCount: '7 Fits',
    image: catStringers,
    desc: 'Racerback and deep cut armholes designed to showcase back and shoulder definition.'
  },
  {
    slug: 'drop-cut',
    title: 'Drop Cut T-Shirts',
    subtitle: 'Curved Hem Athletic Fit',
    itemCount: '8 Fits',
    image: catDropcut,
    desc: 'V-taper enhancing curved hem tees crafted for an athletic aesthetic taper.'
  },
  {
    slug: 'acid-wash',
    title: 'Acid Wash Collection',
    subtitle: 'Distressed Streetwear Aesthetics',
    itemCount: '6 Fits',
    image: spotlightFront,
    desc: 'Individual mineral-dyed distressed pump covers with custom heavy drape.'
  },
  {
    slug: 'trackpants',
    title: 'Athletic Trackpants',
    subtitle: 'Zip Ankle Performance Wear',
    itemCount: '7 Fits',
    image: catTrackpants,
    desc: 'Streamlined athletic trackpants for training, cardio, and lifestyle recovery.'
  }
];

// Product Catalog Data mapped to category slugs
const catalogProducts = [
  // --- OVERSIZED T-SHIRTS ---
  {
    id: 'prod-1',
    title: 'Acid Wash Heavyweight Oversized Tee - Onyx Black',
    category: 'oversized',
    price: 1499,
    originalPrice: 2299,
    discount: '35% Off',
    imageFront: spotlightFront,
    imageBack: spotlightBack,
    colors: [
      { name: 'Onyx Black', hex: '#18181b', image: spotlightFront },
      { name: 'Vintage Grey', hex: '#52525b', image: spotlightSide },
      { name: 'Crimson Red', hex: '#dc2626', image: spotlightBack }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    badge: null,
    rating: 4.9
  },
  {
    id: 'prod-7',
    title: 'Vintage Distressed Heavyweight Pump Cover',
    category: 'oversized',
    price: 1399,
    originalPrice: 1999,
    discount: '30% Off',
    imageFront: heroOversized,
    imageBack: spotlightBack,
    colors: [
      { name: 'Charcoal Black', hex: '#27272a', image: heroOversized },
      { name: 'Off White', hex: '#e4e4e7', image: spotlightBack }
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    badge: null,
    rating: 4.9
  },
  {
    id: 'prod-13',
    title: 'Minimalist Boxy Fit Drop Shoulder Tee',
    category: 'oversized',
    price: 1299,
    originalPrice: 1899,
    discount: '32% Off',
    imageFront: spotlightBack,
    imageBack: spotlightSide,
    colors: [
      { name: 'Carbon Black', hex: '#18181b', image: spotlightBack },
      { name: 'Slate Grey', hex: '#71717a', image: spotlightSide },
      { name: 'Military Olive', hex: '#3f4f34', image: spotlightFront }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    badge: null,
    rating: 4.8
  },
  {
    id: 'prod-14',
    title: 'Stealth Raw Edge Heavyweight Gym Tee',
    category: 'oversized',
    price: 1399,
    originalPrice: 1999,
    discount: '30% Off',
    imageFront: spotlightSide,
    imageBack: heroOversized,
    colors: [
      { name: 'Jet Black', hex: '#09090b', image: spotlightSide },
      { name: 'Heather Grey', hex: '#a1a1aa', image: heroOversized }
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    badge: null,
    rating: 4.9
  },

  // --- MUSCLE COMPRESSION ---
  {
    id: 'prod-2',
    title: 'Pro Muscle-Lock Compression Shirt - Stealth',
    category: 'compression',
    price: 1299,
    originalPrice: 1899,
    discount: '30% Off',
    imageFront: heroCompression,
    imageBack: prodCompressionBack,
    colors: [
      { name: 'Stealth Black', hex: '#000000', image: heroCompression },
      { name: 'Pure White', hex: '#f4f4f5', image: prodCompressionBack },
      { name: 'Blood Red', hex: '#dc2626', image: spotlightBack }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    badge: null,
    rating: 4.9
  },
  {
    id: 'prod-11',
    title: 'Second-Skin Compression Long Sleeve Thermal',
    category: 'compression',
    price: 1399,
    originalPrice: 1999,
    discount: '30% Off',
    imageFront: prodCompressionBack,
    imageBack: heroCompression,
    colors: [
      { name: 'Black Panther', hex: '#18181b', image: prodCompressionBack },
      { name: 'Deep Navy', hex: '#1e293b', image: heroCompression }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    badge: null,
    rating: 4.9
  },
  {
    id: 'prod-15',
    title: 'Vascularity Accent Flatlock Compression Tee',
    category: 'compression',
    price: 1249,
    originalPrice: 1799,
    discount: '31% Off',
    imageFront: heroCompression,
    imageBack: spotlightBack,
    colors: [
      { name: 'Matte Black', hex: '#27272a', image: heroCompression },
      { name: 'Gunmetal Grey', hex: '#52525b', image: spotlightBack }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    badge: null,
    rating: 4.9
  },
  {
    id: 'prod-16',
    title: 'Core Stability Base-Layer Compression Short Sleeve',
    category: 'compression',
    price: 1199,
    originalPrice: 1699,
    discount: '29% Off',
    imageFront: prodCompressionBack,
    imageBack: heroCompression,
    colors: [
      { name: 'Stealth Black', hex: '#09090b', image: prodCompressionBack },
      { name: 'Arctic White', hex: '#e4e4e7', image: heroCompression }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    badge: null,
    rating: 4.8
  },

  // --- 5" TRAINING SHORTS ---
  {
    id: 'prod-3',
    title: '5" Tactical Inseam Gym Shorts - Matte Black',
    category: 'shorts',
    price: 1099,
    originalPrice: 1599,
    discount: '31% Off',
    imageFront: catShorts,
    imageBack: heroJoggers,
    colors: [
      { name: 'Matte Black', hex: '#18181b', image: catShorts },
      { name: 'Army Olive', hex: '#365314', image: heroJoggers },
      { name: 'Charcoal Grey', hex: '#3f3f46', image: catTrackpants }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    badge: null,
    rating: 4.8
  },
  {
    id: 'prod-8',
    title: '2-in-1 Quad-Flex Compression Liner Shorts',
    category: 'shorts',
    price: 1399,
    originalPrice: 1999,
    discount: '30% Off',
    imageFront: heroJoggers,
    imageBack: catShorts,
    colors: [
      { name: 'Black/Red Liner', hex: '#000000', image: heroJoggers },
      { name: 'Grey/Black Liner', hex: '#71717a', image: catShorts }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    badge: null,
    rating: 4.9
  },
  {
    id: 'prod-17',
    title: 'Hyper-Lightweight Perforated Training Shorts',
    category: 'shorts',
    price: 999,
    originalPrice: 1499,
    discount: '33% Off',
    imageFront: catShorts,
    imageBack: spotlightSide,
    colors: [
      { name: 'Carbon Black', hex: '#27272a', image: catShorts },
      { name: 'Electric Red', hex: '#dc2626', image: spotlightSide },
      { name: 'Steel Blue', hex: '#334155', image: heroJoggers }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    badge: null,
    rating: 4.8
  },
  {
    id: 'prod-18',
    title: 'Heavy Fleece Raw Cut Squat Shorts 5"',
    category: 'shorts',
    price: 1199,
    originalPrice: 1699,
    discount: '29% Off',
    imageFront: catShorts,
    imageBack: catTrackpants,
    colors: [
      { name: 'Pitch Black', hex: '#09090b', image: catShorts },
      { name: 'Heather Grey', hex: '#a1a1aa', image: catTrackpants }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    badge: null,
    rating: 4.7
  },

  // --- GYM LOWERS & JOGGERS ---
  {
    id: 'prod-4',
    title: 'Tapered Heavyweight Cargo Joggers - Charcoal',
    category: 'lowers',
    price: 1699,
    originalPrice: 2499,
    discount: '32% Off',
    imageFront: catTrackpants,
    imageBack: heroJoggers,
    colors: [
      { name: 'Charcoal Grey', hex: '#3f3f46', image: catTrackpants },
      { name: 'Jet Black', hex: '#18181b', image: heroJoggers },
      { name: 'Desert Sand', hex: '#a8a29e', image: prodCompressionBack }
    ],
    sizes: ['M', 'L', 'XL'],
    badge: null,
    rating: 4.8
  },
  {
    id: 'prod-19',
    title: 'French Terry Relaxed Aesthetic Gym Joggers',
    category: 'lowers',
    price: 1599,
    originalPrice: 2299,
    discount: '30% Off',
    imageFront: heroJoggers,
    imageBack: catTrackpants,
    colors: [
      { name: 'Onyx Black', hex: '#09090b', image: heroJoggers },
      { name: 'Light Grey Marl', hex: '#d4d4d8', image: catTrackpants }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    badge: null,
    rating: 4.9
  },
  {
    id: 'prod-20',
    title: 'Cuffed Heavy Rib Heavyweight Ankle Joggers',
    category: 'lowers',
    price: 1649,
    originalPrice: 2399,
    discount: '31% Off',
    imageFront: heroJoggers,
    imageBack: prodCompressionBack,
    colors: [
      { name: 'Midnight Black', hex: '#18181b', image: heroJoggers },
      { name: 'Dark Olive', hex: '#3f4f34', image: prodCompressionBack }
    ],
    sizes: ['M', 'L', 'XL'],
    badge: null,
    rating: 4.8
  },

  // --- TANKS & STRINGERS ---
  {
    id: 'prod-5',
    title: 'Deep Cut Athletic Stringer Tank - Raw Black',
    category: 'tanks',
    price: 999,
    originalPrice: 1499,
    discount: '33% Off',
    imageFront: catStringers,
    imageBack: spotlightBack,
    colors: [
      { name: 'Raw Black', hex: '#18181b', image: catStringers },
      { name: 'Crimson Red', hex: '#dc2626', image: spotlightBack },
      { name: 'Pure White', hex: '#ffffff', image: spotlightFront }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    badge: null,
    rating: 4.7
  },
  {
    id: 'prod-21',
    title: 'Racerback Tapered Muscle Cut Tank',
    category: 'tanks',
    price: 949,
    originalPrice: 1399,
    discount: '32% Off',
    imageFront: catStringers,
    imageBack: spotlightSide,
    colors: [
      { name: 'Stealth Black', hex: '#000000', image: catStringers },
      { name: 'Heather Grey', hex: '#71717a', image: spotlightSide }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    badge: null,
    rating: 4.8
  },
  {
    id: 'prod-22',
    title: 'Ultra-Breathable Ribbed Bodybuilding Stringer',
    category: 'tanks',
    price: 899,
    originalPrice: 1299,
    discount: '30% Off',
    imageFront: catStringers,
    imageBack: heroCompression,
    colors: [
      { name: 'Onyx Black', hex: '#18181b', image: catStringers },
      { name: 'Chalk White', hex: '#f4f4f5', image: heroCompression }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    badge: null,
    rating: 4.9
  },

  // --- DROP CUT T-SHIRTS ---
  {
    id: 'prod-6',
    title: 'Curved Drop Cut Athletic Performance Tee',
    category: 'drop-cut',
    price: 1199,
    originalPrice: 1699,
    discount: '29% Off',
    imageFront: catDropcut,
    imageBack: spotlightSide,
    colors: [
      { name: 'Charcoal Black', hex: '#27272a', image: catDropcut },
      { name: 'Mineral Washed', hex: '#52525b', image: spotlightSide },
      { name: 'Ruby Red', hex: '#b91c1c', image: spotlightBack }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    badge: null,
    rating: 4.9
  },
  {
    id: 'prod-12',
    title: 'Curved Hem Aesthetic Drop Cut Tee - Carbon',
    category: 'drop-cut',
    price: 1199,
    originalPrice: 1699,
    discount: '29% Off',
    imageFront: spotlightBack,
    imageBack: catDropcut,
    colors: [
      { name: 'Carbon Black', hex: '#18181b', image: spotlightBack },
      { name: 'Ash Grey', hex: '#a1a1aa', image: catDropcut }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    badge: null,
    rating: 4.8
  },
  {
    id: 'prod-23',
    title: 'V-Taper Raglan Sleeve Drop Cut Fitted Tee',
    category: 'drop-cut',
    price: 1249,
    originalPrice: 1799,
    discount: '31% Off',
    imageFront: catDropcut,
    imageBack: spotlightFront,
    colors: [
      { name: 'Jet Black', hex: '#09090b', image: catDropcut },
      { name: 'Navy Blue', hex: '#1e3a8a', image: spotlightFront }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    badge: null,
    rating: 4.8
  },

  // --- ACID WASH ---
  {
    id: 'prod-9',
    title: 'Acid Wash Charcoal Drop-Shoulder Tee',
    category: 'acid-wash',
    price: 1499,
    originalPrice: 2199,
    discount: '31% Off',
    imageFront: spotlightSide,
    imageBack: spotlightFront,
    colors: [
      { name: 'Acid Charcoal', hex: '#3f3f46', image: spotlightSide },
      { name: 'Acid Black', hex: '#18181b', image: spotlightFront },
      { name: 'Acid Red', hex: '#991b1b', image: spotlightBack }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    badge: null,
    rating: 4.9
  },
  {
    id: 'prod-24',
    title: 'Vintage Mineral Washed Heavy Streetwear Tee',
    category: 'acid-wash',
    price: 1549,
    originalPrice: 2299,
    discount: '33% Off',
    imageFront: spotlightFront,
    imageBack: spotlightSide,
    colors: [
      { name: 'Vintage Black', hex: '#27272a', image: spotlightFront },
      { name: 'Distressed Grey', hex: '#71717a', image: spotlightSide }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    badge: null,
    rating: 4.9
  },

  // --- TRACKPANTS ---
  {
    id: 'prod-10',
    title: 'Athletic Lightweight Trackpants - Deep Grey',
    category: 'trackpants',
    price: 1599,
    originalPrice: 2299,
    discount: '30% Off',
    imageFront: catTrackpants,
    imageBack: heroJoggers,
    colors: [
      { name: 'Deep Grey', hex: '#3f3f46', image: catTrackpants },
      { name: 'Solid Black', hex: '#09090b', image: heroJoggers }
    ],
    sizes: ['M', 'L', 'XL'],
    badge: null,
    rating: 4.8
  },
  {
    id: 'prod-25',
    title: 'Zip-Pocket Performance Running Trackpants',
    category: 'trackpants',
    price: 1699,
    originalPrice: 2399,
    discount: '29% Off',
    imageFront: catTrackpants,
    imageBack: catShorts,
    colors: [
      { name: 'Matte Black', hex: '#18181b', image: catTrackpants },
      { name: 'Storm Grey', hex: '#52525b', image: catShorts }
    ],
    sizes: ['M', 'L', 'XL'],
    badge: null,
    rating: 4.8
  },

  // --- CARGO LOWERS ---
  {
    id: 'prod-26',
    title: 'Tactical Multi-Pocket Gym Cargo Lowers',
    category: 'cargo-lowers',
    price: 1799,
    originalPrice: 2599,
    discount: '31% Off',
    imageFront: catTrackpants,
    imageBack: heroJoggers,
    colors: [
      { name: 'Combat Black', hex: '#000000', image: catTrackpants },
      { name: 'Military Green', hex: '#3f4f34', image: heroJoggers },
      { name: 'Dark Charcoal', hex: '#3f3f46', image: prodCompressionBack }
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    badge: null,
    rating: 4.9
  }
];

export default function CollectionsPage() {
  const { categorySlug: paramSlug } = useParams();
  const location = useLocation();
  const { addToCart, openCart } = useCart();

  // Extract effective slug either from /collections/:categorySlug or direct route like /oversized, /compression, etc.
  const effectiveSlug = useMemo(() => {
    if (paramSlug) return paramSlug.toLowerCase();
    const pathname = location.pathname.replace(/^\/+/, '');
    if (pathname && pathname !== 'collections' && pathname !== 'shop') {
      return pathname.toLowerCase();
    }
    return null;
  }, [paramSlug, location.pathname]);

  // Scroll to top whenever URL or slug changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [effectiveSlug, location.pathname]);

  const [sortBy, setSortBy] = useState('featured');
  const [wishlist, setWishlist] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState({});

  const activeCategory = useMemo(() => {
    if (!effectiveSlug) return null;
    return allCategories.find(c => c.slug === effectiveSlug) || {
      slug: effectiveSlug,
      title: effectiveSlug.replace(/-/g, ' ').toUpperCase(),
      subtitle: 'Xavonic Activewear Collection',
      itemCount: 'Available Fits',
      desc: 'Engineered activewear collection for athletic performance and aesthetics.'
    };
  }, [effectiveSlug]);

  const categoryProducts = useMemo(() => {
    if (!effectiveSlug) return [];
    let list = catalogProducts.filter(p => p.category === effectiveSlug);
    
    // If exact category match is small or specific, fallback to catalog
    if (list.length === 0) {
      list = catalogProducts.slice(0, 8);
    }

    if (sortBy === 'price-low') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list = [...list].sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [effectiveSlug, sortBy]);

  const [selectedColors, setSelectedColors] = useState({});

  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        toast.info('Removed from wishlist');
        return prev.filter(id => id !== productId);
      } else {
        toast.success('Saved to wishlist');
        return [...prev, productId];
      }
    });
  };

  const handleQuickAdd = (product) => {
    const size = selectedSizes[product.id] || product.sizes[0] || 'L';
    addToCart(product, size, 1);
    openCart();
  };

  return (
    <div className="w-full bg-white text-zinc-900 font-sans min-h-screen selection:bg-red-600 selection:text-white">
      
      {/* ========================================================================= */}
      {/* CASE 1: ROOT /collections (SHOW ALL CATEGORIES DIRECTORY) */}
      {/* ========================================================================= */}
      {!effectiveSlug ? (
        <div className="w-full">
          
          {/* Header Banner (Full Width Edge-to-Edge) */}
          <div className="w-full bg-zinc-50 border-b border-zinc-200 py-6 sm:py-10 px-4 sm:px-8 lg:px-12">
            <div className="w-full space-y-2">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Link to="/" className="hover:text-black transition-colors">Home</Link>
                <span>/</span>
                <span className="text-zinc-900 font-medium">Collections</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-4xl font-bold uppercase tracking-tight text-zinc-950">
                    All Collections & Fits
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-500 font-normal">
                    Select a category to explore heavyweight pump covers, compression, and shorts.
                  </p>
                </div>
                <span className="text-xs text-zinc-500 font-mono">
                  {allCategories.length} Categories
                </span>
              </div>
            </div>
          </div>

          {/* Categories Grid (Clean White Theme, Full-Width Edge-to-Edge without extra left/right padding) */}
          <div className="w-full px-0 sm:px-4 lg:px-6 py-6 sm:py-10">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-5 w-full">
              {allCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/collections/${cat.slug}`}
                  className="group relative block aspect-[4/4.6] w-full overflow-hidden bg-zinc-950 transition-all duration-300 rounded-none cursor-pointer shadow-none"
                >
                  {/* High-Resolution Photoshoot Image */}
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out brightness-90 group-hover:brightness-100"
                  />

                  {/* Dark Bottom Gradient for Clean Legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent opacity-90 group-hover:opacity-85 transition-opacity" />

                  {/* Top Red Hover Accent */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Top Count Badge */}
                  <span className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 px-2 py-0.5 bg-black/60 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-medium tracking-wider uppercase rounded-none border border-white/15">
                    {cat.itemCount}
                  </span>

                  {/* Bottom Content with Straight Right Arrow Icon */}
                  <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-4 md:p-5 flex items-end justify-between gap-1.5 sm:gap-3">
                    <div>
                      <h3 className="text-xs sm:text-base md:text-lg font-medium text-white group-hover:text-red-500 transition-colors line-clamp-2">
                        {cat.title}
                      </h3>
                      <p className="hidden sm:block text-[11px] text-zinc-400 line-clamp-1 font-light pt-0.5">
                        {cat.subtitle}
                      </p>
                    </div>

                    {/* Glass Circle with Pure Right Direction Arrow */}
                    <div className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 shrink-0 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-red-600 group-hover:border-red-600 group-hover:scale-110 transition-all duration-300 shadow-lg">
                      <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      ) : (

        /* ========================================================================= */
        /* CASE 2: CATEGORY SPECIFIC PRODUCT CATALOG (/collections/:categorySlug) */
        /* ========================================================================= */
        <div className="w-full">
          
          {/* Top Category Banner (Full Width Edge-to-Edge) */}
          <div className="w-full bg-zinc-50 border-b border-zinc-200 py-6 sm:py-10 px-4 sm:px-8 lg:px-12">
            <div className="w-full space-y-3">
              
              {/* Breadcrumb & Back Link */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Link to="/" className="hover:text-black transition-colors">Home</Link>
                  <span>/</span>
                  <Link to="/collections" className="hover:text-black transition-colors">Collections</Link>
                  <span>/</span>
                  <span className="text-zinc-900 font-medium">{activeCategory.title}</span>
                </div>

                <Link
                  to="/collections"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-black transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>All Categories</span>
                </Link>
              </div>

              {/* Title & Stats */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-4xl font-bold uppercase tracking-tight text-zinc-950">
                    {activeCategory.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-500 font-normal">
                    {activeCategory.desc || 'Premium gymwear engineered for performance and aesthetics.'}
                  </p>
                </div>

                <span className="text-xs text-zinc-500 font-mono">
                  {categoryProducts.length} {categoryProducts.length === 1 ? 'Product' : 'Products'}
                </span>
              </div>

            </div>
          </div>

          {/* Quick Sub-Categories Filter Strip (Full Width) */}
          <div className="sticky top-18 sm:top-20 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200">
            <div className="w-full px-4 sm:px-8 lg:px-12 py-2.5 flex items-center justify-between gap-4">
              
              <div 
                className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 max-w-full"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <Link
                  to="/collections"
                  className="px-3 py-1.5 text-xs font-medium whitespace-nowrap bg-zinc-100 text-zinc-600 hover:text-black rounded-none"
                >
                  ← All Categories
                </Link>

                {allCategories.map((c) => (
                  <Link
                    key={c.slug}
                    to={`/collections/${c.slug}`}
                    className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all rounded-none ${
                      effectiveSlug === c.slug
                        ? 'bg-black text-white font-semibold'
                        : 'bg-zinc-100 text-zinc-700 hover:text-black hover:bg-zinc-200'
                    }`}
                  >
                    {c.title}
                  </Link>
                ))}
              </div>

              {/* Sort By Dropdown */}
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <span className="text-xs text-zinc-400">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-zinc-300 focus:border-black bg-white px-2.5 py-1 text-xs font-medium text-zinc-900 rounded-none focus:outline-none cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>

            </div>
          </div>

          {/* Products Grid (2 Columns Mobile, 4 Columns Desktop, Zero Shadow, Clean Borderless Cards) */}
          <div className="max-w-7xl mx-auto px-3 sm:px-8 lg:px-12 py-6 sm:py-10">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {categoryProducts.map((product) => {
                const selectedSize = selectedSizes[product.id] || product.sizes[0];
                const isWishlisted = wishlist.includes(product.id);
                
                // Active color selection
                const colors = product.colors || [];
                const activeColorIndex = selectedColors[product.id] ?? 0;
                const activeColor = colors[activeColorIndex];
                const displayImageFront = activeColor?.image || product.imageFront;

                return (
                  <div
                    key={product.id}
                    className="group relative flex flex-col bg-white rounded-none overflow-hidden transition-all duration-300 shadow-none"
                  >
                    {/* Image Box */}
                    <div className="relative aspect-[3/4] w-full bg-zinc-100 overflow-hidden">
                      <Link to={`/product/${product.id}`} className="block w-full h-full">
                        <img
                          src={displayImageFront}
                          alt={product.title}
                          className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 group-hover:opacity-0"
                        />
                        <img
                          src={product.imageBack || displayImageFront}
                          alt={product.title}
                          className="absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                        />
                      </Link>

                      {/* Wishlist Button (Clean, No Badge Behind It) */}
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-white/90 text-zinc-700 hover:text-red-600 transition-colors cursor-pointer rounded-none z-10"
                        aria-label="Wishlist"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-red-600 text-red-600' : 'stroke-[1.6]'}`} />
                      </button>

                      {/* Desktop Hover Quick Add */}
                      <div className="hidden sm:flex absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex-col gap-2 z-10">
                        <div className="flex items-center justify-center gap-1.5">
                          {product.sizes.map((s) => (
                            <button
                              key={s}
                              onClick={() => setSelectedSizes({ ...selectedSizes, [product.id]: s })}
                              className={`w-6 h-6 text-[10px] font-medium transition-all cursor-pointer rounded-none border ${
                                selectedSize === s
                                  ? 'bg-white text-black border-white font-bold'
                                  : 'bg-black/60 text-white border-white/40 hover:border-white'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => handleQuickAdd(product)}
                          className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wider rounded-none transition-colors cursor-pointer flex items-center justify-center gap-1"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Quick Add ({selectedSize})</span>
                        </button>
                      </div>
                    </div>

                    {/* Product Info with 4px Left Padding (pl-1) */}
                    <div className="pt-2.5 pb-2 pl-1 pr-1 flex flex-col justify-between flex-1 space-y-1.5">
                      
                      {/* Available Colors Row (Smaller Dots w-2.5 h-2.5 with 4px left padding) */}
                      {colors.length > 0 && (
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5">
                            {colors.map((c, cIdx) => (
                              <button
                                key={cIdx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedColors(prev => ({ ...prev, [product.id]: cIdx }));
                                }}
                                style={{ backgroundColor: c.hex }}
                                title={c.name}
                                className={`w-2.5 h-2.5 rounded-full transition-transform cursor-pointer border ${
                                  activeColorIndex === cIdx
                                    ? 'ring-1 ring-black ring-offset-1 scale-110 border-black/40'
                                    : 'border-zinc-300 hover:scale-110'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[9.5px] text-zinc-400 font-medium">
                            {colors.length} {colors.length === 1 ? 'Color' : 'Colors'}
                          </span>
                        </div>
                      )}

                      {/* Title with link to Product Detail Page */}
                      <Link to={`/product/${product.id}`}>
                        <h3 className="text-xs sm:text-sm font-medium text-zinc-900 line-clamp-1 leading-snug hover:text-red-600 transition-colors">
                          {product.title}
                        </h3>
                      </Link>

                      {/* Pricing */}
                      <div className="flex items-baseline gap-2 pt-0.5">
                        <span className="text-sm sm:text-base font-bold text-zinc-950">
                          ₹{product.price.toLocaleString()}
                        </span>
                        <span className="text-xs text-zinc-400 line-through">
                          ₹{product.originalPrice.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-600 ml-auto">
                          {product.discount}
                        </span>
                      </div>

                      {/* Mobile Add to Bag */}
                      <div className="sm:hidden pt-1.5">
                        <button
                          onClick={() => handleQuickAdd(product)}
                          className="w-full py-1.5 bg-black active:bg-red-600 text-white text-[10px] font-medium uppercase tracking-wider rounded-none transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>Add to Bag</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
