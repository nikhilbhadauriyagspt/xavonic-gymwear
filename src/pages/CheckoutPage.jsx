import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  CreditCard,
  Lock,
  Plus,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Truck,
  Wallet,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, subtotal, clearCart } = useCart();
  const { user, openAuth, addAddress } = useAuth();

  // Stepper state: 'details' (Shipping & Payment) | 'confirmed' (Order Success)
  const [step, setStep] = useState('details');
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Address Selection
  const defaultSavedAddresses = useMemo(() => {
    if (user?.addresses?.length) return user.addresses;
    return [
      {
        id: 'addr-default-1',
        type: 'Home (Default)',
        name: user?.name || 'Nikhil Sharma',
        addressLine: 'Plot 42, Sector 18, Cyber City',
        city: 'Gurugram',
        pincode: '122002',
        state: 'Haryana',
        phone: user?.phone || '+91 98765 43210',
        isDefault: true,
      },
      {
        id: 'addr-default-2',
        type: 'Gym Locker Address',
        name: user?.name || 'Nikhil Sharma (Cult Fitness)',
        addressLine: 'Club House, Sector 54, Golf Course Rd',
        city: 'Gurugram',
        pincode: '122011',
        state: 'Haryana',
        phone: user?.phone || '+91 98765 43210',
        isDefault: false,
      },
    ];
  }, [user]);

  const [selectedAddressId, setSelectedAddressId] = useState(
    defaultSavedAddresses[0]?.id || 'new'
  );
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

  // New Address Form
  const [newAddressForm, setNewAddressForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    addressLine: '',
    apartment: '',
    city: 'Gurugram',
    state: 'Haryana',
    pincode: '122002',
    type: 'Home',
    saveForFuture: true,
  });

  // Contact Info (for guest/unregistered)
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');

  // Delivery Method
  const shippingMethod = 'express'; // 'express' | 'priority'

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'cod' | 'netbanking'
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay'); // 'gpay' | 'phonepe' | 'paytm' | 'custom'
  const [customUpiId, setCustomUpiId] = useState('');

  // Card details
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });

  // Discount Coupons
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState({
    code: 'AUTO10',
    discountPercent: 10,
    label: 'Prepaid Auto Savings (10% OFF)',
  });

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  // Auto city-state by pincode
  const handlePincodeChange = (pincodeVal) => {
    const clean = pincodeVal.replace(/\D/g, '').slice(0, 6);
    setNewAddressForm((prev) => ({ ...prev, pincode: clean }));
    if (clean === '122002' || clean === '122011') {
      setNewAddressForm((prev) => ({ ...prev, city: 'Gurugram', state: 'Haryana' }));
    } else if (clean.startsWith('110')) {
      setNewAddressForm((prev) => ({ ...prev, city: 'New Delhi', state: 'Delhi' }));
    } else if (clean.startsWith('400')) {
      setNewAddressForm((prev) => ({ ...prev, city: 'Mumbai', state: 'Maharashtra' }));
    } else if (clean.startsWith('560')) {
      setNewAddressForm((prev) => ({ ...prev, city: 'Bengaluru', state: 'Karnataka' }));
    }
  };

  // Price Calculations
  const rawSubtotal = subtotal;
  const isPrepaid = paymentMethod === 'upi' || paymentMethod === 'card' || paymentMethod === 'netbanking';

  const prepaidDiscount = isPrepaid ? Math.round(rawSubtotal * 0.10) : 0;
  const couponDiscount = appliedCoupon?.discountPercent
    ? Math.round((rawSubtotal - prepaidDiscount) * (appliedCoupon.discountPercent / 100))
    : 0;

  const totalDiscount = prepaidDiscount + couponDiscount;
  const shippingFee = rawSubtotal >= 999 || shippingMethod === 'express' ? 0 : 99;
  const priorityFee = shippingMethod === 'priority' ? 149 : 0;
  const codFee = paymentMethod === 'cod' ? 50 : 0;

  const grandTotal = Math.max(
    0,
    rawSubtotal - totalDiscount + shippingFee + priorityFee + codFee
  );

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (!clean) return;

    if (clean === 'PUMP15' || clean === 'XAVONIC15') {
      setAppliedCoupon({ code: clean, discountPercent: 15, label: 'VIP Athlete 15% OFF' });
      toast.success('Coupon Applied! Extra 15% OFF unlocked.');
      setCouponCode('');
    } else if (clean === 'FREESHIP') {
      setAppliedCoupon({ code: clean, discountPercent: 5, label: 'Special Shipping Discount' });
      toast.success('Coupon Applied: FREESHIP');
      setCouponCode('');
    } else {
      toast.error('Invalid coupon code. Try PUMP15 or XAVONIC15');
    }
  };

  const handleSaveNewAddress = (e) => {
    e.preventDefault();
    if (!newAddressForm.name || !newAddressForm.addressLine || !newAddressForm.pincode) {
      toast.error('Please fill in required address fields');
      return;
    }

    const createdAddr = {
      id: `addr-${Date.now()}`,
      type: `${newAddressForm.type} (${newAddressForm.city})`,
      name: newAddressForm.name,
      addressLine: newAddressForm.apartment
        ? `${newAddressForm.apartment}, ${newAddressForm.addressLine}`
        : newAddressForm.addressLine,
      city: newAddressForm.city,
      state: newAddressForm.state,
      pincode: newAddressForm.pincode,
      phone: newAddressForm.phone || user?.phone || '+91 98765 43210',
      isDefault: false,
    };

    if (user && addAddress) {
      addAddress(createdAddr);
    }
    defaultSavedAddresses.push(createdAddr);
    setSelectedAddressId(createdAddr.id);
    setIsAddingNewAddress(false);
    toast.success('Delivery address saved successfully');
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      toast.error('Your bag is empty.');
      navigate('/collections');
      return;
    }

    const selectedAddr =
      defaultSavedAddresses.find((a) => a.id === selectedAddressId) || defaultSavedAddresses[0];

    setIsProcessing(true);

    setTimeout(() => {
      const newOrder = {
        id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        date: 'Just now',
        status: 'Order Confirmed',
        statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        step: 1,
        estimatedDelivery: shippingMethod === 'priority' ? 'Tomorrow, by 8:00 PM' : 'Within 2–4 Business Days',
        items: [...cartItems],
        subtotal: `₹${rawSubtotal.toLocaleString('en-IN')}`,
        discount: `₹${totalDiscount.toLocaleString('en-IN')}`,
        shipping: shippingFee === 0 ? 'FREE' : `₹${shippingFee}`,
        total: `₹${grandTotal.toLocaleString('en-IN')}`,
        paymentMethod:
          paymentMethod === 'upi'
            ? `UPI (${selectedUpiApp.toUpperCase()} - Auto Verified)`
            : paymentMethod === 'card'
            ? 'Credit / Debit Card (3D Secure)'
            : paymentMethod === 'netbanking'
            ? 'NetBanking (Verified)'
            : 'Cash on Delivery (COD)',
        trackingNumber: `XAV-${Math.floor(10000000 + Math.random() * 90000000)}`,
        shippingAddress: `${selectedAddr.name}, ${selectedAddr.addressLine}, ${selectedAddr.city}, ${selectedAddr.state} - ${selectedAddr.pincode} (Ph: ${selectedAddr.phone})`,
      };

      setConfirmedOrder(newOrder);
      setStep('confirmed');
      setIsProcessing(false);
      clearCart();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.success('Order Placed Successfully! Your athlete kit is being prepared.');
    }, 1200);
  };

  // If order is confirmed, render the celebration screen
  if (step === 'confirmed' && confirmedOrder) {
    return (
      <div className="min-h-screen bg-[#fafaf9] text-neutral-900 font-sans py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl bg-white border border-neutral-200 p-6 sm:p-10 shadow-xs">
          
          {/* Success Badge */}
          <div className="text-center space-y-3 pb-8 border-b border-neutral-200">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Check className="h-8 w-8 stroke-[2.5]" />
            </div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-700">Payment Verified & Confirmed</p>
            <h1 className="text-2xl sm:text-3xl font-medium tracking-tight uppercase text-neutral-900">
              Thank You For Your Order!
            </h1>
            <p className="text-xs text-neutral-500 font-normal max-w-md mx-auto">
              We have received your order <span className="font-semibold text-neutral-800">#{confirmedOrder.id}</span>. A confirmation SMS & email has been dispatched.
            </p>
          </div>

          {/* Delivery Timeline Card */}
          <div className="my-6 p-4 sm:p-5 bg-neutral-50 border border-neutral-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-neutral-200 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-neutral-800" />
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-900">Estimated Delivery</span>
              </div>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200 rounded-xs">
                {confirmedOrder.estimatedDelivery}
              </span>
            </div>
            <p className="text-xs text-neutral-600 font-normal">
              <strong>Tracking Code:</strong> <span className="font-mono text-neutral-900">{confirmedOrder.trackingNumber}</span> (Bluedart Express)
            </p>
            <p className="text-xs text-neutral-600 font-normal mt-1">
              <strong>Delivering To:</strong> {confirmedOrder.shippingAddress}
            </p>
          </div>

          {/* Ordered Items Summary */}
          <div className="space-y-3 border-b border-neutral-200 pb-6">
            <h3 className="text-xs font-medium uppercase tracking-wider text-neutral-700">Order Summary</h3>
            <div className="divide-y divide-neutral-100">
              {confirmedOrder.items.map((it, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={it.image || it.imageFront} alt="" className="h-14 w-11 object-cover bg-neutral-100" />
                    <div>
                      <h4 className="text-xs font-medium text-neutral-900">{it.title}</h4>
                      <p className="text-[11px] text-neutral-500">Size: {it.size} • Qty: {it.quantity}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-neutral-900">₹{(it.price * it.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Total & Action Buttons */}
          <div className="pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs text-neutral-500">Total Paid ({confirmedOrder.paymentMethod}):</span>
              <div className="text-xl font-semibold text-neutral-900">{confirmedOrder.total}</div>
            </div>

            <div className="flex gap-3">
              <Link
                to="/collections"
                className="inline-flex items-center justify-center gap-2 bg-neutral-900 px-6 py-3 text-xs font-medium uppercase tracking-widest text-white hover:bg-black transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">
      
      {/* 1. Header Bar */}
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-30">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-950 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Cart</span>
            </button>
            <span className="text-neutral-300">|</span>
            <Link to="/" className="text-sm font-semibold tracking-tighter uppercase text-neutral-950">
              XAVONIC <span className="text-[10px] font-normal text-neutral-400">CHECKOUT</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
            <Lock className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">256-Bit SSL Encrypted</span>
          </div>
        </div>
      </header>

      {/* Mobile Collapsible Order Summary Banner */}
      <div className="lg:hidden border-b border-neutral-200 bg-neutral-100 px-4 py-3">
        <button
          onClick={() => setIsMobileSummaryOpen((prev) => !prev)}
          className="flex w-full items-center justify-between text-xs font-medium text-neutral-900"
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-neutral-700" />
            <span>{isMobileSummaryOpen ? 'Hide order summary' : 'Show order summary'}</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isMobileSummaryOpen ? 'rotate-180' : ''}`} />
          </div>
          <span className="text-sm font-semibold">₹{grandTotal.toLocaleString('en-IN')}.00</span>
        </button>

        <AnimatePresence>
          {isMobileSummaryOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden pt-4 space-y-3"
            >
              <div className="divide-y divide-neutral-200">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <img src={item.image || item.imageFront} alt="" className="h-12 w-9 object-cover bg-neutral-200" />
                      <div>
                        <div className="font-medium text-neutral-900 line-clamp-1">{item.title}</div>
                        <div className="text-[11px] text-neutral-500">Size: {item.size} • Qty: {item.quantity}</div>
                      </div>
                    </div>
                    <span className="font-medium">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Checkout Container */}
      <main className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.2fr)_440px] xl:grid-cols-[minmax(0,1.25fr)_460px] lg:gap-12">
          
          {/* LEFT COLUMN: SHIPPING & SAVED ADDRESSES & PAYMENT */}
          <div className="space-y-8">
            
            {/* Step 1: Customer Account / Contact Info */}
            <section className="border border-neutral-200 bg-white p-5 sm:p-6 shadow-2xs">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3.5 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-neutral-900 text-[11px] font-semibold text-white">
                    1
                  </span>
                  <h2 className="text-sm font-medium uppercase tracking-wider text-neutral-900">
                    Contact & Account
                  </h2>
                </div>
                {user ? (
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-200">
                    Logged in as {user.name}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={openAuth}
                    className="text-xs font-medium text-neutral-900 underline underline-offset-3 hover:text-black"
                  >
                    Log In for VIP Points
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-600 mb-1">
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="h-10 w-full border border-neutral-300 px-3 text-xs outline-none focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-600 mb-1">
                    Email for Invoicing & Tracking
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="athlete@xavonic.com"
                    className="h-10 w-full border border-neutral-300 px-3 text-xs outline-none focus:border-neutral-900"
                  />
                </div>
              </div>
            </section>

            {/* Step 2: Saved Delivery Addresses & New Address Management */}
            <section className="border border-neutral-200 bg-white p-5 sm:p-6 shadow-2xs">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3.5 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-neutral-900 text-[11px] font-semibold text-white">
                    2
                  </span>
                  <h2 className="text-sm font-medium uppercase tracking-wider text-neutral-900">
                    Delivery Address
                  </h2>
                </div>

                {!isAddingNewAddress && (
                  <button
                    type="button"
                    onClick={() => setIsAddingNewAddress(true)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-neutral-900 underline underline-offset-3 hover:text-black"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add New Address
                  </button>
                )}
              </div>

              {/* Saved Addresses Radio Cards */}
              {!isAddingNewAddress ? (
                <div className="space-y-3">
                  {defaultSavedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-3.5 sm:p-4 border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'border-neutral-900 bg-neutral-50/70 ring-1 ring-neutral-900'
                            : 'border-neutral-200 hover:border-neutral-400 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 grid h-4 w-4 place-items-center rounded-full border ${
                            isSelected ? 'border-neutral-900 bg-neutral-900' : 'border-neutral-300 bg-white'
                          }`}>
                            {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-neutral-900">{addr.name}</span>
                              <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-600 bg-neutral-200/70 px-1.5 py-0.2 rounded-xs">
                                {addr.type}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-600 font-normal leading-relaxed">
                              {addr.addressLine}, {addr.city}, {addr.state} - <span className="font-medium text-neutral-900">{addr.pincode}</span>
                            </p>
                            <p className="text-[11px] text-neutral-500 font-normal">
                              Phone: <span className="font-medium text-neutral-800">{addr.phone}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-[11px] text-neutral-400">
                          {addr.isDefault && <span className="text-emerald-700 font-medium">Default</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Add New Address Form */
                <form onSubmit={handleSaveNewAddress} className="space-y-3.5 pt-1 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddressForm.name}
                        onChange={(e) => setNewAddressForm((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Nikhil Sharma"
                        className="h-10 w-full border border-neutral-300 px-3 text-xs outline-none focus:border-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-700 mb-1">
                        10-Digit Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={newAddressForm.phone}
                        onChange={(e) => setNewAddressForm((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="e.g. 9876543210"
                        className="h-10 w-full border border-neutral-300 px-3 text-xs outline-none focus:border-neutral-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-700 mb-1">
                      Flat, House no., Building, Company *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddressForm.apartment}
                      onChange={(e) => setNewAddressForm((prev) => ({ ...prev, apartment: e.target.value }))}
                      placeholder="e.g. Flat 402, Tower B, Palm Heights"
                      className="h-10 w-full border border-neutral-300 px-3 text-xs outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-700 mb-1">
                      Area, Street, Sector, Village *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddressForm.addressLine}
                      onChange={(e) => setNewAddressForm((prev) => ({ ...prev, addressLine: e.target.value }))}
                      placeholder="e.g. Sector 18, Near Cyber Hub"
                      className="h-10 w-full border border-neutral-300 px-3 text-xs outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-700 mb-1">
                        6-Digit PIN *
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={newAddressForm.pincode}
                        onChange={(e) => handlePincodeChange(e.target.value)}
                        placeholder="122002"
                        className="h-10 w-full border border-neutral-300 px-3 text-xs outline-none focus:border-neutral-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-700 mb-1">
                        City / Town
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddressForm.city}
                        onChange={(e) => setNewAddressForm((prev) => ({ ...prev, city: e.target.value }))}
                        className="h-10 w-full border border-neutral-300 px-3 text-xs outline-none focus:border-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddressForm.state}
                        onChange={(e) => setNewAddressForm((prev) => ({ ...prev, state: e.target.value }))}
                        className="h-10 w-full border border-neutral-300 px-3 text-xs outline-none focus:border-neutral-900"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingNewAddress(false)}
                      className="h-10 px-4 border border-neutral-300 text-xs font-medium uppercase tracking-wider text-neutral-700 hover:bg-neutral-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="h-10 px-6 bg-neutral-900 text-xs font-medium uppercase tracking-wider text-white hover:bg-black"
                    >
                      Save & Deliver Here
                    </button>
                  </div>
                </form>
              )}
            </section>

            {/* Step 3: Payment Method Selection */}
            <section className="border border-neutral-200 bg-white p-5 sm:p-6 shadow-2xs">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3.5 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-neutral-900 text-[11px] font-semibold text-white">
                    3
                  </span>
                  <h2 className="text-sm font-medium uppercase tracking-wider text-neutral-900">
                    Payment Option
                  </h2>
                </div>

                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200 rounded-xs">
                  Extra 10% OFF on UPI / Cards
                </span>
              </div>

              {/* Payment Methods Accordion / Tabs */}
              <div className="space-y-3">
                
                {/* 1. UPI Payment */}
                <div className={`border transition-all ${
                  paymentMethod === 'upi' ? 'border-neutral-900 bg-neutral-50/50 ring-1 ring-neutral-900' : 'border-neutral-200 bg-white'
                }`}>
                  <div
                    onClick={() => setPaymentMethod('upi')}
                    className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`grid h-4 w-4 place-items-center rounded-full border ${
                        paymentMethod === 'upi' ? 'border-neutral-900 bg-neutral-900' : 'border-neutral-300 bg-white'
                      }`}>
                        {paymentMethod === 'upi' && <Check className="h-2.5 w-2.5 text-white" />}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-neutral-900 flex items-center gap-2">
                          <span>UPI (Instant QR / Google Pay / PhonePe)</span>
                          <span className="bg-emerald-600 text-white text-[9px] font-medium px-1.5 py-0.2 rounded-xs">
                            EXTRA 10% SAVINGS
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 font-normal">
                          Instant verification with zero transaction charges.
                        </p>
                      </div>
                    </div>
                    <QrCode className="h-4 w-4 text-neutral-600" />
                  </div>

                  {paymentMethod === 'upi' && (
                    <div className="border-t border-neutral-200 p-4 bg-white space-y-3 text-xs">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'gpay', name: 'Google Pay' },
                          { id: 'phonepe', name: 'PhonePe' },
                          { id: 'paytm', name: 'Paytm UPI' },
                          { id: 'custom', name: 'Any UPI ID' },
                        ].map((app) => (
                          <button
                            key={app.id}
                            type="button"
                            onClick={() => setSelectedUpiApp(app.id)}
                            className={`p-2.5 border text-center transition-all ${
                              selectedUpiApp === app.id
                                ? 'border-neutral-900 bg-neutral-900 text-white font-medium'
                                : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'
                            }`}
                          >
                            {app.name}
                          </button>
                        ))}
                      </div>

                      {selectedUpiApp === 'custom' && (
                        <div>
                          <input
                            type="text"
                            value={customUpiId}
                            onChange={(e) => setCustomUpiId(e.target.value)}
                            placeholder="username@okhdfcbank / yourname@upi"
                            className="h-10 w-full border border-neutral-300 px-3 text-xs outline-none focus:border-neutral-900"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. Credit / Debit Cards */}
                <div className={`border transition-all ${
                  paymentMethod === 'card' ? 'border-neutral-900 bg-neutral-50/50 ring-1 ring-neutral-900' : 'border-neutral-200 bg-white'
                }`}>
                  <div
                    onClick={() => setPaymentMethod('card')}
                    className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`grid h-4 w-4 place-items-center rounded-full border ${
                        paymentMethod === 'card' ? 'border-neutral-900 bg-neutral-900' : 'border-neutral-300 bg-white'
                      }`}>
                        {paymentMethod === 'card' && <Check className="h-2.5 w-2.5 text-white" />}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-neutral-900">
                          Credit / Debit Cards
                        </div>
                        <p className="text-[11px] text-neutral-500 font-normal">
                          Visa, MasterCard, RuPay, Amex with 3D Secure OTP
                        </p>
                      </div>
                    </div>
                    <CreditCard className="h-4 w-4 text-neutral-600" />
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="border-t border-neutral-200 p-4 bg-white space-y-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-700 mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          maxLength={19}
                          placeholder="4532 •••• •••• 8821"
                          value={cardData.number}
                          onChange={(e) => setCardData((prev) => ({ ...prev, number: e.target.value }))}
                          className="h-10 w-full border border-neutral-300 px-3 text-xs outline-none focus:border-neutral-900 font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-700 mb-1">
                            Expiry (MM/YY)
                          </label>
                          <input
                            type="text"
                            maxLength={5}
                            placeholder="12/28"
                            value={cardData.expiry}
                            onChange={(e) => setCardData((prev) => ({ ...prev, expiry: e.target.value }))}
                            className="h-10 w-full border border-neutral-300 px-3 text-xs outline-none focus:border-neutral-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-700 mb-1">
                            CVV
                          </label>
                          <input
                            type="password"
                            maxLength={4}
                            placeholder="•••"
                            value={cardData.cvv}
                            onChange={(e) => setCardData((prev) => ({ ...prev, cvv: e.target.value }))}
                            className="h-10 w-full border border-neutral-300 px-3 text-xs outline-none focus:border-neutral-900 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Cash on Delivery (COD) */}
                <div className={`border transition-all ${
                  paymentMethod === 'cod' ? 'border-neutral-900 bg-neutral-50/50 ring-1 ring-neutral-900' : 'border-neutral-200 bg-white'
                }`}>
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`grid h-4 w-4 place-items-center rounded-full border ${
                        paymentMethod === 'cod' ? 'border-neutral-900 bg-neutral-900' : 'border-neutral-300 bg-white'
                      }`}>
                        {paymentMethod === 'cod' && <Check className="h-2.5 w-2.5 text-white" />}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-neutral-900">
                          Cash on Delivery (COD)
                        </div>
                        <p className="text-[11px] text-neutral-500 font-normal">
                          Pay in cash or scan QR at doorstep delivery (+₹50 handling fee).
                        </p>
                      </div>
                    </div>
                    <Wallet className="h-4 w-4 text-neutral-600" />
                  </div>
                </div>

              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: STICKY ORDER SUMMARY & COUPONS */}
          <aside className="min-w-0 lg:sticky lg:top-20 lg:self-start space-y-4">
            
            {/* Summary Box */}
            <div className="border border-neutral-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-medium uppercase tracking-wider text-neutral-900 pb-3 border-b border-neutral-200">
                Order Summary ({cartItems.reduce((a, b) => a + b.quantity, 0)} Items)
              </h3>

              {/* Items Preview */}
              <div className="max-h-60 overflow-y-auto divide-y divide-neutral-100 pr-1">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-11 shrink-0 overflow-hidden bg-neutral-100 border border-neutral-200">
                        <img src={item.image || item.imageFront} alt="" className="h-full w-full object-cover" />
                        <span className="absolute top-0.5 right-0.5 grid h-4 w-4 place-items-center rounded-full bg-black text-[9px] font-bold text-white">
                          {item.quantity}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-neutral-900 line-clamp-1">{item.title}</h4>
                        <p className="text-[11px] text-neutral-500 font-normal">Size: {item.size}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-neutral-900">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}.00
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Box */}
              <form onSubmit={handleApplyCoupon} className="pt-2 border-t border-neutral-200 flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon code (e.g. PUMP15)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="h-10 flex-1 border border-neutral-300 px-3 text-xs outline-none focus:border-neutral-900 uppercase font-mono"
                />
                <button
                  type="submit"
                  className="h-10 px-4 bg-neutral-900 text-xs font-medium uppercase tracking-wider text-white hover:bg-black transition-colors"
                >
                  Apply
                </button>
              </form>

              {appliedCoupon && (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/70 p-2 text-xs text-emerald-800">
                  <div className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{appliedCoupon.label}</span>
                  </div>
                  <span className="font-medium">-{appliedCoupon.discountPercent}%</span>
                </div>
              )}

              {/* Price Calculation Breakdown */}
              <div className="space-y-2 pt-2 border-t border-neutral-200 text-xs text-neutral-600 font-normal">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="text-neutral-900 font-medium">₹{rawSubtotal.toLocaleString('en-IN')}.00</span>
                </div>

                {isPrepaid && prepaidDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Prepaid Extra 10% Savings</span>
                    <span className="font-medium">-₹{prepaidDiscount.toLocaleString('en-IN')}.00</span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Coupon Discount</span>
                    <span className="font-medium">-₹{couponDiscount.toLocaleString('en-IN')}.00</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Express Delivery</span>
                  <span className="text-emerald-700 font-medium">FREE</span>
                </div>

                {paymentMethod === 'cod' && (
                  <div className="flex justify-between text-neutral-700">
                    <span>COD Convenience Fee</span>
                    <span className="font-medium">+₹50.00</span>
                  </div>
                )}

                <div className="flex justify-between items-baseline pt-3 border-t border-neutral-200 text-neutral-900">
                  <div>
                    <span className="text-sm font-semibold uppercase tracking-wide">Total Payable</span>
                    <p className="text-[10px] text-neutral-400 font-normal">Inclusive of all taxes & GST</p>
                  </div>
                  <span className="text-lg font-semibold">
                    ₹{grandTotal.toLocaleString('en-IN')}.00
                  </span>
                </div>
              </div>

              {/* Place Order CTA */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={handlePlaceOrder}
                className="w-full flex items-center justify-center gap-2 h-12 bg-neutral-900 hover:bg-black text-white text-xs font-medium uppercase tracking-widest transition-all disabled:opacity-75 cursor-pointer shadow-xs active:scale-[0.99]"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                    <span>Processing Order...</span>
                  </div>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5" />
                    <span>Pay ₹{grandTotal.toLocaleString('en-IN')}.00 & Place Order</span>
                  </>
                )}
              </button>

              {/* Trust Badges */}
              <div className="pt-2 grid grid-cols-3 gap-2 border-t border-neutral-200 text-center text-[10px] text-neutral-500 font-normal">
                <div>
                  <ShieldCheck className="mx-auto h-4 w-4 mb-0.5 text-neutral-700" />
                  <span>100% Genuine</span>
                </div>
                <div>
                  <Truck className="mx-auto h-4 w-4 mb-0.5 text-neutral-700" />
                  <span>Fast Delivery</span>
                </div>
                <div>
                  <CheckCircle2 className="mx-auto h-4 w-4 mb-0.5 text-neutral-700" />
                  <span>7-Day Return</span>
                </div>
              </div>

            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}
