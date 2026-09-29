import React from 'react';
import lastMidImg from '../assets/last mid.png';

export default function LastMidBanner() {
  return (
    <div className="relative w-full bg-black select-none overflow-hidden">
      <div className="relative w-full">
        <img
          src={lastMidImg}
          alt="Xavonic Aesthetics Activewear Banner"
          className="w-full h-auto object-cover object-center block"
        />
      </div>
    </div>
  );
}
