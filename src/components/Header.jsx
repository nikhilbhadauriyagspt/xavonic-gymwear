import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search, 
  User, 
  Heart, 
  ShoppingBag, 
  Menu, 
  X, 
  ChevronDown,
  ArrowRight,
  Home,
  Layers,
  Sparkles,
  ChevronRight,
  Tag,
  Gift,
  Copy,
  CheckCircle2,
  ExternalLink,
  Percent
} from 'lucide-react';
import { toast } from 'sonner';
import logoWhite from '../assets/logo_white.png';
import logoBlack from '../assets/logo_balck.png';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import SearchModal from './SearchModal';
import { ADMIN_API_BASE } from '../config/api';
import { getPublicBanners } from '../services/bannerService';
import { fetchLiveCategories } from '../services/productService';

const DEFAULT_ANNOUNCEMENTS = [
  { text: 'Free express shipping on all orders over ₹999', highlight: 'Free Delivery', code: null },
  { text: 'Get 10% OFF on all gymwear', highlight: 'Use Code', code: 'PUMP10' },
  { text: 'Extra 10% instant discount on Prepaid Orders', highlight: 'Prepaid Offer', code: null },
  { text: 'Engineered for Performance • New Drops Live Now', highlight: 'New In', code: null },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState(null);
  const [categoriesList, setCategoriesList] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Dynamic Announcement Ticker States
  const [announcements, setAnnouncements] = useState(DEFAULT_ANNOUNCEMENTS);
  const [currentAnnouncementIdx, setCurrentAnnouncementIdx] = useState(0);

  // Announcement & Promo Popup Modal State
  const [isOffersModalOpen, setIsOffersModalOpen] = useState(false);
  const [announcementBanners, setAnnouncementBanners] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);

  const location = useLocation();
  const { openCart, totalItemsCount } = useCart();
  const { handleAccountClick, isLoggedIn, user } = useAuth();
  const { wishlistCount } = useWishlist();

  // Fetch live announcement & offers configuration
  useEffect(() => {
    let isMounted = true;
    async function loadOffers() {
      try {
        const res = await fetch(`${ADMIN_API_BASE}/settings/offers`);
        const data = await res.json();
        if (isMounted && data.success && data.config) {
          const cfg = data.config;
          const list = [];
          
          if (Array.isArray(cfg.announcements) && cfg.announcements.length > 0) {
            cfg.announcements.forEach(a => {
              if (a.text) list.push(a);
            });
          }

          if (list.length === 0) {
            if (cfg.free_shipping_threshold) {
              list.push({ text: `Free express shipping on all orders over ₹${cfg.free_shipping_threshold}`, highlight: 'Free Delivery', code: null });
            }
            if (Array.isArray(cfg.coupons) && cfg.coupons.length > 0) {
              cfg.coupons.forEach(c => {
                list.push({ text: `${c.description || `${c.value}% OFF`}`, highlight: 'Use Code', code: c.code });
              });
            }
            if (cfg.prepaid_discount_enabled) {
              list.push({ text: cfg.prepaid_discount_label || `Extra ${cfg.prepaid_discount_percent || 10}% OFF on Prepaid Orders`, highlight: 'Prepaid Deal', code: null });
            }
          }

          if (list.length > 0) {
            setAnnouncements(list);
          }
        }
      } catch (err) {
        console.warn('Could not load announcements:', err);
      }
    }
    loadOffers();
    return () => { isMounted = false; };
  }, []);

  // Fetch live announcement banners
  useEffect(() => {
    let isMounted = true;
    async function loadBanners() {
      try {
        const banners = await getPublicBanners('announcement');
        if (isMounted && Array.isArray(banners) && banners.length > 0) {
          setAnnouncementBanners(banners);
        }
      } catch (err) {
        console.warn('Could not load announcement banners:', err);
      }
    }
    loadBanners();
    return () => { isMounted = false; };
  }, []);

  // Fetch live custom brand logos & identity
  const [customLogos, setCustomLogos] = useState({ white: '', black: '', name: 'Xavonic Athletics' });
  useEffect(() => {
    let isMounted = true;
    async function loadBrandIdentity() {
      try {
        const res = await fetch(`${ADMIN_API_BASE}/settings/brand-content`);
        const resData = await res.json();
        if (isMounted && resData.success && resData.content) {
          setCustomLogos({
            white: resData.content.logo_white || '',
            black: resData.content.logo_black || '',
            name: resData.content.brand_name || 'Xavonic Athletics',
          });
        }
      } catch (_) {}
    }
    loadBrandIdentity();
    return () => { isMounted = false; };
  }, []);

  const handleCopyCoupon = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Rotate announcements every 3.8 seconds with smooth fade transition
  useEffect(() => {
    if (!announcements || announcements.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAnnouncementIdx((prev) => (prev + 1) % announcements.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [announcements]);

  // 1. Fetch live categories from backend / MySQL DB
  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const cats = await fetchLiveCategories();
        if (isMounted && Array.isArray(cats) && cats.length > 0) {
          setCategoriesList(cats);
        }
      } catch (err) {
        console.warn('Could not load live categories for header navigation:', err);
      } finally {
        if (isMounted) setIsLoadingCategories(false);
      }
    }
    loadCategories();
    return () => { isMounted = false; };
  }, []);

  // 2. Scroll listener with hysteresis threshold to prevent jumpy glitch
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > 80) {
        setIsScrolled(true);
      } else if (currentY < 20) {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mega menu and mobile drawer on route change
  useEffect(() => {
    setActiveMegaMenu(null);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // 3. Build Dynamic Mega Menu & Navigation Structure from Live Categories Tree
  const { navLinks, megaMenus } = useMemo(() => {
    const mainCats = categoriesList.filter(c => c.level === 'main' || !c.parent_id);
    const subCats = categoriesList.filter(c => c.level === 'sub');
    const itemTypes = categoriesList.filter(c => c.level === 'item_type');

    const menus = {};
    const links = [];

    // Fallback data if categories haven't loaded yet
    const menImage = categoriesList.find(c => c.slug === 'men')?.image_url || 'https://res.cloudinary.com/fwlidd7t/image/upload/v1790805028/guidelya/products/fytbuv7tb2t6q5lkfukh.jpg';
    const womenImage = categoriesList.find(c => c.slug === 'women')?.image_url || 'https://res.cloudinary.com/fwlidd7t/image/upload/v1790805017/guidelya/products/jar1kslgtpww9gjudcro.jpg';

    // Populate Men mega menu
    const menMain = mainCats.find(c => c.slug === 'men') || { id: 1, name: 'Men', slug: 'men' };
    const menSubs = subCats.filter(c => c.parent_id === menMain.id || c.gender_target === 'Men');
    
    menus['Men'] = {
      name: 'Men',
      slug: 'men',
      categories: menSubs.length > 0 ? menSubs.map(sub => ({
        id: sub.id,
        title: sub.name,
        slug: sub.slug,
        items: itemTypes
          .filter(item => item.parent_id === sub.id)
          .map(item => ({
            name: item.name,
            slug: item.slug,
            path: `/collections/${item.slug}`
          }))
      })) : [
        {
          title: 'Gym T-Shirts & Tops',
          slug: 'men-t-shirts',
          items: [
            { name: 'Compression T-Shirts', slug: 'compression', path: '/collections/compression' },
            { name: 'Oversized T-Shirts', slug: 'oversized', path: '/collections/oversized' },
            { name: 'Drop Cut T-Shirts', slug: 'drop-cut', path: '/collections/drop-cut' },
            { name: 'Tanks & Stringers', slug: 'tanks', path: '/collections/tanks' },
            { name: 'Acid Wash Collection', slug: 'acid-wash', path: '/collections/acid-wash' },
          ]
        },
        {
          title: 'Gym Lowers & Bottoms',
          slug: 'men-lowers-bottoms',
          items: [
            { name: 'Gym Lowers & Joggers', slug: 'lowers', path: '/collections/lowers' },
            { name: 'Athletic Trackpants', slug: 'trackpants', path: '/collections/trackpants' },
            { name: '5" Training Shorts', slug: 'shorts', path: '/collections/shorts' },
            { name: 'Cargo Gym Lowers', slug: 'cargo-lowers', path: '/collections/cargo-lowers' },
          ]
        }
      ],
      featuredCard: {
        title: 'Acid Wash Drop',
        desc: 'Heavyweight pump cover essentials engineered for performance.',
        cta: 'Explore Men Collection',
        path: '/collections/men',
        image: menImage
      }
    };

    // Populate Women mega menu
    const womenMain = mainCats.find(c => c.slug === 'women') || { id: 2, name: 'Women', slug: 'women' };
    const womenSubs = subCats.filter(c => c.parent_id === womenMain.id || c.gender_target === 'Women');

    menus['Women'] = {
      name: 'Women',
      slug: 'women',
      categories: womenSubs.length > 0 ? womenSubs.map(sub => ({
        id: sub.id,
        title: sub.name,
        slug: sub.slug,
        items: itemTypes
          .filter(item => item.parent_id === sub.id)
          .map(item => ({
            name: item.name,
            slug: item.slug,
            path: `/collections/${item.slug}`
          }))
      })) : [
        {
          title: 'Activewear Tops',
          slug: 'women-tops',
          items: [
            { name: 'High Impact Sports Bras', slug: 'sports-bras', path: '/collections/sports-bras' },
            { name: 'Seamless Ribbed Tanks', slug: 'ribbed-tanks', path: '/collections/ribbed-tanks' },
            { name: 'Oversized Pump Covers', slug: 'women-oversized', path: '/collections/women-oversized' },
          ]
        },
        {
          title: 'Bottoms & Leggings',
          slug: 'women-bottoms',
          items: [
            { name: 'Seamless Squat Leggings', slug: 'squat-leggings', path: '/collections/squat-leggings' },
            { name: 'Contour Sculpt Shorts', slug: 'contour-shorts', path: '/collections/contour-shorts' },
            { name: 'Aesthetic Flared Pants', slug: 'flared-pants', path: '/collections/flared-pants' },
          ]
        },
        {
          title: 'Co-ords & Outerwear',
          slug: 'women-outerwear',
          items: [
            { name: 'Matching Gym Co-ord Sets', slug: 'coord-sets', path: '/collections/coord-sets' },
            { name: 'Zip-up Gym Jackets', slug: 'gym-jackets', path: '/collections/gym-jackets' },
            { name: 'Cropped Fleece Hoodies', slug: 'cropped-hoodies', path: '/collections/cropped-hoodies' },
          ]
        }
      ],
      featuredCard: {
        title: 'Seamless Sculpt',
        desc: 'Zero distraction, 100% squat-proof aesthetic activewear.',
        cta: 'Shop Women Collection',
        path: '/collections/women',
        image: womenImage
      }
    };

    // Primary Navigation items list
    links.push({ name: 'Men', type: 'mega', key: 'Men', path: '/collections/men' });
    links.push({ name: 'Women', type: 'mega', key: 'Women', path: '/collections/women' });
    links.push({ name: 'Oversized', type: 'link', path: '/collections/oversized' });
    links.push({ name: 'Tanks & Stringers', type: 'link', path: '/collections/tanks' });
    links.push({ name: 'Bestsellers', type: 'link', path: '/bestsellers', isHighlight: true });
    links.push({ name: 'New Drops', type: 'link', path: '/new-drops' });
    links.push({ name: 'Collections', type: 'link', path: '/collections' });

    return { navLinks: links, megaMenus: menus };
  }, [categoriesList]);

  const toggleMobileCategory = (catKey) => {
    setExpandedMobileCategory(prev => prev === catKey ? null : catKey);
  };

  return (
    <>
      {/* 1. TOP ANNOUNCEMENT BAR (Smooth Dynamic Rotation & Clickable Promo Drawer) */}
      <div 
        onClick={() => setIsOffersModalOpen(true)}
        className="w-full bg-white hover:bg-neutral-50 text-zinc-900 border-b border-zinc-200 py-2 px-4 sm:px-8 text-center text-xs font-normal flex items-center justify-center gap-2.5 rounded-none tracking-normal overflow-hidden h-8.5 select-none cursor-pointer transition-colors group"
        title="Click to view all active deals & promo codes"
      >
        <span className="w-1.5 h-1.5 bg-red-600 inline-block animate-pulse shrink-0"></span>
        <div className="relative overflow-hidden h-5 flex items-center justify-center min-w-0 max-w-2xl">
          {announcements.map((ann, idx) => {
            const isActive = idx === currentAnnouncementIdx;
            return (
              <div
                key={idx}
                className={`flex items-center justify-center gap-2 transition-all duration-500 transform ${
                  isActive
                    ? 'opacity-100 translate-y-0 relative'
                    : 'opacity-0 translate-y-3 absolute pointer-events-none'
                }`}
              >
                <span className="truncate text-xs font-medium text-neutral-800 group-hover:text-black">
                  {ann.text}
                </span>
                {ann.code && (
                  <span className="inline-flex items-center gap-1 shrink-0">
                    <span className="hidden sm:inline text-zinc-400 font-light">|</span>
                    <span className="text-[11px] text-zinc-600 font-normal">Use code</span>
                    <strong className="text-red-600 font-bold bg-neutral-100 group-hover:bg-white px-1.5 py-0.5 border border-neutral-300 font-mono tracking-wider text-[11px]">
                      {ann.code}
                    </strong>
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <span className="hidden lg:inline-block text-[10px] uppercase font-bold text-neutral-400 group-hover:text-red-600 tracking-wider ml-1 transition-colors">
          View All Offers →
        </span>
      </div>

      {/* 2. STICKY MAIN NAVIGATION BAR */}
      <header 
        className={`sticky top-0 z-50 w-full select-none rounded-none font-sans tracking-normal transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md border-b border-zinc-200 shadow-sm' 
            : 'bg-black border-b border-zinc-900'
        }`}
        onMouseLeave={() => setActiveMegaMenu(null)}
      >
        <div className="w-full px-4 sm:px-8 lg:px-12 h-18 sm:h-20 flex items-center justify-between gap-6 transition-all duration-300">
          
          {/* LEFT: Mobile Menu Button & Brand Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 -ml-2 transition-colors cursor-pointer rounded-none ${
                isScrolled ? 'text-zinc-700 hover:text-black' : 'text-zinc-300 hover:text-white'
              }`}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Brand Logo (Switches smoothly between white and black logo, supporting custom admin uploads) */}
            <Link to="/" className="flex items-center shrink-0 py-1">
              <img 
                src={isScrolled ? (customLogos.black || logoBlack) : (customLogos.white || logoWhite)} 
                alt={customLogos.name || "Xavonic Athletics"} 
                className="h-10 sm:h-12 md:h-14 w-auto object-contain transition-all duration-300"
              />
            </Link>
          </div>

          {/* CENTER: Dynamic Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((item, idx) => (
              <div
                key={idx}
                className="h-18 sm:h-20 flex items-center relative"
                onMouseEnter={() => item.type === 'mega' ? setActiveMegaMenu(item.key) : setActiveMegaMenu(null)}
              >
                <Link
                  to={item.path || '#'}
                  className={`flex items-center gap-1.5 text-sm transition-colors duration-150 py-2 border-b-2 tracking-normal ${
                    activeMegaMenu === item.key
                      ? 'border-red-600 text-red-600 font-medium'
                      : item.isHighlight
                      ? 'border-transparent text-red-600 font-medium flex items-center gap-1'
                      : isScrolled
                      ? 'border-transparent text-zinc-700 hover:text-black font-normal'
                      : 'border-transparent text-zinc-300 hover:text-white font-normal'
                  }`}
                >
                  {item.isHighlight && <Sparkles className="w-3.5 h-3.5 text-red-600" />}
                  <span>{item.name}</span>
                  {item.type === 'mega' && (
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${
                      isScrolled ? 'text-zinc-400' : 'text-zinc-500'
                    } ${activeMegaMenu === item.key ? 'rotate-180 text-red-600' : ''}`} />
                  )}
                </Link>
              </div>
            ))}
          </nav>

          {/* RIGHT: Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className={`p-2 sm:p-2.5 transition-colors cursor-pointer rounded-none ${
                isScrolled 
                  ? 'text-zinc-700 hover:text-black hover:bg-zinc-100' 
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
              }`}
              title="Search"
              aria-label="Search"
            >
              <Search className="w-5 h-5 stroke-[1.6]" />
            </button>

            {/* Account / User Avatar Button */}
            <button
              onClick={handleAccountClick}
              className={`relative hidden sm:flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 transition-colors cursor-pointer rounded-full ${
                isScrolled 
                  ? 'text-zinc-700 hover:text-black hover:bg-zinc-100' 
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
              }`}
              title={isLoggedIn ? `Account (${user?.displayName || user?.name || 'User'})` : "Account Login"}
              aria-label="Account"
            >
              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-7 h-7 rounded-full bg-red-600 text-white font-bold text-[11px] flex items-center justify-center tracking-tight shadow-xs uppercase">
                      {user?.initials || 'U'}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-black" />
                  </div>
                  <span className="hidden xl:inline text-xs font-medium">
                    {user?.name?.split(' ')[0] || user?.displayName || 'User'}
                  </span>
                </div>
              ) : (
                <User className="w-5 h-5 stroke-[1.6]" />
              )}
            </button>

            <Link
              to="/wishlist"
              className={`relative hidden sm:flex p-2.5 transition-colors cursor-pointer rounded-none ${
                isScrolled 
                  ? 'text-zinc-700 hover:text-black hover:bg-zinc-100' 
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
              }`}
              title="My Wishlist"
              aria-label="Wishlist"
            >
              <Heart className={`w-5 h-5 stroke-[1.6] ${wishlistCount > 0 ? 'fill-red-600 text-red-600' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-3.5 h-3.5 bg-red-600 text-white font-normal text-[9px] flex items-center justify-center px-0.5 rounded-none leading-none animate-scale-in">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart with Sharp Red Badge */}
            <button
              onClick={openCart}
              className={`relative p-2 sm:p-2.5 transition-colors cursor-pointer rounded-none ${
                isScrolled 
                  ? 'text-zinc-700 hover:text-black hover:bg-zinc-100' 
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
              }`}
              title="Bag"
              aria-label="Bag"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.6]" />
              {totalItemsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-3.5 h-3.5 bg-red-600 text-white font-normal text-[9px] flex items-center justify-center px-0.5 rounded-none leading-none animate-scale-in">
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* 3. DYNAMIC MEGA DROPDOWN */}
        {activeMegaMenu && megaMenus[activeMegaMenu] && (
          <div 
            className="w-full bg-black border-b border-zinc-800 shadow-2xl transition-all duration-150 rounded-none animate-in fade-in slide-in-from-top-1"
            onMouseEnter={() => setActiveMegaMenu(activeMegaMenu)}
            onMouseLeave={() => setActiveMegaMenu(null)}
          >
            <div className="w-full px-4 sm:px-8 lg:px-12 py-8 grid grid-cols-12 gap-10">
              
              {/* Left 8 Cols: Dynamic Category Columns */}
              <div className="col-span-12 lg:col-span-8 grid grid-cols-3 gap-8">
                {megaMenus[activeMegaMenu].categories.map((col, cIdx) => (
                  <div key={cIdx} className="space-y-3.5">
                    <Link
                      to={`/collections/${col.slug}`}
                      className="group flex items-center gap-2 text-xs font-semibold text-white border-b border-zinc-800 pb-2.5 tracking-normal hover:text-red-500 transition-colors"
                    >
                      <span className="w-1.5 h-1.5 bg-red-600 inline-block"></span>
                      <span>{col.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-red-500" />
                    </Link>
                    
                    <ul className="space-y-2">
                      {col.items && col.items.length > 0 ? (
                        col.items.map((item, iIdx) => (
                          <li key={iIdx}>
                            <Link
                              to={item.path}
                              className="group/item flex items-center text-xs font-normal text-zinc-400 hover:text-white transition-colors tracking-normal"
                            >
                              <span className="group-hover/item:text-red-500 group-hover/item:translate-x-1 transition-all duration-150">
                                {item.name}
                              </span>
                            </Link>
                          </li>
                        ))
                      ) : (
                        <li>
                          <Link
                            to={`/collections/${col.slug}`}
                            className="text-xs text-zinc-500 hover:text-zinc-300"
                          >
                            Explore All in {col.title}
                          </Link>
                        </li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Right 4 Cols: Clean Sharp Featured Card */}
              <div className="col-span-12 lg:col-span-4">
                <Link
                  to={megaMenus[activeMegaMenu].featuredCard.path}
                  className="relative block border border-zinc-800 bg-zinc-950 group h-full min-h-[220px] overflow-hidden rounded-none"
                >
                  <img
                    src={megaMenus[activeMegaMenu].featuredCard.image}
                    alt={megaMenus[activeMegaMenu].featuredCard.title}
                    className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-75 rounded-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                  <div className="relative z-10 p-6 flex flex-col justify-end h-full space-y-1.5">
                    <div className="w-6 h-0.5 bg-red-600"></div>
                    <h3 className="text-base font-semibold text-white tracking-normal group-hover:text-red-400 transition-colors">
                      {megaMenus[activeMegaMenu].featuredCard.title}
                    </h3>
                    <p className="text-xs text-zinc-300 leading-relaxed font-normal tracking-normal">
                      {megaMenus[activeMegaMenu].featuredCard.desc}
                    </p>
                    <div className="inline-flex items-center gap-1.5 text-xs font-normal text-white group-hover:text-red-500 transition-colors pt-1 tracking-normal">
                      <span>{megaMenus[activeMegaMenu].featuredCard.cta}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-red-500" />
                    </div>
                  </div>
                </Link>
              </div>

            </div>
          </div>
        )}

        {/* 4. MOBILE DRAWER WITH ACCORDION CATEGORIES */}
        {mobileMenuOpen && (
          <div className="lg:hidden w-full bg-black border-b border-zinc-800 px-5 py-6 space-y-4 max-h-[85vh] overflow-y-auto rounded-none tracking-normal">
            <div className="space-y-2">
              {navLinks.map((item, idx) => (
                <div key={idx} className="border-b border-zinc-900 py-3">
                  {item.type === 'mega' ? (
                    <div>
                      <div className="flex items-center justify-between">
                        <Link
                          to={item.path || '#'}
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-sm font-medium text-zinc-100 hover:text-red-500"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => toggleMobileCategory(item.key)}
                          className="p-1.5 text-zinc-400 hover:text-white cursor-pointer"
                        >
                          <ChevronDown 
                            className={`w-4 h-4 transition-transform duration-200 ${
                              expandedMobileCategory === item.key ? 'rotate-180 text-red-600' : ''
                            }`} 
                          />
                        </button>
                      </div>

                      {/* Expandable subcategories & item-types */}
                      {expandedMobileCategory === item.key && megaMenus[item.key] && (
                        <div className="pl-3 pt-3 space-y-3">
                          {megaMenus[item.key].categories.map((col, cIdx) => (
                            <div key={cIdx} className="space-y-1.5 border-l border-zinc-800 pl-3">
                              <Link
                                to={`/collections/${col.slug}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block text-xs font-semibold text-red-500 hover:underline"
                              >
                                {col.title}
                              </Link>
                              {col.items?.map((sub, sIdx) => (
                                <Link
                                  key={sIdx}
                                  to={sub.path}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="block text-xs text-zinc-400 hover:text-white py-1 font-normal"
                                >
                                  {sub.name}
                                </Link>
                              ))}
                            </div>
                          ))}
                          
                          <Link
                            to={megaMenus[item.key].featuredCard.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className="inline-flex items-center gap-1.5 text-xs text-red-500 font-medium pt-2"
                          >
                            <span>{megaMenus[item.key].featuredCard.cta}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.path || '#'}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-1.5 text-sm font-normal ${
                        item.isHighlight ? 'text-red-600 font-medium' : 'text-zinc-200 hover:text-white'
                      }`}
                    >
                      {item.isHighlight && <Sparkles className="w-3.5 h-3.5 text-red-600" />}
                      <span>{item.name}</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* User Account & Direct Wishlist Links in Mobile Menu */}
            <div className="pt-4 flex items-center justify-around text-xs font-normal text-zinc-400 border-t border-zinc-900">
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleAccountClick();
                }}
                className="flex items-center gap-2 py-2 text-zinc-300 hover:text-white font-normal cursor-pointer"
              >
                {isLoggedIn ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-[10px] flex items-center justify-center uppercase">
                      {user?.initials || 'U'}
                    </div>
                    <span className="font-medium text-white">{user?.name || user?.displayName || 'User'}</span>
                  </div>
                ) : (
                  <>
                    <User className="w-4 h-4 text-red-600" />
                    <span>Account Login</span>
                  </>
                )}
              </button>

              <Link 
                to="/wishlist" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-1.5 py-2 text-zinc-300 hover:text-white font-normal"
              >
                <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'fill-red-600 text-red-600' : 'text-red-600'}`} />
                <span>Wishlist {wishlistCount > 0 ? `(${wishlistCount})` : ''}</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 5. ULTRA-LIGHTWEIGHT MOBILE BOTTOM NAVIGATION BAR */}
      <nav 
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200/80 px-2 py-1.5 flex items-center justify-around shadow-[0_-2px_10px_rgba(0,0,0,0.04)]"
        aria-label="Mobile bottom navigation"
      >
        {/* Home */}
        <Link 
          to="/" 
          className="flex flex-col items-center gap-0.5 py-1 px-3 text-zinc-800 hover:text-black transition-colors"
        >
          <Home className="w-5 h-5 stroke-[1.6]" />
          <span className="text-[10px] font-medium tracking-tight">Home</span>
        </Link>

        {/* Collections / Shop */}
        <Link 
          to="/collections" 
          className="flex flex-col items-center gap-0.5 py-1 px-3 text-zinc-500 hover:text-black transition-colors"
        >
          <Layers className="w-5 h-5 stroke-[1.6]" />
          <span className="text-[10px] font-normal tracking-tight">Shop</span>
        </Link>

        {/* Search */}
        <button 
          onClick={() => setIsSearchOpen(true)}
          className="flex flex-col items-center gap-0.5 py-1 px-3 text-zinc-500 hover:text-black transition-colors cursor-pointer"
        >
          <Search className="w-5 h-5 stroke-[1.6]" />
          <span className="text-[10px] font-normal tracking-tight">Search</span>
        </button>

        {/* Account / Avatar Trigger */}
        <button 
          onClick={handleAccountClick}
          className="relative flex flex-col items-center gap-0.5 py-1 px-3 text-zinc-500 hover:text-black transition-colors cursor-pointer"
        >
          <div className="relative">
            {isLoggedIn ? (
              <div className="w-5 h-5 rounded-full bg-red-600 text-white font-bold text-[9px] flex items-center justify-center uppercase">
                {user?.initials || 'U'}
              </div>
            ) : (
              <User className="w-5 h-5 stroke-[1.6]" />
            )}
            {isLoggedIn && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
            )}
          </div>
          <span className="text-[10px] font-normal tracking-tight">
            {isLoggedIn ? 'Profile' : 'Account'}
          </span>
        </button>

        {/* Cart Trigger */}
        <button 
          onClick={openCart}
          className="relative flex flex-col items-center gap-0.5 py-1 px-3 text-zinc-500 hover:text-black transition-colors cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 stroke-[1.6]" />
            {totalItemsCount > 0 && (
              <span className="absolute -top-1 -right-1.5 min-w-3.5 h-3.5 bg-red-600 text-white font-medium text-[9px] flex items-center justify-center px-0.5 rounded-full leading-none">
                {totalItemsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-normal tracking-tight">Bag</span>
        </button>
      </nav>

      {/* 6. CLEAN MODERN SEARCH MODAL */}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />

      {/* 7. ULTRA-SLEEK ANNOUNCEMENTS & PROMOTIONAL OFFERS POPUP MODAL */}
      {isOffersModalOpen && (
        <div 
          className="fixed inset-0 z-[160] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200 font-sans"
          onClick={() => setIsOffersModalOpen(false)}
        >
          <div 
            className="relative w-full max-w-lg bg-white rounded-none border border-neutral-300 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-200 bg-neutral-950 text-white">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <div>
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
                    Exclusive Deals & Store Offers
                  </h3>
                  <p className="text-[10px] text-neutral-400">
                    Apply promo codes at checkout for instant savings
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsOffersModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content / Scrollable Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 divide-y divide-neutral-100">
              
              {/* Active Promotional Banners (If Configured in Admin) */}
              {announcementBanners.length > 0 && (
                <div className="space-y-3 pb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block">
                    Featured Campaign
                  </span>
                  <div className="space-y-3">
                    {announcementBanners.map((b) => (
                      <Link
                        key={b.id}
                        to={b.link_url || '/collections'}
                        onClick={() => setIsOffersModalOpen(false)}
                        className="group relative block overflow-hidden border border-neutral-200 bg-neutral-100 aspect-21/9"
                      >
                        <img 
                          src={b.image_url} 
                          alt={b.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4 text-white">
                          {b.badge_text && (
                            <span className="inline-block self-start px-2 py-0.5 bg-red-600 text-white text-[9px] font-bold uppercase tracking-widest mb-1">
                              {b.badge_text}
                            </span>
                          )}
                          <h4 className="text-sm font-bold uppercase tracking-wide leading-tight">{b.title}</h4>
                          {b.subtitle && (
                            <p className="text-[11px] text-neutral-300 line-clamp-1 mt-0.5">{b.subtitle}</p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Coupons & Promo Codes List */}
              <div className="space-y-3 pt-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block">
                  Active Coupons & Promo Codes
                </span>

                <div className="space-y-2.5">
                  {announcements.filter(a => a.code).length > 0 ? (
                    announcements.filter(a => a.code).map((ann, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between gap-3 p-3.5 bg-neutral-50 border border-neutral-200 rounded-none hover:border-neutral-400 transition-colors"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Tag className="w-3.5 h-3.5 text-red-600 shrink-0" />
                            <span className="font-bold text-xs text-neutral-900 font-mono tracking-wider bg-white px-2 py-0.5 border border-neutral-300">
                              {ann.code}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-600 font-medium pt-1">
                            {ann.text}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyCoupon(ann.code)}
                          className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                            copiedCode === ann.code
                              ? 'bg-emerald-600 text-white'
                              : 'bg-neutral-900 text-white hover:bg-black'
                          }`}
                        >
                          {copiedCode === ann.code ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-between gap-3 p-3.5 bg-neutral-50 border border-neutral-200">
                      <div>
                        <span className="font-bold text-xs text-neutral-900 font-mono bg-white px-2 py-0.5 border border-neutral-300">
                          PUMP10
                        </span>
                        <p className="text-xs text-neutral-600 font-medium mt-1">
                          Get 10% OFF on all activewear & orders
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyCoupon('PUMP10')}
                        className="px-3 py-1.5 bg-neutral-900 text-white text-xs font-semibold uppercase tracking-wider"
                      >
                        Copy
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Special Store Perks */}
              <div className="space-y-3 pt-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block">
                  Storewide Benefits
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 bg-neutral-50 border border-neutral-200 flex items-start gap-2.5">
                    <span className="p-1.5 bg-white border border-neutral-200 text-neutral-900 shrink-0">🚚</span>
                    <div>
                      <h5 className="text-xs font-bold uppercase text-neutral-900">Free Express Shipping</h5>
                      <p className="text-[11px] text-neutral-500 mt-0.5">On all orders above ₹999 across India</p>
                    </div>
                  </div>

                  <div className="p-3 bg-neutral-50 border border-neutral-200 flex items-start gap-2.5">
                    <span className="p-1.5 bg-white border border-neutral-200 text-neutral-900 shrink-0">💳</span>
                    <div>
                      <h5 className="text-xs font-bold uppercase text-neutral-900">10% Prepaid Bonus</h5>
                      <p className="text-[11px] text-neutral-500 mt-0.5">Instant off with UPI, Cards & NetBanking</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Bottom CTA */}
            <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between gap-3">
              <span className="text-[11px] text-neutral-500 font-medium">
                Tap anywhere to explore collections
              </span>
              <Link
                to="/collections"
                onClick={() => setIsOffersModalOpen(false)}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
