import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Eye,
  Trash2,
  ExternalLink,
  ChevronDown,
  DollarSign,
  Calendar,
  User,
  MapPin,
  CreditCard,
  X,
  Phone,
  Mail,
  ShieldCheck,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  FileText,
  Check,
  ArrowRight,
  Send,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchAdminOrders,
  updateAdminOrderStatus,
  updateAdminReturnRefund,
  cancelOrder,
  deleteAdminOrder,
} from '../../services/orderService';

export default function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    processing: 0,
    inTransit: 0,
    delivered: 0,
    cancelled: 0,
    returns: 0,
    refunds: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'Processing', 'In Transit', 'Delivered', 'Cancelled', 'returns', 'refunds'
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Cancellation Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Customer requested cancellation');
  const [isCancelling, setIsCancelling] = useState(false);

  // Refund Form State for Selected Order
  const [refundForm, setRefundForm] = useState({
    refund_status: 'Initiated',
    refund_amount: 0,
    refund_method: 'Original Payment Mode (UPI / Card)',
    refund_transaction_id: '',
    refund_notes: '',
  });
  const [isSavingRefund, setIsSavingRefund] = useState(false);

  const loadOrders = async (status = statusFilter, query = search) => {
    setLoading(true);
    try {
      const apiStatus = ['returns', 'refunds'].includes(status) ? 'all' : status;
      const data = await fetchAdminOrders({
        status: apiStatus,
        search: query,
        limit: 100,
      });
      if (data.success) {
        setOrders(data.orders || []);
        if (data.summary) setSummary(data.summary);
      } else {
        toast.error('Could not load orders.');
      }
    } catch (err) {
      toast.error('Failed to connect to orders endpoint.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(statusFilter, search);
  }, [statusFilter]);

  // Sync refund form when selected order changes
  useEffect(() => {
    if (selectedOrder) {
      setRefundForm({
        refund_status: selectedOrder.refundStatus && selectedOrder.refundStatus !== 'None' ? selectedOrder.refundStatus : 'Initiated',
        refund_amount: selectedOrder.refundAmount || selectedOrder.totalAmount || 0,
        refund_method: selectedOrder.refundMethod || 'Original Payment Mode (UPI / Card)',
        refund_transaction_id: selectedOrder.refundTransactionId || '',
        refund_notes: selectedOrder.refundNotes || '',
      });
    }
  }, [selectedOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadOrders(statusFilter, search);
  };

  // Update Order Status (Processing, Confirmed, In Transit, Delivered, etc.)
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await updateAdminOrderStatus(orderId, { order_status: newStatus });
      if (res.success) {
        toast.success(`Order status updated to "${newStatus}"`);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }));
        }
        loadOrders(statusFilter, search);
      } else {
        toast.error(res.message || 'Failed to update order status');
      }
    } catch {
      toast.error('Error updating order status');
    }
  };

  // Update Payment Status (Pending, Paid, Refunded, Failed)
  const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
    try {
      const res = await updateAdminOrderStatus(orderId, { payment_status: newPaymentStatus });
      if (res.success) {
        toast.success(`Payment status marked as "${newPaymentStatus}"`);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: newPaymentStatus } : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, paymentStatus: newPaymentStatus }));
        }
      }
    } catch {
      toast.error('Error updating payment status');
    }
  };

  // Cancel Order & Restore Inventory
  const handleCancelOrderSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsCancelling(true);
    try {
      const res = await cancelOrder(selectedOrder.id, cancelReason);
      if (res.success) {
        toast.success(res.message || 'Order cancelled and stock restored!');
        setIsCancelModalOpen(false);
        loadOrders(statusFilter, search);
        setSelectedOrder((prev) => ({
          ...prev,
          orderStatus: 'Cancelled',
          cancellationReason: cancelReason,
          cancelledAt: new Date().toISOString(),
          refundStatus: prev.paymentStatus === 'Paid' ? 'Initiated' : prev.refundStatus,
        }));
      } else {
        toast.error(res.message || 'Failed to cancel order');
      }
    } catch {
      toast.error('Could not cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  // Update Return Status (Approve, Reject, Picked Up, Completed)
  const handleReturnStatusChange = async (orderId, newReturnStatus) => {
    try {
      const res = await updateAdminReturnRefund(orderId, { return_status: newReturnStatus });
      if (res.success) {
        toast.success(`Return status updated to "${newReturnStatus}"`);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, returnStatus: newReturnStatus } : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, returnStatus: newReturnStatus }));
        }
        loadOrders(statusFilter, search);
      } else {
        toast.error(res.message || 'Failed to update return status');
      }
    } catch {
      toast.error('Error updating return status');
    }
  };

  // Update Refund Workflow
  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsSavingRefund(true);
    try {
      const res = await updateAdminReturnRefund(selectedOrder.id, refundForm);
      if (res.success) {
        toast.success('Refund details updated successfully!');
        if (selectedOrder && selectedOrder.id) {
          setSelectedOrder((prev) => ({
            ...prev,
            refundStatus: refundForm.refund_status,
            refundAmount: Number(refundForm.refund_amount),
            refundMethod: refundForm.refund_method,
            refundTransactionId: refundForm.refund_transaction_id,
            refundNotes: refundForm.refund_notes,
            paymentStatus: refundForm.refund_status === 'Refunded' ? 'Refunded' : prev.paymentStatus,
          }));
        }
        loadOrders(statusFilter, search);
      } else {
        toast.error(res.message || 'Failed to update refund');
      }
    } catch {
      toast.error('Could not save refund');
    } finally {
      setIsSavingRefund(false);
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm(`Are you sure you want to delete this order?`)) return;
    try {
      const res = await deleteAdminOrder(orderId);
      if (res.success) {
        toast.success('Order deleted successfully');
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        if (selectedOrder?.id === orderId) setSelectedOrder(null);
        loadOrders(statusFilter, search);
      } else {
        toast.error(res.message || 'Failed to delete order');
      }
    } catch {
      toast.error('Error deleting order');
    }
  };

  // Client filtered orders based on specialized tabs (returns / refunds)
  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'returns') {
      return o.returnStatus && o.returnStatus !== 'None';
    }
    if (statusFilter === 'refunds') {
      return o.refundStatus && o.refundStatus !== 'None';
    }
    return true;
  });

  return (
    <div className="space-y-5 font-sans">
      {/* 1. TOP HEADER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 border border-neutral-200 rounded-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-neutral-900">
              Orders, Returns & Refunds Management
            </h2>
            <span className="px-2 py-0.5 text-xs font-semibold bg-neutral-100 text-neutral-800 rounded-xs border border-neutral-200 font-mono">
              {summary.totalOrders} Orders
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage fulfillment dispatch, cancellations, return requests, reasons, and automated refund workflows.
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
              placeholder="Search order #, customer, phone..."
              className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm pl-8 pr-3 py-1.5 text-xs text-neutral-900 outline-none"
            />
          </form>

          <button
            type="button"
            onClick={() => loadOrders(statusFilter, search)}
            disabled={loading}
            className="p-2 border border-neutral-200 hover:border-neutral-900 rounded-sm text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer bg-white"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-neutral-200 p-3 rounded-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400">Total Revenue</div>
            <div className="text-base font-bold text-neutral-900 mt-0.5">
              ₹{summary.totalRevenue.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="h-7 w-7 rounded-sm bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
            <DollarSign className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-3 rounded-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-amber-600">Processing</div>
            <div className="text-base font-bold text-amber-700 mt-0.5">{summary.processing}</div>
          </div>
          <div className="h-7 w-7 rounded-sm bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-3 rounded-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-blue-600">In Transit</div>
            <div className="text-base font-bold text-blue-700 mt-0.5">{summary.inTransit}</div>
          </div>
          <div className="h-7 w-7 rounded-sm bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
            <Truck className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-3 rounded-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-emerald-600">Delivered</div>
            <div className="text-base font-bold text-emerald-700 mt-0.5">{summary.delivered}</div>
          </div>
          <div className="h-7 w-7 rounded-sm bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-3 rounded-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-purple-600">Returns</div>
            <div className="text-base font-bold text-purple-700 mt-0.5">{summary.returns || 0}</div>
          </div>
          <div className="h-7 w-7 rounded-sm bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
            <RotateCcw className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-3 rounded-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-red-600">Cancelled</div>
            <div className="text-base font-bold text-red-700 mt-0.5">{summary.cancelled}</div>
          </div>
          <div className="h-7 w-7 rounded-sm bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
            <XCircle className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* 3. STATUS FILTER TABS */}
      <div className="flex items-center gap-1.5 border-b border-neutral-200 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'all', label: 'All Orders', count: summary.totalOrders },
          { id: 'Processing', label: 'Processing', count: summary.processing },
          { id: 'In Transit', label: 'In Transit', count: summary.inTransit },
          { id: 'Delivered', label: 'Delivered', count: summary.delivered },
          { id: 'returns', label: '🔄 Returns & Exchanges', count: summary.returns || 0 },
          { id: 'refunds', label: '💳 Refunds', count: summary.refunds || 0 },
          { id: 'Cancelled', label: 'Cancelled', count: summary.cancelled },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
              statusFilter === tab.id
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-xs text-[10px] font-mono ${
                statusFilter === tab.id
                  ? 'bg-neutral-800 text-white'
                  : 'bg-neutral-100 text-neutral-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* 4. ORDERS DATA TABLE */}
      <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2 text-neutral-400">
            <RefreshCw className="w-5 h-5 animate-spin text-neutral-900" />
            <span className="text-xs font-medium">Fetching orders from database...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Package className="w-8 h-8 text-neutral-300 mx-auto" />
            <h4 className="text-xs font-semibold text-neutral-800">No Orders Found</h4>
            <p className="text-[11px] text-neutral-400 max-w-sm mx-auto">
              {search
                ? `No orders matched "${search}".`
                : 'Customer orders and return requests will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/70 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3.5">Order # / Date</th>
                  <th className="py-2.5 px-3.5">Customer Details</th>
                  <th className="py-2.5 px-3.5">Items Ordered</th>
                  <th className="py-2.5 px-3.5">Total & Payment</th>
                  <th className="py-2.5 px-3.5">Order & Return Status</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-normal">
                {filteredOrders.map((ord) => {
                  const hasReturn = ord.returnStatus && ord.returnStatus !== 'None';
                  const hasRefund = ord.refundStatus && ord.refundStatus !== 'None';
                  const isCancelled = ord.orderStatus === 'Cancelled';

                  return (
                    <tr
                      key={ord.id}
                      className="hover:bg-neutral-50/80 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrder(ord)}
                    >
                      {/* Order Number & Date */}
                      <td className="py-3 px-3.5">
                        <div className="font-mono font-bold text-neutral-900 text-xs">
                          {ord.orderNumber}
                        </div>
                        <div className="text-[10px] text-neutral-400 mt-0.5 flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          <span>
                            {ord.createdAt
                              ? new Date(ord.createdAt).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Just now'}
                          </span>
                        </div>
                        {ord.trackingNumber && (
                          <div className="text-[9px] font-mono text-neutral-500 mt-1">
                            Trk: {ord.trackingNumber}
                          </div>
                        )}
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-3.5 min-w-[170px]">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                            <span>{ord.customerName}</span>
                            <span className="text-[9px] font-mono px-1 py-0.2 bg-neutral-100 text-neutral-600 rounded-xs border border-neutral-200">
                              {ord.customerId}
                            </span>
                          </div>
                          {ord.customerPhone && (
                            <div className="text-[10px] text-neutral-600 font-mono">
                              <a
                                href={`https://wa.me/${ord.customerPhone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-emerald-700 hover:underline inline-flex items-center gap-1"
                              >
                                📱 +{ord.customerPhone.replace(/[^0-9]/g, '')}
                              </a>
                            </div>
                          )}
                          {ord.shippingAddress?.city && (
                            <div className="text-[10px] text-neutral-400 truncate max-w-[160px]">
                              📍 {ord.shippingAddress.city}, {ord.shippingAddress.state}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Items Preview */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-1.5">
                          <div className="flex -space-x-2 overflow-hidden shrink-0">
                            {ord.items?.slice(0, 3).map((it, idx) => (
                              <img
                                key={idx}
                                src={it.image || 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=100'}
                                alt={it.title}
                                className="inline-block h-8 w-8 rounded-xs border-2 border-white object-cover bg-neutral-100"
                              />
                            ))}
                          </div>
                          <div className="text-[11px] text-neutral-700">
                            <span className="font-semibold">{ord.itemsCount || ord.items?.length || 1}</span> items
                          </div>
                        </div>
                      </td>

                      {/* Total & Payment Method */}
                      <td className="py-3 px-3.5">
                        <div className="space-y-1">
                          <div className="font-bold text-neutral-900 text-xs font-mono">
                            ₹{ord.totalAmount.toLocaleString('en-IN')}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-neutral-500">
                              {ord.paymentMethod}
                            </span>
                            <span
                              className={`inline-block text-[9px] font-semibold px-1 py-0.2 rounded-xs border ${
                                ord.paymentStatus === 'Paid'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : ord.paymentStatus === 'Refunded'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              {ord.paymentStatus}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Order & Return Status */}
                      <td className="py-3 px-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-semibold border ${
                                ord.orderStatus === 'Delivered'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : ord.orderStatus === 'In Transit'
                                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                                  : ord.orderStatus === 'Cancelled'
                                  ? 'bg-red-50 text-red-800 border-red-300'
                                  : 'bg-amber-50 text-amber-800 border-amber-300'
                              }`}
                            >
                              {ord.orderStatus}
                            </span>
                          </div>

                          {/* Return Badge */}
                          {hasReturn && (
                            <div>
                              <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-xs border border-purple-200">
                                <RotateCcw className="w-2.5 h-2.5" />
                                Return: {ord.returnStatus}
                              </span>
                            </div>
                          )}

                          {/* Refund Badge */}
                          {hasRefund && (
                            <div>
                              <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-xs border ${
                                ord.refundStatus === 'Refunded'
                                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                  : 'text-blue-700 bg-blue-50 border-blue-200'
                              }`}>
                                <CreditCard className="w-2.5 h-2.5" />
                                Refund: {ord.refundStatus}
                              </span>
                            </div>
                          )}

                          {/* Cancellation Reason Tooltip */}
                          {isCancelled && ord.cancellationReason && (
                            <div className="text-[9px] text-red-600 font-medium truncate max-w-[140px]" title={ord.cancellationReason}>
                              Reason: {ord.cancellationReason}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(ord)}
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-sm transition-colors cursor-pointer"
                            title="Manage Order, Return & Refund"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(ord.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors cursor-pointer"
                            title="Delete Order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. ORDER DETAILS & RETURN / REFUND MANAGEMENT DRAWER */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="relative w-full max-w-3xl bg-white p-5 sm:p-6 shadow-2xl my-6 max-h-[92vh] overflow-y-auto rounded-sm border border-neutral-200 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-900 font-mono">
                    Order #{selectedOrder.orderNumber}
                  </h3>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded-xs border ${
                      selectedOrder.orderStatus === 'Delivered'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : selectedOrder.orderStatus === 'In Transit'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : selectedOrder.orderStatus === 'Cancelled'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {selectedOrder.orderStatus}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="grid h-8 w-8 place-items-center rounded-full text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 🔴 CANCELLATION BANNER (If Cancelled) */}
            {selectedOrder.orderStatus === 'Cancelled' ? (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-sm text-xs text-red-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-red-700">
                  <XCircle className="w-4 h-4" />
                  <span>Order Cancelled & Product Stock Restored</span>
                </div>
                <p className="text-red-800">
                  <strong>Reason:</strong> {selectedOrder.cancellationReason || 'Cancelled by user / store policy'}
                </p>
                {selectedOrder.cancelledAt && (
                  <p className="text-[10px] text-red-600 font-mono">
                    Cancelled on: {new Date(selectedOrder.cancelledAt).toLocaleString('en-IN')}
                  </p>
                )}
              </div>
            ) : null}

            {/* 🔄 RETURN REQUEST & REASON SECTION */}
            {selectedOrder.returnStatus && selectedOrder.returnStatus !== 'None' ? (
              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-sm space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-purple-900 flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4 text-purple-700" />
                    <span>Customer Return Request</span>
                  </div>
                  <span className="font-bold text-[10px] uppercase bg-purple-100 text-purple-800 px-2 py-0.5 rounded-xs border border-purple-300">
                    Status: {selectedOrder.returnStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white p-3 border border-purple-100 rounded-xs">
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Return Reason</span>
                    <strong className="text-neutral-900 text-xs">{selectedOrder.returnReason || 'Fit / Quality issue'}</strong>
                  </div>
                  {selectedOrder.returnComment && (
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Customer Note</span>
                      <span className="text-neutral-700 italic text-[11px]">"{selectedOrder.returnComment}"</span>
                    </div>
                  )}
                </div>

                {/* Return Status Actions for Admin */}
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold text-purple-950">Update Return Stage:</span>
                  {['Approved', 'Item Picked Up', 'Item Received', 'Completed', 'Rejected'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleReturnStatusChange(selectedOrder.id, st)}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-xs border transition-colors cursor-pointer ${
                        selectedOrder.returnStatus === st
                          ? 'bg-purple-900 text-white border-purple-900 shadow-xs'
                          : 'bg-white text-purple-900 border-purple-200 hover:bg-purple-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* 💳 REFUND MANAGEMENT SECTION */}
            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-sm space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Refund Workflow & Transaction Logs</span>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-xs border ${
                  refundForm.refund_status === 'Refunded'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : refundForm.refund_status === 'Initiated'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                }`}>
                  Refund: {refundForm.refund_status}
                </span>
              </div>

              <form onSubmit={handleRefundSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-neutral-600 uppercase block mb-1">
                      Refund Status
                    </label>
                    <select
                      value={refundForm.refund_status}
                      onChange={(e) => setRefundForm({ ...refundForm, refund_status: e.target.value })}
                      className="w-full bg-white text-neutral-900 font-medium border border-neutral-300 rounded-xs px-2.5 py-1.5 text-xs outline-none focus:border-neutral-900 cursor-pointer shadow-2xs"
                    >
                      <option value="None" className="bg-white text-neutral-900">None</option>
                      <option value="Initiated" className="bg-white text-neutral-900">Initiated</option>
                      <option value="Processing" className="bg-white text-neutral-900">Processing</option>
                      <option value="Refunded" className="bg-white text-neutral-900">Refunded (Completed)</option>
                      <option value="Failed" className="bg-white text-neutral-900">Failed</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-neutral-600 uppercase block mb-1">
                      Refund Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={refundForm.refund_amount}
                      onChange={(e) => setRefundForm({ ...refundForm, refund_amount: e.target.value })}
                      className="w-full bg-white border border-neutral-300 rounded-xs px-2.5 py-1.5 text-xs font-mono outline-none focus:border-neutral-900 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-neutral-600 uppercase block mb-1">
                      Refund Method
                    </label>
                    <select
                      value={refundForm.refund_method}
                      onChange={(e) => setRefundForm({ ...refundForm, refund_method: e.target.value })}
                      className="w-full bg-white text-neutral-900 font-medium border border-neutral-300 rounded-xs px-2.5 py-1.5 text-xs outline-none focus:border-neutral-900 cursor-pointer shadow-2xs"
                    >
                      <option value="Original Payment Mode (UPI / Card)" className="bg-white text-neutral-900">Original Payment Mode (UPI / Card)</option>
                      <option value="Bank Account IMPS / NEFT Transfer" className="bg-white text-neutral-900">Bank Account IMPS / NEFT Transfer</option>
                      <option value="Store Credits / Coupon Code" className="bg-white text-neutral-900">Store Credits / Coupon Code</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-neutral-600 uppercase block mb-1">
                      Refund Transaction / UTR #
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UTR-88492048120"
                      value={refundForm.refund_transaction_id}
                      onChange={(e) => setRefundForm({ ...refundForm, refund_transaction_id: e.target.value })}
                      className="w-full bg-white border border-neutral-300 rounded-xs px-2.5 py-1.5 text-xs font-mono outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-neutral-600 uppercase block mb-1">
                      Admin Refund Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Processed via Razorpay/Cashfree gateway"
                      value={refundForm.refund_notes}
                      onChange={(e) => setRefundForm({ ...refundForm, refund_notes: e.target.value })}
                      className="w-full bg-white border border-neutral-300 rounded-xs px-2.5 py-1.5 text-xs outline-none focus:border-neutral-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isSavingRefund}
                    className="px-3.5 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isSavingRefund ? 'Updating...' : 'Save Refund Details'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Customer & Shipping Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-neutral-50 p-4 border border-neutral-200 rounded-sm">
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Customer Profile</div>
                <div className="font-semibold text-neutral-900">{selectedOrder.customerName}</div>
                <div className="text-neutral-600 font-mono">📱 +{selectedOrder.customerPhone}</div>
                {selectedOrder.customerEmail && (
                  <div className="text-neutral-600 truncate">{selectedOrder.customerEmail}</div>
                )}
                <div className="text-[10px] text-neutral-400 font-mono">Customer ID: {selectedOrder.customerId}</div>
              </div>

              <div className="space-y-1.5">
                <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider flex items-center justify-between">
                  <span>Shipping Address</span>
                  {selectedOrder.shippingAddress?.latitude && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-xs border border-emerald-200">
                      📍 GPS Verified
                    </span>
                  )}
                </div>
                <div className="text-neutral-700 leading-relaxed">
                  {selectedOrder.shippingAddress?.apartment && `${selectedOrder.shippingAddress.apartment}, `}
                  {selectedOrder.shippingAddress?.addressLine || 'Address not provided'}
                  <br />
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                </div>
                
                {/* Google Maps Location Button */}
                <div className="pt-1.5 flex items-center gap-2">
                  <a
                    href={
                      selectedOrder.shippingAddress?.latitude && selectedOrder.shippingAddress?.longitude
                        ? `https://www.google.com/maps?q=${selectedOrder.shippingAddress.latitude},${selectedOrder.shippingAddress.longitude}`
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            `${selectedOrder.shippingAddress?.addressLine || ''}, ${selectedOrder.shippingAddress?.city || ''} ${selectedOrder.shippingAddress?.pincode || ''}`
                          )}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-blue-700 hover:text-blue-900 bg-blue-50/80 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-xs transition-colors cursor-pointer"
                  >
                    <MapPin className="h-3.5 w-3.5 text-blue-600" />
                    <span>
                      {selectedOrder.shippingAddress?.latitude
                        ? `View GPS on Map (${selectedOrder.shippingAddress.latitude.toFixed(4)}, ${selectedOrder.shippingAddress.longitude.toFixed(4)})`
                        : 'Search Address on Google Maps'}
                    </span>
                  </a>
                </div>

                <div className="text-[10px] text-neutral-500 font-mono pt-1">
                  Tracking: <span className="text-neutral-900 font-semibold">{selectedOrder.trackingNumber}</span> ({selectedOrder.courierPartner})
                </div>
              </div>
            </div>

            {/* Ordered Items List */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 mb-3">
                Ordered Items ({selectedOrder.items?.length || 0})
              </h4>
              <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-sm overflow-hidden">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3 hover:bg-neutral-50/50">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=120'}
                        alt={item.title}
                        className="h-12 w-12 rounded-xs object-cover border border-neutral-200 bg-neutral-100 shrink-0"
                      />
                      <div>
                        <div className="font-semibold text-neutral-900 text-xs">{item.title}</div>
                        <div className="text-[10px] text-neutral-500 font-mono flex items-center gap-2 mt-0.5">
                          <span>Size: <strong>{item.size || item.selectedSize}</strong></span>
                          <span>•</span>
                          <span>Color: <strong>{item.color || item.selectedColor}</strong></span>
                          <span>•</span>
                          <span>Qty: <strong>{item.quantity}</strong></span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-mono font-semibold text-xs text-neutral-900">
                      ₹{((Number(item.price || 0)) * (Number(item.quantity || 1))).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-sm space-y-2 text-xs font-mono">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal:</span>
                <span>₹{selectedOrder.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount ({selectedOrder.couponCode || 'PROMO'}):</span>
                  <span>-₹{selectedOrder.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>Shipping:</span>
                <span>{selectedOrder.shippingFee === 0 ? 'FREE' : `₹${selectedOrder.shippingFee}`}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-neutral-900 pt-2 border-t border-neutral-200">
                <span>Total Amount:</span>
                <span>₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Status Update Quick Controls & Cancel Order Button */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-neutral-600 mb-1">
                  Update Order Dispatch Status
                </label>
                <select
                  value={selectedOrder.orderStatus}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  className="w-full h-10 border border-neutral-300 px-3 text-xs outline-none focus:border-neutral-900 bg-white text-neutral-900 font-medium cursor-pointer shadow-2xs"
                >
                  <option value="Processing" className="bg-white text-neutral-900">Processing</option>
                  <option value="Confirmed" className="bg-white text-neutral-900">Confirmed</option>
                  <option value="In Transit" className="bg-white text-neutral-900">In Transit</option>
                  <option value="Out for Delivery" className="bg-white text-neutral-900">Out for Delivery</option>
                  <option value="Delivered" className="bg-white text-neutral-900">Delivered</option>
                  <option value="Cancelled" className="bg-white text-neutral-900">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-neutral-600 mb-1">
                  Payment Status
                </label>
                <select
                  value={selectedOrder.paymentStatus}
                  onChange={(e) => handlePaymentStatusChange(selectedOrder.id, e.target.value)}
                  className="w-full h-10 border border-neutral-300 px-3 text-xs outline-none focus:border-neutral-900 bg-white text-neutral-900 font-medium cursor-pointer shadow-2xs"
                >
                  <option value="Pending" className="bg-white text-neutral-900">Pending (COD / Unverified)</option>
                  <option value="Paid" className="bg-white text-neutral-900">Paid (Verified)</option>
                  <option value="Refunded" className="bg-white text-neutral-900">Refunded</option>
                  <option value="Failed" className="bg-white text-neutral-900">Failed</option>
                </select>
              </div>
            </div>

            {/* Cancel Action (if order is active) */}
            {selectedOrder.orderStatus !== 'Cancelled' && selectedOrder.orderStatus !== 'Delivered' && (
              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                <div className="text-[11px] text-neutral-500">
                  Customer cancelled or issue with stock?
                </div>
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(true)}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold rounded-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5 text-red-600" />
                  <span>Cancel Order & Restore Stock</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* CANCEL ORDER REASON PROMPT MODAL */}
      {isCancelModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white border border-neutral-200 rounded-sm w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
              <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Cancel Order #{selectedOrder.orderNumber}
              </h4>
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-600">
              Cancelling this order will mark it as Cancelled and <strong>automatically restore product stock</strong> back to the inventory matrix.
            </p>

            <form onSubmit={handleCancelOrderSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-neutral-700 uppercase mb-1">
                  Reason for Cancellation *
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full border border-neutral-300 rounded-xs p-2.5 text-xs outline-none focus:border-neutral-900 bg-white text-neutral-900 font-medium cursor-pointer shadow-2xs"
                >
                  <option value="Customer requested cancellation" className="bg-white text-neutral-900">Customer requested cancellation</option>
                  <option value="Item Out of Stock / Damaged" className="bg-white text-neutral-900">Item Out of Stock / Damaged</option>
                  <option value="Customer Phone Unreachable / Fake Order" className="bg-white text-neutral-900">Customer Phone Unreachable / Fake Order</option>
                  <option value="Incorrect Delivery Address" className="bg-white text-neutral-900">Incorrect Delivery Address</option>
                  <option value="Duplicate Order Placed" className="bg-white text-neutral-900">Duplicate Order Placed</option>
                  <option value="Pricing / System Error" className="bg-white text-neutral-900">Pricing / System Error</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  className="px-3 py-1.5 border border-neutral-200 text-neutral-700 hover:bg-neutral-100 rounded-xs transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isCancelling}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xs transition-colors flex items-center gap-1.5"
                >
                  {isCancelling ? 'Processing...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

