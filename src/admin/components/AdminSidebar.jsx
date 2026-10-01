import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Box,
  Layers,
  Users,
  Settings,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Plus,
  List,
  X,
  Tag,
  Star,
  Image as ImageIcon,
  Truck,
} from 'lucide-react';
import logoBlack from '../../assets/logo_balck.png';

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  pendingOrdersCount = 2,
  productsCount = 12,
  customersCount = 0,
}) {
  const [isInventoryOpen, setIsInventoryOpen] = useState(
    activeTab === 'categories' || activeTab === 'add-category' || activeTab === 'products' || activeTab === 'add-product'
  );

  return (
    <>
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-56 h-full shrink-0 bg-white border-r border-neutral-200 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } font-sans select-none overflow-hidden`}
      >
        {/* Top: Brand and Nav Links (Scrollable if viewport is short) */}
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col justify-between">
          <div>
            {/* Logo Header (Only shown on mobile drawer) */}
            <div className="h-14 px-4 border-b border-neutral-200 flex items-center justify-between lg:hidden">
              <div className="flex items-center gap-2">
                <img
                  src={logoBlack}
                  alt="Brand Logo"
                  className="h-7 w-auto object-contain max-w-[130px]"
                />
              </div>

            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden p-1 rounded-sm text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-2.5 space-y-1">
            <div className="px-2.5 py-1.5 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
              Management
            </div>

            {/* 1. Dashboard */}
            <button
              onClick={() => {
                setActiveTab('overview');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className={`h-3.5 w-3.5 ${activeTab === 'overview' ? 'text-white' : 'text-neutral-500'}`} />
                <span>Dashboard</span>
              </div>
            </button>

            {/* 2. Orders */}
            <button
              onClick={() => {
                setActiveTab('orders');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className={`h-3.5 w-3.5 ${activeTab === 'orders' ? 'text-white' : 'text-neutral-500'}`} />
                <span>Orders</span>
              </div>
              <span className={`px-1.5 py-0.2 rounded-xs text-[10px] font-medium ${
                activeTab === 'orders' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600 border border-red-200'
              }`}>
                {pendingOrdersCount}
              </span>
            </button>

            {/* 3. INVENTORY DROPDOWN */}
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => setIsInventoryOpen(!isInventoryOpen)}
                className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
                  activeTab.startsWith('category') || activeTab.startsWith('add-category') || activeTab.startsWith('product')
                    ? 'text-neutral-900 bg-neutral-100 font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Box className="h-3.5 w-3.5 text-neutral-700" />
                  <span>Inventory</span>
                </div>
                <ChevronDown className={`h-3.5 w-3.5 text-neutral-400 transition-transform duration-200 ${isInventoryOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Submenu Links */}
              {isInventoryOpen && (
                <div className="pl-5 pr-1 py-1 space-y-0.5 border-l-2 border-neutral-200 ml-3.5 animate-in fade-in duration-150">
                  {/* All Categories */}
                  <button
                    onClick={() => {
                      setActiveTab('categories');
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 text-[11px] font-medium rounded-sm transition-colors cursor-pointer ${
                      activeTab === 'categories'
                        ? 'bg-neutral-900 text-white font-semibold'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                    }`}
                  >
                    <Layers className="h-3 w-3" />
                    <span>All Categories</span>
                  </button>

                  {/* Add Category */}
                  <button
                    onClick={() => {
                      setActiveTab('add-category');
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 text-[11px] font-medium rounded-sm transition-colors cursor-pointer ${
                      activeTab === 'add-category'
                        ? 'bg-neutral-900 text-white font-semibold'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                    }`}
                  >
                    <Plus className="h-3 w-3 text-red-500" />
                    <span>Add Category</span>
                  </button>

                  {/* All Products */}
                  <button
                    onClick={() => {
                      setActiveTab('products');
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 text-[11px] font-medium rounded-sm transition-colors cursor-pointer ${
                      activeTab === 'products'
                        ? 'bg-neutral-900 text-white font-semibold'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                    }`}
                  >
                    <List className="h-3 w-3" />
                    <span>All Products</span>
                  </button>

                  {/* Add Product */}
                  <button
                    onClick={() => {
                      setActiveTab('add-product');
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 text-[11px] font-medium rounded-sm transition-colors cursor-pointer ${
                      activeTab === 'add-product'
                        ? 'bg-neutral-900 text-white font-semibold'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                    }`}
                  >
                    <Plus className="h-3 w-3 text-emerald-600" />
                    <span>Add Product</span>
                  </button>
                </div>
              )}
            </div>

            {/* 4. Customers */}
            <button
              onClick={() => {
                setActiveTab('customers');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
                activeTab === 'customers'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className={`h-3.5 w-3.5 ${activeTab === 'customers' ? 'text-white' : 'text-neutral-500'}`} />
                <span>Customers</span>
              </div>
              <span className={`text-[11px] font-mono ${activeTab === 'customers' ? 'text-neutral-300' : 'text-neutral-400'}`}>
                {customersCount}
              </span>
            </button>

            {/* 5. Banners Management */}
            <button
              onClick={() => {
                setActiveTab('banners');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
                activeTab === 'banners'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ImageIcon className={`h-3.5 w-3.5 ${activeTab === 'banners' ? 'text-white' : 'text-red-500'}`} />
                <span>Banners</span>
              </div>
            </button>

            {/* 6. Reviews & Ratings Moderation */}
            <button
              onClick={() => {
                setActiveTab('reviews');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
                activeTab === 'reviews'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Star className={`h-3.5 w-3.5 ${activeTab === 'reviews' ? 'text-amber-400 fill-current' : 'text-amber-500'}`} />
                <span>Reviews & Ratings</span>
              </div>
            </button>

            {/* 7. Global Offers & Discounts */}
            <button
              onClick={() => {
                setActiveTab('offers');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
                activeTab === 'offers'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Tag className={`h-3.5 w-3.5 ${activeTab === 'offers' ? 'text-white' : 'text-emerald-600'}`} />
                <span>Offers & Deals</span>
              </div>
            </button>

            {/* 8. Shipping & COD Delivery Settings */}
            <button
              onClick={() => {
                setActiveTab('shipping');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
                activeTab === 'shipping'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Truck className={`h-3.5 w-3.5 ${activeTab === 'shipping' ? 'text-white' : 'text-blue-500'}`} />
                <span>Shipping & COD</span>
              </div>
            </button>

            {/* 9. Settings */}
            <button
              onClick={() => {
                setActiveTab('settings');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className={`h-3.5 w-3.5 ${activeTab === 'settings' ? 'text-white' : 'text-neutral-500'}`} />
                <span>Settings</span>
              </div>
            </button>
          </div>
        </div>

        {/* Bottom System Status Widget */}
        <div className="p-3 border-t border-neutral-200 bg-neutral-50 m-2 rounded-sm border shrink-0">
          <div className="flex items-center justify-between text-xs font-medium text-neutral-700">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-neutral-700" />
              <span className="text-[11px]">System Status</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.2 rounded-xs bg-emerald-100 text-emerald-800 font-medium">
              Live
            </span>
          </div>
          <p className="text-[10px] text-neutral-500 mt-1">
            Store telemetry active
          </p>
        </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity"
        />
      )}
    </>
  );
}
