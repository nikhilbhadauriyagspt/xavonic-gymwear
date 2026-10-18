import React, { useState } from 'react';
import {
  Plus,
  Upload,
  Image as ImageIcon,
  RefreshCw,
  CheckCircle2,
  ArrowLeft,
  Eye,
  EyeOff,
  LayoutGrid,
  SlidersHorizontal,
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

export default function AddCategoryTab({ onCategoryCreated, onCancel }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Gender & Identity
  const [genderTarget, setGenderTarget] = useState('Men'); // 'Men' | 'Women' | 'Unisex'
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [status, setStatus] = useState('active');

  // Step 2: Home Page Placement Controls
  const [showTitleOverlay, setShowTitleOverlay] = useState(true);
  const [showInDualSection, setShowInDualSection] = useState(true);
  const [kickerTitle, setKickerTitle] = useState('Topwear & T-Shirts');

  // Step 3: Banner Image Upload
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');

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
      } else if (customImageUrl) {
        formData.append('image_url', customImageUrl.trim());
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
        toast.success(`Category "${name}" created & live on website!`);
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

  const hasBannerImage = Boolean(imagePreview || customImageUrl);

  return (
    <div className="w-full space-y-6 font-sans pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 border border-neutral-200 rounded-sm">
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
              Select Gender (Men / Women / Unisex), enter category name, and choose where it appears on the Home Page
            </p>
          </div>
        </div>
      </div>

      {/* Form Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* LEFT COLUMN: Step-by-Step Category Setup (7 cols) */}
        <div className="md:col-span-7 space-y-4">
          {/* STEP 1: Gender & Category Name */}
          <div className="bg-white p-4 sm:p-5 border border-neutral-200 rounded-sm space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
              <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                Step 1: Select Gender & Category Name
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-xs">
                Required
              </span>
            </div>

            {/* Target Gender */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-neutral-800 block">
                1. Kis Section Me Dikhana Hai? (Gender) *
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'Men', label: 'Men', sub: 'Shows in MEN Menu' },
                  { id: 'Women', label: 'Women', sub: 'Shows in WOMEN Menu' },
                  { id: 'Unisex', label: 'Unisex (Both)', sub: 'Shows in Men & Women' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGenderTarget(g.id)}
                    className={`p-2.5 text-left rounded-sm border transition-all cursor-pointer ${
                      genderTarget === g.id
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="text-xs font-semibold">{g.label}</div>
                    <div
                      className={`text-[10px] mt-0.5 ${
                        genderTarget === g.id ? 'text-neutral-300' : 'text-neutral-400'
                      }`}
                    >
                      {g.sub}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Name & URL Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-800">
                  2. Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Compression T-Shirts, Oversized Tees"
                  className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-3 py-2 text-xs text-neutral-900 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-600">
                  URL Slug (Auto-generated)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. compression-t-shirts"
                  className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-3 py-2 text-xs text-neutral-900 outline-none font-mono"
                />
              </div>
            </div>

            {/* Menu Group / Kicker Title */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-neutral-800 block">
                3. Clothing Group / Heading (For Header Menu & Slider Tagline)
              </label>
              <div className="flex flex-wrap gap-1.5 pb-1">
                {QUICK_MENU_GROUPS.map((grp) => (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => setKickerTitle(grp)}
                    className={`px-2.5 py-1 rounded-xs text-[11px] font-medium border transition-colors cursor-pointer ${
                      kickerTitle === grp
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-400'
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
                placeholder="Or type custom group e.g. Topwear & T-Shirts, Heavyweight Line"
                className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-3 py-1.5 text-xs text-neutral-900 outline-none"
              />
            </div>

            {/* Tagline / Subtitle */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-neutral-700">
                4. Short Card Subtitle (Optional — shows below category name on banner)
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. 2nd Skin High Elastic Performance"
                className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-3 py-2 text-xs text-neutral-900 outline-none"
              />
            </div>
          </div>

          {/* STEP 2: Home Page Display Options */}
          <div className="bg-white p-4 sm:p-5 border border-neutral-200 rounded-sm space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
              <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                Step 2: Home Page Display Settings
              </h3>
            </div>

            {/* Toggle 1: Home Page Product Slider Row */}
            <div className="p-3.5 border border-neutral-200 rounded-sm bg-neutral-50/60 flex items-center justify-between gap-4">
              <div className="flex items-start gap-2.5">
                <SlidersHorizontal className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-neutral-900">
                    Show Product Slider Row on Home Page (&ldquo;Shop {name || 'Category'}&rdquo;)
                  </h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Jab aap is category me products add karenge, to Home Page par is category ka alag product slider dikhega.
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={showInDualSection}
                onChange={(e) => setShowInDualSection(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded cursor-pointer accent-red-600 shrink-0"
              />
            </div>

            {/* Toggle 2: Banner Text Display Toggle */}
            <div className="p-3.5 border border-neutral-200 rounded-sm bg-neutral-50/60 flex items-center justify-between gap-4">
              <div className="flex items-start gap-2.5">
                <LayoutGrid className="w-4 h-4 text-neutral-800 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-neutral-900">
                    Show Category Name Text Over Banner Image
                  </h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    {showTitleOverlay
                      ? 'Photo ke upar Category ka Name aur Arrow button likha aayega.'
                      : 'Photo ke upar koi text nahi aayega (agar aapke poster me pehle se text likha hai).'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowTitleOverlay(!showTitleOverlay)}
                className={`p-1.5 px-3 rounded-sm text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border shrink-0 ${
                  showTitleOverlay
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                }`}
              >
                {showTitleOverlay ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{showTitleOverlay ? 'Text ON' : 'Text OFF'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Banner Image Upload & Live Preview (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white p-4 sm:p-5 border border-neutral-200 rounded-sm space-y-3.5">
            <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
              Step 3: Category Card Image & Live Preview
            </h3>

            {/* File Dropzone */}
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-neutral-700 block">
                Upload Category Banner Image (For Home Page Category Grid)
              </label>

              <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 hover:border-neutral-900 rounded-sm p-4 text-center cursor-pointer transition-colors bg-neutral-50/50 hover:bg-neutral-50">
                <Upload className="w-5 h-5 text-neutral-400 mb-1" />
                <span className="text-xs font-medium text-neutral-800">
                  {imageFile ? imageFile.name : 'Click to Upload Image from PC'}
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

            {/* Direct Image URL input */}
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

            {/* Where will this category show summary */}
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-sm space-y-1.5 text-[11px]">
              <div className="font-semibold text-neutral-900">Website Placement Summary:</div>
              <div className="flex items-center gap-1.5 text-neutral-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Header Menu: <strong>{genderTarget}</strong> &rarr; {kickerTitle || 'Collections'} &rarr;{' '}
                  <strong>{name || 'Category Name'}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-700">
                <CheckCircle2
                  className={`w-3.5 h-3.5 shrink-0 ${
                    hasBannerImage ? 'text-emerald-600' : 'text-amber-500'
                  }`}
                />
                <span>
                  Home Category Grid:{' '}
                  <strong>
                    {hasBannerImage ? 'Will show on Home Page' : 'Upload an image above to show on Home Grid'}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-700">
                <CheckCircle2
                  className={`w-3.5 h-3.5 shrink-0 ${
                    showInDualSection ? 'text-emerald-600' : 'text-neutral-400'
                  }`}
                />
                <span>
                  Home Product Slider:{' '}
                  <strong>
                    {showInDualSection ? `Enabled ("Shop ${name || 'Category'}")` : 'Disabled'}
                  </strong>
                </span>
              </div>
            </div>

            {/* Live Frontend Card Preview */}
            <div className="pt-1">
              <label className="text-[11px] font-medium text-neutral-600 block mb-1.5">
                Home Page Category Card Live Preview
              </label>

              <div className="relative aspect-4/5 rounded-sm overflow-hidden bg-neutral-900 border border-neutral-200 shadow-xs group">
                {hasBannerImage ? (
                  <img
                    src={imagePreview || customImageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 gap-1">
                    <ImageIcon className="w-8 h-8 stroke-[1.5]" />
                    <span className="text-[10px]">Upload image to preview Home Card</span>
                  </div>
                )}

                {showTitleOverlay && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3.5 text-white">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-red-500 block">
                      {genderTarget} • {kickerTitle || 'Collection'}
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
                  <span>Saving Category...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save & Publish Category</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
