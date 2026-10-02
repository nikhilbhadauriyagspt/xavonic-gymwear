import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  MapPin,
  Navigation,
  Loader2,
  Search,
  ExternalLink,
  FileText,
  Printer,
  Download,
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

// Real E-commerce Brand SVG Vector Logos
const PhonePeLogo = () => (
  <svg viewBox="0 0 48 48" className="h-7 w-7 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="#5f259f"/>
    <path d="M29.5 14H21.2c-1.8 0-3.2 1.4-3.2 3.2v16.1c0 .9.7 1.7 1.6 1.7.9 0 1.6-.7 1.6-1.7v-6.2h4.5c4.7 0 8.5-3.8 8.5-8.5s-3.8-8.6-8.5-8.6zm0 10.9h-5.3v-5.6h5.3c1.5 0 2.8 1.3 2.8 2.8s-1.3 2.8-2.8 2.8z" fill="#fff"/>
    <path d="M29.5 25.5l-8.5 8.5" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

const GooglePayLogo = () => (
  <svg viewBox="0 0 48 48" className="h-7 w-7 shrink-0" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1"/>
    <path d="M24 13c2.6 0 5 .9 6.8 2.6l-2.9 2.9C26.7 17.4 25.4 16.8 24 16.8c-4 0-7.3 3.3-7.3 7.2s3.3 7.2 7.3 7.2c3.6 0 6.2-2.3 7-5.5H24v-3.8h11c.1.6.2 1.3.2 2 0 6.4-4.3 11-11.2 11C16.9 35 11 29.1 11 24S16.9 13 24 13z" fill="#4285F4"/>
    <path d="M32.8 17.5L29.9 20.4C28.5 19.2 26.5 18.5 24 18.5c-3.3 0-6.1 2.2-7.1 5.2l-3.4-2.7C15.4 16.6 19.3 13.8 24 13.8c3.3 0 6.1 1.2 8.8 3.7z" fill="#EA4335"/>
    <path d="M16.9 24.8c-.3-.8-.4-1.6-.4-2.5 0-.9.1-1.7.4-2.5l3.4 2.7c-.3.7-.4 1.5-.4 2.3 0 .8.1 1.6.4 2.3l-3.4-.3z" fill="#FBBC05"/>
    <path d="M24 32.2c2.4 0 4.4-.8 5.9-2.2l3.2 2.5C30.9 34.5 27.7 35.8 24 35.8c-4.7 0-8.6-2.8-10.5-6.8l3.4-2.7c1 3.1 3.8 5.9 7.1 5.9z" fill="#34A853"/>
  </svg>
);

const PaytmLogo = () => (
  <svg viewBox="0 0 48 48" className="h-7 w-7 shrink-0" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="#002E6E"/>
    <text x="24" y="27" fill="#00BAF2" fontSize="12" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif" textAnchor="middle" letterSpacing="-0.5">Paytm</text>
    <path d="M14 33h20" stroke="#00BAF2" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const BhimUpiLogo = () => (
  <svg viewBox="0 0 48 48" className="h-7 w-7 shrink-0" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1"/>
    <path d="M24 12l10 12-10 12-10-12z" fill="#097939"/>
    <path d="M24 12l10 12-5 6-10-6z" fill="#ed7524"/>
    <text x="24" y="27" fill="#ffffff" fontSize="7" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">UPI</text>
  </svg>
);

const VisaCardLogo = () => (
  <svg viewBox="0 0 38 24" className="h-5 w-8 rounded-xs" xmlns="http://www.w3.org/2000/svg">
    <rect width="38" height="24" rx="3" fill="#0F2080"/>
    <text x="19" y="16" fill="#fff" fontSize="11" fontStyle="italic" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.8">VISA</text>
  </svg>
);

const MastercardCardLogo = () => (
  <svg viewBox="0 0 38 24" className="h-5 w-8 rounded-xs" xmlns="http://www.w3.org/2000/svg">
    <rect width="38" height="24" rx="3" fill="#18181b"/>
    <circle cx="15" cy="12" r="7" fill="#EB001B"/>
    <circle cx="23" cy="12" r="7" fill="#F79E1B" fillOpacity="0.9"/>
  </svg>
);

const RupayCardLogo = () => (
  <svg viewBox="0 0 38 24" className="h-5 w-8 rounded-xs" xmlns="http://www.w3.org/2000/svg">
    <rect width="38" height="24" rx="3" fill="#ffffff" stroke="#e4e4e7" strokeWidth="1"/>
    <text x="19" y="15" fill="#00B050" fontSize="9" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">Ru<tspan fill="#F58220">Pay</tspan></text>
  </svg>
);

const AmexCardLogo = () => (
  <svg viewBox="0 0 38 24" className="h-5 w-8 rounded-xs" xmlns="http://www.w3.org/2000/svg">
    <rect width="38" height="24" rx="3" fill="#007BC1"/>
    <text x="19" y="15" fill="#fff" fontSize="7.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.5">AMEX</text>
  </svg>
);

const BankBadge = ({ name, code, color, bg }) => (
  <div className="flex items-center gap-2 p-2 border border-neutral-200 rounded-xs bg-white hover:border-neutral-900 transition-all cursor-pointer">
    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${bg}`}>
      {code}
    </div>
    <span className="text-xs font-medium text-neutral-800 line-clamp-1">{name}</span>
  </div>
);

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
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
  const { user, openAuth, addAddress } = useAuth();
  const { brand } = useBrand();

  // Razorpay Gateway State
  const [razorpayConfig, setRazorpayConfig] = useState({
    enabled: true,
    key_id: '',
    brand_name: 'Guidelya Activewear',
    theme_color: '#171717',
  });

  // Fetch Public Payment Gateway Config on Mount
  useEffect(() => {
    fetchPublicPaymentConfig().then((data) => {
      if (data && data.success && data.config) {
        setRazorpayConfig(data.config);
      }
    }).catch(() => {});
    loadRazorpayScript();
  }, []);

  // Stepper state: 'details' (Shipping & Payment) | 'confirmed' (Order Success)
  const [step, setStep] = useState('details');
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

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
        latitude: 28.4908,
        longitude: 77.0856,
      },
    ];
  }, [user]);

  const [selectedAddressId, setSelectedAddressId] = useState(
    defaultSavedAddresses[0]?.id || 'new'
  );
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

  // New Address Form with Lat/Lng
  const [newAddressForm, setNewAddressForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    addressLine: '',
    apartment: '',
    city: 'Gurugram',
    state: 'Haryana',
    pincode: '122002',
    type: 'Home',
    latitude: null,
    longitude: null,
    saveForFuture: true,
  });

  // GPS / Autocomplete state
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
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
      .catch(() => {});
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

                toast.success(`📍 GPS Location verified! (${locality}, ${postalCode})`);
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

            toast.success(`📍 Exact Live GPS captured! (${city} - ${pincode})`);
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

  // ⏳ Abandoned Cart Capture (Auto sync phone & cart to Admin WhatsApp recovery)
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
      }).catch(() => {});
    }, 2000);

    return () => clearTimeout(timer);
  }, [contactPhone, newAddressForm.phone, contactEmail, grandTotal, cartItems, step, selectedAddressId]);

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
      latitude: newAddressForm.latitude || null,
      longitude: newAddressForm.longitude || null,
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

  const showOrderSuccess = (order, selectedAddr) => {
    const fullConfirmedOrder = {
      id: order.orderNumber || order.id,
      date: 'Just now',
      status: order.orderStatus || 'Order Confirmed',
      statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      step: 1,
      estimatedDelivery: order.estimatedDelivery || (shippingMethod === 'priority' ? 'Tomorrow, by 8:00 PM' : 'Within 2–4 Business Days'),
      items: [...cartItems],
      subtotal: `₹${rawSubtotal.toLocaleString('en-IN')}`,
      discount: totalDiscount > 0 ? `₹${totalDiscount.toLocaleString('en-IN')}` : '₹0',
      shipping: shippingFee === 0 ? 'FREE' : `₹${shippingFee}`,
      total: `₹${grandTotal.toLocaleString('en-IN')}`,
      paymentMethod: order.paymentMethod || (paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Prepaid Online (Razorpay)'),
      paymentStatus: order.paymentStatus || (paymentMethod === 'cod' ? 'Pending' : 'Paid'),
      trackingNumber: order.trackingNumber || `XAV-${Math.floor(10000000 + Math.random() * 90000000)}`,
      courierPartner: order.courierPartner || 'Bluedart Express',
      shippingAddress: `${selectedAddr.name}, ${selectedAddr.addressLine}, ${selectedAddr.city}, ${selectedAddr.state} - ${selectedAddr.pincode} (Ph: ${selectedAddr.phone})`,
    };

    setConfirmedOrder(fullConfirmedOrder);
    setStep('confirmed');
    clearCart();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.success('Order Placed Successfully! Your athlete kit is being prepared.');
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      toast.error('Your bag is empty.');
      navigate('/collections');
      return;
    }

    const selectedAddr =
      defaultSavedAddresses.find((a) => a.id === selectedAddressId) || defaultSavedAddresses[0];

    if (!selectedAddr || !selectedAddr.name || !selectedAddr.addressLine || !selectedAddr.pincode) {
      toast.error('Please enter complete delivery address details.');
      return;
    }

    setIsProcessing(true);

    const payload = {
      user_id: user?.dbId || (typeof user?.id === 'number' ? user.id : null),
      customer_id: user?.customerId || (typeof user?.id === 'string' ? user.id : `GDL-${user?.dbId || '9842'}`),
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
      payment_method:
        paymentMethod === 'upi'
          ? `UPI (${selectedUpiApp.toUpperCase()})`
          : paymentMethod === 'card'
          ? 'Credit/Debit Card'
          : paymentMethod === 'netbanking'
          ? 'NetBanking'
          : 'Cash on Delivery (COD)',
      payment_status: paymentMethod === 'cod' ? 'Pending' : 'Pending',
      shipping_address: selectedAddr,
      save_address: true,
    };

    // Flow 1: Online Prepaid (Razorpay Native Modal / UPI App Intent)
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

        const options = {
          key: razorpayConfig.key_id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency || 'INR',
          name: razorpayConfig.brand_name || brand?.brand_name || 'Guidelya Activewear',
          description: `Checkout Order (${cartItems.length} items)`,
          image: brand?.logo_black || '/logo.png',
          order_id: razorpayOrder.id,
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
            color: razorpayConfig.theme_color || '#171717',
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
              toast.info('Payment was closed. You can complete it anytime.');
            },
          },
          handler: async function (response) {
            try {
              setIsProcessing(true);
              const verifyRes = await verifyClientPaymentAndPlaceOrder({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderPayload: {
                  ...payload,
                  payment_status: 'Paid',
                  transaction_id: response.razorpay_payment_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                },
              });

              if (verifyRes.success && verifyRes.order) {
                showOrderSuccess(verifyRes.order, selectedAddr);
              } else {
                toast.error(verifyRes.message || 'Payment received, but order confirmation had an issue. Please contact support.');
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
          toast.error(resp.error?.description || 'Payment Failed. Please try another card or UPI.');
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

          {/* Delivery & Shipping Info Card */}
          <div className="my-6 p-4 sm:p-5 bg-neutral-50 border border-neutral-200 rounded-xs space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-neutral-200 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-neutral-800" />
                <span className="font-semibold uppercase tracking-wider text-neutral-900">Estimated Delivery</span>
              </div>
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200 rounded-xs">
                {confirmedOrder.estimatedDelivery}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">Courier Partner</span>
                <span className="font-semibold text-neutral-900">{confirmedOrder.courierPartner}</span>
                <div className="text-[11px] font-mono text-neutral-600 mt-0.5">AWB: <b>{confirmedOrder.trackingNumber}</b></div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">Delivery Destination</span>
                <p className="text-neutral-700 leading-relaxed">{confirmedOrder.shippingAddress}</p>
              </div>
            </div>
          </div>

          {/* Ordered Items Summary */}
          <div className="space-y-3 border-b border-neutral-200 pb-6 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800">Order Items ({confirmedOrder.items.length})</h3>
              <span className="text-[11px] text-neutral-400 font-mono">Invoice #{confirmedOrder.id}</span>
            </div>

            <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-xs overflow-hidden">
              {confirmedOrder.items.map((it, idx) => (
                <div key={idx} className="p-3.5 flex items-center justify-between gap-4 hover:bg-neutral-50/50">
                  <div className="flex items-center gap-3">
                    <img src={it.image || it.imageFront || 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=120'} alt="" className="h-14 w-11 object-cover bg-neutral-100 rounded-xs border border-neutral-200 shrink-0" />
                    <div>
                      <h4 className="text-xs font-semibold text-neutral-900 line-clamp-1">{it.title}</h4>
                      <p className="text-[11px] text-neutral-500 font-mono">Size: {it.selectedSize || it.size || 'M'} • Qty: {it.quantity}</p>
                      <p className="text-[11px] text-neutral-400">Unit Price: ₹{Number(it.price).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-neutral-900 font-mono">₹{(it.price * it.quantity).toLocaleString('en-IN')}.00</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown & Totals */}
          <div className="py-4 border-b border-neutral-200 space-y-2 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>Bag Subtotal:</span>
              <span className="font-mono">{confirmedOrder.subtotal}</span>
            </div>
            {confirmedOrder.discount && confirmedOrder.discount !== '₹0' && (
              <div className="flex justify-between text-emerald-700">
                <span>Total Savings / Discount:</span>
                <span className="font-mono">- {confirmedOrder.discount}</span>
              </div>
            )}
            <div className="flex justify-between text-neutral-600">
              <span>Shipping Fee:</span>
              <span className="font-mono">{confirmedOrder.shipping}</span>
            </div>
            <div className="pt-2 border-t border-neutral-200 flex justify-between items-center text-neutral-950 font-bold text-sm">
              <span>Total Payable ({confirmedOrder.paymentMethod}):</span>
              <span className="text-base text-neutral-900 font-mono">{confirmedOrder.total}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-[11px] text-neutral-400">
              Need help with this order? Email us at <span className="text-neutral-800 font-medium">support@guidelya.com</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsInvoiceModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 border border-neutral-300 bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-neutral-900 hover:bg-neutral-50 transition-colors cursor-pointer rounded-xs shadow-2xs"
              >
                <FileText className="h-4 w-4 text-amber-500" />
                <span>Download Tax Invoice</span>
              </button>

              <button
                type="button"
                onClick={() => printOrderInvoice(confirmedOrder)}
                className="inline-flex items-center justify-center gap-1.5 border border-neutral-300 bg-neutral-100 px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider text-neutral-800 hover:bg-neutral-200 transition-colors cursor-pointer rounded-xs"
                title="Print Invoice / Save PDF"
              >
                <Printer className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Print</span>
              </button>

              <Link
                to="/collections"
                className="inline-flex items-center justify-center gap-2 bg-neutral-900 px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-white hover:bg-black transition-colors cursor-pointer rounded-xs shadow-2xs"
              >
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Tax Invoice Modal */}
          <OrderInvoiceModal
            order={confirmedOrder}
            isOpen={isInvoiceModalOpen}
            onClose={() => setIsInvoiceModalOpen(false)}
          />

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
                  {/* Quick GPS Auto-Detect Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 bg-neutral-900 text-white rounded-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-red-600/30 text-red-400 flex items-center justify-center shrink-0">
                        <Navigation className="h-3.5 w-3.5 animate-pulse" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold">Fast Delivery Auto-Detect</div>
                        <div className="text-[10px] text-neutral-400">Fetch exact live location, pin code, and city instantly</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleDetectLiveLocation}
                      disabled={isDetectingLocation}
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xs text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60 shrink-0"
                    >
                      {isDetectingLocation ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Detecting GPS...</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="h-3.5 w-3.5" />
                          <span>📍 Use Current Location</span>
                        </>
                      )}
                    </button>
                  </div>

                  {newAddressForm.latitude && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xs text-[11px] font-mono">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      <span>GPS Coordinates captured: <b>{newAddressForm.latitude.toFixed(5)}, {newAddressForm.longitude.toFixed(5)}</b></span>
                    </div>
                  )}

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
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-700">
                        Area, Street, Sector, Landmark *
                      </label>
                      <span className="text-[10px] text-neutral-400 font-normal">
                        🔍 Google Places search active
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        ref={autocompleteInputRef}
                        type="text"
                        required
                        value={newAddressForm.addressLine}
                        onChange={(e) => setNewAddressForm((prev) => ({ ...prev, addressLine: e.target.value }))}
                        placeholder="Search area, colony, or street name..."
                        className="h-10 w-full border border-neutral-300 pl-3 pr-8 text-xs outline-none focus:border-neutral-900"
                      />
                      <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
                    </div>
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
                <div className={`border transition-all rounded-xs overflow-hidden ${
                  paymentMethod === 'upi' ? 'border-neutral-900 bg-neutral-50/40 ring-1 ring-neutral-900' : 'border-neutral-200 bg-white hover:border-neutral-300'
                }`}>
                  <div
                    onClick={() => setPaymentMethod('upi')}
                    className="p-4 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`grid h-4 w-4 place-items-center rounded-full border shrink-0 ${
                        paymentMethod === 'upi' ? 'border-neutral-900 bg-neutral-900' : 'border-neutral-300 bg-white'
                      }`}>
                        {paymentMethod === 'upi' && <Check className="h-2.5 w-2.5 text-white stroke-[3]" />}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">UPI Instant 1-Tap & QR</span>
                          <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-xs tracking-wider">
                            EXTRA 10% OFF
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 font-normal mt-0.5">
                          Direct App launch on mobile or live dynamic QR scan.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pl-2">
                      <GooglePayLogo />
                      <PhonePeLogo />
                      <PaytmLogo />
                      <BhimUpiLogo />
                    </div>
                  </div>

                  {paymentMethod === 'upi' && (
                    <div className="border-t border-neutral-200 p-4 bg-white space-y-3.5 text-xs">
                      <span className="text-[11px] font-medium text-neutral-700 block">
                        Choose your preferred UPI method:
                      </span>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {[
                          { id: 'phonepe', name: 'PhonePe', Logo: PhonePeLogo, desc: '1-Tap Mobile' },
                          { id: 'gpay', name: 'Google Pay', Logo: GooglePayLogo, desc: '1-Tap Mobile' },
                          { id: 'paytm', name: 'Paytm UPI', Logo: PaytmLogo, desc: '1-Tap Mobile' },
                          { id: 'qr', name: 'Instant QR', Logo: BhimUpiLogo, desc: 'Scan & Pay' },
                        ].map(({ id, name, Logo, desc }) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setSelectedUpiApp(id)}
                            className={`p-3 border rounded-xs flex flex-col items-center text-center gap-1.5 transition-all cursor-pointer ${
                              selectedUpiApp === id
                                ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                                : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400 hover:bg-neutral-50'
                            }`}
                          >
                            <Logo />
                            <span className="font-semibold text-xs leading-none mt-1">{name}</span>
                            <span className={`text-[9px] ${selectedUpiApp === id ? 'text-neutral-300' : 'text-neutral-400'}`}>{desc}</span>
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xs">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>Zero payment gateway fee. Protected by 256-Bit NPCI Unified Payments security.</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Credit / Debit Cards */}
                <div className={`border transition-all rounded-xs overflow-hidden ${
                  paymentMethod === 'card' ? 'border-neutral-900 bg-neutral-50/40 ring-1 ring-neutral-900' : 'border-neutral-200 bg-white hover:border-neutral-300'
                }`}>
                  <div
                    onClick={() => setPaymentMethod('card')}
                    className="p-4 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`grid h-4 w-4 place-items-center rounded-full border shrink-0 ${
                        paymentMethod === 'card' ? 'border-neutral-900 bg-neutral-900' : 'border-neutral-300 bg-white'
                      }`}>
                        {paymentMethod === 'card' && <Check className="h-2.5 w-2.5 text-white stroke-[3]" />}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">Credit / Debit Cards</span>
                          <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-xs tracking-wider">
                            EXTRA 10% OFF
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 font-normal mt-0.5">
                          All Indian & International cards with 3D Secure OTP.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 pl-2">
                      <VisaCardLogo />
                      <MastercardCardLogo />
                      <RupayCardLogo />
                      <AmexCardLogo />
                    </div>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="border-t border-neutral-200 p-4 bg-white space-y-3 text-xs">
                      <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xs flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="font-semibold text-neutral-900 block text-xs">Direct Bank Card Gateway</span>
                          <p className="text-[11px] text-neutral-600">Enter card details securely via 100% RBI & PCI-DSS compliant checkout window with instant bank OTP.</p>
                        </div>
                        <CreditCard className="h-8 w-8 text-neutral-400 shrink-0 ml-3" />
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. NetBanking */}
                <div className={`border transition-all rounded-xs overflow-hidden ${
                  paymentMethod === 'netbanking' ? 'border-neutral-900 bg-neutral-50/40 ring-1 ring-neutral-900' : 'border-neutral-200 bg-white hover:border-neutral-300'
                }`}>
                  <div
                    onClick={() => setPaymentMethod('netbanking')}
                    className="p-4 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`grid h-4 w-4 place-items-center rounded-full border shrink-0 ${
                        paymentMethod === 'netbanking' ? 'border-neutral-900 bg-neutral-900' : 'border-neutral-300 bg-white'
                      }`}>
                        {paymentMethod === 'netbanking' && <Check className="h-2.5 w-2.5 text-white stroke-[3]" />}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">NetBanking</span>
                          <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-xs tracking-wider">
                            EXTRA 10% OFF
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 font-normal mt-0.5">
                          SBI, HDFC, ICICI, Axis, Kotak, PNB & 50+ other Indian Banks.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-500">
                      <span className="hidden sm:inline">50+ Banks</span>
                      <ShieldCheck className="h-4 w-4 text-neutral-700" />
                    </div>
                  </div>

                  {paymentMethod === 'netbanking' && (
                    <div className="border-t border-neutral-200 p-4 bg-white space-y-3 text-xs">
                      <span className="text-[11px] font-medium text-neutral-700 block">Popular Banks:</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <BankBadge name="HDFC Bank" code="HDFC" bg="bg-blue-800" />
                        <BankBadge name="State Bank of India" code="SBI" bg="bg-sky-600" />
                        <BankBadge name="ICICI Bank" code="ICICI" bg="bg-amber-700" />
                        <BankBadge name="Axis Bank" code="AXIS" bg="bg-rose-800" />
                        <BankBadge name="Kotak Mahindra" code="KOTAK" bg="bg-red-600" />
                        <BankBadge name="Punjab National Bank" code="PNB" bg="bg-yellow-700" />
                      </div>
                      <p className="text-[10px] text-neutral-500 pt-1">
                        Select any bank during the secure payment authorization.
                      </p>
                    </div>
                  )}
                </div>

                {/* 4. Cash on Delivery (COD) */}
                <div className={`border transition-all rounded-xs overflow-hidden ${
                  !isCodAllowedForCart
                    ? 'opacity-60 bg-neutral-100 border-neutral-200 cursor-not-allowed'
                    : paymentMethod === 'cod'
                    ? 'border-neutral-900 bg-neutral-50/40 ring-1 ring-neutral-900 cursor-pointer'
                    : 'border-neutral-200 bg-white cursor-pointer hover:border-neutral-300'
                }`}>
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
                    className="p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`grid h-4 w-4 place-items-center rounded-full border shrink-0 ${
                        paymentMethod === 'cod' && isCodAllowedForCart ? 'border-neutral-900 bg-neutral-900' : 'border-neutral-300 bg-white'
                      }`}>
                        {paymentMethod === 'cod' && isCodAllowedForCart && <Check className="h-2.5 w-2.5 text-white stroke-[3]" />}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">Cash on Delivery (COD)</span>
                          {!isCodAllowedForCart ? (
                            <span className="bg-neutral-200 text-neutral-700 text-[9px] font-bold px-1.5 py-0.5 rounded-xs tracking-wider">
                              {!isCodGloballyEnabled ? 'DISABLED' : `CART LIMIT`}
                            </span>
                          ) : Number(shippingConfig?.cod_extra_charge) > 0 ? (
                            <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded-xs tracking-wider">
                              +₹{shippingConfig.cod_extra_charge} COD FEE
                            </span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded-xs tracking-wider">
                              FREE COD
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500 font-normal mt-0.5">
                          {!isCodAllowedForCart
                            ? !isCodGloballyEnabled
                              ? 'COD is temporarily disabled. Please choose UPI or Card.'
                              : `Available for orders between ₹${codMinLimit} and ₹${codMaxLimit}.`
                            : Number(shippingConfig?.cod_extra_charge) > 0
                            ? `Pay in cash or scan QR upon delivery (+₹${shippingConfig.cod_extra_charge} handling charge).`
                            : 'Pay in cash or scan QR upon delivery with 0 extra fees.'}
                        </p>
                      </div>
                    </div>
                    <Wallet className="h-5 w-5 text-neutral-600 shrink-0" />
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
