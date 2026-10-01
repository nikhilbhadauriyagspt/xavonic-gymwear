import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import mainMidBannerImg from '../assets/mainmid banenr.png';
import { getPublicBanners } from '../services/bannerService';

export default function MidFeatureBanner() {
  const [banner, setBanner] = useState({
    image_url: mainMidBannerImg,
    title: 'Xavonic Performance Aesthetics',
    link_url: '/collections',
  });

  useEffect(() => {
    let isMounted = true;
    getPublicBanners('mid_feature').then((banners) => {
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
          src={banner.image_url || mainMidBannerImg}
          alt={banner.title || 'Xavonic Performance Aesthetics'}
          className="w-full h-auto object-cover object-center block"
        />
      </Link>
    </div>
  );
}
