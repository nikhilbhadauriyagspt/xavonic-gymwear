import React, { useState, useEffect } from 'react';
import { 
  Percent, 
  Tag, 
  Zap, 
  ShoppingBag, 
  Gift, 
  Save, 
  RefreshCw, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  CreditCard 
} from 'lucide-react';
import { toast } from 'sonner';
import { ADMIN_API_BASE } from '../../config/api';

export default function OffersDiscountsTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Global Offers Config State
  const [config, setConfig] = useState({
    bundle_offers_enabled: true,
    bundle_headline: 'No Soft Fits Allowed.',
    bundle_buy_2_discount: 5,
    bundle_buy_3_discount: 10,
    bundle_buy_4_discount: 15,
    prepaid_discount_enabled: true,
    prepaid_discount_percent: 10,
    prepaid_discount_label: 'Extra 10% OFF on prepaid orders',
    new_user_discount_enabled: true,
    new_user_discount_amount: 150,
    free_shipping_threshold: 999,
    cart_tier_1_min: 1999,
    cart_tier_1_discount: 200,
    cart_tier_2_min: 2999,
    cart_tier_2_discount: 500,
    coupons: [
      { code: 'VIP10', discount_type: 'percent', value: 10, min_cart: 999, description: '10% OFF on all activewear' },
      { code: 'PUMP200', discount_type: 'flat', value: 200, min_cart: 1499, description: 'Flat ₹200 OFF on orders above ₹1499' }
    ]
  });

  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount_type: 'percent',
    value: 10,
    min_cart: 999,
    description: ''
  });

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ADMIN_API_BASE}/settings/offers`);
      const data = await res.json();
      if (data.success && data.config) {
        setConfig(prev => ({ ...prev, ...data.config }));
      }
    } catch (err) {
      toast.error('Failed to load global offers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('xavonic_admin_token');
      const res = await fetch(`${ADMIN_API_BASE}/settings/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Global Offers & Discounts settings saved to database!');
      } else {
        toast.error(data.message || 'Failed to save');
      }
    } catch (err) {
      toast.error('Could not connect to backend server');
    } finally {
      setSaving(false);
    }
  };

  const addCoupon = () => {
    if (!newCoupon.code.trim()) {
      toast.error('Coupon code is required');
      return;
    }
    const cleanCode = newCoupon.code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    setConfig(prev => ({
      ...prev,
      coupons: [...prev.coupons, { ...newCoupon, code: cleanCode }]
    }));
    setNewCoupon({
      code: '',
      discount_type: 'percent',
      value: 10,
      min_cart: 999,
      description: ''
    });
    toast.success(`Coupon ${cleanCode} added`);
  };

  const removeCoupon = (idx) => {
    setConfig(prev => ({
      ...prev,
      coupons: prev.coupons.filter((_, i) => i !== idx)
    }));
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-neutral-400 bg-white border border-neutral-200 rounded-sm">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-neutral-900 mb-2" />
        <span className="text-xs">Loading Global Offers & Discounts Engine...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6 font-sans pb-12">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 border border-neutral-200 rounded-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-neutral-900">
              Global Offers & Discounts Engine
            </h2>
            <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-xs border border-emerald-200">
              Live Engine
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Centrally manage Volume Bundles (Buy 2/3), Prepaid Deals, Cart Value Tiers, and Promo Coupons
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 bg-neutral-900 hover:bg-red-600 text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>Save Changes</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        
        {/* ======================================================== */}
        {/* CARD 1: VOLUME BUNDLE OFFERS (BUY MORE, SAVE MORE)       */}
        {/* ======================================================== */}
        <div className="bg-white p-5 border border-neutral-200 rounded-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-neutral-800" />
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
                  1. Product Detail Page Volume Bundles (Buy More, Save More)
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Controls the "Buy 1 / Buy 2 / Buy 3" interactive tier box on all Product Pages
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.bundle_offers_enabled}
                onChange={(e) => setConfig({ ...config, bundle_offers_enabled: e.target.checked })}
                className="w-4 h-4 rounded-xs accent-neutral-900"
              />
              <span className="text-xs font-semibold text-neutral-800">
                {config.bundle_offers_enabled ? 'Bundle Deals ON' : 'Deals OFF'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-4 space-y-1">
              <label className="text-[11px] font-medium text-neutral-700">Bundle Box Tagline / Headline</label>
              <input
                type="text"
                value={config.bundle_headline}
                onChange={(e) => setConfig({ ...config, bundle_headline: e.target.value })}
                placeholder="e.g. No Soft Fits Allowed."
                className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 rounded-sm px-3 py-1.5 text-xs text-neutral-900 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-neutral-700">Buy 1 Quantity</label>
              <input
                type="text"
                disabled
                value="Regular Unit Price"
                className="w-full bg-neutral-100 border border-neutral-200 rounded-sm px-3 py-1.5 text-xs text-neutral-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-neutral-700">Buy 2 Discount (%)</label>
              <div className="relative">
                <input
                  type="number"
                  value={config.bundle_buy_2_discount}
                  onChange={(e) => setConfig({ ...config, bundle_buy_2_discount: Number(e.target.value) })}
                  className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 rounded-sm px-3 py-1.5 text-xs font-semibold text-neutral-900 outline-none pr-7 font-mono"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400">%</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-neutral-700">Buy 3 Discount (%)</label>
              <div className="relative">
                <input
                  type="number"
                  value={config.bundle_buy_3_discount}
                  onChange={(e) => setConfig({ ...config, bundle_buy_3_discount: Number(e.target.value) })}
                  className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 rounded-sm px-3 py-1.5 text-xs font-semibold text-neutral-900 outline-none pr-7 font-mono"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400">%</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-neutral-700">Buy 4+ Discount (%)</label>
              <div className="relative">
                <input
                  type="number"
                  value={config.bundle_buy_4_discount}
                  onChange={(e) => setConfig({ ...config, bundle_buy_4_discount: Number(e.target.value) })}
                  className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 rounded-sm px-3 py-1.5 text-xs font-semibold text-neutral-900 outline-none pr-7 font-mono"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARD 2: PREPAID & FIRST ORDER INCENTIVES                 */}
        {/* ======================================================== */}
        <div className="bg-white p-5 border border-neutral-200 rounded-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-neutral-800" />
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
                  2. Prepaid Payment & New Customer Discounts
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Automated discounts applied at cart and checkout for UPI/Cards and first-time signups
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Prepaid Rule */}
            <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-900">Prepaid Orders Discount</span>
                <input
                  type="checkbox"
                  checked={config.prepaid_discount_enabled}
                  onChange={(e) => setConfig({ ...config, prepaid_discount_enabled: e.target.checked })}
                  className="w-4 h-4 rounded-xs accent-neutral-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-600">Discount Percentage (%)</label>
                <input
                  type="number"
                  value={config.prepaid_discount_percent}
                  onChange={(e) => setConfig({ ...config, prepaid_discount_percent: Number(e.target.value) })}
                  className="w-full bg-white border border-neutral-200 rounded-sm px-3 py-1.5 text-xs font-semibold text-emerald-700 outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-600">Badge Banner Text</label>
                <input
                  type="text"
                  value={config.prepaid_discount_label}
                  onChange={(e) => setConfig({ ...config, prepaid_discount_label: e.target.value })}
                  className="w-full bg-white border border-neutral-200 rounded-sm px-3 py-1.5 text-xs text-neutral-800 outline-none"
                />
              </div>
            </div>

            {/* New Customer Rule */}
            <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-900">New User 1st Order Bonus</span>
                <input
                  type="checkbox"
                  checked={config.new_user_discount_enabled}
                  onChange={(e) => setConfig({ ...config, new_user_discount_enabled: e.target.checked })}
                  className="w-4 h-4 rounded-xs accent-neutral-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-600">Flat Discount Amount (₹)</label>
                <input
                  type="number"
                  value={config.new_user_discount_amount}
                  onChange={(e) => setConfig({ ...config, new_user_discount_amount: Number(e.target.value) })}
                  className="w-full bg-white border border-neutral-200 rounded-sm px-3 py-1.5 text-xs font-semibold text-emerald-700 outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-600">Free Shipping Min Order Value (₹)</label>
                <input
                  type="number"
                  value={config.free_shipping_threshold}
                  onChange={(e) => setConfig({ ...config, free_shipping_threshold: Number(e.target.value) })}
                  className="w-full bg-white border border-neutral-200 rounded-sm px-3 py-1.5 text-xs text-neutral-800 outline-none font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARD 3: CART VALUE TIER DISCOUNTS (SPEND MORE, GET MORE) */}
        {/* ======================================================== */}
        <div className="bg-white p-5 border border-neutral-200 rounded-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <ShoppingBag className="w-4 h-4 text-neutral-800" />
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
                3. Cart Value Thresholds (Spend More, Save More)
              </h3>
              <p className="text-[11px] text-neutral-500">
                Automatic milestone discounts added when customer order total crosses threshold
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-sm flex items-center justify-between gap-3">
              <div className="space-y-1 flex-1">
                <label className="text-[11px] font-medium text-neutral-600">Tier 1 Cart Min Value (₹)</label>
                <input
                  type="number"
                  value={config.cart_tier_1_min}
                  onChange={(e) => setConfig({ ...config, cart_tier_1_min: Number(e.target.value) })}
                  className="w-full bg-white border border-neutral-200 rounded-sm px-3 py-1.5 text-xs font-mono"
                />
              </div>
              <div className="space-y-1 flex-1">
                <label className="text-[11px] font-medium text-neutral-600">Tier 1 Instant Off (₹)</label>
                <input
                  type="number"
                  value={config.cart_tier_1_discount}
                  onChange={(e) => setConfig({ ...config, cart_tier_1_discount: Number(e.target.value) })}
                  className="w-full bg-white border border-neutral-200 rounded-sm px-3 py-1.5 text-xs font-semibold text-emerald-700 font-mono"
                />
              </div>
            </div>

            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-sm flex items-center justify-between gap-3">
              <div className="space-y-1 flex-1">
                <label className="text-[11px] font-medium text-neutral-600">Tier 2 Cart Min Value (₹)</label>
                <input
                  type="number"
                  value={config.cart_tier_2_min}
                  onChange={(e) => setConfig({ ...config, cart_tier_2_min: Number(e.target.value) })}
                  className="w-full bg-white border border-neutral-200 rounded-sm px-3 py-1.5 text-xs font-mono"
                />
              </div>
              <div className="space-y-1 flex-1">
                <label className="text-[11px] font-medium text-neutral-600">Tier 2 Instant Off (₹)</label>
                <input
                  type="number"
                  value={config.cart_tier_2_discount}
                  onChange={(e) => setConfig({ ...config, cart_tier_2_discount: Number(e.target.value) })}
                  className="w-full bg-white border border-neutral-200 rounded-sm px-3 py-1.5 text-xs font-semibold text-emerald-700 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARD 4: PROMO COUPONS MANAGER                            */}
        {/* ======================================================== */}
        <div className="bg-white p-5 border border-neutral-200 rounded-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <Tag className="w-4 h-4 text-neutral-800" />
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
                4. Store Promo Coupons
              </h3>
              <p className="text-[11px] text-neutral-500">
                Active promo codes customers can enter in Cart Drawer and Checkout
              </p>
            </div>
          </div>

          {/* New Coupon Input Form */}
          <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-sm space-y-3">
            <span className="text-xs font-semibold text-neutral-900 block">Create New Coupon</span>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-medium text-neutral-600">Coupon Code</label>
                <input
                  type="text"
                  placeholder="e.g. VIP20"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                  className="w-full bg-white border border-neutral-200 rounded-sm px-2.5 py-1.5 text-xs uppercase font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-medium text-neutral-600">Discount Type</label>
                <select
                  value={newCoupon.discount_type}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discount_type: e.target.value })}
                  className="w-full bg-white border border-neutral-200 rounded-sm px-2.5 py-1.5 text-xs"
                >
                  <option value="percent">Percentage (%)</option>
                  <option value="flat">Flat Amount (₹)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-medium text-neutral-600">Value (% or ₹)</label>
                <input
                  type="number"
                  value={newCoupon.value}
                  onChange={(e) => setNewCoupon({ ...newCoupon, value: Number(e.target.value) })}
                  className="w-full bg-white border border-neutral-200 rounded-sm px-2.5 py-1.5 text-xs font-mono font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-medium text-neutral-600">Min Cart (₹)</label>
                <input
                  type="number"
                  value={newCoupon.min_cart}
                  onChange={(e) => setNewCoupon({ ...newCoupon, min_cart: Number(e.target.value) })}
                  className="w-full bg-white border border-neutral-200 rounded-sm px-2.5 py-1.5 text-xs font-mono"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={addCoupon}
                  className="w-full h-8.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-sm flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Coupon
                </button>
              </div>
            </div>
          </div>

          {/* Active Coupons List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {config.coupons?.map((cp, idx) => (
              <div 
                key={idx}
                className="p-3 border border-neutral-200 rounded-sm bg-white flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-neutral-900 text-white font-mono text-xs font-bold rounded-xs tracking-wider">
                      {cp.code}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700">
                      {cp.discount_type === 'percent' ? `${cp.value}% OFF` : `₹${cp.value} OFF`}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    Min Order: ₹{cp.min_cart} {cp.description ? `• ${cp.description}` : ''}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeCoupon(idx)}
                  className="text-neutral-400 hover:text-red-600 p-1 cursor-pointer"
                  title="Remove Coupon"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-2.5 bg-neutral-900 hover:bg-red-600 text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save All Global Offers</span>
          </button>
        </div>

      </form>

    </div>
  );
}
