import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import lastMidImg from '../assets/last mid.png';
import { getPublicBanners } from '../services/bannerService';

export default function LastMidBanner() {
  const [banner, setBanner] = useState({
    image_url: lastMidImg,
    title: 'Xavonic Aesthetics Activewear Banner',
    link_url: '/collections',
  });

  useEffect(() => {
    let isMounted = true;
    getPublicBanners('last_mid').then((banners) => {
      if (isMounted && Array.isArray(banners) && banners.length > 0) {
        setBanner(banners[0]);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="relative w-full bg-black select-none overflow-hidden">
      <Link to={banner.link_url || '/collections'} className="relative w-full block">
        <img
          src={banner.image_url || lastMidImg}
          alt={banner.title || 'Xavonic Aesthetics Activewear Banner'}
          className="w-full h-auto object-cover object-center block"
        />
      </Link>
    </div>
  );
}
