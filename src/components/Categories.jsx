import React from 'react';
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
  const categories = [
    // --- T-SHIRTS COLLECTION ---
    {
      title: 'Oversized T-Shirts',
      link: '/oversized',
      image: heroOversized,
    },
    {
      title: 'Compression T-Shirts',
      link: '/compression',
      image: heroCompression,
    },
    {
      title: 'Drop Cut T-Shirts',
      link: '/drop-cut',
      image: catDropcut,
    },
    {
      title: 'Stringers & Tanks',
      link: '/tanks',
      image: catStringers,
    },

    // --- LOWERS & BOTTOMWEAR COLLECTION ---
    {
      title: 'Gym Lowers & Joggers',
      link: '/lowers',
      image: heroJoggers,
    },
    {
      title: 'Athletic Trackpants',
      link: '/trackpants',
      image: catTrackpants,
    },
    {
      title: '5" Gym Shorts',
      link: '/shorts',
      image: catShorts,
    },
    {
      title: 'Cargo Gym Lowers',
      link: '/cargo-lowers',
      image: catTrackpants,
    },
  ];

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

      {/* Responsive Grid with Aspect Ratio 4/4.6 */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 w-full">
        {categories.map((cat, idx) => (
          <Link
            key={idx}
            to={cat.link}
            className="group relative block aspect-[4/4.6] w-full overflow-hidden bg-zinc-950 border border-zinc-900 hover:border-zinc-700 transition-all duration-300 rounded-none cursor-pointer"
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

            {/* Bottom Content with Straight Right Arrow Icon */}
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 flex items-end justify-between gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-medium text-white group-hover:text-red-500 transition-colors">
                  {cat.title}
                </h3>
              </div>

              {/* Glass Circle with Pure Right Direction Arrow (ArrowRight) */}
              <div className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-red-600 group-hover:border-red-600 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          </Link>
        ))}
      </div>

    </section>
  );
}
