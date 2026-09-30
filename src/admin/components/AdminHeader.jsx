import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  Eye,
  LogOut,
  Bell,
  Search,
  Check,
  Package,
  AlertTriangle,
  CreditCard,
  Star,
  ExternalLink,
  ChevronDown,
  User,
} from 'lucide-react';
import logoBlack from '../../assets/logo_balck.png';
import { toast } from 'sonner';

export default function AdminHeader({
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  onLogout,
  adminUser = { name: 'Alex Vance', role: 'Store Administrator', email: 'admin@xavonic.com' },
}) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sample real-time notifications for active e-commerce store
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'order',
      title: 'New Order #ORD-98421',
      description: 'Vikram Mehta placed an order for ₹2,598',
      time: '2m ago',
      read: false,
      icon: Package,
    },
    {
      id: 2,
      type: 'inventory',
      title: 'Low Stock Alert',
      description: 'Tactical Shorts (M) - 2 units left',
      time: '18m ago',
      read: false,
      icon: AlertTriangle,
    },
    {
      id: 3,
      type: 'payment',
      title: 'Instant UPI Verified',
      description: '₹1,299 received via PhonePe for #ORD-98420',
      time: '45m ago',
      read: false,
      icon: CreditCard,
    },
    {
      id: 4,
      type: 'review',
      title: '5★ Product Review',
      description: 'Aman S. reviewed Compression Tee',
      time: '2h ago',
      read: true,
      icon: Star,
    },
  ]);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <header className="h-14 bg-white border-b border-neutral-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 font-sans">
      
      {/* Left Section: Mobile Toggle & Brand/Search */}
      <div className="flex items-center gap-3 sm:gap-6 flex-1 max-w-xl">
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="lg:hidden p-1.5 rounded-sm hover:bg-neutral-100 text-neutral-600 transition-colors"
          title="Toggle Navigation"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Brand in Header (Mobile) */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link to="/admin">
            <img
              src={logoBlack}
              alt="Brand Logo"
              className="h-6 w-auto object-contain max-w-[110px]"
            />
          </Link>
        </div>

        {/* Clean White Minimal Search Bar */}
        <div className="relative w-full max-w-xs hidden sm:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders, SKU, customers..."
            className="w-full h-8 bg-neutral-50 hover:bg-neutral-100/60 focus:bg-white border border-neutral-200 rounded-sm pl-8 pr-3 text-xs text-neutral-800 placeholder:text-neutral-400 outline-none focus:border-neutral-900 transition-colors"
          />
        </div>
      </div>

      {/* Right Section: Actions, Notifications & User */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Live Traffic Pill */}
        <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-neutral-50 border border-neutral-200 text-[11px] font-medium text-neutral-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live: <strong className="text-neutral-900 font-semibold">18 Active</strong></span>
        </div>

        {/* View Storefront Link */}
        <Link
          to="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:text-red-600 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-sm transition-colors"
          title="Open live customer store"
        >
          <Eye className="h-3.5 w-3.5 text-neutral-500" />
          <span>View Store</span>
          <ExternalLink className="h-3 w-3 text-neutral-400" />
        </Link>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`relative p-1.5 rounded-sm border transition-colors cursor-pointer ${
              isNotificationsOpen
                ? 'bg-neutral-100 border-neutral-300 text-neutral-900'
                : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-600 hover:text-neutral-900'
            }`}
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-3.5 min-w-[14px] px-1 bg-red-600 text-white font-medium text-[9px] rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Flyout Card */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-neutral-200 rounded-sm z-50 overflow-hidden">
              {/* Header */}
              <div className="px-3 py-2.5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-neutral-900 uppercase tracking-wide">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-xs text-[10px] font-medium bg-red-600 text-white">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] text-neutral-500 hover:text-red-600 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Check className="h-3 w-3" /> Mark read
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-neutral-400">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.id}
                        onClick={() => markAsRead(item.id)}
                        className={`p-3 flex items-start gap-2.5 hover:bg-neutral-50 transition-colors cursor-pointer ${
                          !item.read ? 'bg-neutral-50/60' : ''
                        }`}
                      >
                        <div className="p-1.5 rounded-sm bg-neutral-100 text-neutral-700 shrink-0 mt-0.5">
                          <Icon className="h-3 w-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-medium text-neutral-900 truncate">
                              {item.title}
                            </p>
                            <span className="text-[10px] text-neutral-400 shrink-0">
                              {item.time}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500 leading-tight mt-0.5">
                            {item.description}
                          </p>
                        </div>
                        {!item.read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-red-600 shrink-0 mt-1" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-2 border-t border-neutral-100 bg-neutral-50 text-center">
                <button
                  onClick={() => toast.info('Notification preferences can be configured in Settings')}
                  className="text-[10px] text-neutral-500 hover:text-neutral-900 font-medium uppercase tracking-wider transition-colors"
                >
                  Configure Alerts
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-neutral-200 hidden sm:block" />

        {/* Profile Menu Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-sm hover:bg-neutral-100 border border-transparent hover:border-neutral-200 transition-colors cursor-pointer"
          >
            <div className="h-6 w-6 rounded-sm bg-neutral-900 text-white font-medium text-[11px] flex items-center justify-center">
              AD
            </div>
            <div className="hidden sm:block text-left text-xs leading-tight">
              <div className="font-medium text-neutral-900">{adminUser.name}</div>
              <div className="text-[10px] text-neutral-400">{adminUser.role}</div>
            </div>
            <ChevronDown className="h-3 w-3 text-neutral-400 hidden sm:block" />
          </button>

          {/* Profile Dropdown Card */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-sm z-50 overflow-hidden py-1">
              <div className="px-3 py-2 border-b border-neutral-100 bg-neutral-50">
                <p className="text-xs font-medium text-neutral-900">{adminUser.name}</p>
                <p className="text-[10px] text-neutral-500 truncate">{adminUser.email}</p>
              </div>

              <div className="py-1 text-xs text-neutral-700">
                <Link
                  to="/"
                  target="_blank"
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-50 hover:text-red-600 transition-colors"
                >
                  <Eye className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Open Store</span>
                </Link>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    toast.info('Account profile details');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-50 transition-colors text-left"
                >
                  <User className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Account</span>
                </button>
              </div>

              <div className="border-t border-neutral-100 pt-1">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors text-left font-medium cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
