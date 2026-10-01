import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowRight, Mail, ShieldCheck, Truck, RotateCcw, Lock, Phone } from 'lucide-react';
import logoWhite from '../assets/logo_white.png';
import { useBrand } from '../context/BrandContext';

export default function Footer() {
  const [email, setEmail] = useState('');
  const { brand: brandContent, brandName } = useBrand();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success(`Welcome to the ${brandName} VIP Club!`, {
      description: 'Use code WELCOME10 for 10% off your first drop.',
    });
    setEmail('');
  };

  const navCols = [
    {
      title: 'Topwear Drops',
      links: [
        { label: 'Oversized T-Shirts', to: '/oversized' },
        { label: 'Muscle Compression', to: '/compression' },
        { label: 'Drop Cut T-Shirts', to: '/drop-cut' },
        { label: 'Stringers & Tanks', to: '/tanks' },
        { label: 'Heavyweight Hoodies', to: '/hoodies' },
      ],
    },
    {
      title: 'Bottomwear Line',
      links: [
        { label: '5" Inseam Gym Shorts', to: '/shorts' },
        { label: 'Tactical Gym Joggers', to: '/lowers' },
        { label: 'Athletic Trackpants', to: '/trackpants' },
        { label: 'Cargo Gym Lowers', to: '/cargo' },
        { label: '2-in-1 Compression Lowers', to: '/compression-lowers' },
      ],
    },
    {
      title: 'Customer Support',
      links: [
        { label: 'Track Your Order', to: '/track' },
        { label: '7-Day Easy Returns & Exchange', to: '/returns' },
        { label: 'Size & Fit Chart', to: '/size-guide' },
        { label: 'Shipping & Delivery FAQs', to: '/shipping' },
        { label: 'Contact Us / WhatsApp Support', to: '/contact' },
      ],
    },
    {
      title: 'Our Company',
      links: [
        { label: 'About Xavonic Aesthetics', to: '/about' },
        { label: 'Fabric Technology & GSM', to: '/fabric-guide' },
        { label: 'Athlete Sponsorships', to: '/athletes' },
        { label: 'Terms of Service', to: '/terms' },
        { label: 'Privacy Policy', to: '/privacy' },
      ],
    },
  ];

  return (
    <footer className="w-full bg-black text-zinc-300 font-sans select-none border-t border-zinc-900">
      
      {/* 1. Value Badges Strip (Full Width) */}
      <div className="border-b border-zinc-900/80 py-8 px-4 sm:px-8 lg:px-12 bg-zinc-950/60">
        <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <h4 className="text-xs font-semibold text-white tracking-wide uppercase">Free Express Shipping</h4>
              <p className="text-[11px] text-zinc-500">On all orders over ₹999 across India</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <RotateCcw className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <h4 className="text-xs font-semibold text-white tracking-wide uppercase">7-Day Easy Exchange</h4>
              <p className="text-[11px] text-zinc-500">Hassle-free doorstep size swap</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <h4 className="text-xs font-semibold text-white tracking-wide uppercase">100% Genuine Fabrics</h4>
              <p className="text-[11px] text-zinc-500">240 GSM organic terry & muscle-lock</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <h4 className="text-xs font-semibold text-white tracking-wide uppercase">Secure UPI & COD</h4>
              <p className="text-[11px] text-zinc-500">Encrypted 256-bit safe checkout</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Links & Newsletter (Full Width) */}
      <div className="py-14 sm:py-18 px-4 sm:px-8 lg:px-12">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          
          {/* Brand & Newsletter (Left 4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="inline-block">
              <img
                src={brandContent.logo_white || logoWhite}
                alt={brandContent.brand_name || "Xavonic Aesthetics"}
                className="h-10 sm:h-12 w-auto object-contain brightness-110"
              />
            </Link>

            <p className="text-xs text-zinc-400 font-normal leading-relaxed max-w-sm">
              {brandContent.brand_tagline || "Engineering high-performance gymwear & streetwear fits designed to accentuate the athletic taper."}
            </p>

            {/* VIP Newsletter Box */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-semibold text-white uppercase tracking-wider block">
                Unlock 10% Off Your First Order
              </span>
              <form onSubmit={handleSubscribe} className="flex max-w-sm">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full bg-zinc-900/90 border border-zinc-800 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 rounded-none transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="px-4 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors cursor-pointer rounded-none shrink-0"
                  aria-label="Subscribe"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Social Icons (Clean Crisp SVGs) */}
            <div className="flex items-center gap-3 pt-2">
              {/* Instagram */}
              {brandContent.instagram_url && (
                <a
                  href={brandContent.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-none bg-zinc-900 border border-zinc-800 hover:border-red-600 hover:text-red-500 text-zinc-400 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Instagram"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}

              {/* YouTube */}
              {brandContent.youtube_url && (
                <a
                  href={brandContent.youtube_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-none bg-zinc-900 border border-zinc-800 hover:border-red-600 hover:text-red-500 text-zinc-400 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="YouTube"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              )}

              {/* Facebook */}
              {brandContent.facebook_url && (
                <a
                  href={brandContent.facebook_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-none bg-zinc-900 border border-zinc-800 hover:border-red-600 hover:text-red-500 text-zinc-400 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Facebook"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}

              {/* Email Contact */}
              {brandContent.support_email && (
                <a
                  href={`mailto:${brandContent.support_email}`}
                  className="w-8 h-8 rounded-none bg-zinc-900 border border-zinc-800 hover:border-red-600 hover:text-red-500 text-zinc-400 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Email"
                >
                  <Mail className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Navigation Columns (Right 8 cols) */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {navCols.map((col, idx) => (
              <div key={idx} className="space-y-3.5">
                <h3 className="text-xs font-semibold text-white tracking-wider uppercase">
                  {col.title}
                </h3>
                <ul className="space-y-2">
                  {col.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <Link
                        to={link.to}
                        className="text-xs text-zinc-400 hover:text-white transition-colors duration-150 inline-block font-normal"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* 3. Bottom Copyright & Payment Methods (Full Width) */}
      <div className="border-t border-zinc-900 py-6 px-4 sm:px-8 lg:px-12 bg-black">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-[11px] text-zinc-500">
            {brandContent.copyright_text || `© ${new Date().getFullYear()} Xavonic Aesthetics Inc. All rights reserved. Designed for active lifestyles.`}
          </p>

          {/* Clean Payment Tags */}
          <div className="flex items-center gap-2 text-[10px] text-zinc-400 tracking-wider">
            <span className="px-2 py-0.5 border border-zinc-800 bg-zinc-900/50">UPI</span>
            <span className="px-2 py-0.5 border border-zinc-800 bg-zinc-900/50">CARDS</span>
            <span className="px-2 py-0.5 border border-zinc-800 bg-zinc-900/50">NET BANKING</span>
            <span className="px-2 py-0.5 border border-zinc-800 bg-zinc-900/50">COD</span>
          </div>
        </div>
      </div>

    </footer>
  );
}
