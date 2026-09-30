import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  RefreshCw, 
  Save, 
  Eye, 
  EyeOff, 
  ExternalLink 
} from 'lucide-react';
import { toast } from 'sonner';
import { ADMIN_API_BASE } from '../../config/api';

export default function EditCategoryModal({ category, allCategories = [], isOpen, onClose, onCategoryUpdated }) {
  if (!isOpen || !category) return null;

  const [name, setName] = useState(category.name || '');
  const [slug, setSlug] = useState(category.slug || '');
  const [genderTarget, setGenderTarget] = useState(category.gender_target || 'Men');
  const [level, setLevel] = useState(category.level || 'item_type');
  const [parentId, setParentId] = useState(category.parent_id || '');
  const [showTitleOverlay, setShowTitleOverlay] = useState(Boolean(category.show_title_overlay !== 0 && category.show_title_overlay !== '0'));
  const [showInDualSection, setShowInDualSection] = useState(Boolean(category.show_in_dual_section !== 0 && category.show_in_dual_section !== '0'));
  const [kickerTitle, setKickerTitle] = useState(category.kicker_title || '');
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
      setLevel(category.level || 'item_type');
      setParentId(category.parent_id || '');
      setShowTitleOverlay(Boolean(category.show_title_overlay !== 0 && category.show_title_overlay !== '0'));
      setShowInDualSection(Boolean(category.show_in_dual_section !== 0 && category.show_in_dual_section !== '0'));
      setKickerTitle(category.kicker_title || '');
      setSubtitle(category.subtitle || '');
      setSortOrder(category.sort_order || 0);
      setStatus(category.status || 'active');
      setImagePreview(category.image_url || '');
      setCustomImageUrl(category.image_url || '');
      setImageFile(null);
    }
  }, [category]);

  const handleNameChange = (val) => {
    setName(val);
  };

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
      formData.append('name', name);
      formData.append('slug', slug);
      formData.append('gender_target', genderTarget);
      formData.append('level', level);
      if (parentId) {
        formData.append('parent_id', parentId);
      } else {
        formData.append('parent_id', '');
      }
      formData.append('show_title_overlay', showTitleOverlay ? 1 : 0);
      formData.append('show_in_dual_section', showInDualSection ? 1 : 0);
      formData.append('kicker_title', kickerTitle);
      formData.append('subtitle', subtitle);
      formData.append('sort_order', sortOrder);
      formData.append('status', status);

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (customImageUrl !== category.image_url) {
        formData.append('image_url', customImageUrl);
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

  // Filter out self from possible parents
  const availableParents = allCategories.filter(c => c.id !== category.id);

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
                Update category details, Cloudinary banner, and frontend overlay toggle
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
                <label className="text-[11px] font-medium text-neutral-700 uppercase tracking-wider block">
                  Gender Target
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
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Level & Parent */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-neutral-700 uppercase tracking-wider block">
                    Hierarchy Level
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-3 py-1.5 text-xs text-neutral-900 outline-none"
                  >
                    <option value="main">Main (Root)</option>
                    <option value="sub">Sub-Category</option>
                    <option value="item_type">Item Type / Drop</option>
                  </select>
                </div>

                {level !== 'main' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-neutral-700 uppercase tracking-wider block">
                      Parent Category
                    </label>
                    <select
                      value={parentId}
                      onChange={(e) => setParentId(e.target.value)}
                      className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-3 py-1.5 text-xs text-neutral-900 outline-none"
                    >
                      <option value="">-- No Parent --</option>
                      {availableParents.map((c) => (
                        <option key={c.id} value={c.id}>
                          [{c.gender_target}] {c.level.toUpperCase()} : {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-neutral-700 uppercase tracking-wider block">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
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

              {/* Subtitle / Tagline */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-700 uppercase tracking-wider block">
                  Subtitle / Tagline (Optional)
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. 2nd Skin High Elastic Performance"
                  className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-3 py-1.5 text-xs text-neutral-900 outline-none"
                />
              </div>

              {/* Sort Order & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-neutral-700 uppercase tracking-wider block">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-3 py-1.5 text-xs text-neutral-900 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-neutral-700 uppercase tracking-wider block">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-3 py-1.5 text-xs text-neutral-900 outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Dual Slider Featured Section Toggle */}
              <div className="p-3.5 bg-red-50/50 border border-red-200/80 rounded-sm space-y-2.5">
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
                  <div className="space-y-1 pt-1 border-t border-red-200/60">
                    <label className="text-[10px] font-semibold text-neutral-700 uppercase tracking-wider block">
                      Section Kicker / Top Tagline
                    </label>
                    <input
                      type="text"
                      value={kickerTitle}
                      onChange={(e) => setKickerTitle(e.target.value)}
                      placeholder="e.g. Bottomwear Line, Heavyweight Fits, Summer Drop"
                      className="w-full bg-white border border-red-200 focus:border-neutral-900 rounded-sm px-2.5 py-1 text-xs text-neutral-900 outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Title Overlay Toggle */}
              <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-sm flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-neutral-900">Show Title Text Over Banner</h4>
                  <p className="text-[11px] text-neutral-500">
                    {showTitleOverlay
                      ? 'Text overlay is ON (Category name renders on banner)'
                      : 'Overlay OFF (Pure graphic banner without typography)'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowTitleOverlay(!showTitleOverlay)}
                  className={`px-3 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                    showTitleOverlay
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-neutral-200 text-neutral-700 border-neutral-300'
                  }`}
                >
                  {showTitleOverlay ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{showTitleOverlay ? 'Overlay ON' : 'Overlay OFF'}</span>
                </button>
              </div>

            </div>

            {/* Right Column: Cloudinary Image & Live Preview (5 cols) */}
            <div className="md:col-span-5 space-y-4">
              
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-neutral-700 uppercase tracking-wider block">
                  Update Banner Image (Cloudinary)
                </label>

                <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 hover:border-neutral-900 rounded-sm p-3 text-center cursor-pointer transition-colors bg-neutral-50/50 hover:bg-neutral-50">
                  <Upload className="w-4 h-4 text-neutral-400 mb-1" />
                  <span className="text-xs font-medium text-neutral-800">
                    {imageFile ? imageFile.name : 'Upload New Image to Cloudinary'}
                  </span>
                  <span className="text-[10px] text-neutral-400 mt-0.5">
                    Leave empty to keep existing image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Direct Image URL input */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-600 block">Or Image URL</label>
                <input
                  type="url"
                  value={customImageUrl}
                  onChange={(e) => {
                    setCustomImageUrl(e.target.value);
                    if (e.target.value) setImagePreview(e.target.value);
                  }}
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-3 py-1.5 text-xs text-neutral-900 outline-none font-mono text-[11px]"
                />
              </div>

              {/* Frontend Card Live Preview */}
              <div>
                <label className="text-[11px] font-medium text-neutral-600 block mb-1.5">
                  Frontend Banner Live Look
                </label>
                <div className="relative aspect-4/5 rounded-sm overflow-hidden bg-neutral-900 border border-neutral-200 shadow-xs group">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 gap-1">
                      <ImageIcon className="w-8 h-8 stroke-[1.5]" />
                      <span className="text-[10px]">No banner image</span>
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

            </div>

          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-semibold rounded-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-neutral-900 hover:bg-red-600 text-white text-xs font-semibold rounded-sm transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating Category...</span>
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
