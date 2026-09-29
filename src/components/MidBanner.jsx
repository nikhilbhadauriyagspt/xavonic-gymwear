import React from 'react';
import midBannerImg from '../assets/midbanner.png';

export default function MidBanner() {
  return (
    <div className="relative w-full bg-black select-none overflow-hidden border-t border-zinc-900">
      <div className="relative w-full">
        <img
          src={midBannerImg}
          alt="Nothing Fits Like Xavonic - Gear That Moves With You"
          className="w-full h-auto object-cover sm:object-contain object-center block"
        />

        {/* Soft bottom gradient blend to seamlessly merge into Categories */}
        <div className="absolute inset-x-0 bottom-0 h-12 sm:h-20 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
