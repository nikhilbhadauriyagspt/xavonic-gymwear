import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'sonner';
import { CartProvider } from './context/CartContext';

import Header from './components/Header';
import CartDrawer from './components/CartDrawer';
import Hero from './components/Hero';
import MidBanner from './components/MidBanner';
import Categories from './components/Categories';
import NewInStore from './components/NewInStore';
import TrendingProducts from './components/TrendingProducts';
import MidFeatureBanner from './components/MidFeatureBanner';
import DualFeatureSection from './components/DualFeatureSection';
import LastMidBanner from './components/LastMidBanner';
import MostLovedProducts from './components/MostLovedProducts';
import AboutStory from './components/AboutStory';
import Footer from './components/Footer';

export default function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen w-full bg-black text-zinc-100 antialiased selection:bg-red-600 selection:text-white font-sans">
          {/* Toast Notifications */}
          <Toaster position="top-right" richColors closeButton theme="dark" />

          {/* Slide-Over Modern Cart Drawer */}
          <CartDrawer />

          {/* 1. Header Navigation */}
          <Header />

          {/* Main Content Area */}
          <main className="w-full">
            {/* 2. Full-Height Hero Slider */}
            <Hero />

            {/* 3. Full-Width Brand Mid Banner */}
            <MidBanner />

            {/* 4. Shop By Category Visual Grid */}
            <Categories />

            {/* 5. Light-Themed "New In Store" Interactive Showcase */}
            <NewInStore />

            {/* 6. Trending Bestsellers Product Grid (Dual Hover + Quick Size Add) */}
            <TrendingProducts />

            {/* 7. Full-Width Mid Feature Banner (mainmid banenr) */}
            <MidFeatureBanner />

            {/* 8. Dual Feature Focus Banners (Training Shorts & Oversized Collection) */}
            <DualFeatureSection />

            {/* 9. Full-Width Last Mid Banner (last mid) */}
            <LastMidBanner />

            {/* 10. Most Loved By Customers Product Slider */}
            <MostLovedProducts />

            {/* 11. Simple Clean About Us Brand Story */}
            <AboutStory />
          </main>

          {/* 12. Clean Decent Footer */}
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}
