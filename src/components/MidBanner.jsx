import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import midBannerImg from '../assets/midbanner.png';
import { getPublicBanners } from '../services/bannerService';

export default function MidBanner() {
  const [banner, setBanner] = useState({
    image_url: midBannerImg,
    title: 'Nothing Fits Like Xavonic - Gear That Moves With You',
    link_url: '/collections',
  });

  useEffect(() => {
    let isMounted = true;
    getPublicBanners('mid_banner').then((banners) => {
      if (isMounted && Array.isArray(banners) && banners.length > 0) {
        setBanner(banners[0]);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="relative w-full bg-black select-none overflow-hidden border-t border-zinc-900">
      <Link to={banner.link_url || '/collections'} className="relative w-full block">
        <img
          src={banner.image_url || midBannerImg}
          alt={banner.title || 'Nothing Fits Like Xavonic - Gear That Moves With You'}
          className="w-full h-auto object-cover sm:object-contain object-center block"
        />

        {/* Soft bottom gradient blend to seamlessly merge into Categories */}
        <div className="absolute inset-x-0 bottom-0 h-12 sm:h-20 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
      </Link>
    </div>
  );
}
