import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ADMIN_API_BASE } from '../config/api';

const BrandContext = createContext(null);

const DEFAULT_BRAND = {
  brand_name: 'Guidelya Activewear',
  brand_tagline: 'Engineered for Performance. Cut for Aesthetics.',
  logo_white: '',
  logo_black: '',
  instagram_url: 'https://instagram.com',
  facebook_url: 'https://facebook.com',
  youtube_url: 'https://youtube.com',
  twitter_url: 'https://twitter.com',
  whatsapp_number: '919876543210',
  support_email: 'support@guidelya.com',
  support_phone: '+91 98765 43210',
  office_address: 'Guidelya Performance Apparel Pvt Ltd, DLF Cyber City, Sector 24, Gurugram, Haryana - 122002',
  copyright_text: `© ${new Date().getFullYear()} Guidelya Activewear. All rights reserved.`,
  about_heading: 'Gym Wear for Men & Women',
  about_badge: 'Brand Story & Training Guide',
  about_tagline: 'Engineered for Performance. Cut for Aesthetics.',
};

export const BrandProvider = ({ children }) => {
  const [brand, setBrand] = useState(() => {
    try {
      const cached = localStorage.getItem('guidelya_cached_brand');
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
        try {
          localStorage.setItem('guidelya_cached_brand', JSON.stringify(normalized));
        } catch (_) {}

        // Update document title if needed
        if (normalized.brand_name && document.title.includes('Guidelya') || document.title.includes('Xavonic') || !document.title) {
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
    fetchBrand();
  }, [fetchBrand]);

  const value = {
    brand,
    brandName: brand.brand_name || 'Guidelya Activewear',
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
