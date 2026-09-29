import React from 'react';
import mainMidBannerImg from '../assets/mainmid banenr.png';

export default function MidFeatureBanner() {
  return (
    <div className="relative w-full bg-black select-none overflow-hidden">
      <div className="relative w-full">
        <img
          src={mainMidBannerImg}
          alt="Xavonic Performance Aesthetics"
          className="w-full h-auto object-cover object-center block"
        />
      </div>
    </div>
  );
}
