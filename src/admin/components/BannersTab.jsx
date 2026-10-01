import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Search,
  Check,
  X,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  Eye,
  EyeOff,
  ExternalLink,
  Layers,
  Sparkles,
  AlertCircle,
  Upload,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getAdminBanners,
  createAdminBanner,
  updateAdminBanner,
  toggleAdminBannerStatus,
  deleteAdminBanner,
} from '../../services/bannerService';

const SLOTS = [
  { id: 'all', label: 'All Slots' },
  { id: 'hero', label: 'Hero Slider' },
  { id: 'mid_banner', label: 'Mid Brand Banner' },
  { id: 'mid_feature', label: 'Mid Feature Banner' },
  { id: 'last_mid', label: 'Last Mid Banner' },
];

export default function BannersTab() {
  const [banners, setBanners] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, scheduled: 0, expired: 0, inactive: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    slot: 'hero',
    image_url: '',
    mobile_image_url: '',
    link_url: '/collections',
    button_text: 'Shop Collection',
    badge_text: '',
    sort_order: 0,
    status: 'active',
    start_date: '',
    end_date: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Fetch Banners
  const loadBanners = async () => {
    setIsLoading(true);
    const res = await getAdminBanners({
      slot: selectedSlot,
      status: selectedStatus,
      search: searchQuery,
    });
    if (res.success) {
      setBanners(res.banners || []);
      if (res.stats) setStats(res.stats);
    } else {
      toast.error(res.message || 'Failed to load banners');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadBanners();
  }, [selectedSlot, selectedStatus]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadBanners();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      slot: 'hero',
      image_url: '',
      mobile_image_url: '',
      link_url: '/collections',
      button_text: 'Shop Collection',
      badge_text: '',
      sort_order: banners.length + 1,
      status: 'active',
      start_date: '',
      end_date: '',
    });
    setImageFile(null);
    setImagePreview('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (b) => {
    setEditingBanner(b);
    setFormData({
      title: b.title || '',
      subtitle: b.subtitle || '',
      slot: b.slot || 'hero',
      image_url: b.image_url || '',
      mobile_image_url: b.mobile_image_url || '',
      link_url: b.link_url || '/collections',
      button_text: b.button_text || 'Shop Collection',
      badge_text: b.badge_text || '',
      sort_order: b.sort_order || 0,
      status: b.status || 'active',
      start_date: b.start_date ? b.start_date.substring(0, 16) : '',
      end_date: b.end_date ? b.end_date.substring(0, 16) : '',
    });
    setImageFile(null);
    setImagePreview(b.image_url || '');
    setIsModalOpen(true);
  };

  // Handle Image Selection
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Save Banner Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Please enter a banner title');
      return;
    }
    if (!imageFile && !formData.image_url.trim() && !imagePreview) {
      toast.error('Please provide a banner image (upload file or paste image URL)');
      return;
    }

    setIsSaving(true);
    let payload;

    if (imageFile) {
      payload = new FormData();
      payload.append('image', imageFile);
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          payload.append(key, formData[key]);
        }
      });
    } else {
      payload = { ...formData };
    }

    let res;
    if (editingBanner) {
      res = await updateAdminBanner(editingBanner.id, payload);
    } else {
      res = await createAdminBanner(payload);
    }

    setIsSaving(false);
    if (res.success) {
      toast.success(editingBanner ? 'Banner updated successfully!' : 'Banner created successfully!');
      setIsModalOpen(false);
      loadBanners();
    } else {
      toast.error(res.message || 'Failed to save banner');
    }
  };

  // Toggle Status
  const handleToggleStatus = async (id, currentStatus) => {
    const res = await toggleAdminBannerStatus(id);
    if (res.success) {
      toast.success(`Banner is now ${res.newStatus}`);
      loadBanners();
    } else {
      toast.error(res.message || 'Could not toggle status');
    }
  };

  // Delete Banner
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete banner "${title}"?`)) return;
    const res = await deleteAdminBanner(id);
    if (res.success) {
      toast.success('Banner deleted');
      loadBanners();
    } else {
      toast.error(res.message || 'Failed to delete banner');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
              Banner Management
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-red-100 text-red-700 rounded-full">
              Live Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Configure homepage hero sliders, promotional mid-banners, start/end scheduling dates, and live status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadBanners}
            className="p-2 border border-neutral-200 hover:bg-neutral-100 text-neutral-600 rounded-sm transition-colors cursor-pointer"
            title="Refresh Banners"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-sm transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Banner</span>
          </button>
        </div>
      </div>

      {/* 2. Top Stats Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-sm border border-neutral-200 shadow-2xs">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400">
            Total Banners
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 mt-1">
            {stats.total}
          </div>
        </div>

        <div className="bg-white p-4 rounded-sm border border-neutral-200 shadow-2xs">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-emerald-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            Live Storefront
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            {stats.active}
          </div>
        </div>

        <div className="bg-white p-4 rounded-sm border border-neutral-200 shadow-2xs">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-blue-600 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Scheduled
          </div>
          <div className="text-2xl font-bold font-mono text-blue-700 mt-1">
            {stats.scheduled}
          </div>
        </div>

        <div className="bg-white p-4 rounded-sm border border-neutral-200 shadow-2xs">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400">
            Inactive / Expired
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-500 mt-1">
            {stats.inactive + stats.expired}
          </div>
        </div>
      </div>

      {/* 3. Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-sm border border-neutral-200 space-y-3 shadow-2xs">
        {/* Slot Pills */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-neutral-100 pb-3">
          <span className="text-[11px] font-semibold text-neutral-500 mr-1.5">Slot:</span>
          {SLOTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSlot(s.id)}
              className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
                selectedSlot === s.id
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Status & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-[11px] font-semibold text-neutral-500 mr-1.5">Status:</span>
            {['all', 'active', 'inactive'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1 text-xs font-medium rounded-sm capitalize transition-colors cursor-pointer ${
                  selectedStatus === st
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {st === 'all' ? 'All Status' : st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title or link..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-sm text-xs outline-none focus:border-neutral-900 focus:bg-white transition-colors"
            />
          </div>
        </div>
      </div>

      {/* 4. Banners Grid Showcase */}
      {isLoading ? (
        <div className="bg-white p-12 text-center rounded-sm border border-neutral-200">
          <RefreshCw className="w-6 h-6 animate-spin text-neutral-400 mx-auto mb-2" />
          <p className="text-xs text-neutral-500">Loading banner inventory...</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-sm border border-neutral-200 space-y-3">
          <ImageIcon className="w-10 h-10 text-neutral-300 mx-auto" />
          <h3 className="text-sm font-semibold text-neutral-900">No Banners Found</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            {searchQuery || selectedSlot !== 'all' || selectedStatus !== 'all'
              ? 'No banners matched your active filter criteria.'
              : 'Add your first promotional hero slide or mid-banner to showcase products on the storefront.'}
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-1.5 bg-neutral-900 text-white text-xs font-semibold rounded-sm hover:bg-black transition-colors"
          >
            Create Banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((b) => {
            const isLive = b.scheduleState === 'Live Now';
            const isScheduled = b.scheduleState === 'Scheduled (Upcoming)';
            const isExpired = b.scheduleState === 'Expired';

            return (
              <div
                key={b.id}
                className="bg-white rounded-sm border border-neutral-200 shadow-2xs overflow-hidden flex flex-col justify-between group hover:border-neutral-400 transition-colors"
              >
                {/* Banner Thumbnail Preview */}
                <div>
                  <div className="relative aspect-[16/9] w-full bg-neutral-100 overflow-hidden border-b border-neutral-200">
                    <img
                      src={b.image_url}
                      alt={b.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />

                    {/* Slot badge */}
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <span className="bg-black/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-xs uppercase tracking-wider">
                        {b.slot.replace('_', ' ')}
                      </span>
                      {b.badge_text && (
                        <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase">
                          {b.badge_text}
                        </span>
                      )}
                    </div>

                    {/* Order Pill */}
                    <div className="absolute top-2 right-2 bg-white/90 text-neutral-800 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-xs shadow-xs">
                      #{b.sort_order}
                    </div>

                    {/* Schedule State Overlay Bar */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-white flex items-center justify-between text-[11px]">
                      <span className="font-semibold truncate">{b.button_text || 'Shop Now'}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-xs uppercase ${
                          isLive
                            ? 'bg-emerald-500 text-white'
                            : isScheduled
                            ? 'bg-blue-500 text-white'
                            : isExpired
                            ? 'bg-amber-500 text-black'
                            : 'bg-neutral-600 text-white'
                        }`}
                      >
                        {b.scheduleState}
                      </span>
                    </div>
                  </div>

                  {/* Banner Content Details */}
                  <div className="p-3.5 space-y-2 text-xs">
                    <div>
                      <h4 className="font-bold text-neutral-900 text-sm line-clamp-1">
                        {b.title}
                      </h4>
                      {b.subtitle && (
                        <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                          {b.subtitle}
                        </p>
                      )}
                    </div>

                    <div className="text-[11px] text-neutral-600 flex items-center gap-1 font-mono truncate bg-neutral-50 p-1.5 rounded-xs border border-neutral-100">
                      <ExternalLink className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                      <span className="truncate">{b.link_url || '/collections'}</span>
                    </div>

                    {/* Scheduling Dates Info */}
                    <div className="space-y-1 text-[10px] text-neutral-500 font-mono pt-1">
                      {b.start_date && (
                        <div className="flex items-center gap-1 text-neutral-700">
                          <Calendar className="w-3 h-3 text-blue-600" />
                          <span>Start: {new Date(b.start_date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        </div>
                      )}
                      {b.end_date && (
                        <div className="flex items-center gap-1 text-neutral-700">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>End: {new Date(b.end_date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        </div>
                      )}
                      {!b.start_date && !b.end_date && (
                        <span className="text-neutral-400 italic">Always active (no date limits)</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Bottom Actions */}
                <div className="p-3 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(b.id, b.status)}
                    className={`px-2.5 py-1 rounded-xs text-[11px] font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                      b.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-neutral-100 text-neutral-600 border-neutral-300 hover:bg-neutral-200'
                    }`}
                  >
                    {b.status === 'active' ? (
                      <>
                        <Eye className="w-3 h-3 text-emerald-600" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3 text-neutral-400" />
                        <span>Inactive</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(b)}
                      className="p-1.5 hover:bg-neutral-200 text-neutral-700 rounded-xs transition-colors cursor-pointer"
                      title="Edit Banner"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(b.id, b.title)}
                      className="p-1.5 hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded-xs transition-colors cursor-pointer"
                      title="Delete Banner"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. ADD / EDIT BANNER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-sm border border-neutral-200 w-full max-w-2xl p-5 sm:p-6 shadow-2xl space-y-4 my-8 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  {editingBanner ? 'Edit Banner' : 'Create New Banner'}
                </h3>
                <p className="text-xs text-neutral-500">
                  Configure banner media, redirect links, active toggle, and optional launch dates.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-900 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Slot & Sort Order */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-neutral-700 mb-1">
                    Banner Slot / Placement *
                  </label>
                  <select
                    value={formData.slot}
                    onChange={(e) => setFormData({ ...formData, slot: e.target.value })}
                    className="w-full border border-neutral-300 rounded-xs p-2 text-xs outline-none bg-white text-neutral-900 font-medium cursor-pointer focus:border-neutral-900"
                  >
                    <option value="hero" className="bg-white text-neutral-900">Hero Carousel Slider (Homepage Top)</option>
                    <option value="mid_banner" className="bg-white text-neutral-900">Mid Brand Banner (Brand Statement)</option>
                    <option value="mid_feature" className="bg-white text-neutral-900">Mid Feature Banner (Mid Section)</option>
                    <option value="last_mid" className="bg-white text-neutral-900">Last Mid Banner (Bottom Section)</option>
                    <option value="announcement" className="bg-white text-neutral-900">Announcement Bar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-700 mb-1">
                    Display Priority / Sort
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                    className="w-full border border-neutral-300 rounded-xs p-2 text-xs outline-none font-mono font-semibold"
                  />
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-700 mb-1">
                    Banner Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Heavyweight Aesthetic Oversized Drop"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-neutral-300 rounded-xs p-2 text-xs outline-none focus:border-neutral-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-700 mb-1">
                    Subtitle / Tagline (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 260 GSM French Terry Cotton"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full border border-neutral-300 rounded-xs p-2 text-xs outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              {/* Image Upload / URL */}
              <div className="space-y-2 bg-neutral-50 p-3.5 rounded-sm border border-neutral-200">
                <label className="block text-[10px] uppercase font-bold text-neutral-700">
                  Banner Image (Upload File or Enter Image URL) *
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-neutral-500 block mb-1">Option A: Upload Image File</span>
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 hover:border-neutral-500 rounded-xs p-3 cursor-pointer bg-white transition-colors text-center">
                      <Upload className="w-5 h-5 text-neutral-400 mb-1" />
                      <span className="text-[11px] font-semibold text-neutral-700">
                        {imageFile ? imageFile.name : 'Choose Banner Image'}
                      </span>
                      <span className="text-[9px] text-neutral-400">JPG, PNG, WebP (High Resolution)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div>
                    <span className="text-[10px] text-neutral-500 block mb-1">Option B: Direct Image URL</span>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... or Cloudinary URL"
                      value={formData.image_url}
                      onChange={(e) => {
                        setFormData({ ...formData, image_url: e.target.value });
                        if (!imageFile) setImagePreview(e.target.value);
                      }}
                      className="w-full border border-neutral-300 rounded-xs p-2 text-xs outline-none focus:border-neutral-900 bg-white"
                    />
                    {imagePreview && (
                      <div className="mt-2 relative aspect-[16/6] w-full rounded-xs overflow-hidden border border-neutral-200 bg-black">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Link, Button Text, Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-700 mb-1">
                    Redirect Link URL
                  </label>
                  <input
                    type="text"
                    placeholder="/collections/men-compression-tees"
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    className="w-full border border-neutral-300 rounded-xs p-2 text-xs outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-700 mb-1">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    placeholder="Shop Collection"
                    value={formData.button_text}
                    onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                    className="w-full border border-neutral-300 rounded-xs p-2 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-700 mb-1">
                    Badge Label (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BESTSELLER, 40% OFF"
                    value={formData.badge_text}
                    onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                    className="w-full border border-neutral-300 rounded-xs p-2 text-xs outline-none"
                  />
                </div>
              </div>

              {/* ACTIVE / INACTIVE TOGGLE & SCHEDULING DATES */}
              <div className="p-3.5 bg-neutral-50 rounded-sm border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">Banner Status</span>
                    <span className="text-[11px] text-neutral-500">
                      Enable or disable this banner on storefront without deleting.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        status: formData.status === 'active' ? 'inactive' : 'active',
                      })
                    }
                    className={`px-3 py-1.5 rounded-xs text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                      formData.status === 'active'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-neutral-200 text-neutral-700 border-neutral-300'
                    }`}
                  >
                    {formData.status === 'active' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>ACTIVE</span>
                      </>
                    ) : (
                      <>
                        <X className="w-3.5 h-3.5" />
                        <span>INACTIVE</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Start / End Date Scheduling */}
                <div className="pt-2 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-700 mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-blue-600" />
                      Start Date & Time (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full border border-neutral-300 rounded-xs p-2 text-xs outline-none bg-white font-mono"
                    />
                    <span className="text-[9px] text-neutral-400">Leave blank to make live immediately</span>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-700 mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      End Date & Time (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full border border-neutral-300 rounded-xs p-2 text-xs outline-none bg-white font-mono"
                    />
                    <span className="text-[9px] text-neutral-400">Leave blank to run indefinitely</span>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs font-semibold rounded-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingBanner ? 'Save Changes' : 'Create Banner'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
