import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Briefcase,
  Check,
  ChevronDown,
  CreditCard,
  Home,
  KeyRound,
  LocateFixed,
  Lock,
  Mail,
  Phone,
  Plus,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
  User,
  Wallet,
  CheckCircle2,
  MapPin,
  Navigation,
  Loader2,
  Search,
  ExternalLink,
  FileText,
  Printer,
  Download,
  AlertCircle,
  Package,
  Calendar,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useBrand } from '../context/BrandContext';
import { toast } from 'sonner';
import {
  placeCustomerOrder,
  fetchPublicPaymentConfig,
  createClientPaymentOrder,
  verifyClientPaymentAndPlaceOrder,
  captureAbandonedCheckout,
} from '../services/orderService';
import { ADMIN_API_BASE } from '../config/api';
import OrderInvoiceModal from '../components/OrderInvoiceModal';
import { printOrderInvoice } from '../utils/invoiceGenerator';

// Load Official Razorpay Standard Checkout Modal (checkout.js)
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const existingCustom = document.getElementById('razorpay-custom-sdk');
    if (existingCustom) {
      existingCustom.remove();
      delete window.Razorpay;
    }
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-standard-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, subtotal, clearCart, shippingConfig } = useCart();
  const {
    user,
    openAuth,
    addAddress,
    deleteAddress,
    linkEmailSendOtp,
    verifyLinkEmail,
    sendEmailOtp,
    verifyEmailOtp,
  } = useAuth();
  const { brand } = useBrand();

  // Razorpay Gateway State
  const [razorpayConfig, setRazorpayConfig] = useState({
    enabled: true,
    key_id: '',
    brand_name: 'RageX Activewear',
    theme_color: '#171717',
  });

  // Fetch Public Payment Gateway Config on Mount
  useEffect(() => {
    fetchPublicPaymentConfig().then((data) => {
      if (data && data.success && data.config) {
        setRazorpayConfig(data.config);
      }
    }).catch(() => { });
    loadRazorpayScript();
  }, []);

  // Stepper state: 'details' (Shipping & Payment) | 'confirmed' (Order Success)
  const [step, setStep] = useState('details');
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Guest session addresses (if user adds an address without logging in)
  const [guestAddresses, setGuestAddresses] = useState([]);

  // Real Saved Addresses ONLY (No fake Gurugram default address)
  const defaultSavedAddresses = useMemo(() => {
    const userAddrs = (user?.addresses || []).filter(
      (a) =>
        a &&
        a.id !== 'addr-default-1' &&
        !String(a.addressLine || '').includes('Plot 42, Sector 18, Cyber City')
    );
    const merged = [...userAddrs];
    guestAddresses.forEach((ga) => {
      if (!merged.some((m) => m.id === ga.id)) {
        merged.push(ga);
      }
    });
    return merged;
  }, [user?.addresses, guestAddresses]);

  const [selectedAddressId, setSelectedAddressId] = useState(
    () => defaultSavedAddresses[0]?.id || 'new'
  );
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(
    () => defaultSavedAddresses.length === 0
  );

  // Keep address selection in sync when user logs in or addresses load
  useEffect(() => {
    if (defaultSavedAddresses.length === 0) {
      setIsAddingNewAddress(true);
      setSelectedAddressId('new');
    } else if (selectedAddressId === 'new' || !defaultSavedAddresses.some((a) => a.id === selectedAddressId)) {
      const def = defaultSavedAddresses.find((a) => a.isDefault) || defaultSavedAddresses[0];
      setSelectedAddressId(def.id);
      setIsAddingNewAddress(false);
    }
  }, [defaultSavedAddresses]);

  // New Address Form with Lat/Lng (Clean empty defaults)
  const [newAddressForm, setNewAddressForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    addressLine: '',
    apartment: '',
    city: '',
    state: '',
    pincode: '',
    type: 'Home',
    latitude: null,
    longitude: null,
    saveForFuture: true,
  });

  // Sync user name & phone into newAddressForm if empty when user loads
  useEffect(() => {
    if (user) {
      setNewAddressForm((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user?.name, user?.phone]);

  // GPS / Autocomplete state
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isFetchingPin, setIsFetchingPin] = useState(false);
  const [mapsApiKey, setMapsApiKey] = useState('AIzaSyAWnFjD1hsIsyYB7nQs_fAUd2BVuziu0xE');
  const autocompleteInputRef = useRef(null);
  const googleAutocompleteRef = useRef(null);

  // Fetch Google Maps API Key from backend settings
  useEffect(() => {
    fetch(`${ADMIN_API_BASE}/settings/maps`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config?.api_key) {
          setMapsApiKey(data.config.api_key);
        }
      })
      .catch(() => { });
  }, []);

  // Dynamically load Google Places Script
  useEffect(() => {
    if (!mapsApiKey || typeof window === 'undefined') return;

    if (window.google && window.google.maps && window.google.maps.places) {
      initPlacesAutocomplete();
      return;
    }

    const existingScript = document.getElementById('google-maps-sdk');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-maps-sdk';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initPlacesAutocomplete();
      };
      document.head.appendChild(script);
    } else {
      existingScript.onload = () => {
        initPlacesAutocomplete();
      };
    }
  }, [mapsApiKey, isAddingNewAddress]);

  const initPlacesAutocomplete = () => {
    if (!autocompleteInputRef.current || !window.google?.maps?.places) return;

    try {
      if (googleAutocompleteRef.current) return;
      const autocomplete = new window.google.maps.places.Autocomplete(autocompleteInputRef.current, {
        componentRestrictions: { country: 'in' },
        fields: ['address_components', 'formatted_address', 'geometry', 'name'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place || !place.address_components) return;

        let postalCode = '';
        let locality = '';
        let sublocality = '';
        let administrativeArea = '';
        let streetNumber = '';
        let route = '';

        place.address_components.forEach((component) => {
          const types = component.types;
          if (types.includes('postal_code')) postalCode = component.long_name;
          if (types.includes('sublocality_level_1') || types.includes('sublocality')) sublocality = component.long_name;
          if (types.includes('locality')) locality = component.long_name;
          if (types.includes('administrative_area_level_1')) administrativeArea = component.long_name;
          if (types.includes('street_number')) streetNumber = component.long_name;
          if (types.includes('route')) route = component.long_name;
        });

        const lat = place.geometry?.location ? place.geometry.location.lat() : null;
        const lng = place.geometry?.location ? place.geometry.location.lng() : null;

        const streetLine = [streetNumber, route, sublocality, place.name]
          .filter((v, i, a) => v && a.indexOf(v) === i)
          .join(', ');

        setNewAddressForm((prev) => ({
          ...prev,
          addressLine: streetLine || place.formatted_address || prev.addressLine,
          city: locality || prev.city,
          state: administrativeArea || prev.state,
          pincode: postalCode || prev.pincode,
          latitude: lat,
          longitude: lng,
        }));

        toast.success(`Location selected: ${locality || 'Address'} (${postalCode || ''})`);
      });

      googleAutocompleteRef.current = autocomplete;
    } catch (err) {
      console.warn('Google Places Autocomplete setup notice:', err);
    }
  };

  // High-Accuracy GPS Auto-Detection (HTML5 Geolocation + Reverse Geocode)
  const handleDetectLiveLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingLocation(true);
    toast.info('Fetching high-accuracy GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setNewAddressForm((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }));

        try {
          // 1. First try Google Geocoding if API available
          if (window.google?.maps?.Geocoder) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
              if (status === 'OK' && results && results[0]) {
                const res = results[0];
                let postalCode = '';
                let locality = '';
                let state = '';
                let sublocality = '';

                res.address_components.forEach((c) => {
                  if (c.types.includes('postal_code')) postalCode = c.long_name;
                  if (c.types.includes('locality')) locality = c.long_name;
                  if (c.types.includes('administrative_area_level_1')) state = c.long_name;
                  if (c.types.includes('sublocality_level_1')) sublocality = c.long_name;
                });

                setNewAddressForm((prev) => ({
                  ...prev,
                  addressLine: sublocality ? `${sublocality}, ${res.formatted_address.split(',')[0]}` : res.formatted_address.split(',').slice(0, 2).join(','),
                  city: locality || prev.city,
                  state: state || prev.state,
                  pincode: postalCode || prev.pincode,
                  latitude: lat,
                  longitude: lng,
                }));

                toast.success(`GPS Location verified! (${locality}, ${postalCode})`);
                setIsDetectingLocation(false);
                return;
              }
            });
          }

          // 2. OpenStreetMap Free High-Precision Reverse Geocoding
          const osmRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const osmData = await osmRes.json();

          if (osmData && osmData.address) {
            const addr = osmData.address;
            const pincode = addr.postcode || '';
            const city = addr.city || addr.town || addr.village || addr.suburb || addr.state_district || 'City';
            const state = addr.state || 'State';
            const street = [addr.road, addr.neighbourhood, addr.suburb].filter(Boolean).join(', ');

            setNewAddressForm((prev) => ({
              ...prev,
              addressLine: street || prev.addressLine || `${city}, Near Landmark`,
              city: city,
              state: state,
              pincode: pincode || prev.pincode,
              latitude: lat,
              longitude: lng,
            }));

            toast.success(`Exact Live GPS captured! (${city} - ${pincode})`);
          }
        } catch (err) {
          toast.error('Location detected, please confirm city & pincode.');
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        setIsDetectingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error('Location permission was denied. Please allow location access in your browser.');
        } else {
          toast.error('Could not detect GPS location. Please type manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // Contact Info & Checkout Email Verification State
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [isEmailOtpOpen, setIsEmailOtpOpen] = useState(false);
  const [emailOtpInput, setEmailOtpInput] = useState('');
  const [isSendingEmailOtp, setIsSendingEmailOtp] = useState(false);
  const [isVerifyingEmailOtp, setIsVerifyingEmailOtp] = useState(false);
  const [verifiedSessionEmail, setVerifiedSessionEmail] = useState(
    user?.emailVerified && user?.email ? user.email.trim().toLowerCase() : ''
  );

  // Sync user email & phone when user profile loads
  useEffect(() => {
    if (user?.phone && !contactPhone) {
      setContactPhone(user.phone);
    }
    if (user?.email) {
      setContactEmail((prev) => prev || user.email);
      if (user.emailVerified) {
        setVerifiedSessionEmail(user.email.trim().toLowerCase());
      }
    }
  }, [user?.email, user?.phone, user?.emailVerified]);

  const isEmailCurrentlyVerified = useMemo(() => {
    const clean = (contactEmail || '').trim().toLowerCase();
    if (!clean || !clean.includes('@')) return false;
    if (user?.emailVerified && (user?.email || '').trim().toLowerCase() === clean) {
      return true;
    }
    return verifiedSessionEmail === clean;
  }, [contactEmail, user?.email, user?.emailVerified, verifiedSessionEmail]);

  const handleSendCheckoutEmailOtp = async () => {
    const clean = (contactEmail || '').trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      toast.error('Please enter a valid email address first.');
      return;
    }
    setIsSendingEmailOtp(true);
    try {
      const res = user ? await linkEmailSendOtp(clean) : await sendEmailOtp(clean);
      if (res?.success) {
        setIsEmailOtpOpen(true);
        setEmailOtpInput('');
      }
    } finally {
      setIsSendingEmailOtp(false);
    }
  };

  const handleVerifyCheckoutEmailOtp = async () => {
    const clean = (contactEmail || '').trim().toLowerCase();
    const cleanOtp = (emailOtpInput || '').trim();
    if (cleanOtp.length < 4) {
      toast.error('Please enter the 4-digit OTP sent to your email.');
      return;
    }
    setIsVerifyingEmailOtp(true);
    try {
      const res = user
        ? await verifyLinkEmail(clean, cleanOtp)
        : await verifyEmailOtp(clean, cleanOtp);
      if (res?.success) {
        setVerifiedSessionEmail(clean);
        setIsEmailOtpOpen(false);
        setEmailOtpInput('');
      }
    } finally {
      setIsVerifyingEmailOtp(false);
    }
  };

  // Delivery Method
  const shippingMethod = 'express'; // 'express' | 'priority'

  // Payment Method & Seamless Custom Checkout State
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'cod' | 'netbanking'
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay'); // 'gpay' | 'phonepe' | 'paytm' | 'bhim'
  const [customUpiId, setCustomUpiId] = useState('');
  const [upiCollectStatus, setUpiCollectStatus] = useState('');
  const [selectedBankCode, setSelectedBankCode] = useState('HDFC');

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

  // Auto city-state by pincode (Instant India Post API + fast fallback)
  const handlePincodeChange = async (pincodeVal) => {
    const clean = pincodeVal.replace(/\D/g, '').slice(0, 6);
    setNewAddressForm((prev) => ({ ...prev, pincode: clean }));
    if (clean.length === 6) {
      setIsFetchingPin(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${clean}`);
        const data = await res.json();
        if (Array.isArray(data) && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          setNewAddressForm((prev) => ({
            ...prev,
            city: po.District || po.Block || prev.city,
            state: po.State || prev.state,
          }));
          setIsFetchingPin(false);
          return;
        }
      } catch (_) {
        // Fallback below
      } finally {
        setIsFetchingPin(false);
      }

      if (clean === '122002' || clean === '122011') {
        setNewAddressForm((prev) => ({ ...prev, city: 'Gurugram', state: 'Haryana' }));
      } else if (clean.startsWith('110')) {
        setNewAddressForm((prev) => ({ ...prev, city: 'New Delhi', state: 'Delhi' }));
      } else if (clean.startsWith('201')) {
        setNewAddressForm((prev) => ({ ...prev, city: 'Gautam Buddha Nagar', state: 'Uttar Pradesh' }));
      } else if (clean.startsWith('400')) {
        setNewAddressForm((prev) => ({ ...prev, city: 'Mumbai', state: 'Maharashtra' }));
      } else if (clean.startsWith('560')) {
        setNewAddressForm((prev) => ({ ...prev, city: 'Bengaluru', state: 'Karnataka' }));
      }
    }
  };

  // Price Calculations based on Admin Live Settings
  const rawSubtotal = subtotal;
  const isPrepaid = paymentMethod === 'upi' || paymentMethod === 'card' || paymentMethod === 'netbanking';

  const prepaidDiscount = isPrepaid ? Math.round(rawSubtotal * 0.10) : 0;
  const couponDiscount = appliedCoupon?.discountPercent
    ? Math.round((rawSubtotal - prepaidDiscount) * (appliedCoupon.discountPercent / 100))
    : 0;

  const totalDiscount = prepaidDiscount + couponDiscount;

  // Dynamic Shipping Fee (Calculated via Admin free_shipping_threshold & standard_shipping_charge)
  const freeThreshold = shippingConfig?.free_shipping_threshold ?? 999;
  const standardShippingCharge = Number(shippingConfig?.standard_shipping_charge) || 0;
  const shippingFee = (rawSubtotal >= freeThreshold && freeThreshold > 0) || freeThreshold === 0 ? 0 : standardShippingCharge;

  // Dynamic Priority Shipping Fee
  const priorityFee = shippingMethod === 'priority' ? (Number(shippingConfig?.express_shipping_charge) || 149) : 0;

  // Dynamic COD Validation & Surcharge
  const isCodGloballyEnabled = shippingConfig?.cod_enabled !== false;
  const codMinLimit = Number(shippingConfig?.cod_min_order) || 0;
  const codMaxLimit = Number(shippingConfig?.cod_max_order) || 15000;
  const isCodAllowedForCart = isCodGloballyEnabled && rawSubtotal >= codMinLimit && rawSubtotal <= codMaxLimit;
  const codFee = paymentMethod === 'cod' ? (Number(shippingConfig?.cod_extra_charge) || 0) : 0;

  const grandTotal = Math.max(
    0,
    rawSubtotal - totalDiscount + shippingFee + priorityFee + codFee
  );

  // Abandoned Cart Capture (Auto sync phone & cart to Admin WhatsApp recovery)
  useEffect(() => {
    if (step === 'confirmed' || !cartItems || cartItems.length === 0) return;
    const phone = contactPhone || newAddressForm?.phone;
    if (!phone || phone.replace(/\D/g, '').length < 10) return;

    const timer = setTimeout(() => {
      const activeAddress =
        selectedAddressId === 'new'
          ? newAddressForm
          : defaultSavedAddresses.find((a) => a.id === selectedAddressId) || newAddressForm;

      captureAbandonedCheckout({
        phone: phone.trim(),
        email: contactEmail || user?.email || '',
        customerName: activeAddress?.name || user?.name || 'Shopper',
        cartTotal: grandTotal,
        cartItems: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          size: item.size || item.selectedSize || 'Standard',
          color: item.color || item.selectedColor || 'Default',
          price: item.price,
          quantity: item.quantity || 1,
          image: item.image || item.images?.[0],
        })),
        addressSummary: `${activeAddress?.city || ''}, ${activeAddress?.state || ''} ${activeAddress?.pincode || ''}`.trim(),
      }).catch(() => { });
    }, 2000);

    return () => clearTimeout(timer);
  }, [contactPhone, newAddressForm.phone, contactEmail, grandTotal, cartItems, step, selectedAddressId]);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (!clean) return;

    if (clean === 'PUMP15' || clean === 'XAVONIC15') {
      setAppliedCoupon({ code: clean, discountPercent: 15, label: 'Special 15% OFF' });
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
    if (!newAddressForm.name || !newAddressForm.addressLine || !newAddressForm.pincode || !newAddressForm.city || !newAddressForm.state) {
      toast.error('Please fill in all required delivery address fields.');
      return;
    }

    const createdAddr = {
      id: `addr-${Date.now()}`,
      type: newAddressForm.type || 'Home',
      name: newAddressForm.name.trim(),
      addressLine: newAddressForm.apartment
        ? `${newAddressForm.apartment.trim()}, ${newAddressForm.addressLine.trim()}`
        : newAddressForm.addressLine.trim(),
      city: newAddressForm.city.trim(),
      state: newAddressForm.state.trim(),
      pincode: newAddressForm.pincode.trim(),
      phone: (newAddressForm.phone || contactPhone || user?.phone || '').trim(),
      latitude: newAddressForm.latitude || null,
      longitude: newAddressForm.longitude || null,
      isDefault: defaultSavedAddresses.length === 0,
    };

    if (user && addAddress) {
      addAddress(createdAddr);
    } else {
      setGuestAddresses((prev) => [createdAddr, ...prev]);
    }
    setSelectedAddressId(createdAddr.id);
    setIsAddingNewAddress(false);
    toast.success('Delivery address saved and selected!');
  };

  const showOrderSuccess = (order, selectedAddr) => {
    const cleanPaymentMethod =
      paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Prepaid';
    const fullConfirmedOrder = {
      id: order.orderNumber || order.id,
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      status: order.orderStatus || 'Order Confirmed',
      statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      step: 1,
      estimatedDelivery:
        order.estimatedDelivery ||
        (shippingMethod === 'priority' ? 'Tomorrow, by 8:00 PM' : '2–4 Business Days'),
      items: [...cartItems],
      subtotal: `₹${rawSubtotal.toLocaleString('en-IN')}`,
      discount: totalDiscount > 0 ? `₹${totalDiscount.toLocaleString('en-IN')}` : '₹0',
      shipping: shippingFee === 0 ? 'FREE' : `₹${shippingFee}`,
      total: `₹${grandTotal.toLocaleString('en-IN')}`,
      paymentMethod: cleanPaymentMethod,
      paymentStatus: order.paymentStatus || (paymentMethod === 'cod' ? 'Pay on Delivery' : 'Paid'),
      transactionId: order.transaction_id || order.razorpay_payment_id || null,
      trackingNumber: 'Assigned on Dispatch',
      courierPartner: 'Express Surface / Air',
      shippingAddress: `${selectedAddr.name}, ${selectedAddr.addressLine}, ${selectedAddr.city}, ${selectedAddr.state} - ${selectedAddr.pincode} (Ph: ${selectedAddr.phone})`,
      addressDetails: {
        name: selectedAddr.name,
        type: selectedAddr.type || 'Home',
        addressLine: selectedAddr.addressLine,
        city: selectedAddr.city,
        state: selectedAddr.state,
        pincode: selectedAddr.pincode,
        phone: selectedAddr.phone,
        email: contactEmail || user?.email || '',
      },
    };

    setConfirmedOrder(fullConfirmedOrder);
    setStep('confirmed');
    clearCart();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.success('Order Placed Successfully!');
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      toast.error('Your bag is empty.');
      navigate('/collections');
      return;
    }

    // 1. Require verified email before order placement
    if (!contactEmail || !contactEmail.includes('@')) {
      toast.error('Please enter your email address in Step 1 for order confirmation & invoice.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!isEmailCurrentlyVerified) {
      toast.error('Please verify your email address in Step 1 before placing your order.');
      if (!isEmailOtpOpen) {
        handleSendCheckoutEmailOtp();
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 2. Require a saved/valid delivery address
    let selectedAddr =
      defaultSavedAddresses.find((a) => a.id === selectedAddressId) || defaultSavedAddresses[0];

    if (isAddingNewAddress && (!selectedAddr || defaultSavedAddresses.length === 0)) {
      if (newAddressForm.name && newAddressForm.addressLine && newAddressForm.pincode && newAddressForm.city && newAddressForm.state) {
        selectedAddr = {
          id: `addr-${Date.now()}`,
          type: newAddressForm.type || 'Home',
          name: newAddressForm.name.trim(),
          addressLine: newAddressForm.apartment
            ? `${newAddressForm.apartment.trim()}, ${newAddressForm.addressLine.trim()}`
            : newAddressForm.addressLine.trim(),
          city: newAddressForm.city.trim(),
          state: newAddressForm.state.trim(),
          pincode: newAddressForm.pincode.trim(),
          phone: (newAddressForm.phone || contactPhone || user?.phone || '').trim(),
          latitude: newAddressForm.latitude || null,
          longitude: newAddressForm.longitude || null,
          isDefault: true,
        };
        if (user && addAddress) {
          addAddress(selectedAddr);
        } else {
          setGuestAddresses((prev) => [selectedAddr, ...prev]);
        }
        setSelectedAddressId(selectedAddr.id);
        setIsAddingNewAddress(false);
      } else {
        toast.error('Please complete and save your delivery address in Step 2.');
        return;
      }
    }

    if (!selectedAddr || !selectedAddr.name || !selectedAddr.addressLine || !selectedAddr.pincode) {
      toast.error('Please enter complete delivery address details in Step 2.');
      return;
    }

    setIsProcessing(true);

    const payload = {
      user_id: user?.dbId || (typeof user?.id === 'number' ? user.id : null),
      customer_id: user?.customerId || (typeof user?.id === 'string' ? user.id : `RGX-${user?.dbId || '9842'}`),
      customer_name: selectedAddr.name || user?.name || 'Customer',
      customer_email: contactEmail || user?.email || '',
      customer_phone: selectedAddr.phone || contactPhone || user?.phone || '',
      items: cartItems.map((item) => ({
        id: item.id,
        title: item.title,
        slug: item.slug || '',
        price: Number(item.price || 0),
        originalPrice: Number(item.originalPrice || item.price || 0),
        selectedSize: item.selectedSize || item.size || 'M',
        selectedColor: item.selectedColor || item.color || 'Standard',
        quantity: Number(item.quantity || 1),
        image: item.image || item.imageFront || item.gallery?.[0] || '',
      })),
      subtotal: rawSubtotal,
      discount_amount: totalDiscount,
      coupon_code: appliedCoupon?.code || '',
      shipping_fee: shippingFee,
      total_amount: grandTotal,
      payment_method: paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Online Prepaid',
      payment_status: 'Pending',
      shipping_address: selectedAddr,
      save_address: true,
    };

    // Flow 1: Online Prepaid via Official Razorpay Standard Checkout Window
    if (isPrepaid) {
      if (!razorpayConfig?.key_id) {
        toast.error('Online Payment Gateway is not yet configured. Please add your Razorpay Key ID & Secret in Admin Settings (Razorpay tab) or choose Cash on Delivery (COD).');
        setIsProcessing(false);
        return;
      }

      try {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded || !window.Razorpay) {
          toast.error('Payment gateway SDK could not load. Please check your internet connection.');
          setIsProcessing(false);
          return;
        }

        // Create Razorpay Order on server
        const rzpOrderRes = await createClientPaymentOrder(
          grandTotal,
          `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          {
            customer_name: payload.customer_name,
            customer_phone: payload.customer_phone,
            customer_email: payload.customer_email,
          }
        );

        if (!rzpOrderRes.success || !rzpOrderRes.order) {
          toast.error(rzpOrderRes.message || 'Failed to initialize payment gateway.');
          setIsProcessing(false);
          return;
        }

        const razorpayOrder = rzpOrderRes.order;
        const rzpOrderId = razorpayOrder.orderId || razorpayOrder.id;

        const options = {
          key: razorpayConfig.key_id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency || 'INR',
          name: razorpayConfig.brand_name || brand?.brand_name || 'RageX Activewear',
          description: `Order Payment (${cartItems.length} items)`,
          image: brand?.logo_black || '/logo.png',
          order_id: rzpOrderId,
          prefill: {
            name: payload.customer_name,
            email: payload.customer_email,
            contact: payload.customer_phone,
          },
          notes: {
            customer_phone: payload.customer_phone,
            city: selectedAddr.city,
            pincode: selectedAddr.pincode,
          },
          theme: {
            color: razorpayConfig.theme_color || '#18181b',
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
              toast.info('Payment window was closed. You can complete it anytime.');
            },
          },
          handler: async function (response) {
            try {
              setIsProcessing(true);
              const verifyRes = await verifyClientPaymentAndPlaceOrder({
                razorpay_order_id: response.razorpay_order_id || rzpOrderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderPayload: {
                  ...payload,
                  payment_status: 'Paid',
                  transaction_id: response.razorpay_payment_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id || rzpOrderId,
                },
              });

              if (verifyRes.success && verifyRes.order) {
                showOrderSuccess(verifyRes.order, selectedAddr);
              } else {
                toast.error(verifyRes.message || 'Payment received, but order confirmation had an issue.');
              }
            } catch (err) {
              console.error('Payment verification error:', err);
              toast.error('Network error verifying payment.');
            } finally {
              setIsProcessing(false);
            }
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          setIsProcessing(false);
          toast.error(resp.error?.description || 'Payment Failed. Please try again.');
        });
        rzp.open();
        return;
      } catch (err) {
        console.error('Razorpay launch error:', err);
        toast.error('Payment gateway error. Please try again.');
        setIsProcessing(false);
        return;
      }
    }

    // Flow 2: Cash On Delivery (COD Only)
    try {
      const res = await placeCustomerOrder(payload);
      if (res.success && res.order) {
        showOrderSuccess(res.order, selectedAddr);
      } else {
        toast.error(res.message || 'Failed to place order. Please check details.');
      }
    } catch (err) {
      toast.error('Network error placing order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // RAGE-X: order success (checkout and payment logic remain unchanged)
  if (step === 'confirmed' && confirmedOrder) {
    const addr = confirmedOrder.addressDetails;
    const isCod = /cash on delivery|\bcod\b|pay on delivery/i.test(confirmedOrder.paymentMethod || '');
    const isPaidOnline = !isCod && String(confirmedOrder.paymentStatus || '').toLowerCase() === 'paid';
    const stages = [
      { name: 'Placed', note: 'Order received', Icon: CheckCircle2 },
      { name: 'Processing', note: 'Preparing your order', Icon: Package },
      { name: 'Shipped', note: 'On the way', Icon: Truck },
      { name: 'Delivered', note: 'At your doorstep', Icon: Home },
    ];
    const stageNumber = Math.min(3, Math.max(0,
      /deliver/i.test(confirmedOrder.status || '') ? 3 :
        /ship|dispatch|transit/i.test(confirmedOrder.status || '') ? 2 :
          /process|pack/i.test(confirmedOrder.status || '') ? 1 : 0
    ));

    return (
      <div className="relative min-h-screen overflow-hidden bg-[#fafbf8] text-[#18251e] pb-16" style={{ fontFamily: 'inherit' }}>
        {/* Put the generated 1920x900 image at: public/images/ragex-order-success-bg.png */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[69px] h-[740px] sm:h-[820px] overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-[position:65%_top] sm:bg-center" style={{ backgroundImage: "url('/images/ragex-order-success-bg.png')" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#fafbf8]/10 via-[#fafbf8]/20 to-[#fafbf8]" />
        </div>

        <header className="relative z-10 border-b border-[#e7ece5] bg-white/90">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
            <Link to="/" className="text-xl font-black italic tracking-[-.07em] text-[#151b16]">
              RAGE<span className="text-[#d81f2b]">-X</span>
            </Link>
            <span className="inline-flex items-center gap-2 text-xs font-medium text-[#35734a]"><ShieldCheck className="h-4 w-4" /> Secure checkout</span>
          </div>
        </header>

        <main className="relative z-10 mx-auto max-w-5xl px-4 pt-7 sm:px-8 sm:pt-9">
          <div className="relative grid min-h-[295px] items-center gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-14">
            <motion.div initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .7, delay: .15 }} className="order-2 text-center md:order-1 md:text-left">
              <p className="text-[37px] leading-none italic tracking-tight text-[#185b37] sm:text-[49px]" style={{ fontFamily: 'cursive' }}>Thank You ♡</p>
              <p className="mt-4 text-[10px] font-semibold uppercase tracking-[.25em] text-[#24352a]">For shopping with <span className="font-black italic tracking-normal text-[#bb1722]">RAGE-X</span></p>
            </motion.div>
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65 }} className="order-1 text-center md:order-2">
              <motion.div initial={{ scale: .65, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 180, damping: 16, delay: .15 }} className="relative mx-auto mb-4 grid h-[88px] w-[88px] place-items-center rounded-full border-[7px] border-[#e5f1e7] bg-[#185d38]">
                <svg viewBox="0 0 56 56" className="h-12 w-12" fill="none" aria-label="Order confirmed" role="img">
                  <motion.path d="M12 29L23 40L45 16" stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: .5, duration: .75, ease: 'easeOut' }} />
                </svg>
                {[0, 60, 120, 180, 240, 300].map((angle) => <motion.span key={angle} initial={{ opacity: 0, scale: .3 }} animate={{ opacity: [0, 1, 0], scale: [0.3, 1, 1.2] }} transition={{ duration: .8, delay: .65, ease: 'easeOut' }} className="absolute h-1.5 w-1.5 rounded-full bg-[#367d50]" style={{ left: `calc(50% + ${Math.cos(angle * Math.PI / 180) * 61}px)`, top: `calc(50% + ${Math.sin(angle * Math.PI / 180) * 61}px)` }} />)}
              </motion.div>
              <p className="text-[10px] font-semibold uppercase tracking-[.28em] text-[#37704c]">Order placed successfully</p>
              <h1 className="mt-2 text-[28px] font-bold leading-tight tracking-tight text-[#18251e] sm:text-[40px]">Your order is <span className="text-[#1c623b]">confirmed!</span></h1>
              <p className="mx-auto mt-3 max-w-md text-[13px] leading-6 text-[#58665b] sm:text-sm">We have received your order. We'll send updates to your registered email as it moves toward delivery.</p>
            </motion.section>
          </div>

          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .15, duration: .45 }} className="mt-9 overflow-hidden rounded-2xl border border-[#e1e9df] bg-white/95">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#edf0ea] px-5 py-5 sm:px-8">
              <div><p className="text-[11px] uppercase tracking-[.14em] text-[#849084]">Order number</p><p className="mt-1 text-xl font-bold">#{String(confirmedOrder.id || '').replace(/^#/, '')}</p><p className="mt-1 text-xs text-[#7d887d]">Placed on {confirmedOrder.date}</p></div>
              <div className="flex flex-col items-start gap-2 sm:items-end"><span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf5ec] px-3 py-1.5 text-xs font-semibold text-[#267044]"><CheckCircle2 className="h-3.5 w-3.5" /> Order confirmed</span><p className="text-xs text-[#6a796b]">Expected: {confirmedOrder.estimatedDelivery}</p></div>
            </div>
            <div className="px-5 py-6 sm:px-8">
              <h2 className="mb-6 text-sm font-bold">Your order journey</h2>
              <div className="relative grid grid-cols-4 gap-1 sm:gap-4">
                <div className="absolute left-[12%] right-[12%] top-[19px] h-[2px] bg-[#e2e8e0]" />
                <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: .45, duration: .7 }} style={{ transformOrigin: 'left', width: `${stageNumber * 33.333}%` }} className="absolute left-[12%] top-[19px] h-[2px] bg-[#267044]" />
                {stages.map(({ name, note, Icon }, index) => {
                  const completed = index <= stageNumber;
                  return <div key={name} className="relative flex flex-col items-center text-center"><div className={`z-10 grid h-10 w-10 place-items-center rounded-full border-2 ${completed ? 'border-[#267044] bg-[#267044] text-white' : 'border-[#e2e8e0] bg-white text-[#9da89f]'}`}><Icon className="h-4 w-4" /></div><p className={`mt-3 text-[11px] font-semibold sm:text-xs ${completed ? 'text-[#245d39]' : 'text-[#829084]'}`}>{name}</p><p className="mt-1 hidden text-[11px] text-[#899489] sm:block">{note}</p></div>;
                })}
              </div>
            </div>
          </motion.section>

          <section className="mt-5 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-[#e1e9df] bg-white p-6 sm:p-7">
              <h2 className="flex items-center gap-2 text-sm font-bold"><MapPin className="h-[18px] w-[18px] text-[#347a4f]" /> Shipping details</h2>
              <div className="mt-5 border-t border-[#edf0ea] pt-4 text-sm leading-7 text-[#59695e]">
                <p className="font-semibold text-[#202c22]">{addr?.name || 'Customer'}</p>
                <p>{addr ? <>{addr.addressLine}<br />{addr.city}, {addr.state} - {addr.pincode}</> : confirmedOrder.shippingAddress}</p>
                {addr?.phone && <p className="mt-2 text-xs">Phone: {addr.phone}</p>}
                {addr?.email && <p className="break-all text-xs">Email: {addr.email}</p>}
              </div>
            </div>
            <div className="rounded-2xl border border-[#e1e9df] bg-white p-6 sm:p-7">
              <h2 className="flex items-center gap-2 text-sm font-bold"><CreditCard className="h-[18px] w-[18px] text-[#347a4f]" /> Payment details</h2>
              <div className="mt-5 space-y-4 border-t border-[#edf0ea] pt-4 text-sm">
                <div className="flex justify-between gap-4"><span className="text-[#798779]">Payment method</span><span className="text-right font-semibold">{confirmedOrder.paymentMethod}</span></div>
                <div className="flex justify-between gap-4"><span className="text-[#798779]">Status</span><span className="font-semibold text-[#22643e]">{isCod ? 'Pay on delivery' : confirmedOrder.paymentStatus}</span></div>
                <div className="flex justify-between gap-4 border-t border-[#edf0ea] pt-4"><span className="font-semibold">{isPaidOnline ? 'Amount paid' : 'Order total'}</span><span className="text-lg font-bold text-[#22643e]">{confirmedOrder.total}</span></div>
              </div>
            </div>
          </section>

          <section className="mt-5 rounded-2xl border border-[#e1e9df] bg-white p-6 sm:p-7">
            <div className="flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-sm font-bold"><ShoppingBag className="h-[18px] w-[18px] text-[#347a4f]" /> Order summary</h2><span className="text-xs text-[#7b897b]">{confirmedOrder.items.length} item(s)</span></div>
            <div className="mt-4 divide-y divide-[#eef1eb] border-y border-[#eef1eb]">
              {confirmedOrder.items.map((item, index) => <div key={`${item.id || item.title || 'item'}-${index}`} className="flex items-start justify-between gap-4 py-3.5 text-sm"><div><p className="font-medium">{item.title || item.name || 'Order item'}</p><p className="mt-1 text-xs text-[#819082]">Size: {item.selectedSize || item.size || 'Standard'} · Qty: {item.quantity || 1}</p></div><span className="shrink-0 font-semibold">₹{(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString('en-IN')}</span></div>)}
            </div>
            <div className="ml-auto mt-4 max-w-sm space-y-2.5 text-sm"><div className="flex justify-between"><span className="text-[#798779]">Subtotal</span><span>{confirmedOrder.subtotal}</span></div>{confirmedOrder.discount !== '₹0' && <div className="flex justify-between"><span className="text-[#798779]">Discount</span><span className="text-[#22643e]">-{confirmedOrder.discount}</span></div>}<div className="flex justify-between"><span className="text-[#798779]">Shipping</span><span>{confirmedOrder.shipping}</span></div><div className="flex justify-between border-t border-[#e4ebe3] pt-3 text-base font-bold"><span>Total</span><span>{confirmedOrder.total}</span></div></div>
          </section>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/collections" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#22643e] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#174c2e]">Continue shopping <ArrowRight className="h-4 w-4" /></Link>
            <button type="button" onClick={() => setIsInvoiceModalOpen(true)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#bfd0c0] bg-white px-6 text-sm font-semibold text-[#245b37] transition-colors hover:bg-[#f1f7f0]"><FileText className="h-4 w-4" /> View invoice</button>
            <button type="button" onClick={() => printOrderInvoice(confirmedOrder)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#e1e9df] bg-white px-5 text-sm font-semibold text-[#4c6151] transition-colors hover:bg-[#f6f9f5]"><Printer className="h-4 w-4" /> Print</button>
          </div>
          <p className="mt-8 text-center text-xs text-[#829083]">Questions about your order? <a className="font-semibold text-[#22643e] underline underline-offset-4" href={`mailto:${brand?.support_email || 'support@rage-x.com'}`}>Contact us</a></p>
          <OrderInvoiceModal order={confirmedOrder} isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} />
        </main>
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
              RAGEX <span className="text-[10px] font-normal text-neutral-400">CHECKOUT</span>
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

            {/* Step 1: Customer Account / Contact Info & Email Verification */}
            <section className="rounded-xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-2xs transition-all">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-zinc-900 text-[11px] font-semibold text-white">
                    1
                  </span>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-900">
                    Contact & Account
                  </h2>
                </div>
                {user ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{user.name}</span>
                  </span>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={openAuth}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <User className="h-3.5 w-3.5" />
                    <span>Sign In</span>
                  </motion.button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Mobile Phone Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                      Mobile Phone *
                    </label>
                    {user?.phoneVerified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                        <CheckCircle2 className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50/50 pl-9 pr-3 text-xs text-zinc-900 outline-none transition-all focus:bg-white focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/5"
                    />
                  </div>
                </div>

                {/* Email Field with Clean Side-by-Side Verify Button */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                      Email Address *
                    </label>
                    {isEmailCurrentlyVerified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                        <CheckCircle2 className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 min-w-0">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => {
                          setContactEmail(e.target.value);
                          if (isEmailOtpOpen) setIsEmailOtpOpen(false);
                        }}
                        placeholder="name@example.com"
                        className={`h-11 w-full rounded-lg border pl-9 pr-3 text-xs text-zinc-900 outline-none transition-all ${isEmailCurrentlyVerified
                          ? 'border-emerald-200 bg-emerald-50/20 focus:border-emerald-600'
                          : 'border-zinc-200 bg-zinc-50/50 focus:bg-white focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/5'
                          }`}
                      />
                    </div>
                    {!isEmailCurrentlyVerified && !isEmailOtpOpen && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        disabled={isSendingEmailOtp || !contactEmail.trim()}
                        onClick={handleSendCheckoutEmailOtp}
                        className="h-11 px-4 shrink-0 rounded-lg bg-zinc-900 hover:bg-black text-white text-[11px] font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isSendingEmailOtp ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <span>Verify</span>
                            <ArrowRight className="h-3 w-3" />
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>

                  {/* Minimal Compact Inline OTP Row */}
                  <AnimatePresence>
                    {!isEmailCurrentlyVerified && isEmailOtpOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1 min-w-0">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                            <input
                              type="text"
                              maxLength={6}
                              value={emailOtpInput}
                              onChange={(e) => setEmailOtpInput(e.target.value.replace(/\D/g, ''))}
                              placeholder="Enter 4-digit OTP"
                              className="h-10 w-full rounded-lg border border-zinc-300 bg-white pl-9 pr-14 text-xs font-semibold tracking-wider text-zinc-900 outline-none focus:border-zinc-900"
                            />
                            <button
                              type="button"
                              disabled={isSendingEmailOtp}
                              onClick={handleSendCheckoutEmailOtp}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-zinc-400 hover:text-zinc-900 cursor-pointer"
                            >
                              Resend
                            </button>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            disabled={isVerifyingEmailOtp}
                            onClick={handleVerifyCheckoutEmailOtp}
                            className="h-10 px-4 shrink-0 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors disabled:opacity-60 cursor-pointer"
                          >
                            {isVerifyingEmailOtp ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                            )}
                            <span>Confirm</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </section>

            {/* Step 2: Saved Delivery Addresses & New Address Management */}
            <section className="rounded-xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-2xs transition-all">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-zinc-900 text-[11px] font-semibold text-white">
                    2
                  </span>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-900">
                    Delivery Address
                  </h2>
                </div>

                {!isAddingNewAddress ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => setIsAddingNewAddress(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add New Address</span>
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={handleDetectLiveLocation}
                    disabled={isDetectingLocation}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer disabled:opacity-60 ${newAddressForm.latitude
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-900'
                      }`}
                  >
                    {isDetectingLocation ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Detecting...</span>
                      </>
                    ) : newAddressForm.latitude ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Location Detected</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="h-3.5 w-3.5 text-zinc-700" />
                        <span>Use Current Location</span>
                      </>
                    )}
                  </motion.button>
                )}
              </div>

              {/* Saved Addresses Radio Cards */}
              {!isAddingNewAddress && defaultSavedAddresses.length > 0 ? (
                <div className="space-y-3">
                  {defaultSavedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    const addrTypeClean = String(addr.type || 'Home').toLowerCase();
                    const TypeIcon = addrTypeClean.includes('office') || addrTypeClean.includes('work') ? Briefcase : Home;

                    return (
                      <motion.div
                        layout
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${isSelected
                          ? 'border-zinc-900 bg-zinc-50/80 ring-1 ring-zinc-900 shadow-2xs'
                          : 'border-zinc-200 hover:border-zinc-400 bg-white'
                          }`}
                      >
                        <div className="flex items-start gap-3.5">
                          <div className={`mt-0.5 grid h-4 w-4 place-items-center rounded-full border shrink-0 transition-colors ${isSelected ? 'border-zinc-900 bg-zinc-900' : 'border-zinc-300 bg-white'
                            }`}>
                            {isSelected && <Check className="h-2.5 w-2.5 text-white stroke-[3]" />}
                          </div>
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-semibold text-zinc-900">{addr.name}</span>
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-700 bg-zinc-200/70 px-2 py-0.5 rounded-md">
                                <TypeIcon className="h-2.5 w-2.5" />
                                <span>{addr.type}</span>
                              </span>
                              {addr.isDefault && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                  <CheckCircle2 className="h-2.5 w-2.5" />
                                  <span>Default</span>
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-600 font-normal leading-relaxed">
                              {addr.addressLine}, {addr.city}, {addr.state} - <span className="font-semibold text-zinc-900">{addr.pincode}</span>
                            </p>
                            <p className="text-[11px] text-zinc-500 font-normal flex items-center gap-1.5 pt-0.5">
                              <Phone className="h-3 w-3 text-zinc-400" />
                              <span>{addr.phone}</span>
                            </p>
                          </div>
                        </div>

                        {user && deleteAddress && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAddress(addr.id);
                            }}
                            className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove address"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                /* Clean Modern Add New Address Form */
                <motion.form
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSaveNewAddress}
                  className="space-y-4 pt-1 text-xs"
                >
                  {/* Full Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                        <input
                          type="text"
                          required
                          value={newAddressForm.name}
                          onChange={(e) => setNewAddressForm((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter recipient full name"
                          className="h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50/50 pl-9 pr-3 text-xs text-zinc-900 outline-none transition-all focus:bg-white focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/5"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                        10-Digit Phone *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                        <input
                          type="tel"
                          required
                          value={newAddressForm.phone}
                          onChange={(e) => setNewAddressForm((prev) => ({ ...prev, phone: e.target.value }))}
                          placeholder="e.g. 9876543210"
                          className="h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50/50 pl-9 pr-3 text-xs text-zinc-900 outline-none transition-all focus:bg-white focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/5"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Flat / House / Building */}
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                      Flat, House no., Building, Company *
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={newAddressForm.apartment}
                        onChange={(e) => setNewAddressForm((prev) => ({ ...prev, apartment: e.target.value }))}
                        placeholder="e.g. Flat 402, Tower B, Palm Heights"
                        className="h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50/50 pl-9 pr-3 text-xs text-zinc-900 outline-none transition-all focus:bg-white focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/5"
                      />
                    </div>
                  </div>

                  {/* Area / Street / Landmark with Google Places Autocomplete */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-700">
                        Area, Street, Sector, Landmark *
                      </label>
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md">
                        <Search className="h-2.5 w-2.5 text-zinc-600" />
                        <span>Google Places Active</span>
                      </span>
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                      <input
                        ref={autocompleteInputRef}
                        type="text"
                        required
                        value={newAddressForm.addressLine}
                        onChange={(e) => setNewAddressForm((prev) => ({ ...prev, addressLine: e.target.value }))}
                        placeholder="Search area, colony, sector, or street..."
                        className="h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50/50 pl-9 pr-9 text-xs text-zinc-900 outline-none transition-all focus:bg-white focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/5"
                      />
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* PIN Code, City, State */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                        6-Digit PIN *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={newAddressForm.pincode}
                          onChange={(e) => handlePincodeChange(e.target.value)}
                          placeholder="e.g. 201218"
                          className="h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50/50 pl-3.5 pr-8 text-xs font-medium text-zinc-900 outline-none transition-all focus:bg-white focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/5"
                        />
                        {isFetchingPin ? (
                          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-zinc-500" />
                        ) : newAddressForm.pincode?.length === 6 && newAddressForm.city ? (
                          <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-600" />
                        ) : null}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                        City / District *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddressForm.city}
                        onChange={(e) => setNewAddressForm((prev) => ({ ...prev, city: e.target.value }))}
                        placeholder="City / Town"
                        className="h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3.5 text-xs text-zinc-900 outline-none transition-all focus:bg-white focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/5"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                        State *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddressForm.state}
                        onChange={(e) => setNewAddressForm((prev) => ({ ...prev, state: e.target.value }))}
                        placeholder="State"
                        className="h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3.5 text-xs text-zinc-900 outline-none transition-all focus:bg-white focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/5"
                      />
                    </div>
                  </div>

                  {/* Save Address Type Selector */}
                  <div className="pt-1">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-700 mb-2">
                      Address Type
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {[
                        { label: 'Home', icon: Home },
                        { label: 'Office', icon: Briefcase },
                        { label: 'Other', icon: MapPin },
                      ].map(({ label, icon: Icon }) => {
                        const active = newAddressForm.type === label;
                        return (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            key={label}
                            type="button"
                            onClick={() => setNewAddressForm((prev) => ({ ...prev, type: label }))}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${active
                              ? 'border-zinc-900 bg-zinc-900 text-white shadow-2xs'
                              : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400'
                              }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            <span>{label}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
                    {defaultSavedAddresses.length > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setIsAddingNewAddress(false)}
                        className="h-11 px-5 rounded-lg border border-zinc-300 bg-white text-xs font-semibold uppercase tracking-wider text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                      >
                        Cancel
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="h-11 px-6 rounded-lg bg-zinc-900 hover:bg-black text-xs font-semibold uppercase tracking-wider text-white inline-flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                    >
                      <Check className="h-4 w-4 stroke-[2.5]" />
                      <span>Save & Deliver Here</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </section>

            {/* Step 3: Payment Options (Clean Official Razorpay Window + COD) */}
            <section className="rounded-xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-2xs">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-zinc-900 text-[11px] font-semibold text-white">
                    3
                  </span>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-900">
                    Payment Options
                  </h2>
                </div>

                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500">
                  <Lock className="h-3 w-3 text-emerald-600" />
                  <span>100% Secure Gateway</span>
                </span>
              </div>

              <div className="space-y-3">
                {/* 1. Pay Online via Official Razorpay Popup Window */}
                <div
                  onClick={() => setPaymentMethod('upi')}
                  className={`rounded-xl border p-4 transition-all cursor-pointer ${paymentMethod !== 'cod'
                    ? 'border-zinc-900 bg-zinc-50/60 ring-1 ring-zinc-900'
                    : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`mt-0.5 grid h-4 w-4 place-items-center rounded-full border shrink-0 transition-colors ${paymentMethod !== 'cod' ? 'border-zinc-900 bg-zinc-900' : 'border-zinc-300 bg-white'
                          }`}
                      >
                        {paymentMethod !== 'cod' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-zinc-900">
                            Pay Online (UPI, Cards, NetBanking, Wallets)
                          </span>
                          <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                            Extra 10% OFF
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 font-normal mt-1 leading-relaxed">
                          Instant & secure payment via UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, or NetBanking.
                        </p>
                      </div>
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white shrink-0">
                      <CreditCard className="h-4 w-4 text-zinc-700" />
                    </div>
                  </div>
                </div>

                {/* 2. Cash on Delivery (COD) */}
                <div
                  onClick={() => {
                    if (isCodAllowedForCart) {
                      setPaymentMethod('cod');
                    } else if (!isCodGloballyEnabled) {
                      toast.error('Cash on Delivery (COD) is currently unavailable on this store.');
                    } else if (rawSubtotal < codMinLimit) {
                      toast.error(`Minimum order of ₹${codMinLimit} required for COD`);
                    } else if (rawSubtotal > codMaxLimit) {
                      toast.error(`COD is not available for orders above ₹${codMaxLimit}. Please pay online.`);
                    }
                  }}
                  className={`rounded-xl border p-4 transition-all ${!isCodAllowedForCart
                    ? 'opacity-60 border-zinc-200 bg-zinc-50 cursor-not-allowed'
                    : paymentMethod === 'cod'
                      ? 'border-zinc-900 bg-zinc-50/60 ring-1 ring-zinc-900 cursor-pointer'
                      : 'border-zinc-200 bg-white hover:border-zinc-300 cursor-pointer'
                    }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`mt-0.5 grid h-4 w-4 place-items-center rounded-full border shrink-0 transition-colors ${paymentMethod === 'cod' && isCodAllowedForCart
                          ? 'border-zinc-900 bg-zinc-900'
                          : 'border-zinc-300 bg-white'
                          }`}
                      >
                        {paymentMethod === 'cod' && isCodAllowedForCart && (
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </div>

                      <div>
                        <span className="text-xs font-semibold text-zinc-900 block">
                          Cash on Delivery (COD)
                        </span>
                        <p className="text-[11px] text-zinc-500 font-normal mt-1">
                          {!isCodAllowedForCart
                            ? !isCodGloballyEnabled
                              ? 'Currently unavailable on this store'
                              : `Available for orders between ₹${codMinLimit} and ₹${codMaxLimit}`
                            : Number(shippingConfig?.cod_extra_charge) > 0
                              ? `Pay by Cash or UPI at the time of delivery (+₹${shippingConfig.cod_extra_charge} convenience fee)`
                              : 'Pay by Cash or UPI at the time of delivery'}
                        </p>
                      </div>
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white shrink-0">
                      <Wallet className="h-4 w-4 text-zinc-700" />
                    </div>
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
                  className="h-10 flex-1 border border-neutral-300 px-3 text-xs outline-none focus:border-neutral-900 uppercase "
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
