import React, { useState, useEffect } from 'react';
import AdminLogin from './components/AdminLogin';
import AdminHeader from './components/AdminHeader';
import AdminSidebar from './components/AdminSidebar';
import DashboardOverview from './components/DashboardOverview';
import WhatsAppSettingsTab from './components/WhatsAppSettingsTab';
import CustomersTab from './components/CustomersTab';
import AllCategoriesTab from './components/AllCategoriesTab';
import AddCategoryTab from './components/AddCategoryTab';
import AllProductsTab from './components/AllProductsTab';
import AddProductTab from './components/AddProductTab';
import OffersDiscountsTab from './components/OffersDiscountsTab';
import ReviewsTab from './components/ReviewsTab';
import OrdersTab from './components/OrdersTab';
import BannersTab from './components/BannersTab';
import ShippingTab from './components/ShippingTab';
import BrandContentTab from './components/BrandContentTab';
import { toast } from 'sonner';
import { ADMIN_API_BASE, ORDERS_API_BASE } from '../config/api';

export default function AdminPage() {
  // Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('xavonic_admin_auth') === 'true';
  });

  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('xavonic_admin_user');
      return saved ? JSON.parse(saved) : { name: 'Master Admin', email: 'admin@xavonic.com', role: 'Super Admin' };
    } catch {
      return { name: 'Master Admin', email: 'admin@xavonic.com', role: 'Super Admin' };
    }
  });

  // Active Sidebar Tab State
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [customersCount, setCustomersCount] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  // Fetch live count
  useEffect(() => {
    if (isAdminLoggedIn) {
      const token = localStorage.getItem('xavonic_admin_token');
      // Customers count
      fetch(`${ADMIN_API_BASE}/customers?limit=1`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) setCustomersCount(data.total);
        })
        .catch(() => {});

      // Pending / Processing Orders count
      fetch(`${ADMIN_API_BASE}/orders?limit=50`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.orders) {
            const pending = data.orders.filter(o => o.orderStatus === 'Processing' || o.orderStatus === 'Confirmed').length;
            setPendingOrdersCount(pending);
          }
        })
        .catch(() => {});
    }
  }, [isAdminLoggedIn, activeTab]);

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('xavonic_admin_auth');
    localStorage.removeItem('xavonic_admin_token');
    localStorage.removeItem('xavonic_admin_user');
    setIsAdminLoggedIn(false);
    toast.success('Admin session ended. Signed out.');
  };

  // If not logged in, render the clean minimal white Login page
  if (!isAdminLoggedIn) {
    return (
      <AdminLogin
        onLoginSuccess={(user) => {
          if (user) setAdminUser(user);
          setIsAdminLoggedIn(true);
        }}
      />
    );
  }

  return (
    <div className="h-screen w-full bg-[#fafafa] text-neutral-900 flex flex-col font-sans selection:bg-red-600 selection:text-white overflow-hidden">
      {/* Admin Top Header (Fixed at top) */}
      <AdminHeader
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        onLogout={handleLogout}
        adminUser={adminUser}
      />

      {/* Main Admin Workspace Layout (Fixed height, independent scrolling) */}
      <div className="flex-1 flex overflow-hidden w-full">
        {/* Admin Left Sidebar (Fixed & scrollable inside if needed, won't stretch with main content) */}
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileSidebarOpen={isMobileSidebarOpen}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
          customersCount={customersCount}
          pendingOrdersCount={pendingOrdersCount}
        />

        {/* Dynamic Content Area (Independent scrollable viewport) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 w-full min-w-0 h-full">
          <div className="w-full max-w-7xl mx-auto">
            {activeTab === 'overview' && (
              <DashboardOverview onNavigateTab={setActiveTab} />
            )}

            {activeTab === 'orders' && (
              <OrdersTab />
            )}

            {activeTab === 'categories' && (
              <AllCategoriesTab onNavigateToAdd={() => setActiveTab('add-category')} />
            )}

            {activeTab === 'add-category' && (
              <AddCategoryTab 
                onCategoryCreated={() => setActiveTab('categories')}
                onCancel={() => setActiveTab('categories')}
              />
            )}

            {activeTab === 'products' && (
              <AllProductsTab onNavigateToAdd={() => setActiveTab('add-product')} />
            )}

            {activeTab === 'add-product' && (
              <AddProductTab 
                onProductCreated={() => setActiveTab('products')}
                onCancel={() => setActiveTab('products')}
              />
            )}

            {activeTab === 'customers' && (
              <CustomersTab />
            )}

            {activeTab === 'banners' && (
              <BannersTab />
            )}

            {activeTab === 'reviews' && (
              <ReviewsTab />
            )}

            {activeTab === 'offers' && (
              <OffersDiscountsTab />
            )}

            {activeTab === 'shipping' && (
              <ShippingTab />
            )}

            {activeTab === 'brand-content' && (
              <BrandContentTab />
            )}

            {activeTab === 'settings' && (
              <WhatsAppSettingsTab />
            )}

            {activeTab !== 'overview' && activeTab !== 'orders' && activeTab !== 'customers' && activeTab !== 'banners' && activeTab !== 'reviews' && activeTab !== 'offers' && activeTab !== 'shipping' && activeTab !== 'brand-content' && activeTab !== 'products' && activeTab !== 'add-product' && activeTab !== 'categories' && activeTab !== 'add-category' && activeTab !== 'settings' && (
              <div className="w-full bg-white border border-neutral-200 rounded-sm p-8 sm:p-12 text-center space-y-3">
                <div className="h-10 w-10 rounded-sm bg-neutral-100 text-neutral-800 flex items-center justify-center mx-auto text-sm font-semibold uppercase">
                  {activeTab.slice(0, 2)}
                </div>
                <h3 className="text-base font-semibold text-neutral-900 capitalize">
                  {activeTab} Management
                </h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">
                  This section is ready. Tell us what specific tools, tables, and actions you would like to build here.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="px-3.5 py-1.5 bg-neutral-900 hover:bg-red-600 text-white rounded-sm text-xs font-medium transition-colors cursor-pointer"
                  >
                    Back to Overview
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
