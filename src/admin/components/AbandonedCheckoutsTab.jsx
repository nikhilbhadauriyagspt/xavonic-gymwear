import React, { useState, useEffect } from 'react';
import {
  Clock,
  Search,
  RefreshCw,
  Phone,
  Mail,
  ShoppingBag,
  ExternalLink,
  Percent,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Tag,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchAdminAbandonedCheckouts, sendAdminAbandonedWhatsApp } from '../../services/orderService';

export default function AbandonedCheckoutsTab() {
  const [checkouts, setCheckouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'recovered'
  const [sendingId, setSendingId] = useState(null);
  const [selectedCheckout, setSelectedCheckout] = useState(null);
  const [recoveryCoupon, setRecoveryCoupon] = useState('EXTRA5');

  const loadAbandonedCheckouts = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminAbandonedCheckouts();
      if (res && res.success) {
        setCheckouts(res.checkouts || []);
      } else {
        toast.error('Failed to load abandoned carts');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error loading abandoned checkouts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAbandonedCheckouts();
  }, []);

  const filteredCheckouts = checkouts.filter((item) => {
    const matchesSearch =
      item.customer_phone?.toLowerCase().includes(search.toLowerCase()) ||
      item.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      item.customer_email?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === 'pending') return !item.is_recovered;
    if (filter === 'recovered') return item.is_recovered;
    return true;
  });

  // Calculate Metrics
  const totalValue = checkouts.reduce((acc, c) => acc + Number(c.cart_total || 0), 0);
  const recoveredValue = checkouts
    .filter((c) => c.is_recovered)
    .reduce((acc, c) => acc + Number(c.cart_total || 0), 0);
  const recoveryRate = checkouts.length ? Math.round((checkouts.filter((c) => c.is_recovered).length / checkouts.length) * 100) : 0;

  const handleSendWhatsApp = async (item) => {
    setSendingId(item.id);
    try {
      const res = await sendAdminAbandonedWhatsApp(item.id, recoveryCoupon);
      if (res && res.success) {
        toast.success(`WhatsApp recovery message generated! Opening chat...`);
        if (res.whatsappUrl) {
          window.open(res.whatsappUrl, '_blank');
        }
        loadAbandonedCheckouts();
      } else {
        toast.error(res?.message || 'Failed to trigger recovery');
      }
    } catch (err) {
      toast.error('Error sending WhatsApp message');
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Abandoned Checkout Recovery
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
              WhatsApp Automation
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Capture shoppers who dropped off at checkout. Send instant 1-click WhatsApp discount links to boost conversion by 20–30%.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAbandonedCheckouts}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-neutral-50 text-neutral-700 rounded-sm border border-neutral-200 text-xs font-medium transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-sm border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500 font-medium">Abandoned Carts</span>
            <div className="p-1.5 bg-amber-50 rounded-xs text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">{checkouts.length}</span>
            <span className="text-[11px] text-neutral-400">Total dropped</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-sm border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500 font-medium">Potential Lost Revenue</span>
            <div className="p-1.5 bg-red-50 rounded-xs text-red-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">₹{totalValue.toLocaleString('en-IN')}</span>
            <span className="text-[11px] text-red-500 font-medium">In Cart</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-sm border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500 font-medium">Recovered Revenue</span>
            <div className="p-1.5 bg-emerald-50 rounded-xs text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">₹{recoveredValue.toLocaleString('en-IN')}</span>
            <span className="text-[11px] text-emerald-600 font-medium">Win-back</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-sm border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500 font-medium">Recovery Rate</span>
            <div className="p-1.5 bg-indigo-50 rounded-xs text-indigo-600">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">{recoveryRate}%</span>
            <span className="text-[11px] text-indigo-600 font-medium">Target 25%+</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-sm border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by customer phone, name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-sm focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="inline-flex rounded-sm border border-neutral-200 p-0.5 bg-neutral-50 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-xs font-medium transition-colors cursor-pointer ${
                filter === 'all' ? 'bg-white shadow-xs text-neutral-900 font-semibold' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              All ({checkouts.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded-xs font-medium transition-colors cursor-pointer ${
                filter === 'pending' ? 'bg-white shadow-xs text-amber-700 font-semibold' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Pending ({checkouts.filter((c) => !c.is_recovered).length})
            </button>
            <button
              onClick={() => setFilter('recovered')}
              className={`px-3 py-1 rounded-xs font-medium transition-colors cursor-pointer ${
                filter === 'recovered' ? 'bg-white shadow-xs text-emerald-700 font-semibold' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Recovered ({checkouts.filter((c) => c.is_recovered).length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Abandoned Checkouts List */}
      <div className="bg-white rounded-sm border border-neutral-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-500 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin text-neutral-400" />
            Loading abandoned carts...
          </div>
        ) : filteredCheckouts.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500 flex flex-col items-center justify-center gap-2">
            <ShoppingBag className="h-8 w-8 text-neutral-300" />
            <p className="font-semibold text-neutral-700">No abandoned checkouts found</p>
            <p className="text-neutral-400 max-w-sm">
              Great news! When a customer enters their phone number at checkout and drops off, they will automatically appear here with a 1-click WhatsApp recovery link.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filteredCheckouts.map((item) => {
              let items = [];
              try {
                items = typeof item.cart_items === 'string' ? JSON.parse(item.cart_items) : item.cart_items || [];
              } catch (e) {
                items = [];
              }

              const formattedPhone = (item.customer_phone || '').replace(/\D/g, '');
              const cleanPhone = formattedPhone.startsWith('91') ? formattedPhone : `91${formattedPhone}`;

              return (
                <div key={item.id} className="p-4 sm:p-5 hover:bg-neutral-50/50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Left: Customer & Dropped Time Info */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-neutral-900">
                          {item.customer_name || 'Guest Shopper'}
                        </span>
                        {item.is_recovered ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" /> Recovered Order
                          </span>
                        ) : item.recovery_sent_at ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-blue-50 text-blue-700 text-[10px] font-medium border border-blue-200">
                            <Send className="h-3 w-3" /> WhatsApp Sent ({new Date(item.recovery_sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                            <Clock className="h-3 w-3" /> Needs Recovery
                          </span>
                        )}
                        <span className="text-[11px] text-neutral-400">
                          Dropped off {new Date(item.created_at || item.updated_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-neutral-600 flex-wrap">
                        {item.customer_phone && (
                          <span className="inline-flex items-center gap-1 font-mono text-neutral-800 font-medium">
                            <Phone className="h-3.5 w-3.5 text-neutral-400" />
                            {item.customer_phone}
                          </span>
                        )}
                        {item.customer_email && (
                          <span className="inline-flex items-center gap-1 text-neutral-500">
                            <Mail className="h-3.5 w-3.5 text-neutral-400" />
                            {item.customer_email}
                          </span>
                        )}
                        {item.address_summary && (
                          <span className="text-[11px] text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-xs">
                            📍 {item.address_summary}
                          </span>
                        )}
                      </div>

                      {/* Items Preview */}
                      <div className="pt-2 flex items-center gap-2 flex-wrap">
                        {items.slice(0, 4).map((it, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-white border border-neutral-200 rounded-sm p-1.5 shadow-2xs">
                            {it.image && (
                              <img src={it.image} alt={it.name} className="h-8 w-8 object-cover rounded-xs" />
                            )}
                            <div className="text-[11px] leading-tight">
                              <p className="font-medium text-neutral-800 max-w-[140px] truncate">{it.name}</p>
                              <p className="text-neutral-400 text-[10px]">
                                {it.size ? `Size ${it.size}` : ''} {it.quantity > 1 ? `× ${it.quantity}` : ''}
                              </p>
                            </div>
                          </div>
                        ))}
                        {items.length > 4 && (
                          <span className="text-[10px] text-neutral-500 bg-neutral-100 px-2 py-1 rounded-sm">
                            +{items.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Cart Value & 1-Click WhatsApp Trigger */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-100">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                          Cart Total
                        </span>
                        <span className="text-lg font-bold text-neutral-900">
                          ₹{Number(item.cart_total || 0).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSendWhatsApp(item)}
                          disabled={sendingId === item.id || item.is_recovered}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white rounded-sm text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          {sendingId === item.id ? 'Opening WhatsApp...' : '1-Click WhatsApp (5% OFF)'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
