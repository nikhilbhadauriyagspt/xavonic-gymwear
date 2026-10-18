import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ADMIN_API_BASE } from '../config/api';

const BrandContext = createContext(null);

const DEFAULT_BRAND = {
  brand_name: 'RageX Activewear',
  brand_tagline: 'Engineered for Performance. Cut for Aesthetics.',
  logo_white: '',
  logo_black: '',
  favicon: '',
  instagram_url: 'https://instagram.com',
  facebook_url: 'https://facebook.com',
  youtube_url: 'https://youtube.com',
  twitter_url: 'https://twitter.com',
  whatsapp_number: '919876543210',
  support_email: 'support@ragex.com',
  support_phone: '+91 98765 43210',
  office_address: 'RageX Performance Apparel Pvt Ltd, DLF Cyber City, Sector 24, Gurugram, Haryana - 122002',
  copyright_text: `© ${new Date().getFullYear()} RageX Activewear. All rights reserved.`,
  about_heading: 'Gym Wear for Men & Women',
  about_badge: 'Brand Story & Training Guide',
  about_tagline: 'Engineered for Performance. Cut for Aesthetics.',
};

function applyFavicon(faviconUrl) {
  if (typeof document === 'undefined') return;
  const href = faviconUrl && faviconUrl.trim() ? faviconUrl.trim() : '/favicon.svg';
  const rels = ['icon', 'shortcut icon', 'apple-touch-icon'];
  rels.forEach((rel) => {
    let link = document.querySelector(`link[rel="${rel}"]`);
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', rel);
      document.head.appendChild(link);
    }
    link.removeAttribute('type');
    link.setAttribute('href', href);
  });
}

export const BrandProvider = ({ children }) => {
  const [brand, setBrand] = useState(() => {
    try {
      const cached = localStorage.getItem('ragex_cached_brand');
      return cached ? JSON.parse(cached) : DEFAULT_BRAND;
    } catch {
      return DEFAULT_BRAND;
    }
  });
  const [loading, setLoading] = useState(false);

  const fetchBrand = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${ADMIN_API_BASE}/settings/brand-content`);
      const data = await res.json();
      if (data.success && data.content) {
        const normalized = {
          ...DEFAULT_BRAND,
          ...data.content,
          brand_name: data.content.brand_name || data.content.name || DEFAULT_BRAND.brand_name,
        };
        setBrand(normalized);
        applyFavicon(normalized.favicon);
        try {
          localStorage.setItem('ragex_cached_brand', JSON.stringify(normalized));
        } catch (_) {}

        // Update document title if needed
        if (normalized.brand_name && (document.title.includes('RageX') || document.title.includes('Guidelya') || document.title.includes('Xavonic') || !document.title)) {
          document.title = `${normalized.brand_name} | ${normalized.brand_tagline || 'Premium Activewear'}`;
        }
      }
    } catch (err) {
      console.warn('Could not load brand content from API:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    applyFavicon(brand?.favicon);
  }, [brand?.favicon]);

  useEffect(() => {
    fetchBrand();
  }, [fetchBrand]);

  const value = {
    brand,
    brandName: brand.brand_name || 'RageX Activewear',
    loading,
    refreshBrand: fetchBrand,
  };

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
};

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (!context) {
    return {
      brand: DEFAULT_BRAND,
      brandName: DEFAULT_BRAND.brand_name,
      loading: false,
      refreshBrand: () => {},
    };
  }
  return context;
};

export default BrandContext;
