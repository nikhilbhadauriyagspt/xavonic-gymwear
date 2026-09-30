import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { useCart } from '../context/CartContext';

import spotlightFront from '../assets/spotlight_front.jpg';
import spotlightBack from '../assets/spotlight_back.jpg';
import heroCompression from '../assets/hero_compression.jpg';
import prodCompressionBack from '../assets/prod_compression_back.jpg';
import heroJoggers from '../assets/hero_joggers.jpg';
import catTrackpants from '../assets/cat_trackpants.jpg';
import catDropcut from '../assets/cat_dropcut.jpg';
import catShorts from '../assets/cat_shorts.jpg';
import catStringers from '../assets/cat_stringers.jpg';
import heroOversized from '../assets/hero_oversized.jpg';
import spotlightSide from '../assets/spotlight_side.jpg';

const searchableCatalog = [
  {
    id: 'search-1',
    title: 'Acid Wash Heavyweight Oversized Tee',
    category: 'Oversized Tees',
    price: '₹1,499',
    originalPrice: '₹2,299',
    image: spotlightFront,
    tags: ['oversized', 'acid wash', 't-shirt', 'tee', 'pump cover', 'heavyweight', 'cotton', 'topwear'],
  },
  {
    id: 'search-2',
    title: 'Pro Muscle-Lock Compression Shirt',
    category: 'Compression',
    price: '₹1,299',
    originalPrice: '₹1,899',
    image: heroCompression,
    tags: ['compression', 'tight', 'second skin', 'rashguard', 'muscle lock', 'gym tee', 'topwear'],
  },
  {
    id: 'search-3',
    title: 'Tapered Tactical Gym Joggers',
    category: 'Gym Lowers',
    price: '₹1,699',
    originalPrice: '₹2,499',
    image: catTrackpants,
    tags: ['joggers', 'pants', 'trackpants', 'bottomwear', 'zipper pockets', 'lowers', 'sweatpants'],
  },
  {
    id: 'search-4',
    title: '5" Tactical Inseam Gym Shorts',
    category: 'Training Shorts',
    price: '₹1,099',
    originalPrice: '₹1,599',
    image: catShorts,
    tags: ['shorts', '5 inch', '5"', 'training shorts', 'bottomwear', 'quads', 'squat'],
  },
  {
    id: 'search-5',
    title: 'Drop Cut Curved Hem Athletic Tee',
    category: 'Oversized Tees',
    price: '₹1,199',
    originalPrice: '₹1,699',
    image: catDropcut,
    tags: ['drop cut', 'curved hem', 't-shirt', 'v taper', 'athletic fit', 'topwear'],
  },
  {
    id: 'search-6',
    title: 'Deep Cut Athletic Stringer Tank',
    category: 'Stringers & Tanks',
    price: '₹999',
    originalPrice: '₹1,499',
    image: catStringers,
    tags: ['stringer', 'tank top', 'racerback', 'bodybuilding', 'sleeveless', 'topwear'],
  },
  {
    id: 'search-7',
    title: 'Heavyweight Vintage Distressed Graphic Tee',
    category: 'Oversized Tees',
    price: '₹1,399',
    originalPrice: '₹1,999',
    image: heroOversized,
    tags: ['vintage', 'graphic tee', 'distressed', 'heavyweight', 'oversized', 'streetwear'],
  },
  {
    id: 'search-8',
    title: '2-in-1 Compression Liner Lowers',
    category: 'Gym Lowers',
    price: '₹1,599',
    originalPrice: '₹2,399',
    image: heroJoggers,
    tags: ['2 in 1', 'compression pants', 'layer lower', 'tights', 'joggers', 'bottomwear'],
  },
];

const trendingSearches = [
  'Acid Wash Oversized',
  'Muscle Compression',
  '5" Gym Shorts',
  'Tactical Joggers',
  'Deep Cut Stringers',
  'Heavyweight Drop',
];

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const { addToCart } = useCart();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Keyboard shortcut: ESC to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const cleanQuery = query.trim().toLowerCase();

  const filteredResults = cleanQuery === '' 
    ? [] 
    : searchableCatalog.filter((item) => {
        const titleMatch = item.title.toLowerCase().includes(cleanQuery);
        const categoryMatch = item.category.toLowerCase().includes(cleanQuery);
        const tagMatch = item.tags.some((tag) => tag.toLowerCase().includes(cleanQuery));
        return titleMatch || categoryMatch || tagMatch;
      });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex flex-col items-center justify-start font-sans select-none">
          
          {/* Subtle Dim Backdrop with Smooth Blur Fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-xs cursor-pointer"
          />

          {/* Top Slide-Down & Slide-Up Search Container */}
          <motion.div
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ 
              duration: 0.35, 
              ease: [0.22, 1, 0.36, 1] 
            }}
            className="relative w-full max-w-4xl bg-white text-zinc-900 shadow-2xl border-b border-zinc-200/90 rounded-none overflow-hidden z-10"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Input Bar */}
            <div className="flex items-center px-4 sm:px-6 py-4 border-b border-zinc-100 gap-3">
              <Search className="w-5 h-5 text-zinc-400 shrink-0 stroke-[1.8]" />
              
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search fits, compression, oversized, shorts, joggers..."
                className="flex-1 bg-transparent text-sm sm:text-base font-normal text-zinc-900 placeholder:text-zinc-400 focus:outline-none tracking-normal"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-zinc-400 hover:text-zinc-900 text-xs px-2 py-1 transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-950 transition-colors cursor-pointer rounded-none ml-1 -mr-2"
                aria-label="Close Search"
              >
                <X className="w-5 h-5 stroke-[1.8]" />
              </button>
            </div>

            {/* Content Area: Suggestions / Results */}
            <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 divide-y divide-zinc-100">
              
              {/* State 1: When input is empty -> Show Trending Quick Tags */}
              {cleanQuery === '' && (
                <motion.div 
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                    <TrendingUp className="w-3.5 h-3.5 text-red-600" />
                    <span>Popular Searches</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((term, index) => (
                      <button
                        key={index}
                        onClick={() => setQuery(term)}
                        className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-950 text-zinc-700 hover:text-white text-xs font-normal transition-all cursor-pointer rounded-none border border-zinc-200/60 hover:border-zinc-950"
                      >
                        {term}
                      </button>
                    ))}
                  </div>

                  {/* Featured Quick Drops list */}
                  <div className="pt-4 border-t border-zinc-100 space-y-3">
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                      Recommended Drops
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {searchableCatalog.slice(0, 4).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            addToCart(item, 'L', 1);
                            onClose();
                          }}
                          className="group flex items-center gap-3 p-2 bg-zinc-50/70 hover:bg-zinc-100 border border-zinc-100 hover:border-zinc-300 transition-all cursor-pointer rounded-none"
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-12 h-14 object-cover shrink-0 bg-zinc-200"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-medium text-zinc-900 group-hover:text-red-600 transition-colors line-clamp-1">
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-zinc-500">{item.price}</p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all mr-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* State 2: When query matches results */}
              {cleanQuery !== '' && filteredResults.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between text-xs text-zinc-500 pb-1">
                    <span>Results for "{query}"</span>
                    <span>{filteredResults.length} {filteredResults.length === 1 ? 'fit' : 'fits'} found</span>
                  </div>

                  <div className="divide-y divide-zinc-100">
                    {filteredResults.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18, delay: idx * 0.03 }}
                        className="group flex items-center justify-between gap-4 py-3 hover:bg-zinc-50 px-2 transition-colors cursor-pointer"
                        onClick={() => {
                          addToCart(item, 'L', 1);
                          onClose();
                        }}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-12 h-15 object-cover shrink-0 bg-zinc-100 border border-zinc-200"
                          />
                          <div className="min-w-0 space-y-0.5">
                            <span className="text-[10px] font-semibold text-red-600 uppercase tracking-wider block">
                              {item.category}
                            </span>
                            <h4 className="text-xs sm:text-sm font-normal text-zinc-900 group-hover:text-red-600 transition-colors line-clamp-1">
                              {item.title}
                            </h4>
                            <div className="flex items-center gap-2 pt-0.5">
                              <span className="text-xs font-semibold text-zinc-950">{item.price}</span>
                              <span className="text-[11px] text-zinc-400 line-through">{item.originalPrice}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item, 'L', 1);
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-zinc-950 hover:bg-red-600 text-white text-[11px] font-medium transition-colors cursor-pointer rounded-none shrink-0"
                        >
                          Quick Add
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* State 3: No results found */}
              {cleanQuery !== '' && filteredResults.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="py-10 text-center space-y-2"
                >
                  <p className="text-sm font-medium text-zinc-900">No matching fits found</p>
                  <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                    Try searching for "oversized", "compression", "joggers", or "shorts".
                  </p>
                </motion.div>
              )}

            </div>

            {/* Bottom Keyboard Hint Bar */}
            <div className="px-6 py-2.5 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
              <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-zinc-200 text-zinc-600 font-mono text-[10px]">ESC</kbd> to close</span>
              <span>Click product to instantly view & add to bag</span>
            </div>

          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
}
