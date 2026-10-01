import React, { useState, useEffect } from 'react';
import {
  Star,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  ShieldCheck,
  Image as ImageIcon,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Filter,
  Check,
  X,
  ThumbsUp,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchAdminReviews,
  updateAdminReviewStatus,
  deleteAdminReview,
} from '../../services/reviewService';

export default function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    avgRating: 5.0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  const loadReviews = async (status = statusFilter, query = search) => {
    setLoading(true);
    try {
      const data = await fetchAdminReviews({
        status,
        search: query,
        limit: 100,
      });
      if (data.success) {
        setReviews(data.reviews || []);
        if (data.summary) setSummary(data.summary);
      } else {
        toast.error('Could not load reviews.');
      }
    } catch (err) {
      toast.error('Failed to connect to reviews endpoint.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews(statusFilter, search);
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadReviews(statusFilter, search);
  };

  const handleStatusChange = async (reviewId, newStatus) => {
    try {
      const res = await updateAdminReviewStatus(reviewId, { status: newStatus });
      if (res.success) {
        toast.success(`Review status changed to ${newStatus}`);
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, status: newStatus } : r))
        );
        // Refresh summary
        loadReviews(statusFilter, search);
      } else {
        toast.error(res.message || 'Failed to update review status');
      }
    } catch {
      toast.error('Error updating review status');
    }
  };

  const handleToggleVerified = async (reviewId, currentVerified) => {
    try {
      const res = await updateAdminReviewStatus(reviewId, {
        isVerifiedBuyer: !currentVerified,
      });
      if (res.success) {
        toast.success(`Verified Buyer status updated`);
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId ? { ...r, isVerifiedBuyer: !currentVerified } : r
          )
        );
      }
    } catch {
      toast.error('Error toggling verified badge');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to permanently delete this customer review?')) return;
    try {
      const res = await deleteAdminReview(reviewId);
      if (res.success) {
        toast.success('Review permanently deleted');
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        loadReviews(statusFilter, search);
      } else {
        toast.error(res.message || 'Failed to delete review');
      }
    } catch {
      toast.error('Error deleting review');
    }
  };

  return (
    <div className="space-y-5 font-sans">
      {/* 1. TOP HEADER & SUMMARY METRICS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 border border-neutral-200 rounded-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-neutral-900">
              Product Reviews & Moderation
            </h2>
            <span className="px-2 py-0.5 text-xs font-semibold bg-neutral-100 text-neutral-800 rounded-xs border border-neutral-200">
              {summary.total} Total
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage live verified ratings, approve/reject customer feedback, and moderate uploaded photoshoot reviews.
          </p>
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reviewer, product, text..."
              className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm pl-8 pr-3 py-1.5 text-xs text-neutral-900 outline-none"
            />
          </form>

          <button
            type="button"
            onClick={() => loadReviews(statusFilter, search)}
            disabled={loading}
            className="p-2 border border-neutral-200 hover:border-neutral-900 rounded-sm text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer bg-white"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-neutral-200 p-3.5 rounded-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400">Total Reviews</div>
            <div className="text-lg font-bold text-neutral-900 mt-0.5">{summary.total}</div>
          </div>
          <div className="h-8 w-8 rounded-sm bg-neutral-100 flex items-center justify-center text-neutral-700">
            <MessageSquare className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-3.5 rounded-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-emerald-600">Approved (Live)</div>
            <div className="text-lg font-bold text-emerald-700 mt-0.5">{summary.approved}</div>
          </div>
          <div className="h-8 w-8 rounded-sm bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-3.5 rounded-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-amber-600">Pending Review</div>
            <div className="text-lg font-bold text-amber-700 mt-0.5">{summary.pending}</div>
          </div>
          <div className="h-8 w-8 rounded-sm bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-3.5 rounded-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400">Avg Store Rating</div>
            <div className="text-lg font-bold text-neutral-900 flex items-center gap-1 mt-0.5">
              <span>{summary.avgRating || 4.9}</span>
              <Star className="w-4 h-4 text-amber-400 fill-current" />
            </div>
          </div>
          <div className="h-8 w-8 rounded-sm bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. FILTER TABS */}
      <div className="flex items-center gap-1.5 border-b border-neutral-200 pb-2">
        {[
          { id: 'all', label: 'All Reviews', count: summary.total },
          { id: 'approved', label: 'Approved (Live)', count: summary.approved },
          { id: 'pending', label: 'Pending Approval', count: summary.pending },
          { id: 'rejected', label: 'Rejected', count: summary.rejected },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors cursor-pointer flex items-center gap-1.5 ${
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

      {/* 4. REVIEWS TABLE & MODERATION ACTIONS */}
      <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2 text-neutral-400">
            <RefreshCw className="w-5 h-5 animate-spin text-neutral-900" />
            <span className="text-xs font-medium">Fetching customer reviews from database...</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <MessageSquare className="w-8 h-8 text-neutral-300 mx-auto" />
            <h4 className="text-xs font-semibold text-neutral-800">No Reviews Found</h4>
            <p className="text-[11px] text-neutral-400 max-w-sm mx-auto">
              {search
                ? `No reviews matched "${search}".`
                : 'Customer reviews submitted on product pages will appear here for moderation.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/70 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3.5">Product</th>
                  <th className="py-2.5 px-3.5">Customer & Rating</th>
                  <th className="py-2.5 px-3.5">Review Feedback</th>
                  <th className="py-2.5 px-3.5">Photos</th>
                  <th className="py-2.5 px-3.5">Verified</th>
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-normal">
                {reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-neutral-50/80 transition-colors">
                    {/* Product Info */}
                    <td className="py-3 px-3.5 max-w-[200px]">
                      <div className="font-semibold text-neutral-900 line-clamp-2">
                        {rev.productTitle}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-1 font-mono">
                        <span>Prod ID: #{rev.productId}</span>
                        {rev.productSlug && (
                          <a
                            href={`/product/${rev.productSlug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-neutral-700 hover:text-neutral-900 inline-flex items-center gap-0.5 underline"
                          >
                            <ExternalLink className="w-2.5 h-2.5" /> View
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Customer & Linked Order */}
                    <td className="py-3 px-3.5 min-w-[190px]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-neutral-900">{rev.authorName}</span>
                          <span className="text-[9px] font-mono px-1 py-0.2 bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-xs">
                            {rev.customerId}
                          </span>
                        </div>

                        {/* WhatsApp Phone & Email */}
                        <div className="flex flex-col text-[10px] text-neutral-500 font-mono space-y-0.5">
                          {rev.authorPhone && (
                            <a
                              href={`https://wa.me/${rev.authorPhone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-700 hover:underline flex items-center gap-1"
                            >
                              <span>📱 +{rev.authorPhone.replace(/[^0-9]/g, '')}</span>
                            </a>
                          )}
                          {rev.authorEmail && (
                            <span className="text-neutral-400 truncate max-w-[170px]">{rev.authorEmail}</span>
                          )}
                        </div>

                        {/* Linked Order Record */}
                        {rev.orderNumber && (
                          <div className="pt-1 border-t border-neutral-100 flex items-center gap-1 text-[10px] text-neutral-600">
                            <span className="font-medium text-neutral-800">Order:</span>
                            <span className="font-mono bg-neutral-100 px-1 rounded-xs">{rev.orderNumber}</span>
                            {rev.orderDate && (
                              <span className="text-neutral-400">
                                ({new Date(rev.orderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Star Rating & Review Body */}
                    <td className="py-3 px-3.5 max-w-[280px]">
                      <div className="space-y-1">
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < rev.rating ? 'fill-current' : 'text-neutral-200'
                              }`}
                            />
                          ))}
                          <span className="ml-1.5 text-[10px] font-semibold text-neutral-800 font-mono">
                            {rev.rating}.0 / 5
                          </span>
                        </div>

                        {rev.title && (
                          <div className="font-semibold text-neutral-900 text-xs">
                            {rev.title}
                          </div>
                        )}
                        <p className="text-neutral-600 text-[11px] leading-relaxed line-clamp-3">
                          {rev.comment}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-neutral-400 pt-0.5 font-mono">
                          {rev.sizePurchased && <span>Size: {rev.sizePurchased}</span>}
                          {rev.fitFeedback && (
                            <>
                              <span>•</span>
                              <span>{rev.fitFeedback}</span>
                            </>
                          )}
                          {rev.helpfulVotes > 0 && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-0.5 text-neutral-600">
                                <ThumbsUp className="w-2.5 h-2.5" /> {rev.helpfulVotes}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Photos */}
                    <td className="py-3 px-3.5">
                      {rev.images && rev.images.length > 0 ? (
                        <div className="flex items-center gap-1 flex-wrap max-w-[100px]">
                          {rev.images.map((imgSrc, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setPreviewImage(imgSrc)}
                              className="h-9 w-9 rounded-xs overflow-hidden border border-neutral-200 hover:ring-1 hover:ring-neutral-900 transition-all cursor-pointer"
                            >
                              <img
                                src={imgSrc}
                                alt="review"
                                className="h-full w-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-neutral-400 italic text-[10px]">No photos</span>
                      )}
                    </td>

                    {/* Verified Buyer Toggle */}
                    <td className="py-3 px-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleVerified(rev.id, rev.isVerifiedBuyer)}
                        className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-xs border transition-colors cursor-pointer ${
                          rev.isVerifiedBuyer
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-neutral-200'
                        }`}
                        title="Click to toggle verified buyer badge"
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span>{rev.isVerifiedBuyer ? 'Verified' : 'Unverified'}</span>
                      </button>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3.5">
                      {rev.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Approved
                        </span>
                      )}
                      {rev.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-xs border border-amber-200">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                      {rev.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-xs border border-red-200">
                          <XCircle className="w-3 h-3" />
                          Rejected
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {rev.status !== 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(rev.id, 'approved')}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-sm border border-emerald-200 transition-colors cursor-pointer"
                            title="Approve Review (Make Live)"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {rev.status !== 'rejected' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(rev.id, 'rejected')}
                            className="p-1.5 bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white rounded-sm border border-amber-200 transition-colors cursor-pointer"
                            title="Reject Review"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDelete(rev.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors cursor-pointer"
                          title="Delete Review Permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PHOTO PREVIEW LIGHTBOX */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-xl max-h-[85vh] bg-white rounded-sm overflow-hidden p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 p-1.5 bg-black/70 text-white rounded-full hover:bg-black transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={previewImage}
              alt="Customer review photo"
              className="max-h-[75vh] w-auto mx-auto object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
