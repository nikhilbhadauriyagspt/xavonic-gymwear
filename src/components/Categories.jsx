import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import heroOversized from '../assets/hero_oversized.jpg';
import heroCompression from '../assets/hero_compression.jpg';
import catDropcut from '../assets/cat_dropcut.jpg';
import catStringers from '../assets/cat_stringers.jpg';
import heroJoggers from '../assets/hero_joggers.jpg';
import catTrackpants from '../assets/cat_trackpants.jpg';
import catShorts from '../assets/cat_shorts.jpg';

export default function Categories() {
  const fallbackCategories = [
    { id: 1, name: 'Oversized T-Shirts', slug: 'oversized', image_url: heroOversized, show_title_overlay: 1 },
    { id: 2, name: 'Compression T-Shirts', slug: 'compression', image_url: heroCompression, show_title_overlay: 1 },
    { id: 3, name: 'Drop Cut T-Shirts', slug: 'drop-cut', image_url: catDropcut, show_title_overlay: 1 },
    { id: 4, name: 'Stringers & Tanks', slug: 'tanks', image_url: catStringers, show_title_overlay: 1 },
    { id: 5, name: 'Gym Lowers & Joggers', slug: 'lowers', image_url: heroJoggers, show_title_overlay: 1 },
    { id: 6, name: 'Athletic Trackpants', slug: 'trackpants', image_url: catTrackpants, show_title_overlay: 1 },
    { id: 7, name: '5" Gym Shorts', slug: 'shorts', image_url: catShorts, show_title_overlay: 1 },
    { id: 8, name: 'Cargo Gym Lowers', slug: 'cargo-lowers', image_url: catTrackpants, show_title_overlay: 1 },
  ];

  const [categories, setCategories] = useState(fallbackCategories);

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.categories && data.categories.length > 0) {
          // Filter active item_type drops or subcategories with images
          const displayCats = data.categories.filter((c) => c.image_url && c.status === 'active');
          if (displayCats.length > 0) setCategories(displayCats);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section 
      id="categories-section" 
      className="relative w-full bg-gradient-to-b from-black via-zinc-950 to-black pt-12 sm:pt-16 pb-16 sm:pb-24 px-4 sm:px-8 lg:px-12 select-none font-sans rounded-none border-b border-zinc-900"
    >
      {/* Seamless Ambient Top Glow connecting from MidBanner */}
      <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black via-black/40 to-transparent pointer-events-none" />

      {/* Centered Premium Header */}
      <div className="relative z-10 w-full max-w-3xl mx-auto text-center mb-10 sm:mb-14 space-y-3">
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-normal leading-[1.15]">
          Introducing Premium Fits For The Active Lifestyle.
        </h2>

        <p className="text-sm sm:text-base text-zinc-400 font-normal leading-relaxed max-w-2xl mx-auto">
          Crafted for the heavy grind. Engineered for everyday confidence and uncompromised comfort.
        </p>
      </div>

      {/* Responsive Grid: 2 cols on mobile, 2 on sm, 3 on lg, 4 on 2xl */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-6 w-full">
        {categories.map((cat, idx) => (
          <Link
            key={cat.id || idx}
            to={`/collections/${cat.slug || 'all'}`}
            className="group relative block aspect-[4/4.6] w-full overflow-hidden bg-zinc-950 transition-all duration-300 rounded-none cursor-pointer shadow-none"
          >
            {/* High-Resolution Cloudinary / Photoshoot Image */}
            <img
              src={cat.image_url || cat.image}
              alt={cat.name || cat.title}
              className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out brightness-90 group-hover:brightness-100"
            />

            {/* Dark Bottom Gradient for Clean Legibility */}
            {Boolean(cat.show_title_overlay !== 0 && cat.show_title_overlay !== false) && (
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent opacity-90 group-hover:opacity-85 transition-opacity" />
            )}

            {/* Top Red Hover Accent */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Bottom Content with Straight Right Arrow Icon (Rendered only if overlay is enabled) */}
            {Boolean(cat.show_title_overlay !== 0 && cat.show_title_overlay !== false) ? (
              <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5 md:p-6 flex items-end justify-between gap-2 sm:gap-4">
                <div>
                  <h3 className="text-xs sm:text-lg md:text-xl font-medium text-white group-hover:text-red-500 transition-colors line-clamp-2">
                    {cat.name || cat.title}
                  </h3>
                  {cat.subtitle && (
                    <p className="text-[10px] sm:text-xs text-zinc-400 font-light mt-0.5 line-clamp-1">
                      {cat.subtitle}
                    </p>
                  )}
                </div>

                {/* Glass Circle with Pure Right Direction Arrow (ArrowRight) */}
                <div className="w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 shrink-0 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-red-600 group-hover:border-red-600 group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <ArrowRight className="w-3.5 h-3.5 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform duration-300" />
                </div>
              </div>
            ) : (
              /* Pure Banner Hover Indicator */
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            )}
          </Link>
        ))}
      </div>

    </section>
  );
}
