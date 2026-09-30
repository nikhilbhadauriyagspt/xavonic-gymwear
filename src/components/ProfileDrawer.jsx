import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Package, 
  MapPin, 
  Heart, 
  Headphones, 
  LogOut, 
  ChevronRight, 
  ArrowLeft,
  Truck,
  Plus,
  User,
  Ruler,
  CheckCircle2,
  Trash2,
  Phone,
  Mail,
  ShieldCheck,
  CreditCard,
  RotateCcw,
  ShoppingBag,
  PackageCheck,
  Home,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function ProfileDrawer() {
  const { 
    isProfileOpen, 
    closeProfile, 
    user, 
    updateProfile, 
    addAddress, 
    deleteAddress, 
    setDefaultAddress, 
    logout 
  } = useAuth();

  // Navigation State
  const [currentView, setCurrentView] = useState('menu'); // 'menu' | 'profile' | 'orders' | 'order-detail' | 'addresses' | 'add-address' | 'support'
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Profile Edit Form State
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    chestSize: 'L (42")',
    lowerSize: 'M (32")'
  });

  // Add Address Form State
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

  useEffect(() => {
    if (isProfileOpen) {
      document.body.style.overflow = 'hidden';
      setCurrentView('menu');
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isProfileOpen]);

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
        phone: user.phone || ''
      }));
    }
  }, [user]);

  if (!user) return null;

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfile(profileForm);
    setCurrentView('menu');
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!addressForm.addressLine || !addressForm.city || !addressForm.pincode) {
      toast.error('Please fill in complete address details');
      return;
    }
    addAddress(addressForm);
    setAddressForm({
      name: user.name || '',
      phone: user.phone || '',
      addressLine: '',
      city: '',
      state: 'Haryana',
      pincode: '',
      type: 'Home',
      isDefault: false
    });
    setCurrentView('addresses');
  };

  const menuItems = [
    {
      id: 'orders',
      icon: Package,
      title: 'My Orders & Tracking',
      subtitle: `${user.orders?.length || 0} active orders`,
      badge: user.orders?.length ? `${user.orders.length}` : null
    },
    {
      id: 'addresses',
      icon: MapPin,
      title: 'Saved Addresses',
      subtitle: `${user.addresses?.length || 1} delivery locations`
    },
    {
      id: 'profile',
      icon: User,
      title: 'Profile & Size Preferences',
      subtitle: 'Name, email, topwear & lower sizes'
    },
    {
      id: 'support',
      icon: Headphones,
      title: 'Help & Concierge Support',
      subtitle: 'WhatsApp & exchange support'
    }
  ];

  return (
    <AnimatePresence>
      {isProfileOpen && (
        <div className="fixed inset-0 z-[120] flex justify-end font-sans select-none">
          
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeProfile}
            className="fixed inset-0 bg-black/50 cursor-pointer"
          />

          {/* Right Slide-Over Account Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md bg-white text-zinc-900 h-full flex flex-col shadow-2xl z-10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* 1. TOP HEADER */}
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
              
              {currentView === 'menu' ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-black text-white font-semibold text-xs flex items-center justify-center tracking-wider shadow-xs">
                    {user.initials || 'NS'}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-950">{user.name}</h3>
                    <p className="text-xs text-zinc-500">{user.phone}</p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (currentView === 'order-detail') {
                      setCurrentView('orders');
                    } else if (currentView === 'add-address') {
                      setCurrentView('addresses');
                    } else {
                      setCurrentView('menu');
                    }
                  }}
                  className="inline-flex items-center gap-2 text-xs font-medium text-zinc-700 hover:text-black cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>
                    {currentView === 'order-detail' 
                      ? 'Back to Orders' 
                      : currentView === 'add-address'
                      ? 'Back to Addresses'
                      : 'Back to Menu'}
                  </span>
                </button>
              )}

              {/* Close Drawer Button */}
              <button
                onClick={closeProfile}
                className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-black hover:bg-zinc-200 transition-colors cursor-pointer rounded-full"
                aria-label="Close Profile"
              >
                <X className="w-4 h-4 stroke-[2]" />
              </button>
            </div>

            {/* 2. BODY CONTENT VIEWS */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              
              {/* ================= VIEW 1: MAIN MENU ================= */}
              {currentView === 'menu' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setCurrentView(item.id)}
                          className="w-full flex items-center justify-between p-3.5 hover:bg-zinc-50 transition-colors rounded-[10px] text-left cursor-pointer group"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-8 h-8 rounded-[8px] bg-zinc-100 text-zinc-700 group-hover:bg-black group-hover:text-white flex items-center justify-center transition-colors">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-medium text-zinc-900 group-hover:text-black">{item.title}</h4>
                              <p className="text-[11px] text-zinc-400">{item.subtitle}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {item.badge && (
                              <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-medium rounded-full">
                                {item.badge}
                              </span>
                            )}
                            <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-700 group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick Sizing Pill */}
                  <div className="p-3.5 bg-zinc-50 rounded-[10px] border border-zinc-100 flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Saved Size:</span>
                    <strong className="text-zinc-900">Tee: {user.chestSize || 'L'} | Lower: {user.lowerSize || 'M'}</strong>
                  </div>
                </div>
              )}

              {/* ================= VIEW 2: MY ORDERS LIST ================= */}
              {currentView === 'orders' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-xs font-semibold text-zinc-900">Your Orders</h4>
                    <span className="text-[11px] text-zinc-400">{user.orders?.length} items</span>
                  </div>

                  {user.orders?.map((order) => (
                    <div 
                      key={order.id} 
                      onClick={() => {
                        setSelectedOrder(order);
                        setCurrentView('order-detail');
                      }}
                      className="border border-zinc-200 rounded-[10px] p-4 space-y-3 bg-white hover:border-zinc-400 transition-all cursor-pointer shadow-2xs group"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-950 group-hover:text-red-600 transition-colors">{order.id}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-medium rounded border ${order.statusColor}`}>
                          {order.status}
                        </span>
                      </div>

                      {/* Items Preview */}
                      <div className="space-y-2 py-1">
                        {order.items?.map((item, iIdx) => (
                          <div key={iIdx} className="flex items-center gap-3">
                            <img 
                              src={item.image} 
                              alt={item.title} 
                              className="w-10 h-12 object-cover rounded bg-zinc-100 shrink-0" 
                            />
                            <div className="min-w-0 flex-1">
                              <h5 className="text-xs font-medium text-zinc-800 line-clamp-1">{item.title}</h5>
                              <p className="text-[11px] text-zinc-400">Size: {item.size} • Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
                        <span className="flex items-center gap-1 text-zinc-800 font-medium">
                          <Truck className="w-3.5 h-3.5 text-red-600" />
                          {order.estimatedDelivery}
                        </span>
                        <div className="flex items-center gap-1">
                          <strong className="text-zinc-950 text-xs">{order.total}</strong>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ================= VIEW 3: FULL ORDER DETAIL ================= */}
              {currentView === 'order-detail' && selectedOrder && (
                <div className="space-y-4 animate-in fade-in duration-200 text-xs">
                  
                  {/* Status Banner */}
                  <div className="p-4 bg-zinc-950 text-white rounded-[10px] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{selectedOrder.id}</span>
                      <span className="text-[10px] font-mono text-zinc-400">{selectedOrder.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-400 font-medium pt-1">
                      <Truck className="w-4 h-4" />
                      <span>{selectedOrder.status} • {selectedOrder.estimatedDelivery}</span>
                    </div>
                  </div>

                  {/* 4-Step Icon Timeline */}
                  <div className="p-4 sm:p-5 border border-zinc-200 rounded-[10px] space-y-4 bg-white">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-900 block text-[11px] uppercase tracking-wider">
                        Live Tracking Timeline
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                        AWB: {selectedOrder.trackingNumber}
                      </span>
                    </div>

                    {/* Step Icons & Connecting Line */}
                    <div className="pt-2 pb-1">
                      <div className="grid grid-cols-4 relative">
                        
                        {/* Connecting Line Between Step 1 and 4 */}
                        <div className="absolute top-4 left-[12%] right-[12%] h-[2px] bg-zinc-200 -z-0">
                          <div 
                            className="h-full bg-red-600 transition-all duration-500" 
                            style={{ 
                              width: selectedOrder.step === 4 
                                ? '100%' 
                                : selectedOrder.step === 3 
                                ? '66%' 
                                : selectedOrder.step === 2 
                                ? '33%' 
                                : '0%' 
                            }} 
                          />
                        </div>

                        {/* Step 1: Confirmed */}
                        <div className="flex flex-col items-center text-center space-y-1.5 relative z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            selectedOrder.step >= 1 
                              ? 'bg-black text-white shadow-xs' 
                              : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                          }`}>
                            <ShoppingBag className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5">
                            <span className={`text-[11px] font-semibold block leading-tight ${
                              selectedOrder.step >= 1 ? 'text-zinc-950' : 'text-zinc-400'
                            }`}>
                              Confirmed
                            </span>
                            <span className="text-[10px] text-zinc-400 block">Placed</span>
                          </div>
                        </div>

                        {/* Step 2: Shipped */}
                        <div className="flex flex-col items-center text-center space-y-1.5 relative z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            selectedOrder.step >= 2 
                              ? 'bg-black text-white shadow-xs' 
                              : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                          }`}>
                            <PackageCheck className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5">
                            <span className={`text-[11px] font-semibold block leading-tight ${
                              selectedOrder.step >= 2 ? 'text-zinc-950' : 'text-zinc-400'
                            }`}>
                              Shipped
                            </span>
                            <span className="text-[10px] text-zinc-400 block">In Hub</span>
                          </div>
                        </div>

                        {/* Step 3: Out for Delivery */}
                        <div className="flex flex-col items-center text-center space-y-1.5 relative z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            selectedOrder.step >= 3 
                              ? 'bg-red-600 text-white shadow-xs' 
                              : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                          }`}>
                            <Truck className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5">
                            <span className={`text-[11px] font-semibold block leading-tight ${
                              selectedOrder.step >= 3 ? 'text-red-600 font-bold' : 'text-zinc-400'
                            }`}>
                              On the Way
                            </span>
                            <span className="text-[10px] text-zinc-400 block">Out for delivery</span>
                          </div>
                        </div>

                        {/* Step 4: Delivered */}
                        <div className="flex flex-col items-center text-center space-y-1.5 relative z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            selectedOrder.step === 4 
                              ? 'bg-emerald-600 text-white shadow-xs' 
                              : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                          }`}>
                            <Home className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5">
                            <span className={`text-[11px] font-semibold block leading-tight ${
                              selectedOrder.step === 4 ? 'text-emerald-600' : 'text-zinc-400'
                            }`}>
                              Delivered
                            </span>
                            <span className="text-[10px] text-zinc-400 block">Handover</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* Items in Order */}
                  <div className="p-4 border border-zinc-200 rounded-[10px] space-y-3 bg-white">
                    <span className="font-semibold text-zinc-900 block text-[11px] uppercase tracking-wider">
                      Items in Package
                    </span>
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3.5 py-1">
                        <img src={item.image} alt={item.title} className="w-12 h-14 object-cover rounded bg-zinc-100 shrink-0" />
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <h5 className="font-medium text-zinc-900 line-clamp-1">{item.title}</h5>
                          <p className="text-[11px] text-zinc-500">Size: {item.size} • Color: {item.color}</p>
                          <p className="text-[11px] font-semibold text-zinc-950">{item.price} x {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Price Breakdown */}
                  <div className="p-4 border border-zinc-200 rounded-[10px] space-y-2 bg-white">
                    <span className="font-semibold text-zinc-900 block text-[11px] uppercase tracking-wider">
                      Payment Summary
                    </span>
                    <div className="flex justify-between text-zinc-600">
                      <span>Subtotal</span>
                      <span>{selectedOrder.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-zinc-600">
                      <span>Express Shipping</span>
                      <span className="text-emerald-600 font-medium">{selectedOrder.shipping}</span>
                    </div>
                    <div className="pt-2 border-t border-zinc-100 flex justify-between font-bold text-zinc-950 text-sm">
                      <span>Total Paid</span>
                      <span>{selectedOrder.total}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 pt-1">Payment Method: {selectedOrder.paymentMethod}</p>
                  </div>

                  {/* Delivery Address */}
                  <div className="p-4 border border-zinc-200 rounded-[10px] space-y-1 bg-white">
                    <span className="font-semibold text-zinc-900 block text-[11px] uppercase tracking-wider">
                      Shipping Address
                    </span>
                    <p className="text-zinc-600 text-[11px] leading-relaxed">{selectedOrder.shippingAddress}</p>
                  </div>

                </div>
              )}

              {/* ================= VIEW 4: SAVED ADDRESSES ================= */}
              {currentView === 'addresses' && (
                <div className="space-y-3.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-xs font-semibold text-zinc-900">Saved Addresses</h4>
                    <button
                      onClick={() => setCurrentView('add-address')}
                      className="text-xs text-red-600 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Address</span>
                    </button>
                  </div>

                  {user.addresses?.map((addr) => (
                    <div key={addr.id} className="border border-zinc-200 rounded-[10px] p-4 space-y-2 bg-white relative">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                          <span className="text-xs font-semibold text-zinc-900">{addr.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {addr.isDefault ? (
                            <span className="px-2 py-0.5 bg-zinc-100 text-zinc-800 text-[10px] font-semibold rounded">
                              Default
                            </span>
                          ) : (
                            <button
                              onClick={() => setDefaultAddress(addr.id)}
                              className="text-[10px] text-zinc-500 hover:text-black underline cursor-pointer"
                            >
                              Set Default
                            </button>
                          )}
                          <button
                            onClick={() => deleteAddress(addr.id)}
                            className="p-1 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer ml-1"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-600 leading-relaxed pl-6">
                        {addr.addressLine}, {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                      </p>
                      <p className="text-[11px] text-zinc-400 pl-6">Phone: {addr.phone}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* ================= VIEW 5: ADD NEW ADDRESS FORM ================= */}
              {currentView === 'add-address' && (
                <form onSubmit={handleAddressSubmit} className="space-y-3.5 animate-in fade-in duration-200 text-xs">
                  <h4 className="font-semibold text-zinc-900 px-1">Add Delivery Location</h4>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-700">Recipient Name</label>
                    <input
                      type="text"
                      value={addressForm.name}
                      onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                      placeholder="Full Name"
                      className="w-full border border-zinc-300 focus:border-zinc-950 px-3 py-2 text-xs rounded-[8px] focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-700">Contact Number</label>
                    <input
                      type="tel"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      placeholder="10-digit mobile number"
                      className="w-full border border-zinc-300 focus:border-zinc-950 px-3 py-2 text-xs rounded-[8px] focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-700">House No, Building, Street</label>
                    <input
                      type="text"
                      value={addressForm.addressLine}
                      onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                      placeholder="e.g. Flat 302, Green Heights, Sector 42"
                      className="w-full border border-zinc-300 focus:border-zinc-950 px-3 py-2 text-xs rounded-[8px] focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-zinc-700">City</label>
                      <input
                        type="text"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        placeholder="Gurugram"
                        className="w-full border border-zinc-300 focus:border-zinc-950 px-3 py-2 text-xs rounded-[8px] focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-zinc-700">Pincode</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/[^0-9]/g, '') })}
                        placeholder="122002"
                        className="w-full border border-zinc-300 focus:border-zinc-950 px-3 py-2 text-xs rounded-[8px] focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="defaultAddr"
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                      className="w-4 h-4 text-black focus:ring-0 rounded"
                    />
                    <label htmlFor="defaultAddr" className="text-zinc-700 cursor-pointer">
                      Make this my default shipping address
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-black hover:bg-red-600 text-white text-xs font-semibold rounded-[8px] transition-colors cursor-pointer mt-2"
                  >
                    Save Address
                  </button>
                </form>
              )}

              {/* ================= VIEW 6: PROFILE DETAILS & SIZES ================= */}
              {currentView === 'profile' && (
                <form onSubmit={handleProfileSubmit} className="space-y-4 animate-in fade-in duration-200 text-xs">
                  <h4 className="font-semibold text-zinc-900 px-1">Personal Details & Sizing</h4>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-700">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full border border-zinc-300 focus:border-zinc-950 px-3 py-2 text-xs rounded-[8px] focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-700">Email Address</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full border border-zinc-300 focus:border-zinc-950 px-3 py-2 text-xs rounded-[8px] focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-700">Mobile Number (Verified)</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      disabled
                      className="w-full border border-zinc-200 bg-zinc-100 text-zinc-500 px-3 py-2 text-xs rounded-[8px] cursor-not-allowed"
                    />
                  </div>

                  {/* Size Preferences */}
                  <div className="pt-2 border-t border-zinc-100 space-y-3">
                    <div className="flex items-center gap-1.5 font-semibold text-zinc-900">
                      <Ruler className="w-3.5 h-3.5 text-red-600" />
                      <span>Gymwear Sizing Preferences</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[11px] text-zinc-600">Topwear Size</label>
                        <select
                          value={profileForm.chestSize}
                          onChange={(e) => setProfileForm({ ...profileForm, chestSize: e.target.value })}
                          className="w-full border border-zinc-300 focus:border-zinc-950 px-2.5 py-2 text-xs rounded-[8px] bg-white focus:outline-none"
                        >
                          <option value="S (38&quot;)">S (38")</option>
                          <option value="M (40&quot;)">M (40")</option>
                          <option value="L (42&quot;)">L (42")</option>
                          <option value="XL (44&quot;)">XL (44")</option>
                          <option value="XXL (46&quot;)">XXL (46")</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-zinc-600">Shorts / Lowers</label>
                        <select
                          value={profileForm.lowerSize}
                          onChange={(e) => setProfileForm({ ...profileForm, lowerSize: e.target.value })}
                          className="w-full border border-zinc-300 focus:border-zinc-950 px-2.5 py-2 text-xs rounded-[8px] bg-white focus:outline-none"
                        >
                          <option value="S (30&quot;)">S (30")</option>
                          <option value="M (32&quot;)">M (32")</option>
                          <option value="L (34&quot;)">L (34")</option>
                          <option value="XL (36&quot;)">XL (36")</option>
                          <option value="XXL (38&quot;)">XXL (38")</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-black hover:bg-red-600 text-white text-xs font-semibold rounded-[8px] transition-colors cursor-pointer mt-2"
                  >
                    Save Changes
                  </button>
                </form>
              )}

              {/* ================= VIEW 7: SUPPORT & HELP ================= */}
              {currentView === 'support' && (
                <div className="space-y-3.5 animate-in fade-in duration-200 text-xs">
                  <h4 className="font-semibold text-zinc-900 px-1">Athlete Support Concierge</h4>
                  
                  <div className="p-4 border border-zinc-200 rounded-[10px] space-y-3 bg-zinc-50">
                    <div className="space-y-1">
                      <span className="font-semibold text-zinc-900 block">Instant WhatsApp Support</span>
                      <p className="text-zinc-600 text-[11px]">Direct chat for order updates, size swaps & tracking.</p>
                    </div>
                    <a
                      href="https://wa.me/919876543210"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full py-2.5 bg-black hover:bg-zinc-800 text-white text-xs font-medium rounded-[8px] transition-colors"
                    >
                      Chat on WhatsApp (+91 98765 43210)
                    </a>
                  </div>

                  <div className="p-4 border border-zinc-200 rounded-[10px] space-y-2 bg-white">
                    <span className="font-semibold text-zinc-900 block">Return & Exchange Policy</span>
                    <p className="text-zinc-600 leading-relaxed text-[11px]">
                      Enjoy hassle-free 7-day doorstep size exchanges on all unworn gymwear.
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* 3. BOTTOM LOGOUT BUTTON (Only on main menu view) */}
            {currentView === 'menu' && (
              <div className="p-4 border-t border-zinc-100 bg-white">
                <button
                  onClick={logout}
                  className="w-full py-2.5 border border-zinc-200 hover:border-red-600 text-zinc-600 hover:text-red-600 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out of Account</span>
                </button>
              </div>
            )}

          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
}
