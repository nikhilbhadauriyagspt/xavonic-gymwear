import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Upload, 
  Image as ImageIcon, 
  RefreshCw, 
  CheckCircle2, 
  ArrowLeft,
  Sparkles,
  Layers,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { ADMIN_API_BASE } from '../../config/api';

export default function AddCategoryTab({ onCategoryCreated, onCancel }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [genderTarget, setGenderTarget] = useState('Men'); // 'Men' | 'Women' | 'Unisex'
  const [level, setLevel] = useState('item_type'); // 'main' | 'sub' | 'item_type'
  const [parentId, setParentId] = useState('');
  const [showTitleOverlay, setShowTitleOverlay] = useState(true);
  const [showInDualSection, setShowInDualSection] = useState(false);
  const [kickerTitle, setKickerTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [status, setStatus] = useState('active');

  // Image Upload State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Fetch parent categories for dropdown
  useEffect(() => {
    const fetchExistingCategories = async () => {
      try {
        const res = await fetch(`${ADMIN_API_BASE}/categories`);
        const data = await res.json();
        if (data.success) {
          setCategories(data.categories || []);
          // Find default sub-category parent
          const firstSub = (data.categories || []).find(c => c.level === 'sub');
          if (firstSub) setParentId(firstSub.id);
        }
      } catch (err) {
        console.error('Error fetching categories for selector:', err);
      }
    };
    fetchExistingCategories();
  }, []);

  // Auto-generate slug from name
  const handleNameChange = (val) => {
    setName(val);
    const generated = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setSlug(generated);
  };

  // Handle Image File selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Submit Category
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('xavonic_admin_token');
      const formData = new FormData();
      formData.append('name', name);
      formData.append('slug', slug);
      formData.append('gender_target', genderTarget);
      formData.append('level', level);
      if (parentId) formData.append('parent_id', parentId);
      formData.append('show_title_overlay', showTitleOverlay ? 1 : 0);
      formData.append('show_in_dual_section', showInDualSection ? 1 : 0);
      formData.append('kicker_title', kickerTitle);
      formData.append('subtitle', subtitle);
      formData.append('sort_order', sortOrder);
      formData.append('status', status);

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (customImageUrl) {
        formData.append('image_url', customImageUrl);
      }

      const res = await fetch(`${ADMIN_API_BASE}/categories`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Category "${name}" uploaded to Cloudinary and saved to database!`);
        if (onCategoryCreated) onCategoryCreated();
      } else {
        toast.error(data.message || 'Failed to save category');
      }
    } catch (err) {
      toast.error('Could not connect to backend server');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6 font-sans pb-12">
      
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-4 sm:p-5 border border-neutral-200 rounded-sm">
        <div className="flex items-center gap-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-1.5 hover:bg-neutral-100 rounded-sm text-neutral-600 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-base font-semibold text-neutral-900">Add New Category</h2>
            <p className="text-xs text-neutral-500">
              Create category with Cloudinary image upload and visual text overlay control
            </p>
          </div>
        </div>
      </div>

      {/* Form Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: Main Info (8 cols) */}
        <div className="md:col-span-7 space-y-4">
          
          {/* 1. Basic Details Card */}
          <div className="bg-white p-4 sm:p-5 border border-neutral-200 rounded-sm space-y-3.5">
            <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
              Category Hierarchy & Details
            </h3>

            {/* Target Gender */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-neutral-700">Gender Target</label>
              <div className="grid grid-cols-3 gap-2">
                {['Men', 'Women', 'Unisex'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGenderTarget(g)}
                    className={`py-1.5 text-xs font-medium rounded-sm border transition-colors cursor-pointer ${
                      genderTarget === g
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Level */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-neutral-700">Category Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-3 py-2 text-xs text-neutral-900 outline-none"
              >
                <option value="main">Main Root (e.g. Men / Women)</option>
                <option value="sub">Sub-Category (e.g. T-Shirts & Tops, Shorts & Lowers)</option>
                <option value="item_type">Item Type / Banner Drop (e.g. Compression T-Shirt, Dropcut Tee)</option>
              </select>
            </div>

            {/* Parent Category Selector (If not main) */}
            {level !== 'main' && (
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-700">Parent Category</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-3 py-2 text-xs text-neutral-900 outline-none"
                >
                  <option value="">-- Select Parent Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.gender_target}] {c.level.toUpperCase()} : {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Category Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-neutral-700">Category Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Muscle Fit Compression T-Shirt"
                className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-3 py-2 text-xs text-neutral-900 outline-none"
              />
            </div>

            {/* Slug / URL */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-neutral-700">URL Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. compression-t-shirt"
                className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-3 py-2 text-xs text-neutral-900 outline-none font-mono"
              />
            </div>

            {/* Tagline / Subtitle */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-neutral-700">Subtitle / Tagline (Optional)</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. 2nd Skin High Elastic Performance"
                className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-3 py-2 text-xs text-neutral-900 outline-none"
              />
            </div>

          </div>

          {/* 2. Dual Slider Featured Section Toggle */}
          <div className="bg-white p-4 sm:p-5 border border-red-200/80 rounded-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-neutral-900">Show in Home Dual Featured Slider</h4>
                <p className="text-[11px] text-neutral-500">
                  Enable this category to have its own product slider row on the Home Page
                </p>
              </div>

              <input
                type="checkbox"
                checked={showInDualSection}
                onChange={(e) => setShowInDualSection(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded cursor-pointer accent-red-600"
              />
            </div>

            {showInDualSection && (
              <div className="space-y-1 pt-2 border-t border-red-100">
                <label className="text-[11px] font-medium text-neutral-700 block">
                  Section Kicker / Top Tagline
                </label>
                <input
                  type="text"
                  value={kickerTitle}
                  onChange={(e) => setKickerTitle(e.target.value)}
                  placeholder="e.g. Bottomwear Line, Heavyweight Fits, Summer Drop"
                  className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-3 py-1.5 text-xs text-neutral-900 outline-none"
                />
              </div>
            )}
          </div>

          {/* 3. Banner Text Display Toggle */}
          <div className="bg-white p-4 sm:p-5 border border-neutral-200 rounded-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-neutral-900">Show Title Text Over Banner</h4>
                <p className="text-[11px] text-neutral-500">
                  {showTitleOverlay
                    ? 'Frontend will render category name overlay text on banner'
                    : 'Text disabled. Frontend will display pure graphic banner as uploaded'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowTitleOverlay(!showTitleOverlay)}
                className={`p-1.5 px-3 rounded-sm text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                  showTitleOverlay
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                }`}
              >
                {showTitleOverlay ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{showTitleOverlay ? 'Overlay ON' : 'Overlay OFF'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Cloudinary Upload & Live Preview (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          
          <div className="bg-white p-4 sm:p-5 border border-neutral-200 rounded-sm space-y-3.5">
            <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
              Banner & Image Upload (Cloudinary)
            </h3>

            {/* File Dropzone */}
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-neutral-700 block">
                Choose Image File
              </label>

              <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 hover:border-neutral-900 rounded-sm p-4 text-center cursor-pointer transition-colors bg-neutral-50/50 hover:bg-neutral-50">
                <Upload className="w-5 h-5 text-neutral-400 mb-1" />
                <span className="text-xs font-medium text-neutral-800">
                  {imageFile ? imageFile.name : 'Click to Upload to Cloudinary'}
                </span>
                <span className="text-[10px] text-neutral-400 mt-0.5">
                  JPG, PNG, WEBP up to 5MB
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Direct Image URL input (Optional alternative) */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-neutral-600">Or Paste Image URL</label>
              <input
                type="url"
                value={customImageUrl}
                onChange={(e) => {
                  setCustomImageUrl(e.target.value);
                  if (e.target.value) setImagePreview(e.target.value);
                }}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-3 py-1.5 text-xs text-neutral-900 outline-none font-mono"
              />
            </div>

            {/* Live Frontend Card Preview */}
            <div className="pt-2">
              <label className="text-[11px] font-medium text-neutral-600 block mb-1.5">
                Frontend Live Look Preview
              </label>

              <div className="relative aspect-4/5 rounded-sm overflow-hidden bg-neutral-900 border border-neutral-200 shadow-xs group">
                {imagePreview || customImageUrl ? (
                  <img
                    src={imagePreview || customImageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 gap-1">
                    <ImageIcon className="w-8 h-8 stroke-[1.5]" />
                    <span className="text-[10px]">No image selected</span>
                  </div>
                )}

                {/* Simulated Overlay on Banner */}
                {showTitleOverlay && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3.5 text-white">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-red-500 block">
                      {genderTarget} Collection
                    </span>
                    <h4 className="text-sm font-semibold leading-tight">
                      {name || 'Category Name'}
                    </h4>
                    {subtitle && (
                      <p className="text-[10px] text-zinc-300 font-light mt-0.5 line-clamp-1">
                        {subtitle}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-neutral-900 hover:bg-red-600 text-white text-xs font-semibold rounded-sm transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-3"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading to Cloudinary & Saving...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save Category</span>
                </>
              )}
            </button>

          </div>

        </div>

      </form>

    </div>
  );
}
