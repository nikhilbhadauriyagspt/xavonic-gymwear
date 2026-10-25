import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  User, 
  Package, 
  MapPin, 
  Heart, 
  Headphones, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Plus, 
  Trash2, 
  FileText, 
  RotateCcw, 
  X, 
  Phone, 
  Mail, 
  ShoppingBag,
  ArrowLeft,
  ExternalLink,
  Truck,
  Home,
  CreditCard,
  Wallet,
  Calendar,
  Clock,
  ShieldCheck,
  Printer,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { ORDERS_API_BASE } from '../config/api';
import OrderInvoiceModal from '../components/OrderInvoiceModal';
import { printOrderInvoice } from '../utils/invoiceGenerator';

const TOPWEAR_SIZES = ['S (38")', 'M (40")', 'L (42")', 'XL (44")', 'XXL (46")'];
const BOTTOMWEAR_SIZES = ['S (30")', 'M (32")', 'L (34")', 'XL (36")', 'XXL (38")'];
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh'
];

export default function AccountPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    user, 
    isLoggedIn, 
    openAuth, 
    updateProfile, 
    addAddress, 
    deleteAddress, 
    setDefaultAddress, 
    logout,
    linkEmailSendOtp,
    verifyLinkEmail
  } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist();

  // Tab State
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync tab with URL
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
    setSelectedOrder(null);
  };

  // Orders State
  const [customerOrders, setCustomerOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [orderFilter, setOrderFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Modal States
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Ordered by mistake');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('Size / Fit issue');
  const [returnComment, setReturnComment] = useState('');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  // Address Modal State
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    addressLine: '',
    city: '',
    state: 'Haryana',
    pincode: '',
    type: 'Home',
    isDefault: false
  });

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    chestSize: 'L (42")',
    lowerSize: 'M (32")'
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Email verification state
  const [isEmailOtpSent, setIsEmailOtpSent] = useState(false);
  const [emailOtpInput, setEmailOtpInput] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  // Sync initial user details to profile form
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        chestSize: user.chestSize || 'L (42")',
        lowerSize: user.lowerSize || 'M (32")'
      });
      setAddressForm(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone?.replace(/[^0-9]/g, '') || ''
      }));
    }
  }, [user]);

  // Fetch real-time orders
  useEffect(() => {
    if (user) {
      const idOrPhone = user.phone || user.id || user.dbId;
      if (idOrPhone) {
        setIsLoadingOrders(true);
        fetch(`${ORDERS_API_BASE}/user/${encodeURIComponent(idOrPhone)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && Array.isArray(data.orders)) {
              setCustomerOrders(data.orders);
            } else {
              setCustomerOrders([]);
            }
          })
          .catch(() => {
            setCustomerOrders([]);
          })
          .finally(() => setIsLoadingOrders(false));
      }
    }
  }, [user]);

  // Handle Profile Save
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateProfile(profileForm);
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Send Email OTP
  const handleSendEmailOtp = async () => {
    if (!profileForm.email || !profileForm.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setIsEmailLoading(true);
    try {
      const res = await linkEmailSendOtp(profileForm.email);
      if (res?.success) {
        setIsEmailOtpSent(true);
        toast.success(`Verification code sent to ${profileForm.email}`);
      } else {
        toast.error(res?.message || 'Failed to send OTP code');
      }
    } catch {
      toast.error('Failed to send verification code');
    } finally {
      setIsEmailLoading(false);
    }
  };

  // Verify Email OTP
  const handleVerifyEmailOtp = async () => {
    if (!emailOtpInput || emailOtpInput.length < 4) {
      toast.error('Please enter the 4-digit verification code');
      return;
    }
    setIsEmailLoading(true);
    try {
      const res = await verifyLinkEmail(profileForm.email, emailOtpInput);
      if (res?.success) {
        setIsEmailOtpSent(false);
        setEmailOtpInput('');
        toast.success('Email linked and verified successfully!');
      } else {
        toast.error(res?.message || 'Invalid verification code');
      }
    } catch {
      toast.error('Error verifying email OTP');
    } finally {
      setIsEmailLoading(false);
    }
  };

  // Handle Address Submit
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (!addressForm.addressLine || !addressForm.city || !addressForm.pincode) {
      toast.error('Please complete all required address fields.');
      return;
    }
    try {
      await addAddress(addressForm);
      toast.success('New delivery address saved!');
      setIsAddAddressOpen(false);
      setAddressForm({
        name: user?.name || '',
        phone: user?.phone?.replace(/[^0-9]/g, '') || '',
        addressLine: '',
        city: '',
        state: 'Haryana',
        pincode: '',
        type: 'Home',
        isDefault: false
      });
    } catch {
      toast.error('Could not save address. Try again.');
    }
  };

  // Handle Order Cancel
  const handleCustomerCancelSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsSubmittingCancel(true);
    try {
      const res = await fetch(`${ORDERS_API_BASE}/${selectedOrder.orderNumber || selectedOrder.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancellation_reason: cancelReason }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Order cancelled successfully.');
        setIsCancelModalOpen(false);
        setSelectedOrder((prev) => ({
          ...prev,
          orderStatus: 'Cancelled',
          cancellationReason: cancelReason,
          cancelledAt: new Date().toISOString(),
        }));
        const idOrPhone = user?.phone || user?.id || user?.dbId;
        if (idOrPhone) {
          fetch(`${ORDERS_API_BASE}/user/${encodeURIComponent(idOrPhone)}`)
            .then((r) => r.json())
            .then((d) => { if (d.success) setCustomerOrders(d.orders || []); });
        }
      } else {
        toast.error(data.message || 'Failed to cancel order');
      }
    } catch {
      toast.error('Network error cancelling order');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  // Handle Order Return
  const handleCustomerReturnSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsSubmittingReturn(true);
    try {
      const res = await fetch(`${ORDERS_API_BASE}/${selectedOrder.orderNumber || selectedOrder.id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          return_reason: returnReason,
          return_comment: returnComment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Return request initiated! Courier pickup will be scheduled.');
        setIsReturnModalOpen(false);
        setSelectedOrder((prev) => ({
          ...prev,
          returnStatus: 'Requested',
          returnReason: returnReason,
          returnComment: returnComment,
          refundStatus: 'Initiated',
        }));
        const idOrPhone = user?.phone || user?.id || user?.dbId;
        if (idOrPhone) {
          fetch(`${ORDERS_API_BASE}/user/${encodeURIComponent(idOrPhone)}`)
            .then((r) => r.json())
            .then((d) => { if (d.success) setCustomerOrders(d.orders || []); });
        }
      } else {
        toast.error(data.message || 'Failed to submit return request');
      }
    } catch {
      toast.error('Network error submitting return request');
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  // Filter orders
  const filteredOrders = customerOrders.filter(order => {
    if (orderFilter === 'all') return true;
    const status = (order.orderStatus || '').toLowerCase();
    if (orderFilter === 'processing') return status === 'confirmed' || status === 'processing' || status === 'pending';
    if (orderFilter === 'shipped') return status === 'shipped' || status === 'out for delivery';
    if (orderFilter === 'delivered') return status === 'delivered';
    if (orderFilter === 'cancelled') return status === 'cancelled' || status === 'returned';
    return true;
  });

  // Not logged in view
  if (!user && !isLoggedIn) {
    return (
      <div className="min-h-[calc(100vh-112px)] w-full flex items-center justify-center px-4 py-16 bg-zinc-50 text-zinc-900">
        <div className="max-w-md w-full bg-white border border-zinc-200 rounded-lg p-8 text-center space-y-5 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-800">
            <User className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-900">Sign In to Your Account</h2>
            <p className="text-xs text-zinc-500">
              Please log in to view your orders, manage saved addresses, and update your profile details.
            </p>
          </div>
          <button
            onClick={openAuth}
            className="w-full py-3 bg-black hover:bg-zinc-800 text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
          >
            Sign In / Register
          </button>
          <Link
            to="/"
            className="block text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'profile', label: 'My Profile', icon: User, badge: null },
    { 
      id: 'orders', 
      label: 'My Orders', 
      icon: Package, 
      badge: customerOrders.length > 0 ? customerOrders.length : null 
    },
    { 
      id: 'addresses', 
      label: 'Saved Addresses', 
      icon: MapPin, 
      badge: user?.addresses?.length > 0 ? user.addresses.length : null 
    },
    { 
      id: 'wishlist', 
      label: 'My Wishlist', 
      icon: Heart, 
      badge: wishlist?.length > 0 ? wishlist.length : null 
    },
    { id: 'support', label: 'Help & Support', icon: Headphones, badge: null },
  ];

  return (
    <div className="min-h-[calc(100vh-112px)] w-full max-w-none bg-white text-zinc-900 font-sans antialiased flex flex-col lg:flex-row">
      
      {/* ================= LEFT FULL-HEIGHT SIDEBAR ================= */}
      <aside className="w-full lg:w-72 xl:w-80 bg-white border-b lg:border-b-0 lg:border-r border-zinc-200 shrink-0 flex flex-col justify-between lg:min-h-[calc(100vh-112px)] lg:sticky lg:top-[112px]">
        
        <div>
          {/* User Profile Header inside Sidebar */}
          <div className="p-5 sm:p-6 border-b border-zinc-200">
            <div className="flex items-center gap-3.5">
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 border border-red-200 font-bold text-sm flex items-center justify-center uppercase tracking-wider">
                  {user?.initials || user?.name?.slice(0, 2) || 'U'}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold text-zinc-900 truncate">
                  {user?.name || 'My Account'}
                </h2>
                <p className="text-xs text-zinc-500  mt-0.5">
                  +91 {user?.phone?.replace(/[^0-9]/g, '').slice(-10)}
                </p>
                {user?.customerId && (
                  <span className="inline-block mt-1 text-[10px]  px-1.5 py-0.5 bg-zinc-100 text-zinc-600 rounded border border-zinc-200">
                    ID: {user.customerId}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Navigation Menu */}
          <div className="p-3 sm:p-4">
            <span className="hidden lg:block px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Account Navigation
            </span>
            <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-1.5 scrollbar-none">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`flex items-center justify-between px-3.5 py-2.5 text-xs font-medium rounded-md transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 lg:shrink lg:w-full border ${
                      isActive
                        ? 'bg-red-50 text-red-600 border-red-200 font-semibold'
                        : 'bg-white text-zinc-600 border-transparent hover:text-zinc-900 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-red-600' : 'text-zinc-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    
                    {item.badge !== null && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ml-2 ${
                        isActive 
                          ? 'bg-red-600 text-white' 
                          : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Mobile Sign Out Button */}
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                  toast.success('Signed out successfully.');
                }}
                className="lg:hidden flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Bottom Sidebar Footer (Desktop) */}
        <div className="hidden lg:block p-4 border-t border-zinc-200 bg-white">
          <button
            onClick={() => {
              logout();
              navigate('/');
              toast.success('Signed out successfully.');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-red-600 bg-white hover:bg-red-50 border border-red-200 rounded-md transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>

      {/* ================= RIGHT FULL-WIDTH CONTENT AREA ================= */}
      <main className="flex-1 min-w-0 w-full max-w-none bg-white p-5 sm:p-8 lg:p-10">

        {/* TAB 1: MY PROFILE */}
        {activeTab === 'profile' && (
          <div className="w-full space-y-6 animate-in fade-in duration-150">
            
            {/* Page Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-200">
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight">My Profile</h1>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Manage your personal information, contact details, and size preferences.
                </p>
              </div>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-6">
              
              {/* Card 1: Personal Information */}
              <div className="bg-white border border-zinc-200 rounded-lg p-5 sm:p-6 space-y-5 shadow-2xs">
                <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-100 pb-3">
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-zinc-600 uppercase tracking-wide block">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full bg-white border border-zinc-300 focus:border-black rounded-md px-3.5 py-2.5 text-zinc-900 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-zinc-600 uppercase tracking-wide flex items-center justify-between">
                      <span>Mobile Number (WhatsApp)</span>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    </label>
                    <div className="flex items-center bg-zinc-100 border border-zinc-200 rounded-md px-3.5 py-2.5 text-zinc-600 ">
                      <span>+91 {profileForm.phone?.replace(/[^0-9]/g, '').slice(-10) || user?.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Email Address with Verification */}
                <div className="space-y-1.5 text-xs pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-medium text-zinc-600 uppercase tracking-wide">
                      Email Address
                    </label>
                    {user.email && user.emailVerified ? (
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-600 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Not Verified
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="flex-1 bg-white border border-zinc-300 focus:border-black rounded-md px-3.5 py-2.5 text-zinc-900 focus:outline-none transition-colors"
                    />
                    {(!user.email || !user.emailVerified || profileForm.email !== user.email) && (
                      <button
                        type="button"
                        onClick={handleSendEmailOtp}
                        disabled={isEmailLoading || !profileForm.email}
                        className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-md font-medium transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                      >
                        {isEmailLoading ? 'Sending OTP...' : 'Verify Email'}
                      </button>
                    )}
                  </div>

                  {/* OTP Input for Email */}
                  {isEmailOtpSent && (
                    <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-md space-y-2 mt-2">
                      <span className="text-[11px] text-zinc-600 block">
                        Enter the 4-digit code sent to <strong>{profileForm.email}</strong>:
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={4}
                          value={emailOtpInput}
                          onChange={(e) => setEmailOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                          className="w-28 text-center bg-white border border-zinc-300 focus:border-black rounded-md px-2 py-1.5 text-zinc-900  text-sm tracking-widest focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyEmailOtp}
                          disabled={isEmailLoading || emailOtpInput.length < 4}
                          className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          Verify OTP
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2: Size Preferences */}
              <div className="bg-white border border-zinc-200 rounded-lg p-5 sm:p-6 space-y-5 shadow-2xs">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">Default Size Preferences</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Select your regular clothing sizes for faster shopping.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Topwear Size */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-medium text-zinc-600 uppercase tracking-wide block">
                      Topwear Size (T-Shirts / Hoodies / Jackets)
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {TOPWEAR_SIZES.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setProfileForm({ ...profileForm, chestSize: size })}
                          className={`px-3.5 py-2 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                            profileForm.chestSize === size
                              ? 'bg-red-50 text-red-600 border-red-500 font-semibold'
                              : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-500'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bottomwear Size */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-medium text-zinc-600 uppercase tracking-wide block">
                      Bottomwear Size (Joggers / Shorts / Trackpants)
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {BOTTOMWEAR_SIZES.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setProfileForm({ ...profileForm, lowerSize: size })}
                          className={`px-3.5 py-2 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                            profileForm.lowerSize === size
                              ? 'bg-red-50 text-red-600 border-red-500 font-semibold'
                              : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-500'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Action */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSavingProfile ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* TAB 2: MY ORDERS */}
        {activeTab === 'orders' && (
          <div className="w-full space-y-6 animate-in fade-in duration-150">
            {selectedOrder ? (
              /* ================= ORDER DETAILS VIEW ================= */
              <div className="space-y-5 text-xs">
                {/* Back Button */}
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="inline-flex items-center gap-1.5 text-zinc-600 hover:text-zinc-900 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to All Orders</span>
                </button>

                {/* 1. Order Header & Connected 4-Step Icon Delivery Tracker */}
                {(() => {
                  const statusRaw = String(selectedOrder.orderStatus || 'Confirmed');
                  const statusLower = statusRaw.toLowerCase();
                  const isCancelled = statusLower === 'cancelled' || statusLower === 'returned';
                  const isDelivered = statusLower === 'delivered';
                  const isShipped = statusLower === 'shipped' || statusLower === 'out for delivery' || isDelivered;
                  const isPaidOnline =
                    String(selectedOrder.paymentStatus || '').toLowerCase() === 'paid' ||
                    !String(selectedOrder.paymentMethod || '').toLowerCase().includes('cod');
                  const cleanPaymentLabel = String(selectedOrder.paymentMethod || '')
                    .toLowerCase()
                    .includes('cod')
                    ? 'Cash on Delivery (COD)'
                    : 'Online Prepaid';
                  const orderDateStr = selectedOrder.createdAt
                    ? new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : selectedOrder.date || 'Recent';

                  return (
                    <>
                      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-2xs">
                        {/* Top Bar */}
                        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100">
                          <div className="flex items-start gap-3.5">
                            <div
                              className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white shadow-2xs ${
                                isCancelled
                                  ? 'bg-red-600'
                                  : isDelivered
                                  ? 'bg-emerald-600'
                                  : 'bg-zinc-900'
                              }`}
                            >
                              {isCancelled ? (
                                <X className="h-5 w-5" />
                              ) : isDelivered ? (
                                <CheckCircle2 className="h-5 w-5" />
                              ) : (
                                <Package className="h-5 w-5" />
                              )}
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900">
                                  Order #{String(selectedOrder.orderNumber || selectedOrder.id || '').replace(/^#/, '')}
                                </h3>
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                    isDelivered
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : isCancelled
                                      ? 'bg-red-50 text-red-700 border-red-200'
                                      : 'bg-amber-50 text-amber-700 border-amber-200'
                                  }`}
                                >
                                  {isDelivered ? (
                                    <CheckCircle2 className="h-3 w-3" />
                                  ) : isCancelled ? (
                                    <AlertCircle className="h-3 w-3" />
                                  ) : (
                                    <Clock className="h-3 w-3" />
                                  )}
                                  <span>{statusRaw}</span>
                                </span>

                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                                    isPaidOnline
                                      ? 'bg-emerald-50/70 text-emerald-700 border-emerald-200'
                                      : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                                  }`}
                                >
                                  {isPaidOnline ? (
                                    <CreditCard className="h-3 w-3" />
                                  ) : (
                                    <Wallet className="h-3 w-3" />
                                  )}
                                  <span>{isPaidOnline ? 'Paid Online' : 'Pay on Delivery'}</span>
                                </span>
                              </div>

                              <p className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 mt-1">
                                <Calendar className="h-3 w-3 text-zinc-400" />
                                <span>Placed on {orderDateStr}</span>
                              </p>
                            </div>
                          </div>

                          {/* Header Actions */}
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => {
                                setInvoiceOrder(selectedOrder);
                                setIsInvoiceModalOpen(true);
                              }}
                              className="h-9 px-3.5 bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-300 rounded-lg font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5 text-zinc-700" />
                              <span>Tax Invoice</span>
                            </button>

                            <button
                              onClick={() => printOrderInvoice(selectedOrder)}
                              className="h-9 px-3 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-300 rounded-lg font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="Print Invoice"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Print</span>
                            </button>

                            {(!selectedOrder.orderStatus ||
                              statusLower === 'confirmed' ||
                              statusLower === 'processing' ||
                              statusLower === 'pending') && (
                              <button
                                onClick={() => setIsCancelModalOpen(true)}
                                className="h-9 px-3.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-semibold transition-colors cursor-pointer"
                              >
                                Cancel Order
                              </button>
                            )}

                            {isDelivered && (
                              <button
                                onClick={() => setIsReturnModalOpen(true)}
                                className="h-9 px-3.5 border border-zinc-300 hover:border-zinc-900 text-zinc-800 rounded-lg font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Return / Exchange</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Connected 4-Step Delivery Stepper */}
                        {!isCancelled && (
                          <div className="bg-zinc-50/60 px-5 py-6 sm:px-6">
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-5">
                              <div className="flex items-center gap-2.5">
                                <div className="grid h-8 w-8 place-items-center rounded-lg bg-white border border-zinc-200 text-zinc-800 shadow-2xs">
                                  <Truck className="h-4 w-4" />
                                </div>
                                <div>
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
                                    Estimated Delivery
                                  </span>
                                  <span className="text-xs sm:text-sm font-bold text-zinc-900">
                                    {selectedOrder.estimatedDelivery || '2–4 Business Days'}
                                  </span>
                                </div>
                              </div>

                              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-zinc-200 px-3 py-1.5 text-[11px] font-semibold text-zinc-700 shadow-2xs">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span>{isDelivered ? 'Delivered Successfully' : 'Express Fulfilment Active'}</span>
                              </span>
                            </div>

                            <div className="relative pt-1">
                              <div className="hidden sm:block absolute top-6 left-[12.5%] right-[12.5%] h-0.5 bg-zinc-200" />
                              <div
                                className="hidden sm:block absolute top-6 left-[12.5%] h-0.5 bg-emerald-600 transition-all duration-500"
                                style={{
                                  width: isDelivered ? '75%' : isShipped ? '50%' : '25%',
                                }}
                              />

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 relative z-10">
                                {[
                                  {
                                    label: 'Confirmed',
                                    sub: 'Order received',
                                    Icon: CheckCircle2,
                                    state: 'done',
                                  },
                                  {
                                    label: 'Processing',
                                    sub: 'Quality & packing',
                                    Icon: Package,
                                    state: isShipped || isDelivered ? 'done' : 'active',
                                  },
                                  {
                                    label: 'Shipped',
                                    sub: isShipped ? 'Dispatched' : 'In transit',
                                    Icon: Truck,
                                    state: isDelivered ? 'done' : isShipped ? 'active' : 'upcoming',
                                  },
                                  {
                                    label: 'Delivered',
                                    sub: selectedOrder.estimatedDelivery || '2–4 Business Days',
                                    Icon: Home,
                                    state: isDelivered ? 'done' : 'upcoming',
                                  },
                                ].map(({ label, sub, Icon, state }) => {
                                  const isDone = state === 'done';
                                  const isActive = state === 'active';
                                  return (
                                    <div
                                      key={label}
                                      className={`flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 rounded-xl sm:rounded-none border sm:border-0 p-3 sm:p-0 ${
                                        isDone
                                          ? 'border-emerald-200 bg-emerald-50/40 sm:bg-transparent'
                                          : isActive
                                          ? 'border-zinc-900 bg-white sm:bg-transparent'
                                          : 'border-zinc-200 bg-white/60 sm:bg-transparent'
                                      }`}
                                    >
                                      <div
                                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 transition-all ${
                                          isDone
                                            ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                                            : isActive
                                            ? 'border-zinc-900 bg-white text-zinc-900 ring-4 ring-zinc-900/10'
                                            : 'border-zinc-200 bg-white text-zinc-400'
                                        }`}
                                      >
                                        <Icon className="h-4 w-4 stroke-[2.2]" />
                                      </div>
                                      <div className="min-w-0">
                                        <p
                                          className={`text-xs font-bold ${
                                            isDone
                                              ? 'text-emerald-700'
                                              : isActive
                                              ? 'text-zinc-900'
                                              : 'text-zinc-400'
                                          }`}
                                        >
                                          {label}
                                        </p>
                                        <p className="text-[11px] text-zinc-500 mt-0.5 truncate">{sub}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 2. Two-Column Delivery Address & Payment Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Delivery Address Card */}
                        <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-2xs">
                          <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-zinc-100">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-zinc-700" />
                              <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                                Delivery Address
                              </span>
                            </div>
                            {typeof selectedOrder.shippingAddress === 'object' &&
                              selectedOrder.shippingAddress?.type && (
                                <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                                  {selectedOrder.shippingAddress.type}
                                </span>
                              )}
                          </div>

                          {typeof selectedOrder.shippingAddress === 'object' &&
                          selectedOrder.shippingAddress !== null ? (
                            <div className="space-y-1 text-xs">
                              <p className="font-semibold text-zinc-900 text-sm">
                                {selectedOrder.shippingAddress.name || user.name}
                              </p>
                              <p className="text-zinc-600 leading-relaxed">
                                {[
                                  selectedOrder.shippingAddress.apartment,
                                  selectedOrder.shippingAddress.addressLine,
                                ]
                                  .filter(Boolean)
                                  .join(', ')}
                              </p>
                              <p className="text-zinc-600">
                                {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} —{' '}
                                <span className="font-semibold text-zinc-900">
                                  {selectedOrder.shippingAddress.pincode}
                                </span>
                              </p>
                              {selectedOrder.shippingAddress.phone && (
                                <div className="pt-2.5 mt-2.5 border-t border-zinc-100 flex items-center gap-1.5 text-[11px] text-zinc-500">
                                  <Phone className="h-3 w-3 text-zinc-400" />
                                  <span className="font-medium text-zinc-700">
                                    {selectedOrder.shippingAddress.phone}
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-zinc-600 leading-relaxed">
                              {selectedOrder.shippingAddress}
                            </p>
                          )}
                        </div>

                        {/* Payment & Dispatch Summary Card */}
                        <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-2xs">
                          <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-zinc-100">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4 text-zinc-700" />
                              <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                                Payment Summary
                              </span>
                            </div>
                            <span className="text-[11px] font-semibold text-zinc-500">
                              {cleanPaymentLabel}
                            </span>
                          </div>

                          <div className="space-y-2 text-xs text-zinc-600">
                            <div className="flex justify-between">
                              <span>Bag Subtotal</span>
                              <span className="font-medium text-zinc-900">
                                ₹{Number(selectedOrder.subtotal || selectedOrder.totalAmount || 0).toLocaleString('en-IN')}.00
                              </span>
                            </div>
                            {Number(selectedOrder.discountAmount || 0) > 0 && (
                              <div className="flex justify-between text-emerald-700">
                                <span>Total Savings & Discount</span>
                                <span className="font-semibold">
                                  - ₹{Number(selectedOrder.discountAmount).toLocaleString('en-IN')}.00
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span>Shipping & Handling</span>
                              <span className="text-emerald-700 font-semibold">FREE</span>
                            </div>
                            <div className="pt-2.5 mt-1 border-t border-zinc-200 flex justify-between items-baseline text-zinc-900">
                              <span className="text-xs font-bold uppercase tracking-wider">
                                Total {isPaidOnline ? 'Paid' : 'Payable'}
                              </span>
                              <span className="text-base font-bold">
                                ₹{Number(selectedOrder.totalAmount || 0).toLocaleString('en-IN')}.00
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 3. Ordered Items Card */}
                      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-2xs">
                        <div className="flex items-center justify-between px-5 py-4 sm:px-6 border-b border-zinc-100">
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4 text-zinc-700" />
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                              Order Items ({selectedOrder.items?.length || 1})
                            </span>
                          </div>
                          <span className="text-[11px] text-zinc-400">
                            Invoice #{String(selectedOrder.orderNumber || selectedOrder.id || '').replace(/^#/, '')}
                          </span>
                        </div>

                        <div className="divide-y divide-zinc-100 px-5 sm:px-6">
                          {(selectedOrder.items || []).map((item, idx) => {
                            const qty = Number(item.quantity || 1);
                            const unitPrice = Number(item.price || item.unitPrice || 0);
                            return (
                              <div key={idx} className="py-4 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3.5 min-w-0">
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.title || item.name}
                                      className="w-13 h-16 object-cover rounded-lg bg-zinc-100 border border-zinc-200 shrink-0"
                                    />
                                  ) : (
                                    <div className="w-13 h-16 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 shrink-0">
                                      <Package className="w-5 h-5" />
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 truncate">
                                      {item.title || item.name}
                                    </h4>
                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
                                      <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-medium text-zinc-700">
                                        Size: {item.selectedSize || item.size || 'M'}
                                      </span>
                                      <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-medium text-zinc-700">
                                        Qty: {qty}
                                      </span>
                                      <span className="text-zinc-400">
                                        ₹{unitPrice.toLocaleString('en-IN')} / unit
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-xs sm:text-sm font-bold text-zinc-900">
                                    ₹{(unitPrice * qty).toLocaleString('en-IN')}.00
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              /* ================= ORDERS LIST VIEW ================= */
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
                  <div>
                    <h1 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight">My Orders</h1>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Track your shipments, download tax invoices, or request returns & exchanges.
                    </p>
                  </div>

                  {/* Order Status Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                    {['all', 'processing', 'shipped', 'delivered', 'cancelled'].map((flt) => (
                      <button
                        key={flt}
                        onClick={() => setOrderFilter(flt)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer whitespace-nowrap border ${
                          orderFilter === flt
                            ? 'bg-zinc-900 text-white border-zinc-900'
                            : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                        }`}
                      >
                        {flt}
                      </button>
                    ))}
                  </div>
                </div>

                {isLoadingOrders ? (
                  <div className="bg-white border border-zinc-200 rounded-xl py-16 text-center text-zinc-500 text-xs">
                    Loading your orders...
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="bg-white border border-zinc-200 rounded-xl py-16 text-center space-y-4">
                    <ShoppingBag className="w-10 h-10 text-zinc-400 mx-auto" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-zinc-900">No orders found</h4>
                      <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                        {orderFilter === 'all'
                          ? "You haven't placed any orders yet."
                          : `No orders with status '${orderFilter}'.`}
                      </p>
                    </div>
                    <Link
                      to="/collections"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors"
                    >
                      <span>Start Shopping</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => {
                      const orderNum = String(order.orderNumber || order.id || 'ORD-9842').replace(/^#/, '');
                      const itemsCount = order.items?.length || 1;
                      const firstItem = order.items?.[0];
                      const statusRaw = String(order.orderStatus || 'Confirmed');
                      const statusLower = statusRaw.toLowerCase();
                      const isCancelled = statusLower === 'cancelled' || statusLower === 'returned';
                      const isDelivered = statusLower === 'delivered';
                      const isShipped = statusLower === 'shipped' || statusLower === 'out for delivery' || isDelivered;
                      const isPaidOnline =
                        String(order.paymentStatus || '').toLowerCase() === 'paid' ||
                        !String(order.paymentMethod || '').toLowerCase().includes('cod');
                      const orderDateStr = order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : order.date || 'Recent';

                      return (
                        <div
                          key={orderNum}
                          className="bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl overflow-hidden transition-all shadow-2xs"
                        >
                          {/* Top Order Card Header */}
                          <div className="bg-zinc-50/70 px-4 py-3 sm:px-5 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex flex-wrap items-center gap-2.5">
                              <span className="inline-flex items-center gap-1.5 font-bold text-zinc-900 text-sm">
                                <Package className="w-4 h-4 text-zinc-700" />
                                <span>#{orderNum}</span>
                              </span>

                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                  isDelivered
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : isCancelled
                                    ? 'bg-red-50 text-red-700 border-red-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                {isDelivered ? (
                                  <CheckCircle2 className="w-3 h-3" />
                                ) : isCancelled ? (
                                  <AlertCircle className="w-3 h-3" />
                                ) : (
                                  <Clock className="w-3 h-3" />
                                )}
                                <span>{statusRaw}</span>
                              </span>

                              <span
                                className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                                  isPaidOnline
                                    ? 'bg-white text-emerald-700 border-emerald-200'
                                    : 'bg-white text-zinc-600 border-zinc-200'
                                }`}
                              >
                                {isPaidOnline ? (
                                  <CreditCard className="w-3 h-3" />
                                ) : (
                                  <Wallet className="w-3 h-3" />
                                )}
                                <span>{isPaidOnline ? 'Paid Online' : 'Cash on Delivery'}</span>
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-zinc-500 text-xs">
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                                <span>{orderDateStr}</span>
                              </span>
                              <span className="text-zinc-300">|</span>
                              <span className="font-bold text-zinc-900 text-sm">
                                ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}.00
                              </span>
                            </div>
                          </div>

                          {/* Middle Product & Action Row */}
                          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5 min-w-0">
                              {firstItem?.image ? (
                                <img
                                  src={firstItem.image}
                                  alt={firstItem.title || 'Product'}
                                  className="w-14 h-16 object-cover rounded-lg bg-zinc-100 shrink-0 border border-zinc-200"
                                />
                              ) : (
                                <div className="w-14 h-16 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 shrink-0">
                                  <Package className="w-6 h-6" />
                                </div>
                              )}

                              <div className="min-w-0 text-xs">
                                <h4 className="font-semibold text-zinc-900 text-sm truncate">
                                  {firstItem?.title || firstItem?.name || `Order (${itemsCount} items)`}
                                </h4>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
                                  <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-medium text-zinc-700">
                                    Size: {firstItem?.selectedSize || firstItem?.size || 'M'}
                                  </span>
                                  <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-medium text-zinc-700">
                                    Qty: {firstItem?.quantity || 1}
                                  </span>
                                  {itemsCount > 1 && (
                                    <span className="rounded-md bg-zinc-900 text-white px-2 py-0.5 font-semibold text-[10px]">
                                      +{itemsCount - 1} more {itemsCount - 1 === 1 ? 'item' : 'items'}
                                    </span>
                                  )}
                                </div>
                                {!isCancelled && (
                                  <p className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                                    <Truck className="w-3.5 h-3.5" />
                                    <span>
                                      {isDelivered
                                        ? 'Delivered to your address'
                                        : `Est. Delivery: ${order.estimatedDelivery || '2–4 Business Days'}`}
                                    </span>
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => {
                                  setInvoiceOrder(order);
                                  setIsInvoiceModalOpen(true);
                                }}
                                className="h-9 px-3.5 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-300 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Invoice</span>
                              </button>

                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="h-9 px-4 bg-zinc-900 hover:bg-black text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                              >
                                <span>Track & Details</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Bottom 4-Step Mini Icon Progress Strip */}
                          {!isCancelled && (
                            <div className="bg-zinc-50/50 border-t border-zinc-100 px-4 py-2.5 sm:px-5 grid grid-cols-4 gap-2">
                              {[
                                { label: 'Confirmed', Icon: CheckCircle2, active: true, done: true },
                                { label: 'Processing', Icon: Package, active: true, done: isShipped || isDelivered },
                                { label: 'Shipped', Icon: Truck, active: isShipped, done: isDelivered },
                                { label: 'Delivered', Icon: Home, active: isDelivered, done: isDelivered },
                              ].map(({ label, Icon, active, done }) => (
                                <div key={label} className="flex items-center gap-1.5">
                                  <div
                                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                                      done
                                        ? 'bg-emerald-600 text-white'
                                        : active
                                        ? 'bg-zinc-900 text-white'
                                        : 'bg-zinc-200 text-zinc-400'
                                    }`}
                                  >
                                    <Icon className="w-3 h-3" />
                                  </div>
                                  <span
                                    className={`text-[11px] font-semibold truncate ${
                                      done
                                        ? 'text-emerald-700'
                                        : active
                                        ? 'text-zinc-900'
                                        : 'text-zinc-400'
                                    }`}
                                  >
                                    {label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SAVED ADDRESSES */}
        {activeTab === 'addresses' && (
          <div className="w-full space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight">Saved Addresses</h1>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Manage your delivery addresses for faster checkout.
                </p>
              </div>

              <button
                onClick={() => setIsAddAddressOpen(true)}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wider rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Address</span>
              </button>
            </div>

            {(!user.addresses || user.addresses.length === 0) ? (
              <div className="bg-white border border-zinc-200 rounded-lg py-16 text-center space-y-3">
                <MapPin className="w-10 h-10 text-zinc-400 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-zinc-900">No saved addresses</h4>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    Add your home or office delivery address for quick checkout.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddAddressOpen(true)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-black text-white text-xs font-medium rounded-md transition-colors cursor-pointer"
                >
                  Add Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {user.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="bg-white border border-zinc-200 rounded-lg p-5 space-y-3 flex flex-col justify-between shadow-2xs"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-900">{addr.name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                            {addr.type || 'Home'}
                          </span>
                        </div>
                        {addr.isDefault && (
                          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Default
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-600 leading-relaxed">
                        {addr.apartment && `${addr.apartment}, `}
                        {addr.addressLine}, {addr.city}, {addr.state} - <span className=" font-medium text-zinc-900">{addr.pincode}</span>
                      </p>

                      <p className="text-xs text-zinc-500 ">
                        Phone: +91 {addr.phone}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                      {!addr.isDefault ? (
                        <button
                          onClick={() => setDefaultAddress(addr.id)}
                          className="text-zinc-600 hover:text-zinc-900 font-medium transition-colors cursor-pointer text-xs"
                        >
                          Set as Default
                        </button>
                      ) : <div />}

                      <button
                        onClick={() => deleteAddress(addr.id)}
                        className="text-red-600 hover:text-red-700 p-1 rounded transition-colors cursor-pointer"
                        title="Delete Address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: MY WISHLIST */}
        {activeTab === 'wishlist' && (
          <div className="w-full space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight">My Wishlist</h1>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Items you have saved for later.
                </p>
              </div>
            </div>

            {(!wishlist || wishlist.length === 0) ? (
              <div className="bg-white border border-zinc-200 rounded-lg py-16 text-center space-y-4">
                <Heart className="w-10 h-10 text-zinc-400 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-zinc-900">Your wishlist is empty</h4>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    Save your favorite styles while browsing to easily find them later.
                  </p>
                </div>
                <Link
                  to="/collections"
                  className="inline-block px-5 py-2.5 bg-zinc-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-colors"
                >
                  Explore Collections
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {wishlist.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-zinc-200 rounded-lg overflow-hidden flex flex-col justify-between group shadow-2xs"
                  >
                    <Link to={`/product/${item.slug || item.id}`} className="block relative aspect-[3/4] bg-zinc-100 overflow-hidden">
                      {item.imageFront && (
                        <img
                          src={item.imageFront}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </Link>
                    <div className="p-3.5 space-y-2">
                      <Link to={`/product/${item.slug || item.id}`} className="block">
                        <h4 className="text-xs font-semibold text-zinc-900 truncate">{item.title}</h4>
                        <p className="text-xs font-bold text-zinc-900  mt-0.5">₹{item.price}</p>
                      </Link>
                      <div className="flex items-center gap-2 pt-1">
                        <Link
                          to={`/product/${item.slug || item.id}`}
                          className="flex-1 py-1.5 bg-zinc-900 hover:bg-black text-white text-[11px] font-medium text-center rounded transition-colors"
                        >
                          View Item
                        </Link>
                        <button
                          onClick={() => toggleWishlist(item)}
                          className="p-1.5 text-zinc-400 hover:text-red-600 border border-zinc-200 rounded transition-colors cursor-pointer"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: HELP & SUPPORT */}
        {activeTab === 'support' && (
          <div className="w-full space-y-6 animate-in fade-in duration-150">
            <div className="pb-4 border-b border-zinc-200">
              <h1 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight">Help & Customer Support</h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                Get assistance with orders, size exchanges, deliveries, or general queries.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="https://wa.me/919999999999?text=Hi%2C%20I%20need%20help%20with%20my%20order"
                target="_blank"
                rel="noreferrer"
                className="p-5 bg-white border border-zinc-200 hover:border-zinc-400 rounded-lg space-y-2 transition-all group cursor-pointer shadow-2xs"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-zinc-900">WhatsApp Support</h4>
                <p className="text-xs text-zinc-500">Monday to Saturday, 10:00 AM – 7:00 PM IST</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 pt-1">
                  <span>Chat on WhatsApp</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </a>

              <a
                href="mailto:support@ragex.com"
                className="p-5 bg-white border border-zinc-200 hover:border-zinc-400 rounded-lg space-y-2 transition-all group cursor-pointer shadow-2xs"
              >
                <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-zinc-900">Email Support</h4>
                <p className="text-xs text-zinc-500">support@ragex.com</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-900 pt-1">
                  <span>Send Email</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </a>
            </div>

            {/* FAQs */}
            <div className="bg-white border border-zinc-200 rounded-lg p-5 sm:p-6 space-y-4 shadow-2xs">
              <h3 className="text-sm font-semibold text-zinc-900">Frequently Asked Questions</h3>
              <div className="divide-y divide-zinc-100 text-xs">
                {[
                  { q: 'How do I exchange an item for a different size?', a: 'Go to My Orders, select your delivered order, and click "Return / Exchange". Our courier partner will pick up the product from your address.' },
                  { q: 'How long does shipping take?', a: 'Orders are dispatched within 24 hours. Metro cities take 2–3 business days; rest of India takes 3–5 business days.' },
                  { q: 'How are refunds processed?', a: 'Prepaid orders are refunded to the original payment method within 48 hours of pickup. COD orders are refunded via bank transfer or UPI.' },
                ].map((faq, i) => (
                  <div key={i} className="py-3.5 first:pt-0 last:pb-0 space-y-1">
                    <span className="font-semibold text-zinc-900 block">{faq.q}</span>
                    <p className="text-zinc-600 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ================= ADD ADDRESS MODAL ================= */}
      <AnimatePresence>
        {isAddAddressOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddAddressOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs cursor-pointer"
            />
            
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="relative w-full max-w-lg bg-white border border-zinc-200 rounded-lg p-6 shadow-2xl z-10 text-xs space-y-4 text-zinc-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Add New Address</h3>
                <button
                  onClick={() => setIsAddAddressOpen(false)}
                  className="text-zinc-400 hover:text-zinc-900 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddressSubmit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-medium text-zinc-600">Full Name</label>
                    <input
                      type="text"
                      required
                      value={addressForm.name}
                      onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                      className="w-full bg-white border border-zinc-300 rounded-md px-3 py-2 text-zinc-900 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-medium text-zinc-600">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/[^0-9]/g, '') })}
                      className="w-full bg-white border border-zinc-300 rounded-md px-3 py-2 text-zinc-900 focus:outline-none focus:border-black "
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-medium text-zinc-600">Street Address / House / Flat No.</label>
                  <input
                    type="text"
                    required
                    value={addressForm.addressLine}
                    onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                    className="w-full bg-white border border-zinc-300 rounded-md px-3 py-2 text-zinc-900 focus:outline-none focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-medium text-zinc-600">City</label>
                    <input
                      type="text"
                      required
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="w-full bg-white border border-zinc-300 rounded-md px-3 py-2 text-zinc-900 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-medium text-zinc-600">State</label>
                    <select
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      className="w-full bg-white border border-zinc-300 rounded-md px-2 py-2 text-zinc-900 focus:outline-none focus:border-black text-xs"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-medium text-zinc-600">Pincode</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/[^0-9]/g, '') })}
                      className="w-full bg-white border border-zinc-300 rounded-md px-3 py-2 text-zinc-900 focus:outline-none focus:border-black "
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    {['Home', 'Work', 'Other'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setAddressForm({ ...addressForm, type: t })}
                        className={`px-3 py-1 rounded-md text-xs font-medium border cursor-pointer ${
                          addressForm.type === t
                            ? 'bg-zinc-900 text-white border-zinc-900'
                            : 'bg-white text-zinc-600 border-zinc-300'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-zinc-700">
                    <input
                      type="checkbox"
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                      className="accent-black"
                    />
                    <span>Set as default</span>
                  </label>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setIsAddAddressOpen(false)}
                    className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-md text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-zinc-900 hover:bg-black text-white rounded-md text-xs font-semibold uppercase tracking-wider cursor-pointer"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= CANCEL ORDER MODAL ================= */}
      <AnimatePresence>
        {isCancelModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCancelModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs cursor-pointer"
            />
            <motion.div
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.96 }}
              className="relative w-full max-w-md bg-white border border-zinc-200 rounded-lg p-6 shadow-2xl z-10 text-xs space-y-4 text-zinc-900"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-sm font-bold text-zinc-900">Cancel Order #{selectedOrder.orderNumber || selectedOrder.id}</h3>
              <p className="text-zinc-500 text-xs">
                Are you sure you want to cancel this order? Any prepaid amount will be refunded to your original payment method.
              </p>
              <form onSubmit={handleCustomerCancelSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-600 uppercase font-medium">Reason for Cancellation</label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded-md p-2.5 text-zinc-900 text-xs"
                  >
                    <option value="Ordered by mistake">Ordered by mistake</option>
                    <option value="Found a better price elsewhere">Found a better price elsewhere</option>
                    <option value="Need to change shipping address">Need to change shipping address</option>
                    <option value="Expected delivery time is too long">Expected delivery time is too long</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCancelModalOpen(false)}
                    className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-md cursor-pointer"
                  >
                    Keep Order
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCancel}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md cursor-pointer"
                  >
                    {isSubmittingCancel ? 'Cancelling...' : 'Confirm Cancel'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= RETURN ORDER MODAL ================= */}
      <AnimatePresence>
        {isReturnModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReturnModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs cursor-pointer"
            />
            <motion.div
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.96 }}
              className="relative w-full max-w-md bg-white border border-zinc-200 rounded-lg p-6 shadow-2xl z-10 text-xs space-y-4 text-zinc-900"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-sm font-bold text-zinc-900">Return / Exchange Request</h3>
              <p className="text-zinc-500 text-xs">
                Our courier partner will pick up the item from your delivery address within 24–48 hours.
              </p>
              <form onSubmit={handleCustomerReturnSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-600 uppercase font-medium">Reason for Return</label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded-md p-2.5 text-zinc-900 text-xs"
                  >
                    <option value="Size / Fit issue">Size / Fit issue</option>
                    <option value="Defective or damaged item">Defective or damaged item</option>
                    <option value="Received wrong item or color">Received wrong item or color</option>
                    <option value="Quality not as expected">Quality not as expected</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-600 uppercase font-medium">Additional Comments (Optional)</label>
                  <textarea
                    rows={2}
                    value={returnComment}
                    onChange={(e) => setReturnComment(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded-md p-2.5 text-zinc-900 text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReturnModalOpen(false)}
                    className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-md cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReturn}
                    className="px-4 py-2 bg-zinc-900 hover:bg-black text-white font-medium rounded-md cursor-pointer"
                  >
                    {isSubmittingReturn ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= TAX INVOICE MODAL ================= */}
      {isInvoiceModalOpen && invoiceOrder && (
        <OrderInvoiceModal
          order={invoiceOrder}
          isOpen={isInvoiceModalOpen}
          onClose={() => {
            setIsInvoiceModalOpen(false);
            setInvoiceOrder(null);
          }}
        />
      )}

    </div>
  );
}
