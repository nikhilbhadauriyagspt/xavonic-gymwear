import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  Mail, 
  Trash2, 
  Calendar, 
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

export default function CustomersTab() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const fetchCustomers = async (searchQuery = '') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('xavonic_admin_token');
      const url = new URL('http://localhost:5000/api/admin/customers');
      if (searchQuery) url.searchParams.append('search', searchQuery);

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers || []);
        setTotal(data.total || 0);
      } else {
        toast.error(data.message || 'Failed to load customers');
      }
    } catch (err) {
      toast.error('Could not connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCustomers(search);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete customer #${id}?`)) return;

    try {
      const token = localStorage.getItem('xavonic_admin_token');
      const res = await fetch(`http://localhost:5000/api/admin/customers/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Customer removed successfully');
        setCustomers((prev) => prev.filter((c) => c.id !== id));
        setTotal((prev) => Math.max(0, prev - 1));
        if (selectedCustomer?.id === id) setSelectedCustomer(null);
      } else {
        toast.error(data.message || 'Failed to delete customer');
      }
    } catch (err) {
      toast.error('Could not delete customer');
    }
  };

  return (
    <div className="space-y-5 font-sans">
      
      {/* 1. TOP HEADER & METRICS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 border border-neutral-200 rounded-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-neutral-900">
              Registered Customers
            </h2>
            <span className="px-2 py-0.5 text-xs font-semibold bg-neutral-100 text-neutral-800 rounded-xs border border-neutral-200">
              {total} Total
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Real-time MySQL database records with WhatsApp & Email verification logs
          </p>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone, email..."
              className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm pl-8 pr-3 py-1.5 text-xs text-neutral-900 outline-none"
            />
          </form>

          <button
            type="button"
            onClick={() => fetchCustomers(search)}
            disabled={loading}
            className="p-2 border border-neutral-200 hover:border-neutral-900 rounded-sm text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer bg-white"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. CUSTOMERS DATA TABLE */}
      <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2 text-neutral-400">
            <RefreshCw className="w-5 h-5 animate-spin text-neutral-900" />
            <span className="text-xs font-medium">Loading database records...</span>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="w-8 h-8 text-neutral-300 mx-auto" />
            <h4 className="text-xs font-semibold text-neutral-800">No Customers Found</h4>
            <p className="text-[11px] text-neutral-400 max-w-sm mx-auto">
              {search ? `No customers matched "${search}". Try clearing search.` : 'Registered customers from frontend OTP login will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/70 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3.5">ID</th>
                  <th className="py-2.5 px-3.5">Customer / Name</th>
                  <th className="py-2.5 px-3.5">WhatsApp Mobile</th>
                  <th className="py-2.5 px-3.5">Email Address</th>
                  <th className="py-2.5 px-3.5">Club Tier</th>
                  <th className="py-2.5 px-3.5">Sizing</th>
                  <th className="py-2.5 px-3.5">Joined Date</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-normal">
                {customers.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-neutral-50/80 transition-colors group cursor-pointer"
                    onClick={() => setSelectedCustomer(c)}
                  >
                    {/* ID */}
                    <td className="py-3 px-3.5 font-mono text-[11px]">
                      <span className="font-semibold text-neutral-900 bg-neutral-100 px-1.5 py-0.5 rounded-xs border border-neutral-200">
                        {c.customer_id || `GDL-${String(c.id).padStart(5, '0')}`}
                      </span>
                    </td>

                    {/* Name */}
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-neutral-900 text-white font-semibold text-[10px] flex items-center justify-center shrink-0 uppercase tracking-wider">
                          {c.name ? c.name.slice(0, 2) : 'AT'}
                        </div>
                        <div>
                          <div className="font-medium text-neutral-900">
                            {c.name ? c.name : <span className="text-neutral-400 italic font-light">Not provided yet</span>}
                          </div>
                          <div className="text-[10px] text-neutral-400">
                            {c.gender || 'Male'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* WhatsApp Mobile */}
                    <td className="py-3 px-3.5">
                      {c.phone ? (
                        <div className="space-y-0.5">
                          <div className="font-mono text-neutral-900 flex items-center gap-1">
                            <span>+{c.phone.replace(/[^0-9]/g, '')}</span>
                          </div>
                          {Boolean(c.phone_verified) ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-xs border border-emerald-200">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              WhatsApp Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-xs border border-amber-200">
                              Unverified
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-neutral-400 italic text-[11px]">-</span>
                      )}
                    </td>

                    {/* Email */}
                    <td className="py-3 px-3.5">
                      {c.email ? (
                        <div className="space-y-0.5">
                          <div className="text-neutral-800 max-w-[170px] truncate">
                            {c.email}
                          </div>
                          {Boolean(c.email_verified) ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-xs border border-emerald-200">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Email Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-xs border border-amber-200">
                              Unverified
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-neutral-400 italic text-[11px] font-light">Not Linked</span>
                      )}
                    </td>

                    {/* Tier & Points */}
                    <td className="py-3 px-3.5">
                      <div className="space-y-0.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-xs">
                          <Sparkles className="w-2.5 h-2.5" />
                          {c.tier || 'VIP Club'}
                        </span>
                        <div className="text-[10px] text-neutral-500 font-mono">
                          {c.points || 100} Reward Pts
                        </div>
                      </div>
                    </td>

                    {/* Sizing */}
                    <td className="py-3 px-3.5">
                      <div className="text-[11px] text-neutral-600 space-y-0.5 font-mono">
                        <div>Top: <span className="font-semibold text-neutral-900">{c.chest_size || 'L'}</span></div>
                        <div>Lower: <span className="font-semibold text-neutral-900">{c.lower_size || 'M'}</span></div>
                      </div>
                    </td>

                    {/* Joined Date */}
                    <td className="py-3 px-3.5 text-neutral-500 text-[11px]">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      }) : 'Recent'}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors cursor-pointer"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
