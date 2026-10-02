import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { BrandProvider } from './context/BrandContext';

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
import LiveSalesPopup from './components/LiveSalesPopup';
import CollectionsPage from './pages/CollectionsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import About from './pages/About';
import PolicyPage from './pages/PolicyPage';
import AdminPage from './admin/AdminPage';

function ScrollToTop() {
  const { pathname, search } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return null;
}

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
      {/* Auto Scroll To Top on Page Switch */}
      <ScrollToTop />

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
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/product/:productId" element={<ProductDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<PolicyPage policyType="privacy" />} />
          <Route path="/terms" element={<PolicyPage policyType="terms" />} />
          <Route path="/returns" element={<PolicyPage policyType="returns" />} />
          <Route path="/shipping" element={<PolicyPage policyType="shipping" />} />
          <Route path="/contact" element={<About />} />
          <Route path="/size-guide" element={<PolicyPage policyType="returns" />} />
          <Route path="/fabric-guide" element={<About />} />
          <Route path="/track" element={<CheckoutPage />} />
        </Routes>
      </div>

      {/* Clean Decent Footer */}
      <Footer />

      {/* Live Sales Activity FOMO Toast */}
      <LiveSalesPopup />
    </div>
  );
}

export default function App() {
  return (
    <BrandProvider>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <Router>
              {/* Minimalist Light Clean Toast Notifications */}
              <Toaster
                position="top-right"
                theme="light"
                closeButton
                richColors={false}
                duration={3500}
                offset={18}
                toastOptions={{
                  style: {
                    background: '#ffffff',
                    color: '#18181b',
                    border: '1px solid #e4e4e7',
                    borderRadius: '8px',
                    boxShadow: '0 10px 30px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
                    fontSize: '12.5px',
                    fontWeight: 500,
                    padding: '12px 14px',
                  },
                  className: 'font-sans shadow-lg',
                }}
              />
              <MainLayout />
            </Router>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </BrandProvider>
  );
}
