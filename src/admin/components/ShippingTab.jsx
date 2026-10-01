import React, { useState, useEffect } from 'react';
import {
  Truck,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  IndianRupee,
  ShieldCheck,
  Zap,
  PackageCheck,
  Ban,
  Clock,
  Sliders,
  DollarSign,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { ADMIN_API_BASE } from '../../config/api';

export default function ShippingTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [shippingConfig, setShippingConfig] = useState({
    free_shipping_threshold: 999,
    standard_shipping_charge: 99,
    cod_enabled: true,
    cod_extra_charge: 0,
    cod_min_order: 0,
    cod_max_order: 15000,
    estimated_delivery_days: '2-4 Business Days',
    courier_partner: 'Bluedart Express',
    express_shipping_enabled: false,
    express_shipping_charge: 149,
  });

  // Fetch live shipping settings
  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${ADMIN_API_BASE}/settings/shipping`);
      const data = await res.json();
      if (data.success && data.config) {
        setShippingConfig(data.config);
      }
    } catch (err) {
      toast.error('Failed to load shipping settings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Save Shipping Settings
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('xavonic_admin_token');
      const res = await fetch(`${ADMIN_API_BASE}/settings/shipping`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(shippingConfig),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Shipping & COD settings saved successfully!');
      } else {
        toast.error(data.message || 'Could not save shipping settings');
      }
    } catch (err) {
      toast.error('Network error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto font-sans">
      {/* 1. Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
              Shipping & Delivery Settings
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-full">
              Live Gateway
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Configure free shipping thresholds, standard delivery charges, and Cash on Delivery (COD) rules.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchConfig}
            className="p-2 border border-neutral-200 hover:bg-neutral-100 text-neutral-600 rounded-sm transition-colors cursor-pointer"
            title="Refresh Settings"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 2. FREE SHIPPING THRESHOLD & STANDARD CHARGE */}
        <div className="bg-white rounded-sm border border-neutral-200 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-sm">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Free Shipping & Standard Rates</h3>
                <p className="text-xs text-neutral-500">
                  Orders meeting or exceeding the threshold automatically receive FREE shipping.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xs border border-emerald-200">
              Threshold: ₹{shippingConfig.free_shipping_threshold}
            </span>
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-700 mb-1">
                  Free Shipping Threshold (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={shippingConfig.free_shipping_threshold}
                    onChange={(e) =>
                      setShippingConfig({
                        ...shippingConfig,
                        free_shipping_threshold: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full pl-8 pr-3 py-2 border border-neutral-300 rounded-xs text-xs font-mono font-semibold outline-none focus:border-neutral-900"
                  />
                </div>
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  Customers with cart subtotal ≥ ₹{shippingConfig.free_shipping_threshold} get Free Shipping.
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-700 mb-1">
                  Standard Shipping Fee Below Threshold (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={shippingConfig.standard_shipping_charge}
                    onChange={(e) =>
                      setShippingConfig({
                        ...shippingConfig,
                        standard_shipping_charge: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full pl-8 pr-3 py-2 border border-neutral-300 rounded-xs text-xs font-mono font-semibold outline-none focus:border-neutral-900"
                  />
                </div>
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  Applied to orders with cart value below ₹{shippingConfig.free_shipping_threshold}. (Set 0 for Free Shipping on all orders)
                </span>
              </div>
            </div>

            {/* Live Visual Preview Simulator */}
            <div className="p-3.5 bg-neutral-50 rounded-sm border border-neutral-200 text-xs space-y-2">
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">
                Storefront Customer Experience Preview
              </span>
              <div className="flex items-center justify-between text-[11px] font-medium text-neutral-800">
                <span>Cart Goal Tracker:</span>
                <span>
                  {shippingConfig.free_shipping_threshold === 0
                    ? '🎉 FREE Shipping on all orders!'
                    : `Add items to reach ₹${shippingConfig.free_shipping_threshold} for FREE delivery`}
                </span>
              </div>
              <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full w-2/3 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* 3. CASH ON DELIVERY (COD) RULES & SURCHARGES */}
        <div className="bg-white rounded-sm border border-neutral-200 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 text-blue-700 rounded-sm">
                <PackageCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Cash on Delivery (COD) Controls</h3>
                <p className="text-xs text-neutral-500">
                  Manage COD payment availability, optional handling surcharge, and order limits.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setShippingConfig({
                  ...shippingConfig,
                  cod_enabled: !shippingConfig.cod_enabled,
                })
              }
              className={`px-3 py-1.5 rounded-xs text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                shippingConfig.cod_enabled
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              {shippingConfig.cod_enabled ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>COD ACTIVE</span>
                </>
              ) : (
                <>
                  <Ban className="w-3.5 h-3.5" />
                  <span>COD DISABLED</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            {!shippingConfig.cod_enabled && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xs text-xs text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  <strong>Notice:</strong> COD is currently disabled. Customers will only be able to pay via UPI, Credit/Debit Cards, or Net Banking.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-700 mb-1">
                  COD Handling Surcharge (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={shippingConfig.cod_extra_charge}
                    onChange={(e) =>
                      setShippingConfig({
                        ...shippingConfig,
                        cod_extra_charge: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full pl-8 pr-3 py-2 border border-neutral-300 rounded-xs text-xs font-mono font-semibold outline-none focus:border-neutral-900"
                  />
                </div>
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  Extra fee added if customer selects COD (Set 0 for Free COD).
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-700 mb-1">
                  Minimum Cart for COD (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={shippingConfig.cod_min_order}
                    onChange={(e) =>
                      setShippingConfig({
                        ...shippingConfig,
                        cod_min_order: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full pl-8 pr-3 py-2 border border-neutral-300 rounded-xs text-xs font-mono font-semibold outline-none focus:border-neutral-900"
                  />
                </div>
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  Orders below this cannot use COD (Default: 0).
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-700 mb-1">
                  Maximum Cart Limit for COD (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="1"
                    value={shippingConfig.cod_max_order}
                    onChange={(e) =>
                      setShippingConfig({
                        ...shippingConfig,
                        cod_max_order: Number(e.target.value) || 15000,
                      })
                    }
                    className="w-full pl-8 pr-3 py-2 border border-neutral-300 rounded-xs text-xs font-mono font-semibold outline-none focus:border-neutral-900"
                  />
                </div>
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  Prevents high-risk fraud COD orders above this value.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. LOGISTICS & COURIER PARTNER */}
        <div className="bg-white rounded-sm border border-neutral-200 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-50 text-purple-700 rounded-sm">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Courier & Estimated Delivery Timeline</h3>
                <p className="text-xs text-neutral-500">
                  Displayed on product detail pages, checkout summary, and order confirmation invoices.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-700 mb-1">
                  Primary Courier Partner
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bluedart Express / Delhivery"
                  value={shippingConfig.courier_partner}
                  onChange={(e) =>
                    setShippingConfig({
                      ...shippingConfig,
                      courier_partner: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xs text-xs font-medium outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-700 mb-1">
                  Estimated Delivery Timeline Display
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2–4 Business Days"
                  value={shippingConfig.estimated_delivery_days}
                  onChange={(e) =>
                    setShippingConfig({
                      ...shippingConfig,
                      estimated_delivery_days: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xs text-xs font-medium outline-none focus:border-neutral-900"
                />
              </div>
            </div>

            {/* Express Shipping Option */}
            <div className="pt-3 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-neutral-900 block">Priority / Express Shipping Option</span>
                <span className="text-[11px] text-neutral-500">
                  Offer customers a 24-hour dispatch priority delivery upgrade at checkout.
                </span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="Fee (₹)"
                  value={shippingConfig.express_shipping_charge}
                  onChange={(e) =>
                    setShippingConfig({
                      ...shippingConfig,
                      express_shipping_charge: Number(e.target.value) || 149,
                    })
                  }
                  className="w-24 px-2.5 py-1.5 border border-neutral-300 rounded-xs text-xs font-mono font-semibold outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShippingConfig({
                      ...shippingConfig,
                      express_shipping_enabled: !shippingConfig.express_shipping_enabled,
                    })
                  }
                  className={`px-3 py-1.5 rounded-xs text-xs font-bold border transition-colors cursor-pointer ${
                    shippingConfig.express_shipping_enabled
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {shippingConfig.express_shipping_enabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Save Button Toolbar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-xs transition-colors flex items-center gap-2 cursor-pointer shadow-md"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Rules...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Shipping & COD Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
