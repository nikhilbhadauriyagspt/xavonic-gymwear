import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

import Header from './components/Header';
import CartDrawer from './components/CartDrawer';
import AuthDrawer from './components/AuthDrawer';
import ProfileDrawer from './components/ProfileDrawer';
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
import CollectionsPage from './pages/CollectionsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminPage from './admin/AdminPage';

function HomePage() {
  return (
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
  );
}

function MainLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/*" element={<AdminPage />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black text-zinc-100 antialiased selection:bg-red-600 selection:text-white font-sans flex flex-col">
      {/* Slide-Over Modern Cart Drawer */}
      <CartDrawer />

      {/* Center Modern Login Modal */}
      <AuthDrawer />

      {/* Slide-Over Right Profile & Orders Drawer */}
      <ProfileDrawer />

      {/* 1. Header Navigation */}
      <Header />

      {/* Route Content Area */}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/collections/:categorySlug" element={<CollectionsPage />} />
          <Route path="/shop" element={<CollectionsPage />} />
          <Route path="/oversized" element={<CollectionsPage />} />
          <Route path="/compression" element={<CollectionsPage />} />
          <Route path="/shorts" element={<CollectionsPage />} />
          <Route path="/lowers" element={<CollectionsPage />} />
          <Route path="/tanks" element={<CollectionsPage />} />
          <Route path="/trackpants" element={<CollectionsPage />} />
          <Route path="/drop-cut" element={<CollectionsPage />} />
          <Route path="/cargo-lowers" element={<CollectionsPage />} />
          <Route path="/bestsellers" element={<CollectionsPage />} />
          <Route path="/new-drops" element={<CollectionsPage />} />
          <Route path="/product/:productId" element={<ProductDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Routes>
      </div>

      {/* Clean Decent Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          {/* Toast Notifications */}
          <Toaster position="top-right" richColors closeButton theme="dark" />
          <MainLayout />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
