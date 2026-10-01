import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  ShoppingBag, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Truck, 
  CreditCard, 
  TrendingUp, 
  ExternalLink,
  Package,
  RefreshCw,
  Clock,
  ChevronRight
} from 'lucide-react';
import { ADMIN_API_BASE } from '../../config/api';
import { toast } from 'sonner';

export default function CustomerProfileModal({ customerId, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'orders', 'addresses'
  const [customerData, setCustomerData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !customerId) return;

    const fetchCustomerDetail = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('xavonic_admin_token');
        const res = await fetch(`${ADMIN_API_BASE}/customers/${customerId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setCustomerData(data.customer);
          setOrders(data.orders || []);
          setAddresses(data.addresses || []);
        } else {
          toast.error(data.message || 'Failed to load customer profile');
        }
      } catch (err) {
        toast.error('Could not connect to server');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDetail();
  }, [isOpen, customerId]);

  if (!isOpen) return null;

  const totalSpent = Number(customerData?.total_spent || 0);
  const totalOrders = Number(customerData?.total_orders || orders.length || 0);
  const avgOrderValue = Number(customerData?.avg_order_value || (totalOrders > 0 ? totalSpent / totalOrders : 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs font-sans">
      <div 
        className="bg-white border border-neutral-200 rounded-sm w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 bg-neutral-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neutral-900 text-white font-bold text-sm flex items-center justify-center uppercase tracking-wider shadow-xs">
              {customerData?.name ? customerData.name.slice(0, 2) : 'CU'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-neutral-900">
                  {customerData?.name || 'Registered Customer'}
                </h3>
                <span className="font-mono text-[10px] font-semibold bg-neutral-200/80 text-neutral-800 px-1.5 py-0.2 rounded-xs">
                  {customerData?.customer_id || `GDL-${String(customerData?.id || '').padStart(5, '0')}`}
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Member since {customerData?.created_at ? new Date(customerData.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric', day: '2-digit' }) : 'Recent'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-sm transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Financial Highlights Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-neutral-200 border-b border-neutral-200 bg-white text-xs">
          <div className="p-3.5 space-y-0.5">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-600" /> Total Spending
            </span>
            <div className="text-sm font-bold text-neutral-900 font-mono">
              ₹{totalSpent.toLocaleString('en-IN')}.00
            </div>
          </div>

          <div className="p-3.5 space-y-0.5">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium flex items-center gap-1">
              <ShoppingBag className="w-3 h-3 text-neutral-600" /> Total Orders
            </span>
            <div className="text-sm font-bold text-neutral-900 font-mono">
              {totalOrders} {totalOrders === 1 ? 'Order' : 'Orders'}
            </div>
          </div>

          <div className="p-3.5 space-y-0.5">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-neutral-600" /> Avg. Order Value
            </span>
            <div className="text-sm font-bold text-neutral-900 font-mono">
              ₹{Math.round(avgOrderValue).toLocaleString('en-IN')}.00
            </div>
          </div>

          <div className="p-3.5 space-y-0.5">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-red-600" /> Reward Points
            </span>
            <div className="text-sm font-bold text-red-600 font-mono">
              {customerData?.points || 100} Pts
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-neutral-200 bg-neutral-50/40 text-xs">
          {[
            { id: 'profile', label: 'Customer Profile', icon: User },
            { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
            { id: 'addresses', label: `Saved Addresses (${addresses.length})`, icon: MapPin },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2.5 px-3 font-semibold flex items-center gap-1.5 transition-colors border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-neutral-900 text-neutral-900'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto max-h-[62vh] space-y-5 bg-neutral-50/20">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-2 text-neutral-400">
              <RefreshCw className="w-5 h-5 animate-spin text-neutral-900" />
              <span className="text-xs font-medium">Fetching customer profile & order history...</span>
            </div>
          ) : (
            <>
              {/* TAB 1: CUSTOMER PROFILE & MEASUREMENTS */}
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  
                  {/* Contact & Verification Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    
                    {/* WhatsApp Mobile */}
                    <div className="bg-white p-4 border border-neutral-200 rounded-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Mobile
                        </span>
                        {Boolean(customerData?.phone_verified) ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-xs border border-emerald-200">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-xs border border-amber-200">
                            Unverified
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono font-semibold text-neutral-900">
                        {customerData?.phone ? `+${customerData.phone.replace(/[^0-9]/g, '')}` : 'Not provided'}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="bg-white p-4 border border-neutral-200 rounded-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-neutral-600" /> Email Address
                        </span>
                        {Boolean(customerData?.email_verified) ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-xs border border-emerald-200">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-xs border border-amber-200">
                            Unverified
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-medium text-neutral-900 truncate">
                        {customerData?.email || 'Not provided'}
                      </div>
                    </div>

                  </div>

                  {/* Sizing & Club Membership Card */}
                  <div className="bg-white p-4 border border-neutral-200 rounded-sm space-y-3">
                    <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider border-b border-neutral-100 pb-2">
                      Athlete Club & Sizing Profile
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-neutral-400 uppercase">Gender</span>
                        <div className="font-semibold text-neutral-900">{customerData?.gender || 'Male'}</div>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[10px] text-neutral-400 uppercase">VIP Tier</span>
                        <div className="font-semibold text-red-600 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>{customerData?.tier || 'VIP Athlete Club'}</span>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[10px] text-neutral-400 uppercase">Top / Chest Fit</span>
                        <div className="font-mono font-semibold text-neutral-900">{customerData?.chest_size || 'L (42")'}</div>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[10px] text-neutral-400 uppercase">Lower / Waist Fit</span>
                        <div className="font-mono font-semibold text-neutral-900">{customerData?.lower_size || 'M (32")'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Activity Timestamps */}
                  <div className="bg-neutral-50 p-3.5 border border-neutral-200 rounded-sm flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Registered: <strong>{customerData?.created_at ? new Date(customerData.created_at).toLocaleString('en-IN') : 'N/A'}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Last Login: <strong>{customerData?.last_login ? new Date(customerData.last_login).toLocaleString('en-IN') : 'Recent'}</strong></span>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: ORDER HISTORY */}
              {activeTab === 'orders' && (
                <div className="space-y-3">
                  {orders.length === 0 ? (
                    <div className="bg-white p-10 border border-neutral-200 rounded-sm text-center space-y-2">
                      <Package className="w-8 h-8 text-neutral-300 mx-auto" />
                      <h4 className="text-xs font-semibold text-neutral-800">No Orders Placed Yet</h4>
                      <p className="text-[11px] text-neutral-400">
                        When this customer places orders on the storefront, they will be listed here with live status & tracking.
                      </p>
                    </div>
                  ) : (
                    orders.map((ord) => {
                      const isDelivered = ord.order_status === 'Delivered';
                      const isCancelled = ord.order_status === 'Cancelled';
                      const isPending = ord.order_status === 'Pending' || ord.order_status === 'Processing';

                      return (
                        <div key={ord.id} className="bg-white p-4 border border-neutral-200 rounded-sm space-y-3">
                          
                          {/* Order Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-neutral-900">
                                {ord.order_number}
                              </span>
                              <span className="text-[11px] text-neutral-400">
                                {new Date(ord.created_at).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-semibold border ${
                                isDelivered 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : isCancelled
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-neutral-100 text-neutral-800 border-neutral-200'
                              }`}>
                                {ord.order_status}
                              </span>

                              <span className="text-[10px] font-medium bg-neutral-50 border border-neutral-200 px-1.5 py-0.5 rounded-xs text-neutral-600">
                                {ord.payment_method} ({ord.payment_status})
                              </span>
                            </div>
                          </div>

                          {/* Order Items List */}
                          <div className="space-y-2">
                            {ord.items?.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-neutral-50 last:border-b-0">
                                <div className="flex items-center gap-2.5">
                                  {item.image ? (
                                    <img src={item.image} alt="" className="w-9 h-11 object-cover rounded-xs border border-neutral-200" />
                                  ) : (
                                    <div className="w-9 h-11 bg-neutral-100 rounded-xs flex items-center justify-center text-neutral-400">
                                      <Package className="w-3.5 h-3.5" />
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-medium text-neutral-900">{item.title}</div>
                                    <div className="text-[10px] text-neutral-500 font-mono">
                                      Size: <strong className="text-neutral-800">{item.size || item.selectedSize}</strong>
                                      {item.color && <span> • Color: {item.color}</span>}
                                      <span> • Qty: {item.quantity || 1}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="font-mono font-semibold text-neutral-900">
                                  ₹{Number(item.price * (item.quantity || 1)).toLocaleString('en-IN')}.00
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Order Footer & Tracking */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100 text-[11px]">
                            <div className="flex items-center gap-1.5 text-neutral-600">
                              <Truck className="w-3.5 h-3.5 text-neutral-500" />
                              <span>{ord.courier_partner || 'Bluedart Express'}</span>
                              {ord.tracking_number && (
                                <span className="font-mono font-semibold text-neutral-900 bg-neutral-100 px-1.5 py-0.2 rounded-xs">
                                  {ord.tracking_number}
                                </span>
                              )}
                            </div>

                            <div className="text-right">
                              <span className="text-neutral-500">Total: </span>
                              <strong className="text-xs font-bold font-mono text-neutral-900">
                                ₹{Number(ord.total_amount).toLocaleString('en-IN')}.00
                              </strong>
                            </div>
                          </div>

                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB 3: SAVED ADDRESSES */}
              {activeTab === 'addresses' && (
                <div className="space-y-3">
                  {addresses.length === 0 ? (
                    <div className="bg-white p-10 border border-neutral-200 rounded-sm text-center space-y-2">
                      <MapPin className="w-8 h-8 text-neutral-300 mx-auto" />
                      <h4 className="text-xs font-semibold text-neutral-800">No Addresses Recorded</h4>
                      <p className="text-[11px] text-neutral-400">
                        Addresses entered during checkout or profile management will be saved and shown here.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {addresses.map((addr, idx) => {
                        const name = addr.name || addr.fullName || customerData?.name || 'Customer';
                        const phone = addr.phone || addr.mobile || customerData?.phone || '';
                        const street = addr.address || addr.street || addr.line1 || '';
                        const city = addr.city || '';
                        const state = addr.state || '';
                        const pincode = addr.pincode || addr.postalCode || '';
                        const tag = addr.tag || addr.type || (idx === 0 ? 'Primary Address' : `Address #${idx + 1}`);

                        return (
                          <div key={idx} className="bg-white p-4 border border-neutral-200 rounded-sm space-y-2 relative group hover:border-neutral-400 transition-colors">
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded-xs border border-neutral-200 uppercase tracking-wider">
                                <MapPin className="w-2.5 h-2.5 text-neutral-600" />
                                {tag}
                              </span>
                            </div>

                            <div className="space-y-0.5 text-xs text-neutral-800">
                              <div className="font-semibold text-neutral-900">{name}</div>
                              {phone && <div className="text-[11px] text-neutral-500 font-mono">Ph: +{phone.replace(/[^0-9]/g, '')}</div>}
                              <div className="text-neutral-600 leading-relaxed pt-1">
                                {street}
                                {addr.landmark && <span className="block text-[11px] text-neutral-400">Near: {addr.landmark}</span>}
                              </div>
                              <div className="font-medium text-neutral-900 pt-0.5">
                                {[city, state, pincode].filter(Boolean).join(', ')}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-neutral-200 bg-neutral-50/70 flex items-center justify-between text-xs">
          <div className="text-neutral-500 font-mono text-[11px]">
            Customer ID: {customerData?.customer_id || `GDL-${String(customerData?.id || '').padStart(5, '0')}`}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 hover:bg-black text-white font-medium rounded-sm transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
