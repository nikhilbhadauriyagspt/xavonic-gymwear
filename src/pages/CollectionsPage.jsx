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
import { fetchLiveProducts, fetchLiveCategories } from '../services/productService';
import { allCategories as fallbackCategories, allProducts as fallbackProducts } from '../data/productsData';

import heroOversized from '../assets/hero_oversized.jpg';
import heroCompression from '../assets/hero_compression.jpg';
import catShorts from '../assets/cat_shorts.jpg';
import heroJoggers from '../assets/hero_joggers.jpg';
import catStringers from '../assets/cat_stringers.jpg';
import catDropcut from '../assets/cat_dropcut.jpg';
import spotlightFront from '../assets/spotlight_front.jpg';
import catTrackpants from '../assets/cat_trackpants.jpg';

const localCategoryImages = {
  'oversized': heroOversized,
  'compression': heroCompression,
  'shorts': catShorts,
  'lowers': heroJoggers,
  'tanks': catStringers,
  'drop-cut': catDropcut,
  'acid-wash': spotlightFront,
  'trackpants': catTrackpants,
  'cargo-lowers': catTrackpants,
  'men': heroOversized,
  'women': heroCompression,
  'men-t-shirts': heroOversized,
  'men-lowers-bottoms': heroJoggers,
};

export default function CollectionsPage() {
  const { categorySlug: paramSlug } = useParams();
  const location = useLocation();
  const { addToCart, openCart } = useCart();

  const [allProductsList, setAllProductsList] = useState(fallbackProducts);
  const [categoriesList, setCategoriesList] = useState(fallbackCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [prods, cats] = await Promise.all([
          fetchLiveProducts(),
          fetchLiveCategories(),
        ]);
        if (isMounted) {
          if (prods && prods.length > 0) setAllProductsList(prods);
          if (cats && cats.length > 0) setCategoriesList(cats);
        }
      } catch (err) {
        console.warn('Could not fetch live collections data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

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

  // Clean list of display categories on main /collections page
  const displayCategories = useMemo(() => {
    if (!categoriesList || categoriesList.length === 0) return fallbackCategories;
    
    // Filter out root containers 'men' and 'women' if item_types exist, so each grid card is a specific fit category
    const itemTypes = categoriesList.filter(c => c.slug !== 'men' && c.slug !== 'women');
    return itemTypes.length > 0 ? itemTypes : categoriesList;
  }, [categoriesList]);

  const activeCategory = useMemo(() => {
    if (!effectiveSlug) return null;
    return categoriesList.find(c => c.slug === effectiveSlug) || {
      slug: effectiveSlug,
      title: effectiveSlug.replace(/-/g, ' ').toUpperCase(),
      subtitle: 'Xavonic Activewear Collection',
      itemCount: 'Available Fits',
      desc: 'Engineered activewear collection for athletic performance and aesthetics.'
    };
  }, [effectiveSlug, categoriesList]);

  const categoryProducts = useMemo(() => {
    if (!effectiveSlug) return [];
    
    // Check if effectiveSlug is a main gender category (e.g. 'men' or 'women')
    if (effectiveSlug === 'men' || effectiveSlug === 'women') {
      const filtered = allProductsList.filter(p => 
        (p.genderTarget && p.genderTarget.toLowerCase() === effectiveSlug) ||
        (p.category && p.category.toLowerCase() === effectiveSlug) ||
        (p.category_slug && p.category_slug.toLowerCase() === effectiveSlug)
      );
      if (filtered.length > 0) return sortList(filtered, sortBy);
    }

    // Check if effectiveSlug is a subcategory (e.g. 'men-t-shirts' or 'men-lowers-bottoms')
    const currentCat = categoriesList.find(c => c.slug === effectiveSlug);
    let targetSlugs = [effectiveSlug];

    if (currentCat) {
      // Find all child item types belonging to this category
      const childSlugs = categoriesList
        .filter(c => c.parent_id === currentCat.id)
        .map(c => c.slug);
      targetSlugs = [...targetSlugs, ...childSlugs];
    }

    let list = allProductsList.filter(p => 
      targetSlugs.includes(p.category) || 
      targetSlugs.includes(p.category_slug)
    );
    
    // Fallback if specific category has no products
    if (list.length === 0) {
      list = allProductsList.slice(0, 8);
    }

    return sortList(list, sortBy);
  }, [effectiveSlug, sortBy, allProductsList, categoriesList]);

  function sortList(list, sort) {
    if (sort === 'price-low') {
      return [...list].sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sort === 'price-high') {
      return [...list].sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sort === 'rating') {
      return [...list].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    }
    return list;
  }

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
    const size = selectedSizes[product.id] || product.sizes?.[0] || 'L';
    addToCart(product, size, 1, product.colors?.[0]?.name || 'Standard');
    openCart();
  };

  // Helper to get image for any category
  const getCategoryImage = (cat) => {
    if (cat.image_url) return cat.image_url;
    if (cat.image) return cat.image;
    if (cat.slug && localCategoryImages[cat.slug]) return localCategoryImages[cat.slug];
    return heroOversized;
  };

  return (
    <div className="w-full bg-white text-zinc-900 font-sans min-h-screen selection:bg-red-600 selection:text-white">
      
      {/* ========================================================================= */}
      {/* CASE 1: ROOT /collections (SHOW ALL CATEGORIES DIRECTORY) */}
      {/* ========================================================================= */}
      {!effectiveSlug ? (
        <div className="w-full">
          
          {/* Header Banner */}
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
                  {displayCategories.length} Categories
                </span>
              </div>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="w-full px-4 sm:px-8 lg:px-12 py-6 sm:py-10">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 w-full">
              {displayCategories.map((cat) => {
                const catImg = getCategoryImage(cat);
                const title = cat.name || cat.title || 'Collection';
                const subtitle = cat.subtitle || 'Engineered Performance';
                const itemCount = cat.itemCount || 'Available Fits';

                return (
                  <Link
                    key={cat.id || cat.slug}
                    to={`/collections/${cat.slug}`}
                    className="group relative block aspect-[4/4.6] w-full overflow-hidden bg-zinc-950 transition-all duration-300 rounded-none cursor-pointer shadow-none"
                  >
                    {/* High-Resolution Photoshoot Image */}
                    <img
                      src={catImg}
                      alt={title}
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out brightness-90 group-hover:brightness-100"
                    />

                    {/* Dark Bottom Gradient for Clean Legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent opacity-90 group-hover:opacity-85 transition-opacity" />

                    {/* Top Red Hover Accent */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Top Count Badge */}
                    <span className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 px-2 py-0.5 bg-black/60 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-medium tracking-wider uppercase rounded-none border border-white/15">
                      {itemCount}
                    </span>

                    {/* Bottom Content with Straight Right Arrow Icon */}
                    <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-4 md:p-5 flex items-end justify-between gap-1.5 sm:gap-3">
                      <div>
                        <h3 className="text-xs sm:text-base md:text-lg font-medium text-white group-hover:text-red-500 transition-colors line-clamp-2">
                          {title}
                        </h3>
                        <p className="hidden sm:block text-[11px] text-zinc-400 line-clamp-1 font-light pt-0.5">
                          {subtitle}
                        </p>
                      </div>

                      {/* Glass Circle with Pure Right Direction Arrow */}
                      <div className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 shrink-0 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-red-600 group-hover:border-red-600 group-hover:scale-110 transition-all duration-300 shadow-lg">
                        <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

        </div>
      ) : (

        /* ========================================================================= */
        /* CASE 2: CATEGORY SPECIFIC PRODUCT CATALOG (/collections/:categorySlug) */
        /* ========================================================================= */
        <div className="w-full">
          
          {/* Top Category Banner */}
          <div className="w-full bg-zinc-50 border-b border-zinc-200 py-6 sm:py-10 px-4 sm:px-8 lg:px-12">
            <div className="w-full space-y-3">
              
              {/* Breadcrumb & Back Link */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Link to="/" className="hover:text-black transition-colors">Home</Link>
                  <span>/</span>
                  <Link to="/collections" className="hover:text-black transition-colors">Collections</Link>
                  <span>/</span>
                  <span className="text-zinc-900 font-medium">{activeCategory.title || activeCategory.name}</span>
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
                    {activeCategory.title || activeCategory.name}
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

          {/* Quick Sub-Categories Filter Strip */}
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

                {displayCategories.map((c) => (
                  <Link
                    key={c.id || c.slug}
                    to={`/collections/${c.slug}`}
                    className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all rounded-none ${
                      effectiveSlug === c.slug
                        ? 'bg-black text-white font-semibold'
                        : 'bg-zinc-100 text-zinc-700 hover:text-black hover:bg-zinc-200'
                    }`}
                  >
                    {c.name || c.title}
                  </Link>
                ))}
              </div>

              {/* Sort Options */}
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <span className="text-xs text-zinc-500 font-medium">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs font-semibold bg-zinc-50 border border-zinc-300 py-1 px-2.5 outline-none cursor-pointer"
                >
                  <option value="featured">Featured Drops</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>

            </div>
          </div>

          {/* Products Grid */}
          <div className="w-full px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
            {categoryProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-sm text-zinc-500">No products found in this category.</p>
                <Link to="/collections" className="inline-block mt-4 px-6 py-2 bg-black text-white text-xs font-medium">
                  Browse All Categories
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {categoryProducts.map((p) => {
                  const isWishlisted = wishlist.includes(p.id);
                  const frontImg = p.imageFront || p.colors?.[0]?.image || p.gallery?.[0] || heroOversized;
                  const backImg = p.imageBack || p.gallery?.[1] || frontImg;
                  const priceFormatted = typeof p.price === 'number' ? `₹${p.price.toLocaleString('en-IN')}` : p.price;
                  const origPriceFormatted = p.originalPrice ? (typeof p.originalPrice === 'number' ? `₹${p.originalPrice.toLocaleString('en-IN')}` : p.originalPrice) : null;
                  const productUrl = `/product/${p.slug || p.id}`;

                  return (
                    <div
                      key={p.id || p.slug}
                      className="group relative flex flex-col bg-white overflow-hidden rounded-none border border-transparent hover:border-zinc-200 transition-all duration-300"
                    >
                      {/* Image Container with Seamless Hover Flip */}
                      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-100">
                        <Link to={productUrl} className="block w-full h-full">
                          <img
                            src={frontImg}
                            alt={p.title}
                            className="absolute inset-0 h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          />
                          <img
                            src={backImg}
                            alt={`${p.title} Alternate`}
                            className="absolute inset-0 h-full w-full object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"
                          />
                        </Link>

                        {/* Wishlist Button */}
                        <button
                          type="button"
                          onClick={() => toggleWishlist(p.id)}
                          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer ${
                            isWishlisted
                              ? 'bg-red-600 text-white'
                              : 'bg-white/80 text-zinc-700 hover:text-red-600 hover:bg-white shadow-xs'
                          }`}
                          aria-label="Save to Wishlist"
                        >
                          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-white' : ''}`} />
                        </button>

                        {/* Quick Size Selection Slide Bar */}
                        <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full group-hover:translate-y-0 transition-transform duration-200 bg-white/95 p-2">
                          <div className="flex items-center justify-center gap-1">
                            {(p.sizes || ['S', 'M', 'L', 'XL']).map((size) => (
                              <button
                                key={size}
                                onClick={() => {
                                  setSelectedSizes(prev => ({ ...prev, [p.id]: size }));
                                  addToCart(p, size, 1, p.colors?.[0]?.name || 'Standard');
                                  openCart();
                                }}
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
                          {p.colors && p.colors.length > 0 && (
                            <div className="flex items-center gap-1">
                              {p.colors.map((c, cIdx) => (
                                <span
                                  key={cIdx}
                                  className="w-2.5 h-2.5 rounded-full border border-zinc-300 inline-block"
                                  style={{ backgroundColor: typeof c === 'string' ? c : c.hex }}
                                />
                              ))}
                            </div>
                          )}

                          <Link to={productUrl} className="block">
                            <h3 className="text-[13px] font-normal text-zinc-900 group-hover:text-red-600 transition-colors line-clamp-1">
                              {p.title}
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
                          {p.discount && (
                            <span className="text-[10px] font-medium text-red-600 ml-auto">
                              {p.discount}
                            </span>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
