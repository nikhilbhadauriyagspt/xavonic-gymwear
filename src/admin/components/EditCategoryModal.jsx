import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  RefreshCw,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { ADMIN_API_BASE } from '../../config/api';

const QUICK_MENU_GROUPS = [
  'Topwear & T-Shirts',
  'Bottomwear & Shorts',
  'Compression & Innerwear',
  'Hoodies & Winterwear',
  'Stringers & Tanks',
  'Accessories',
];

export default function EditCategoryModal({ category, isOpen, onClose, onCategoryUpdated }) {
  if (!isOpen || !category) return null;

  const [name, setName] = useState(category.name || '');
  const [slug, setSlug] = useState(category.slug || '');
  const [genderTarget, setGenderTarget] = useState(category.gender_target || 'Men');
  const [showTitleOverlay, setShowTitleOverlay] = useState(
    Boolean(category.show_title_overlay !== 0 && category.show_title_overlay !== '0')
  );
  const [showInDualSection, setShowInDualSection] = useState(
    Boolean(category.show_in_dual_section !== 0 && category.show_in_dual_section !== '0')
  );
  const [kickerTitle, setKickerTitle] = useState(category.kicker_title || 'Topwear & T-Shirts');
  const [subtitle, setSubtitle] = useState(category.subtitle || '');
  const [sortOrder, setSortOrder] = useState(category.sort_order || 0);
  const [status, setStatus] = useState(category.status || 'active');

  // Image upload
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(category.image_url || '');
  const [customImageUrl, setCustomImageUrl] = useState(category.image_url || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setSlug(category.slug || '');
      setGenderTarget(category.gender_target || 'Men');
      setShowTitleOverlay(Boolean(category.show_title_overlay !== 0 && category.show_title_overlay !== '0'));
      setShowInDualSection(Boolean(category.show_in_dual_section !== 0 && category.show_in_dual_section !== '0'));
      setKickerTitle(category.kicker_title || 'Topwear & T-Shirts');
      setSubtitle(category.subtitle || '');
      setSortOrder(category.sort_order || 0);
      setStatus(category.status || 'active');
      setImagePreview(category.image_url || '');
      setCustomImageUrl(category.image_url || '');
      setImageFile(null);
    }
  }, [category]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('xavonic_admin_token');
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('slug', slug.trim());
      formData.append('gender_target', genderTarget);
      formData.append('level', 'item_type');
      formData.append('show_title_overlay', showTitleOverlay ? 1 : 0);
      formData.append('show_in_dual_section', showInDualSection ? 1 : 0);
      formData.append('kicker_title', kickerTitle.trim());
      formData.append('subtitle', subtitle.trim());
      formData.append('sort_order', sortOrder);
      formData.append('status', status);

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (customImageUrl !== category.image_url) {
        formData.append('image_url', customImageUrl.trim());
      }

      const res = await fetch(`${ADMIN_API_BASE}/categories/${category.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Category "${name}" updated successfully!`);
        if (onCategoryUpdated) onCategoryUpdated(data.category);
        onClose();
      } else {
        toast.error(data.message || 'Failed to update category');
      }
    } catch (err) {
      toast.error('Could not connect to backend server');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs font-sans animate-in fade-in duration-200">
      <div
        className="bg-white border border-neutral-200 rounded-sm w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 bg-neutral-50/60">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-neutral-900 text-white rounded-xs">
              <Save className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">
                Edit Category: <span className="text-red-600">{category.name}</span>
              </h3>
              <p className="text-[11px] text-neutral-500">
                Update Gender, Menu Group, Banner Image & Home Page settings
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-sm transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Left Column: Form Details (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              {/* Gender Target */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-700 uppercase tracking-wider block">
                  Gender Section
                </label>
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
                      {g === 'Unisex' ? 'Unisex (Both)' : g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-700 uppercase tracking-wider block">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-3 py-1.5 text-xs text-neutral-900 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-neutral-700 uppercase tracking-wider block">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-3 py-1.5 text-xs text-neutral-900 outline-none font-mono"
                  />
                </div>
              </div>

              {/* Clothing Group / Heading */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-neutral-700 uppercase tracking-wider block">
                  Clothing Group / Menu Heading
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_MENU_GROUPS.map((grp) => (
                    <button
                      key={grp}
                      type="button"
                      onClick={() => setKickerTitle(grp)}
                      className={`px-2 py-1 rounded-xs text-[10px] font-medium border transition-colors cursor-pointer ${
                        kickerTitle === grp
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-neutral-50 text-neutral-600 border-neutral-200'
                      }`}
                    >
                      {grp}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={kickerTitle}
                  onChange={(e) => setKickerTitle(e.target.value)}
                  placeholder="e.g. Topwear & T-Shirts"
                  className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-3 py-1.5 text-xs text-neutral-900 outline-none"
                />
              </div>

              {/* Subtitle & Sort Order */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-medium text-neutral-700 uppercase tracking-wider block">
                    Subtitle / Tagline
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-3 py-1.5 text-xs text-neutral-900 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-neutral-700 uppercase tracking-wider block">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-3 py-1.5 text-xs text-neutral-900 outline-none"
                  />
                </div>
              </div>

              {/* Home Page Dual Slider Toggle */}
              <div className="p-3.5 bg-red-50/40 border border-red-200 rounded-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-neutral-900 block">
                    Show Product Slider Row on Home Page (&ldquo;Shop {name || 'Category'}&rdquo;)
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Displays a horizontal slider of products from this category on Home Page
                  </span>
                </div>

                <input
                  type="checkbox"
                  checked={showInDualSection}
                  onChange={(e) => setShowInDualSection(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded cursor-pointer accent-red-600"
                />
              </div>

              {/* Overlay Toggle & Status */}
              <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-sm flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-neutral-900 block">
                    Show Category Title Text on Banner
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    {showTitleOverlay ? 'Text overlay ON' : 'Pure graphic poster (Text OFF)'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTitleOverlay(!showTitleOverlay)}
                    className={`px-3 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                      showTitleOverlay
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-neutral-200 text-neutral-700 border-neutral-300'
                    }`}
                  >
                    {showTitleOverlay ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{showTitleOverlay ? 'Text ON' : 'Text OFF'}</span>
                  </button>

                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="bg-white border border-neutral-200 rounded-sm px-2.5 py-1.5 text-xs font-medium text-neutral-800 outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Hidden</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column: Image Upload & Preview (5 cols) */}
            <div className="md:col-span-5 space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-neutral-700 uppercase tracking-wider block">
                  Upload New Banner Image
                </label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 hover:border-neutral-900 rounded-sm p-3 text-center cursor-pointer transition-colors bg-neutral-50/60">
                  <Upload className="w-4 h-4 text-neutral-400 mb-1" />
                  <span className="text-xs font-medium text-neutral-800">
                    {imageFile ? imageFile.name : 'Replace Banner Image'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-600 block">Or Image URL</label>
                <input
                  type="url"
                  value={customImageUrl}
                  onChange={(e) => {
                    setCustomImageUrl(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 rounded-sm px-2.5 py-1.5 text-xs font-mono text-neutral-800 outline-none"
                />
              </div>

              {/* Live Preview Box */}
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-neutral-600 block">Card Live Preview</span>
                <div className="relative aspect-4/4.5 w-full rounded-sm overflow-hidden bg-neutral-900 border border-neutral-200">
                  {imagePreview ? (
                    <img src={imagePreview} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 gap-1">
                      <ImageIcon className="w-7 h-7 stroke-[1.5]" />
                      <span className="text-[10px]">No banner image</span>
                    </div>
                  )}

                  {showTitleOverlay && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-3 text-white">
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-red-500">
                        {genderTarget} • {kickerTitle || 'Collection'}
                      </span>
                      <h4 className="text-sm font-semibold leading-tight">{name}</h4>
                      {subtitle && (
                        <p className="text-[10px] text-zinc-300 font-light mt-0.5 line-clamp-1">{subtitle}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-200 hover:bg-neutral-100 text-neutral-700 rounded-sm text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-neutral-900 hover:bg-red-600 text-white rounded-sm text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
