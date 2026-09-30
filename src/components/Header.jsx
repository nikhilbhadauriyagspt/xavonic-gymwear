import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Layers
} from 'lucide-react';
import logoWhite from '../assets/logo_white.png';
import logoBlack from '../assets/logo_balck.png';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import SearchModal from './SearchModal';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState(null);
  const { openCart, totalItemsCount } = useCart();
  const { openAuth, openProfile, handleAccountClick, isLoggedIn, user } = useAuth();

  // Scroll listener with hysteresis threshold to prevent jumpy glitch
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

  // Clean Mega Menu Data (Natural Font Case, Normal Weight)
  const megaMenus = {
    Men: {
      categories: [
        {
          title: 'Topwear',
          items: [
            'Oversized T-Shirts',
            'Acid Wash & Drop Cut Tees',
            'Stringers & Gym Tanks',
            'Compression & Baselayers',
            'Hoodies & Sweatshirts',
            'Performance Tees'
          ]
        },
        {
          title: 'Bottomwear',
          items: [
            '5" & 7" Gym Shorts',
            '2-in-1 Compression Shorts',
            'Heavyweight Cargo Joggers',
            'Athletic Track Pants',
            'Casual Sweatpants'
          ]
        },
        {
          title: 'Shop by Fabric',
          items: [
            '240 GSM Heavyweight Cotton',
            '4-Way Stretch Performance',
            'Seamless Anti-Odor Wear',
            'Winter Warm Fleece'
          ]
        }
      ],
      featuredCard: {
        title: 'Acid Wash Drop',
        desc: 'Heavyweight pump cover essentials engineered for performance.',
        cta: 'Explore Collection',
        image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=600&auto=format&fit=crop'
      }
    },
    Women: {
      categories: [
        {
          title: 'Activewear',
          items: [
            'High Impact Sports Bras',
            'Seamless High-Waist Leggings',
            'Crop Tops & Ribbed Tanks',
            'Oversized Pump Covers',
            'Contour Sculpt Shorts'
          ]
        },
        {
          title: 'Outerwear & Sets',
          items: [
            'Matching Gym Co-ord Sets',
            'Zip-up Gym Jackets',
            'Cropped Hoodies',
            'Comfort Joggers'
          ]
        },
        {
          title: 'Collections',
          items: [
            'Contour Sculpt Series',
            'Pure Comfort Loungewear',
            'Ultra-Flex Yoga Series'
          ]
        }
      ],
      featuredCard: {
        title: 'Seamless Sculpt',
        desc: 'Zero distraction, 100% squat-proof aesthetic activewear.',
        cta: 'Shop Collection',
        image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop'
      }
    }
  };

  const navLinks = [
    { name: 'Men', type: 'mega', key: 'Men' },
    { name: 'Women', type: 'mega', key: 'Women' },
    { name: 'Oversized', type: 'link', path: '/oversized' },
    { name: 'Tanks & Stringers', type: 'link', path: '/tanks' },
    { name: 'Bestsellers', type: 'link', path: '/bestsellers', isHighlight: true },
    { name: 'New Drops', type: 'link', path: '/new-drops' },
  ];

  return (
    <>
      {/* 1. TOP ANNOUNCEMENT BAR (Normal Page Flow - naturally scrolls away without layout shift) */}
      <div className="w-full bg-white text-zinc-900 border-b border-zinc-300 py-2 px-4 sm:px-8 text-center text-xs font-normal flex items-center justify-center gap-2.5 rounded-none tracking-normal">
        <span className="w-1.5 h-1.5 bg-red-600 inline-block"></span>
        <span>Free express shipping on all orders over ₹999</span>
        <span className="hidden md:inline text-zinc-300">|</span>
        <span className="hidden md:inline text-zinc-700">
          Use code <strong className="text-red-600 font-medium bg-zinc-100 px-1.5 py-0.5 border border-zinc-300">PUMP10</strong> for 10% off
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

            {/* Brand Logo (Switches smoothly between white and black logo) */}
            <Link to="/" className="flex items-center shrink-0 py-1">
              <img 
                src={isScrolled ? logoBlack : logoWhite} 
                alt="Xavonic Athletics" 
                className="h-10 sm:h-12 md:h-14 w-auto object-contain transition-all duration-300"
              />
            </Link>
          </div>

          {/* CENTER: Natural Typography Navigation Links */}
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
                      ? 'border-transparent text-red-600 font-medium'
                      : isScrolled
                      ? 'border-transparent text-zinc-700 hover:text-black font-normal'
                      : 'border-transparent text-zinc-300 hover:text-white font-normal'
                  }`}
                >
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
              title={isLoggedIn ? `Athlete Portal (${user?.name})` : "Account Login"}
              aria-label="Account"
            >
              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-7 h-7 rounded-full bg-red-600 text-white font-bold text-[11px] flex items-center justify-center tracking-tight shadow-xs">
                      {user?.initials || 'NS'}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-black" />
                  </div>
                  <span className="hidden xl:inline text-xs font-medium">
                    {user?.name?.split(' ')[0] || 'Athlete'}
                  </span>
                </div>
              ) : (
                <User className="w-5 h-5 stroke-[1.6]" />
              )}
            </button>

            <button
              className={`hidden sm:flex p-2.5 transition-colors cursor-pointer rounded-none ${
                isScrolled 
                  ? 'text-zinc-700 hover:text-black hover:bg-zinc-100' 
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
              }`}
              title="Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 stroke-[1.6]" />
            </button>

            {/* Cart with Sharp Red Badge (Opens Cart Drawer) */}
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
                <span className="absolute top-1.5 right-1.5 min-w-3.5 h-3.5 bg-red-600 text-white font-normal text-[9px] flex items-center justify-center px-0.5 rounded-none leading-none">
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>

        </div>

      {/* 3. MEGA DROPDOWN (Normal weight, clean natural spacing) */}
      {activeMegaMenu && megaMenus[activeMegaMenu] && (
        <div 
          className="w-full bg-black border-b border-zinc-800 shadow-2xl transition-all duration-150 rounded-none animate-in fade-in slide-in-from-top-1"
          onMouseEnter={() => setActiveMegaMenu(activeMegaMenu)}
          onMouseLeave={() => setActiveMegaMenu(null)}
        >
          <div className="w-full px-4 sm:px-8 lg:px-12 py-8 grid grid-cols-12 gap-10">
            
            {/* Left 8 Cols: Clean Category Lists */}
            <div className="col-span-12 lg:col-span-8 grid grid-cols-3 gap-8">
              {megaMenus[activeMegaMenu].categories.map((col, cIdx) => (
                <div key={cIdx} className="space-y-3.5">
                  <h4 className="text-xs font-medium text-white border-b border-zinc-800 pb-2.5 flex items-center gap-2 tracking-normal">
                    <span className="w-1 h-1 bg-red-600 inline-block"></span>
                    {col.title}
                  </h4>
                  <ul className="space-y-2">
                    {col.items.map((item, iIdx) => (
                      <li key={iIdx}>
                        <Link
                          to="#"
                          className="group/item flex items-center text-xs font-normal text-zinc-400 hover:text-white transition-colors tracking-normal"
                        >
                          <span className="group-hover/item:text-red-500 group-hover/item:translate-x-1 transition-all duration-150">
                            {item}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Right 4 Cols: Clean Sharp Featured Card */}
            <div className="col-span-12 lg:col-span-4">
              <div className="relative border border-zinc-800 bg-zinc-950 group h-full min-h-[220px] flex flex-col justify-end p-6 rounded-none">
                <img
                  src={megaMenus[activeMegaMenu].featuredCard.image}
                  alt="Featured"
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-75 rounded-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                <div className="relative z-10 space-y-1.5">
                  <div className="w-5 h-0.5 bg-red-600"></div>
                  <h3 className="text-base font-semibold text-white tracking-normal">
                    {megaMenus[activeMegaMenu].featuredCard.title}
                  </h3>
                  <p className="text-xs text-zinc-300 leading-relaxed font-normal tracking-normal">
                    {megaMenus[activeMegaMenu].featuredCard.desc}
                  </p>
                  <Link
                    to="#"
                    className="inline-flex items-center gap-1.5 text-xs font-normal text-white group-hover:text-red-500 transition-colors pt-1 tracking-normal"
                  >
                    <span>{megaMenus[activeMegaMenu].featuredCard.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 4. MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden w-full bg-black border-b border-zinc-800 px-5 py-6 space-y-4 max-h-[85vh] overflow-y-auto rounded-none tracking-normal">
          <div className="space-y-2">
            {navLinks.map((item, idx) => (
              <div key={idx} className="border-b border-zinc-900 py-3">
                <Link
                  to="#"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block text-sm font-normal ${
                    item.isHighlight ? 'text-red-600 font-medium' : 'text-zinc-200'
                  }`}
                >
                  {item.name}
                </Link>
                {item.type === 'mega' && megaMenus[item.key] && (
                  <div className="pl-3 pt-2.5 space-y-2.5">
                    {megaMenus[item.key].categories.map((cat, cIdx) => (
                      <div key={cIdx} className="space-y-1">
                        <span className="text-xs font-medium text-red-600">{cat.title}</span>
                        {cat.items.slice(0, 4).map((sub, sIdx) => (
                          <Link
                            key={sIdx}
                            to="#"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-xs text-zinc-400 hover:text-white py-1 font-normal"
                          >
                            {sub}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

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
                  <div className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-[10px] flex items-center justify-center">
                    {user?.initials || 'NS'}
                  </div>
                  <span className="font-medium text-white">{user?.name}</span>
                </div>
              ) : (
                <>
                  <User className="w-4 h-4 text-red-600" />
                  <span>Account Login</span>
                </>
              )}
            </button>
            <button className="flex items-center gap-1.5 py-2 text-zinc-300 hover:text-white font-normal">
              <Heart className="w-4 h-4 text-red-600" />
              <span>Wishlist</span>
            </button>
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

        {/* Categories / Shop trigger */}
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
              <div className="w-5 h-5 rounded-full bg-red-600 text-white font-bold text-[9px] flex items-center justify-center">
                {user?.initials || 'NS'}
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
    </>
  );
}
