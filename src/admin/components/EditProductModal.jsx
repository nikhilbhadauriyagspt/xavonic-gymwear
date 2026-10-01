import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  RefreshCw, 
  Trash2, 
  Check, 
  Save,
  Layers,
  Palette,
  DollarSign,
  Box,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { ADMIN_API_BASE } from '../../config/api';

export default function EditProductModal({ product, isOpen, onClose, onProductUpdated }) {
  if (!isOpen || !product) return null;

  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState(product.title || '');
  const [slug, setSlug] = useState(product.slug || '');
  const [sku, setSku] = useState(product.sku || '');
  const [genderTarget, setGenderTarget] = useState(product.gender_target || 'Men');
  const [categoryId, setCategoryId] = useState(product.category_id || '');
  const [categoryName, setCategoryName] = useState(product.category_name || '');
  const [categorySlug, setCategorySlug] = useState(product.category_slug || '');

  const [price, setPrice] = useState(product.price || 0);
  const [originalPrice, setOriginalPrice] = useState(product.original_price || 0);
  const [discountLabel, setDiscountLabel] = useState(product.discount_label || '');
  const [stock, setStock] = useState(product.stock !== undefined ? product.stock : 50);

  const [availableSizes, setAvailableSizes] = useState(product.sizes || ['S', 'M', 'L', 'XL', 'XXL']);
  const allPossibleSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

  // Size-wise / Color-wise stock inventory matrix (e.g. { "S": 10, "M": 15, "Black_M": 5, "Black_L": 2 })
  const [sizeStock, setSizeStock] = useState(() => {
    return product.size_stock || product.sizeStock || {
      'S': 10,
      'M': 15,
      'L': 12,
      'XL': 8,
      'XXL': 5,
    };
  });

  const [colors, setColors] = useState(() => {
    return (product.colors || []).map((c, idx) => ({
      id: `col-${idx}`,
      name: c.name || 'Color',
      hex: c.hex || '#000000',
      image: c.image || '',
      gallery: c.gallery || (c.image ? [c.image] : []),
      newFiles: [],
      newPreviews: []
    }));
  });

  const [fabric, setFabric] = useState(product.fabric || '');
  const [fit, setFit] = useState(product.fit || '');
  const [modelStats, setModelStats] = useState(product.model_stats || '');
  const [description, setDescription] = useState(product.description || '');
  const [features, setFeatures] = useState(product.features || []);
  const [newFeatureInput, setNewFeatureInput] = useState('');
  const [careInstructions, setCareInstructions] = useState(product.care_instructions || '');

  // Cascading Category selection
  const [selectedMainCat, setSelectedMainCat] = useState('');
  const [selectedSubCat, setSelectedSubCat] = useState('');
  const [selectedItemDrop, setSelectedItemDrop] = useState(product.category_id || '');
  const [categorySearch, setCategorySearch] = useState('');

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch(`${ADMIN_API_BASE}/categories`);
        const data = await res.json();
        if (data.success) {
          setCategories(data.categories || []);
          // Preselect hierarchy if category_id exists
          const current = (data.categories || []).find(c => c.id === product.category_id);
          if (current) {
            if (current.level === 'item_type') {
              setSelectedItemDrop(current.id);
              const parent = (data.categories || []).find(c => c.id === current.parent_id);
              if (parent) {
                setSelectedSubCat(parent.id);
                const grandParent = (data.categories || []).find(c => c.id === parent.parent_id);
                if (grandParent) setSelectedMainCat(grandParent.id);
              }
            }
          }
        }
      } catch (err) {}
    };
    fetchCats();
  }, [product.id]);

  const toggleSize = (sz) => {
    setAvailableSizes(prev => 
      prev.includes(sz) ? prev.filter(s => s !== sz) : [...prev, sz]
    );
  };

  const addColorVariant = () => {
    setColors(prev => [
      ...prev,
      {
        id: `col-${Date.now()}`,
        name: 'New Color',
        hex: '#18181b',
        image: '',
        gallery: [],
        newFiles: [],
        newPreviews: []
      }
    ]);
  };

  const removeColorVariant = (idx) => {
    if (colors.length <= 1) {
      toast.error('At least one color is required');
      return;
    }
    setColors(prev => prev.filter((_, i) => i !== idx));
  };

  const handleColorFiles = (cIdx, e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newPreviews = files.map(f => URL.createObjectURL(f));
    setColors(prev => {
      const copy = [...prev];
      copy[cIdx].newFiles = [...copy[cIdx].newFiles, ...files];
      copy[cIdx].newPreviews = [...copy[cIdx].newPreviews, ...newPreviews];
      return copy;
    });
  };

  const removeExistingColorImg = (cIdx, imgUrl) => {
    setColors(prev => {
      const copy = [...prev];
      copy[cIdx].gallery = copy[cIdx].gallery.filter(img => img !== imgUrl);
      if (copy[cIdx].image === imgUrl) {
        copy[cIdx].image = copy[cIdx].gallery[0] || '';
      }
      return copy;
    });
  };

  const removeNewColorImg = (cIdx, imgIdx) => {
    setColors(prev => {
      const copy = [...prev];
      copy[cIdx].newFiles = copy[cIdx].newFiles.filter((_, i) => i !== imgIdx);
      copy[cIdx].newPreviews = copy[cIdx].newPreviews.filter((_, i) => i !== imgIdx);
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('xavonic_admin_token');
      const formData = new FormData();

      formData.append('title', title);
      formData.append('slug', slug);
      formData.append('sku', sku);
      formData.append('category_id', selectedItemDrop || selectedSubCat || selectedMainCat || categoryId);
      formData.append('category_name', categoryName);
      formData.append('category_slug', categorySlug);
      formData.append('gender_target', genderTarget);
      formData.append('price', price);
      formData.append('original_price', originalPrice);
      formData.append('discount_label', discountLabel);
      formData.append('stock', stock);
      formData.append('size_stock_json', JSON.stringify(sizeStock));
      formData.append('fabric', fabric);
      formData.append('fit', fit);
      formData.append('model_stats', modelStats);
      formData.append('description', description);
      formData.append('care_instructions', careInstructions);
      formData.append('sizes_json', JSON.stringify(availableSizes));
      formData.append('features_json', JSON.stringify(features));

      // Append colors with new images
      const colorsPayload = colors.map((c, cIdx) => {
        c.newFiles.forEach((file, fIdx) => {
          formData.append(`color_${cIdx}_image_${fIdx}`, file);
        });

        return {
          name: c.name,
          hex: c.hex,
          image: c.image || c.gallery[0] || '',
          gallery: c.gallery || []
        };
      });

      formData.append('colors_json', JSON.stringify(colorsPayload));

      const res = await fetch(`${ADMIN_API_BASE}/products/${product.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Product "${title}" updated successfully!`);
        if (onProductUpdated) onProductUpdated();
        onClose();
      } else {
        toast.error(data.message || 'Failed to update product');
      }
    } catch (err) {
      toast.error('Could not connect to backend server');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs font-sans">
      <div 
        className="bg-white border border-neutral-200 rounded-sm w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 bg-neutral-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-neutral-900 text-white rounded-xs">
              <Save className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">
                Edit Product: <span className="text-red-600">{product.title}</span>
              </h3>
              <p className="text-[11px] text-neutral-500">
                Update multi-color galleries, Cloudinary images, pricing and specifications
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
          
          {/* 1. Basic Info */}
          <div className="p-4 border border-neutral-200 rounded-sm space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5" /> 1. Title, SKU & Hierarchy
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] font-medium text-neutral-700">Product Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 rounded-sm px-3 py-1.5 text-xs text-neutral-900 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-700">SKU Code</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 rounded-sm px-3 py-1.5 text-xs text-neutral-900 outline-none font-mono"
                />
              </div>
            </div>

            {/* Hierarchical Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-700">Main Root (e.g. Men / Women)</label>
                <select
                  value={selectedMainCat}
                  onChange={(e) => {
                    setSelectedMainCat(e.target.value);
                    setSelectedSubCat('');
                    setSelectedItemDrop('');
                  }}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-2.5 py-1.5 text-xs"
                >
                  <option value="">-- Select Main --</option>
                  {categories.filter(c => c.level === 'main').map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-700">Sub-Category (e.g. T-Shirts)</label>
                <select
                  value={selectedSubCat}
                  onChange={(e) => {
                    setSelectedSubCat(e.target.value);
                    setSelectedItemDrop('');
                  }}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-2.5 py-1.5 text-xs"
                >
                  <option value="">-- Select Sub Category --</option>
                  {categories.filter(c => c.level === 'sub' && (!selectedMainCat || String(c.parent_id) === String(selectedMainCat))).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-700">Sub-Sub Item Type (e.g. Compression)</label>
                <select
                  value={selectedItemDrop}
                  onChange={(e) => {
                    const selId = e.target.value;
                    setSelectedItemDrop(selId);
                    const catObj = categories.find(c => String(c.id) === selId);
                    if (catObj) {
                      setCategoryName(catObj.name);
                      setCategorySlug(catObj.slug);
                    }
                  }}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-2.5 py-1.5 text-xs font-semibold text-neutral-900"
                >
                  <option value="">-- Select Specific Fit --</option>
                  {categories.filter(c => c.level === 'item_type' && (!selectedSubCat || String(c.parent_id) === String(selectedSubCat))).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 2. Pricing & Sizes */}
          <div className="p-4 border border-neutral-200 rounded-sm space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" /> 2. Pricing & Sizes
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-700">Selling Price (₹)</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3 py-1.5 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-700">Original MRP (₹)</label>
                <input
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(Number(e.target.value))}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3 py-1.5 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-700">Discount Tag</label>
                <input
                  type="text"
                  value={discountLabel}
                  onChange={(e) => setDiscountLabel(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3 py-1.5 text-xs text-emerald-700 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-700">Total Product Stock</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3 py-1.5 text-xs font-mono font-semibold"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="text-[11px] font-medium text-neutral-700 block mb-1.5">Available Sizes</label>
              <div className="flex flex-wrap gap-1.5">
                {allPossibleSizes.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => toggleSize(sz)}
                    className={`h-7 px-3 text-xs font-medium rounded-sm border transition-colors cursor-pointer ${
                      availableSizes.includes(sz)
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-white text-neutral-600 border-neutral-200'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* ⚡ VARIANT-LEVEL INVENTORY MATRIX (Size & Color combinations) */}
            <div className="pt-3 border-t border-neutral-100 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-neutral-900 block">
                    Size-Wise & Color Variant Inventory
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    Set exact stock for each size. Low stock (&le; 3) and Out of stock (0) badges are automatically applied.
                  </span>
                </div>
              </div>

              {/* Sizes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
                {availableSizes.map((sz) => {
                  const currentSzStock = sizeStock[sz] !== undefined ? sizeStock[sz] : 10;
                  const isLow = currentSzStock > 0 && currentSzStock <= 3;
                  const isOut = currentSzStock === 0;

                  return (
                    <div
                      key={`sz-stock-${sz}`}
                      className={`p-2.5 rounded-sm border text-xs space-y-1.5 ${
                        isOut
                          ? 'bg-red-50/50 border-red-200'
                          : isLow
                          ? 'bg-amber-50/50 border-amber-200'
                          : 'bg-white border-neutral-200'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-neutral-900">Size {sz}</span>
                        {isOut ? (
                          <span className="text-[9px] px-1 py-0.2 bg-red-600 text-white rounded-2xs font-mono uppercase">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="text-[9px] px-1 py-0.2 bg-amber-500 text-white rounded-2xs font-mono uppercase">
                            Low: {currentSzStock}
                          </span>
                        ) : (
                          <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded-2xs border border-emerald-200 font-mono">
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
                          className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 rounded-sm px-2 py-1 text-xs font-mono outline-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Color + Size Combinations (Optional Variant breakdown) */}
              {colors.length > 1 && (
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-neutral-700 block mb-1">
                    Color-Specific Variant Breakdown (Optional)
                  </span>
                  <div className="space-y-1.5 bg-neutral-50/60 p-2.5 border border-neutral-200 rounded-sm">
                    {colors.map((col) => (
                      <div key={col.id || col.name} className="flex flex-wrap items-center gap-2 text-xs py-1 border-b border-neutral-100 last:border-b-0">
                        <div className="flex items-center gap-1.5 w-28 shrink-0">
                          <span className="h-3 w-3 rounded-full border border-neutral-300" style={{ backgroundColor: col.hex }} />
                          <span className="font-medium text-neutral-900 truncate">{col.name}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 flex-1">
                          {availableSizes.map((sz) => {
                            const comboKey = `${col.name}_${sz}`;
                            const comboStock = sizeStock[comboKey] !== undefined ? sizeStock[comboKey] : (sizeStock[sz] || 5);
                            return (
                              <div key={comboKey} className="flex items-center gap-1 bg-white border border-neutral-200 px-1.5 py-0.5 rounded-sm text-[11px]">
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
                                  className="w-10 text-center bg-transparent border-0 font-mono outline-none font-semibold text-neutral-900"
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

          {/* 3. Color Variants & Multi-Galleries */}
          <div className="p-4 border border-neutral-200 rounded-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" /> 3. Color Variants & Photo Galleries (Cloudinary)
              </h4>
              <button
                type="button"
                onClick={addColorVariant}
                className="px-2.5 py-1 bg-neutral-900 text-white text-xs font-medium rounded-sm flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Add Color
              </button>
            </div>

            <div className="space-y-3">
              {colors.map((col, cIdx) => (
                <div key={col.id || cIdx} className="p-3 bg-neutral-50 border border-neutral-200 rounded-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
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
                        className="w-7 h-7 rounded-xs border p-0 cursor-pointer"
                      />
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
                        className="bg-white border border-neutral-200 rounded-sm px-2 py-1 text-xs font-semibold w-40"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeColorVariant(cIdx)}
                      className="text-neutral-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Existing & New Gallery Photos */}
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 pt-1">
                    {col.gallery?.map((imgUrl, imgIdx) => (
                      <div key={imgIdx} className="relative aspect-3/4 bg-neutral-900 rounded-xs overflow-hidden border border-neutral-200 group">
                        <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExistingColorImg(cIdx, imgUrl)}
                          className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    ))}

                    {col.newPreviews?.map((imgSrc, nIdx) => (
                      <div key={nIdx} className="relative aspect-3/4 bg-neutral-900 rounded-xs overflow-hidden border-2 border-emerald-500 group">
                        <img src={imgSrc} alt="" className="w-full h-full object-cover" />
                        <span className="absolute top-0.5 right-0.5 bg-emerald-600 text-white text-[8px] px-1 font-bold">NEW</span>
                        <button
                          type="button"
                          onClick={() => removeNewColorImg(cIdx, nIdx)}
                          className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    ))}

                    <label className="aspect-3/4 flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 hover:border-neutral-900 bg-white rounded-xs cursor-pointer p-1 text-center">
                      <Upload className="w-3.5 h-3.5 text-neutral-400 mb-0.5" />
                      <span className="text-[10px] font-medium">+ Photos</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleColorFiles(cIdx, e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Technical Specs */}
          <div className="p-4 border border-neutral-200 rounded-sm space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
              4. PDP Technical Specs & Fabric
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-700">Fabric Blend</label>
                <input
                  type="text"
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3 py-1.5 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-700">Fit Silhouette</label>
                <input
                  type="text"
                  value={fit}
                  onChange={(e) => setFit(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3 py-1.5 text-xs"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] font-medium text-neutral-700">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-sm p-2 text-xs outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-neutral-200 text-neutral-700 text-xs font-semibold rounded-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-neutral-900 hover:bg-red-600 text-white text-xs font-semibold rounded-sm transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Product</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
