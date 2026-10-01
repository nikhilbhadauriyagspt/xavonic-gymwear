import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Upload, 
  Image as ImageIcon, 
  RefreshCw, 
  Trash2, 
  Check, 
  ArrowLeft,
  Sparkles,
  Layers,
  Palette,
  Ruler,
  Tag,
  Info,
  DollarSign,
  Box,
  Eye,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { ADMIN_API_BASE } from '../../config/api';

export default function AddProductTab({ onProductCreated, onCancel }) {
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Basic Info
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [genderTarget, setGenderTarget] = useState('Men');
  const [categoryId, setCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [categorySlug, setCategorySlug] = useState('');

  // Cascading Category States
  const [selectedMainCat, setSelectedMainCat] = useState('');
  const [selectedSubCat, setSelectedSubCat] = useState('');
  const [selectedItemDrop, setSelectedItemDrop] = useState('');

  // 2. Pricing & Stock
  const [price, setPrice] = useState(1299);
  const [originalPrice, setOriginalPrice] = useState(1899);
  const [discountLabel, setDiscountLabel] = useState('30% Off');
  const [stock, setStock] = useState(100);
  const [inStock, setInStock] = useState(true);
  const [sizeStock, setSizeStock] = useState({
    S: 20,
    M: 30,
    L: 30,
    XL: 15,
    XXL: 5,
  });

  // 3. Sizes (Checkboxes)
  const [availableSizes, setAvailableSizes] = useState(['S', 'M', 'L', 'XL', 'XXL']);
  const allPossibleSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

  // 4. Color Variants (Each with its own name, hex, and multiple gallery images)
  const [colors, setColors] = useState([
    {
      id: 'color-1',
      name: 'Stealth Black',
      hex: '#000000',
      galleryFiles: [],
      galleryPreviews: [],
    },
    {
      id: 'color-2',
      name: 'Blood Red',
      hex: '#dc2626',
      galleryFiles: [],
      galleryPreviews: [],
    }
  ]);

  // Active color being previewed
  const [activePreviewColorIdx, setActivePreviewColorIdx] = useState(0);

  // 5. Specs & PDP Tabs
  const [fabric, setFabric] = useState('85% Nylon, 15% Spandex Muscle-Lock Matrix');
  const [fit, setFit] = useState('Second-Skin Compression Lock');
  const [modelStats, setModelStats] = useState("Model is 5'11\" (82kg) wearing size M");
  const [description, setDescription] = useState('Engineered for maximum blood flow, vascularity display, and joint warmth. Seamless 4-way stretch holds muscle bellies tight while eliminating chafing during intense lifts.');
  const [features, setFeatures] = useState([
    'Reinforced Flatlock 4-needle stitching',
    'Targeted lat and pec compression zones',
    'Quick-dry sweat-wicking capillary technology',
    'Anti-microbial and silver-ion odor barrier'
  ]);
  const [newFeatureInput, setNewFeatureInput] = useState('');
  const [careInstructions, setCareInstructions] = useState('Machine wash cold with similar colors. Do not bleach or use fabric softeners. Tumble dry low or hang dry.');

  // Fetch hierarchical categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch(`${ADMIN_API_BASE}/categories`);
        const data = await res.json();
        if (data.success && data.categories) {
          setCategories(data.categories);
          if (data.categories.length > 0) {
            const first = data.categories.find(c => c.level === 'item_type') || data.categories[0];
            setCategoryId(first.id);
            setCategoryName(first.name);
            setCategorySlug(first.slug);
          }
        }
      } catch (err) {
        console.warn('Could not load categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Title -> Slug & SKU generator
  const handleTitleChange = (val) => {
    setTitle(val);
    const genSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setSlug(genSlug);
    if (!sku) {
      const code = val.slice(0, 3).toUpperCase() || 'GDL';
      setSku(`GDL-${code}-${Math.floor(100 + Math.random() * 900)}`);
    }
  };

  // Auto calculate discount
  const handlePriceChange = (newPrice, newOrigPrice) => {
    const p = Number(newPrice) || 0;
    const op = Number(newOrigPrice) || 0;
    setPrice(p);
    setOriginalPrice(op);
    if (op > p && p > 0) {
      const disc = Math.round(((op - p) / op) * 100);
      setDiscountLabel(`${disc}% Off`);
    } else {
      setDiscountLabel('');
    }
  };

  // Toggle Size Checkbox
  const toggleSize = (sz) => {
    setAvailableSizes(prev => 
      prev.includes(sz) ? prev.filter(s => s !== sz) : [...prev, sz]
    );
  };

  // Add new Color Variant
  const addColorVariant = () => {
    const newId = `color-${Date.now()}`;
    setColors(prev => [
      ...prev,
      {
        id: newId,
        name: 'New Color',
        hex: '#18181b',
        galleryFiles: [],
        galleryPreviews: []
      }
    ]);
  };

  // Remove Color Variant
  const removeColorVariant = (idx) => {
    if (colors.length <= 1) {
      toast.error('At least one color variant is required');
      return;
    }
    setColors(prev => prev.filter((_, i) => i !== idx));
    if (activePreviewColorIdx >= colors.length - 1) {
      setActivePreviewColorIdx(0);
    }
  };

  // Handle Multi-file Upload for specific Color Variant
  const handleColorFilesChange = (colorIdx, e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newPreviews = [];
    files.forEach(file => {
      newPreviews.push(URL.createObjectURL(file));
    });

    setColors(prev => {
      const updated = [...prev];
      updated[colorIdx] = {
        ...updated[colorIdx],
        galleryFiles: [...updated[colorIdx].galleryFiles, ...files],
        galleryPreviews: [...updated[colorIdx].galleryPreviews, ...newPreviews]
      };
      return updated;
    });
  };

  // Remove an image from a specific color's gallery
  const removeColorImage = (colorIdx, imgIdx) => {
    setColors(prev => {
      const updated = [...prev];
      const targetColor = updated[colorIdx];
      targetColor.galleryFiles = targetColor.galleryFiles.filter((_, i) => i !== imgIdx);
      targetColor.galleryPreviews = targetColor.galleryPreviews.filter((_, i) => i !== imgIdx);
      return updated;
    });
  };

  // Add Feature bullet
  const addFeature = () => {
    if (!newFeatureInput.trim()) return;
    setFeatures(prev => [...prev, newFeatureInput.trim()]);
    setNewFeatureInput('');
  };

  // Remove Feature bullet
  const removeFeature = (idx) => {
    setFeatures(prev => prev.filter((_, i) => i !== idx));
  };

  // Auto calculate total stock from available sizes & sizeStock
  useEffect(() => {
    let total = 0;
    availableSizes.forEach((sz) => {
      total += Number(sizeStock[sz] !== undefined ? sizeStock[sz] : 10);
    });
    if (total >= 0) {
      setStock(total);
    }
  }, [sizeStock, availableSizes]);

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Product title is required.');
      return;
    }

    if (colors.length === 0) {
      toast.error('Please add at least one color variant.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('xavonic_admin_token');
      const formData = new FormData();

      formData.append('title', title);
      formData.append('slug', slug);
      formData.append('sku', sku);
      formData.append('category_id', categoryId);
      formData.append('category_name', categoryName);
      formData.append('category_slug', categorySlug);
      formData.append('gender_target', genderTarget);
      formData.append('price', price);
      formData.append('original_price', originalPrice);
      formData.append('discount_label', discountLabel);
      formData.append('stock', stock);
      formData.append('size_stock_json', JSON.stringify(sizeStock));
      formData.append('in_stock', inStock && stock > 0 ? 1 : 0);
      formData.append('fabric', fabric);
      formData.append('fit', fit);
      formData.append('model_stats', modelStats);
      formData.append('description', description);
      formData.append('care_instructions', careInstructions);
      formData.append('status', 'active');
      formData.append('sizes_json', JSON.stringify(availableSizes));
      formData.append('features_json', JSON.stringify(features));

      // Build colors JSON payload and append files
      const colorsPayload = colors.map((c, cIdx) => {
        // Append all files for this color with specific fieldname
        c.galleryFiles.forEach((file, fIdx) => {
          formData.append(`color_${cIdx}_image_${fIdx}`, file);
        });

        return {
          name: c.name,
          hex: c.hex,
          image: '', // Will be populated by backend Cloudinary upload
          gallery: []
        };
      });

      formData.append('colors_json', JSON.stringify(colorsPayload));

      const res = await fetch(`${ADMIN_API_BASE}/products`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Product "${title}" uploaded to Cloudinary & saved to MySQL!`);
        if (onProductCreated) onProductCreated(data.product);
      } else {
        toast.error(data.message || 'Failed to save product');
      }
    } catch (err) {
      toast.error('Could not connect to backend server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeColor = colors[activePreviewColorIdx] || colors[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans pb-12">
      
      {/* 1. Header Bar */}
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
            <h2 className="text-base sm:text-lg font-semibold text-neutral-900">Add New Activewear Product</h2>
            <p className="text-xs text-neutral-500">
              Create rich product with Multi-Color galleries (5–7 Cloudinary images per color), fabric specs & sizes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-1.5 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-sm text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* ======================================================== */}
        {/* CARD 1: BASIC INFORMATION & CATEGORY HIERARCHY          */}
        {/* ======================================================== */}
        <div className="bg-white p-5 border border-neutral-200 rounded-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <Box className="w-4 h-4 text-neutral-800" />
            <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
              1. Basic Information & Hierarchy
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Title */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-[11px] font-medium text-neutral-700 uppercase tracking-wider block">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Pro Muscle-Lock Compression Shirt"
                className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-3 py-2 text-xs text-neutral-900 outline-none"
              />
            </div>

            {/* SKU */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-neutral-700 uppercase tracking-wider block">
                SKU Identifier
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. GDL-CMP-001"
                className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-3 py-2 text-xs text-neutral-900 outline-none font-mono"
              />
            </div>

            {/* Target Gender */}
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

            {/* 3-Tier Cascading Category Selector */}
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-neutral-50/80 border border-neutral-200 rounded-sm">
              {/* Main Category */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-700 block">
                  1. Main Category (Root)
                </label>
                <select
                  value={selectedMainCat}
                  onChange={(e) => {
                    setSelectedMainCat(e.target.value);
                    setSelectedSubCat('');
                    setSelectedItemDrop('');
                  }}
                  className="w-full bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-2.5 py-1.5 text-xs text-neutral-900 outline-none"
                >
                  <option value="">-- Select Main Category --</option>
                  {categories.filter(c => c.level === 'main').map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.gender_target})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub Category */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-700 block">
                  2. Sub-Category
                </label>
                <select
                  value={selectedSubCat}
                  onChange={(e) => {
                    setSelectedSubCat(e.target.value);
                    setSelectedItemDrop('');
                  }}
                  className="w-full bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-2.5 py-1.5 text-xs text-neutral-900 outline-none"
                >
                  <option value="">-- Select Sub-Category --</option>
                  {categories
                    .filter(c => c.level === 'sub' && (!selectedMainCat || String(c.parent_id) === String(selectedMainCat)))
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Sub-Sub Item Type */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-700 block">
                  3. Sub-Sub Item Type (Fit / Drop)
                </label>
                <select
                  value={selectedItemDrop}
                  onChange={(e) => {
                    const selId = e.target.value;
                    setSelectedItemDrop(selId);
                    const catObj = categories.find(c => String(c.id) === selId);
                    if (catObj) {
                      setCategoryId(catObj.id);
                      setCategoryName(catObj.name);
                      setCategorySlug(catObj.slug);
                    }
                  }}
                  className="w-full bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-2.5 py-1.5 text-xs font-semibold text-neutral-900 outline-none"
                >
                  <option value="">-- Select Specific Fit Drop --</option>
                  {categories
                    .filter(c => c.level === 'item_type' && (!selectedSubCat || String(c.parent_id) === String(selectedSubCat)))
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Or Quick Category Search Selector */}
              <div className="sm:col-span-3 pt-2 border-t border-neutral-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[11px] text-neutral-500">
                  Selected Category: <strong className="text-neutral-900">{categoryName || 'None'}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-neutral-400">Search & Select All:</span>
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      const sel = categories.find(c => String(c.id) === e.target.value);
                      if (sel) {
                        setCategoryId(sel.id);
                        setCategoryName(sel.name);
                        setCategorySlug(sel.slug);
                        setSelectedItemDrop(sel.id);
                      }
                    }}
                    className="bg-white border border-neutral-200 rounded-sm px-2 py-1 text-xs text-neutral-800 outline-none"
                  >
                    <option value="">-- All Categories List --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        [{c.gender_target}] {c.level.toUpperCase()} : {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Slug */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-neutral-700 uppercase tracking-wider block">
                URL Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-3 py-2 text-xs text-neutral-900 outline-none font-mono"
              />
            </div>

          </div>
        </div>

        {/* ======================================================== */}
        {/* CARD 2: PRICING, DISCOUNT & INVENTORY                    */}
        {/* ======================================================== */}
        <div className="bg-white p-5 border border-neutral-200 rounded-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <DollarSign className="w-4 h-4 text-neutral-800" />
            <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
              2. Pricing, Discounts & Stock
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            {/* Selling Price */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-neutral-700 uppercase tracking-wider block">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => handlePriceChange(e.target.value, originalPrice)}
                className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-3 py-2 text-xs font-semibold text-neutral-900 outline-none font-mono"
              />
            </div>

            {/* Original MRP */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-neutral-700 uppercase tracking-wider block">
                Original MRP (₹)
              </label>
              <input
                type="number"
                value={originalPrice}
                onChange={(e) => handlePriceChange(price, e.target.value)}
                className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-3 py-2 text-xs text-neutral-500 outline-none font-mono"
              />
            </div>

            {/* Discount Badge */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-neutral-700 uppercase tracking-wider block">
                Discount Badge
              </label>
              <input
                type="text"
                value={discountLabel}
                onChange={(e) => setDiscountLabel(e.target.value)}
                placeholder="e.g. 30% Off"
                className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-3 py-2 text-xs text-emerald-700 font-semibold outline-none"
              />
            </div>

            {/* Stock Count */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-neutral-700 uppercase tracking-wider block">
                Stock Units Available
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-3 py-2 text-xs text-neutral-900 outline-none font-mono"
              />
            </div>

          </div>

          {/* Sizes Checkboxes */}
          <div className="pt-2 border-t border-neutral-100">
            <label className="text-[11px] font-medium text-neutral-700 uppercase tracking-wider block mb-2">
              Available Sizes for Product
            </label>
            <div className="flex flex-wrap gap-2">
              {allPossibleSizes.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => toggleSize(sz)}
                  className={`h-8 min-w-10 px-3 text-xs font-semibold rounded-sm border transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    availableSizes.includes(sz)
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  {availableSizes.includes(sz) && <Check className="w-3 h-3 text-white" />}
                  <span>{sz}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ⚡ SIZE-WISE & VARIANT INVENTORY MATRIX */}
          <div className="pt-3 border-t border-neutral-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-neutral-900 block">
                  Size-Wise & Color Variant Inventory Matrix
                </span>
                <span className="text-[10px] text-neutral-500">
                  Set exact stock units per size. Low stock (&le; 3) and Out of stock (0) badges are automatically assigned.
                </span>
              </div>
              <span className="text-xs font-semibold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded-xs border border-neutral-200">
                Total Stock: {stock} units
              </span>
            </div>

            {/* Sizes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
              {availableSizes.map((sz) => {
                const currentSzStock = sizeStock[sz] !== undefined ? sizeStock[sz] : 20;
                const isLow = currentSzStock > 0 && currentSzStock <= 3;
                const isOut = currentSzStock === 0;

                return (
                  <div
                    key={`add-sz-stock-${sz}`}
                    className={`p-2.5 rounded-sm border text-xs space-y-1.5 ${
                      isOut
                        ? 'bg-red-50/60 border-red-200'
                        : isLow
                        ? 'bg-amber-50/60 border-amber-200'
                        : 'bg-neutral-50/80 border-neutral-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-neutral-900">Size {sz}</span>
                      {isOut ? (
                        <span className="text-[9px] px-1 py-0.2 bg-red-600 text-white rounded-2xs font-mono uppercase font-bold">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="text-[9px] px-1 py-0.2 bg-amber-500 text-white rounded-2xs font-mono uppercase font-bold">
                          Low: {currentSzStock}
                        </span>
                      ) : (
                        <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded-2xs border border-emerald-200 font-mono font-bold">
                          In Stock
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        value={currentSzStock}
                        onChange={(e) => {
                          const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                          setSizeStock((prev) => ({
                            ...prev,
                            [sz]: val,
                          }));
                        }}
                        className="w-full bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-2 py-1 text-xs font-mono outline-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Color + Size Combinations (Optional Variant breakdown) */}
            {colors.length > 1 && (
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-neutral-700 block mb-1.5">
                  Color-Specific Variant Breakdown (Optional Multi-Color Stock)
                </span>
                <div className="space-y-2 bg-neutral-50/70 p-3 border border-neutral-200 rounded-sm">
                  {colors.map((col) => (
                    <div key={col.id || col.name} className="flex flex-wrap items-center gap-2 text-xs py-1.5 border-b border-neutral-200/60 last:border-b-0">
                      <div className="flex items-center gap-2 w-32 shrink-0">
                        <span className="h-3.5 w-3.5 rounded-full border border-neutral-300 shrink-0" style={{ backgroundColor: col.hex }} />
                        <span className="font-medium text-neutral-900 truncate">{col.name || 'Unnamed Color'}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 flex-1">
                        {availableSizes.map((sz) => {
                          const comboKey = `${col.name}_${sz}`;
                          const comboStock = sizeStock[comboKey] !== undefined ? sizeStock[comboKey] : (sizeStock[sz] || 10);
                          return (
                            <div key={comboKey} className="flex items-center gap-1 bg-white border border-neutral-200 px-2 py-1 rounded-sm text-[11px]">
                              <span className="text-neutral-500 font-mono">{sz}:</span>
                              <input
                                type="number"
                                min="0"
                                value={comboStock}
                                onChange={(e) => {
                                  const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                                  setSizeStock((prev) => ({
                                    ...prev,
                                    [comboKey]: val,
                                  }));
                                }}
                                className="w-12 bg-transparent text-xs font-mono outline-none text-right font-medium"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARD 3: COLOR VARIANTS & MULTI-IMAGE GALLERIES           */}
        {/* ======================================================== */}
        <div className="bg-white p-5 border border-neutral-200 rounded-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-neutral-800" />
              <div>
                <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                  3. Color Variants & Individual Galleries (Cloudinary)
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Each color has its own 5–7 photos (Front, Back, Side, Close-up Fabric, Model).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={addColorVariant}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-red-600 text-white text-xs font-semibold rounded-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Color Variant</span>
            </button>
          </div>

          {/* Color Cards Stack */}
          <div className="space-y-4">
            {colors.map((col, cIdx) => (
              <div 
                key={col.id || cIdx}
                className="p-4 border border-neutral-200 rounded-sm bg-neutral-50/50 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  {/* Color Name & Hex Input */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={col.hex}
                        onChange={(e) => {
                          const val = e.target.value;
                          setColors(prev => {
                            const copy = [...prev];
                            copy[cIdx].hex = val;
                            return copy;
                          });
                        }}
                        className="w-8 h-8 rounded-xs border border-neutral-300 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={col.hex}
                        onChange={(e) => {
                          const val = e.target.value;
                          setColors(prev => {
                            const copy = [...prev];
                            copy[cIdx].hex = val;
                            return copy;
                          });
                        }}
                        className="w-20 bg-white border border-neutral-200 rounded-sm px-2 py-1 text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <input
                        type="text"
                        value={col.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setColors(prev => {
                            const copy = [...prev];
                            copy[cIdx].name = val;
                            return copy;
                          });
                        }}
                        placeholder="Color Name (e.g. Stealth Black)"
                        className="bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-2.5 py-1 text-xs font-semibold text-neutral-900 outline-none w-48 sm:w-60"
                      />
                    </div>
                  </div>

                  {/* Remove Color Variant */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActivePreviewColorIdx(cIdx)}
                      className={`px-2.5 py-1 text-[11px] rounded-sm font-medium transition-colors cursor-pointer border ${
                        activePreviewColorIdx === cIdx
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'bg-white text-neutral-600 border-neutral-200'
                      }`}
                    >
                      Preview on PDP
                    </button>

                    <button
                      type="button"
                      onClick={() => removeColorVariant(cIdx)}
                      className="p-1 text-neutral-400 hover:text-red-600 rounded-sm transition-colors cursor-pointer"
                      title="Remove Color"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Upload multi images for this color */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-[11px] text-neutral-600">
                    <span>Gallery Photos for <strong>{col.name || 'this color'}</strong> ({col.galleryPreviews.length} Selected):</span>
                    <span className="text-[10px] text-neutral-400">Front, Back, Side, Fabric, Model</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                    
                    {/* Selected Image Previews */}
                    {col.galleryPreviews.map((imgSrc, imgIdx) => (
                      <div key={imgIdx} className="relative aspect-3/4 rounded-xs overflow-hidden bg-neutral-900 border border-neutral-200 group">
                        <img src={imgSrc} alt="Preview" className="w-full h-full object-cover" />
                        <span className="absolute top-1 left-1 px-1.5 py-0.2 bg-black/70 text-white text-[9px] rounded-xs font-mono">
                          #{imgIdx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeColorImage(cIdx, imgIdx)}
                          className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    ))}

                    {/* Add Image Dropzone Tile */}
                    <label className="aspect-3/4 flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 hover:border-neutral-900 rounded-xs text-center cursor-pointer transition-colors bg-white hover:bg-neutral-50 p-2">
                      <Upload className="w-4 h-4 text-neutral-400 mb-1" />
                      <span className="text-[11px] font-medium text-neutral-700">Add Photos</span>
                      <span className="text-[9px] text-neutral-400">Multi-select</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleColorFilesChange(cIdx, e)}
                        className="hidden"
                      />
                    </label>

                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>

        {/* ======================================================== */}
        {/* CARD 4: TECHNICAL SPECS, FIT, FABRIC & HIGHLIGHTS        */}
        {/* ======================================================== */}
        <div className="bg-white p-5 border border-neutral-200 rounded-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <Info className="w-4 h-4 text-neutral-800" />
            <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
              4. Technical Specs, Fabric Composition & PDP Story
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Fabric */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-neutral-700 uppercase tracking-wider block">
                Fabric Composition *
              </label>
              <input
                type="text"
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                placeholder="e.g. 240 GSM 100% Combed French Terry Cotton"
                className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-3 py-2 text-xs text-neutral-900 outline-none"
              />
            </div>

            {/* Fit */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-neutral-700 uppercase tracking-wider block">
                Fit Silhouette *
              </label>
              <input
                type="text"
                value={fit}
                onChange={(e) => setFit(e.target.value)}
                placeholder="e.g. Relaxed Drop-Shoulder Oversized Boxy Fit"
                className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-3 py-2 text-xs text-neutral-900 outline-none"
              />
            </div>

            {/* Model Stats */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-neutral-700 uppercase tracking-wider block">
                Model Stats
              </label>
              <input
                type="text"
                value={modelStats}
                onChange={(e) => setModelStats(e.target.value)}
                placeholder="e.g. Model is 6'1 wearing size L"
                className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-3 py-2 text-xs text-neutral-900 outline-none"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-3 space-y-1">
              <label className="text-[11px] font-medium text-neutral-700 uppercase tracking-wider block">
                Description & Performance Story *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write detailed design notes and gym utility benefits..."
                className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm p-3 text-xs text-neutral-900 outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Features Bullets (Why you'll like it) */}
            <div className="md:col-span-3 space-y-2">
              <label className="text-[11px] font-medium text-neutral-700 uppercase tracking-wider block">
                Key Bullet Features ("Why You'll Like It")
              </label>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFeatureInput}
                  onChange={(e) => setNewFeatureInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); }}}
                  placeholder="e.g. Reinforced Flatlock 4-needle stitching for zero friction"
                  className="flex-1 bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-3 py-1.5 text-xs text-neutral-900 outline-none"
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-4 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-sm transition-colors cursor-pointer"
                >
                  Add Feature
                </button>
              </div>

              {/* Active Features list */}
              <div className="flex flex-wrap gap-2 pt-1">
                {features.map((feat, fIdx) => (
                  <div 
                    key={fIdx}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 border border-neutral-200 rounded-sm text-xs text-neutral-800"
                  >
                    <span>• {feat}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(fIdx)}
                      className="text-neutral-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Care instructions */}
            <div className="md:col-span-3 space-y-1">
              <label className="text-[11px] font-medium text-neutral-700 uppercase tracking-wider block">
                Care & Washing Instructions
              </label>
              <input
                type="text"
                value={careInstructions}
                onChange={(e) => setCareInstructions(e.target.value)}
                className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm px-3 py-2 text-xs text-neutral-900 outline-none"
              />
            </div>

          </div>
        </div>

        {/* Submit Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs font-semibold rounded-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-2.5 bg-neutral-900 hover:bg-red-600 text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Uploading to Cloudinary & Saving Product...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Publish Product Live</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
