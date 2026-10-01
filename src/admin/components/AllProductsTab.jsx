import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Edit2, 
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Eye,
  Layers,
  Palette,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { ADMIN_API_BASE } from '../../config/api';
import EditProductModal from './EditProductModal';

export default function AllProductsTab({ onNavigateToAdd }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ADMIN_API_BASE}/products`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      } else {
        toast.error('Failed to load products');
      }
    } catch (err) {
      toast.error('Could not connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const token = localStorage.getItem('xavonic_admin_token');
      const res = await fetch(`${ADMIN_API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Product "${title}" deleted`);
        setProducts(prev => prev.filter(p => p.id !== id));
      } else {
        toast.error(data.message || 'Failed to delete');
      }
    } catch (err) {
      toast.error('Error deleting product');
    }
  };

  // Filter products
  const filtered = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
    const matchesGender = genderFilter === 'ALL' || p.gender_target === genderFilter || p.gender_target === 'Unisex';
    const matchesCat = categoryFilter === 'ALL' || p.category_slug === categoryFilter;
    return matchesSearch && matchesGender && matchesCat;
  });

  return (
    <div className="space-y-5 font-sans">
      
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 border border-neutral-200 rounded-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-neutral-900">
              Activewear Products Catalog
            </h2>
            <span className="px-2 py-0.5 text-xs font-semibold bg-neutral-100 text-neutral-800 rounded-xs border border-neutral-200">
              {products.length} Products
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage multi-color galleries, Cloudinary images, pricing, inventory and PDP specs
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToAdd && (
            <button
              onClick={onNavigateToAdd}
              className="px-3.5 py-1.5 bg-neutral-900 hover:bg-red-600 text-white rounded-sm text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Product</span>
            </button>
          )}

          <button
            onClick={fetchProducts}
            disabled={loading}
            className="p-2 border border-neutral-200 hover:border-neutral-900 rounded-sm text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer bg-white"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Search & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 border border-neutral-200 rounded-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product title, SKU..."
            className="w-full bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-sm pl-8 pr-3 py-1.5 text-xs text-neutral-900 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Gender Filter */}
          <div className="flex items-center border border-neutral-200 rounded-sm p-0.5 bg-neutral-50 text-[11px]">
            {['ALL', 'Men', 'Women'].map((g) => (
              <button
                key={g}
                onClick={() => setGenderFilter(g)}
                className={`px-2.5 py-1 rounded-xs font-medium transition-colors cursor-pointer ${
                  genderFilter === g ? 'bg-neutral-900 text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Products Table */}
      <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2 text-neutral-400">
            <RefreshCw className="w-5 h-5 animate-spin text-neutral-900" />
            <span className="text-xs font-medium">Loading Products from MySQL Database...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Package className="w-8 h-8 text-neutral-300 mx-auto" />
            <h4 className="text-xs font-semibold text-neutral-800">No Products Found</h4>
            <p className="text-[11px] text-neutral-400">
              Click "Add Product" to create your first item with multi-color galleries.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/70 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3.5">Thumbnail</th>
                  <th className="py-2.5 px-3.5">Product Title & SKU</th>
                  <th className="py-2.5 px-3.5">Category</th>
                  <th className="py-2.5 px-3.5">Price & MRP</th>
                  <th className="py-2.5 px-3.5">Colors & Gallery</th>
                  <th className="py-2.5 px-3.5">Stock</th>
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-normal">
                {filtered.map((prod) => {
                  const mainThumbnail = prod.colors?.[0]?.gallery?.[0] || prod.colors?.[0]?.image || prod.gallery?.[0];
                  const totalPhotosCount = prod.colors?.reduce((acc, c) => acc + (c.gallery?.length || (c.image ? 1 : 0)), 0) || 0;

                  return (
                    <tr key={prod.id} className="hover:bg-neutral-50/80 transition-colors">
                      
                      {/* Thumbnail */}
                      <td className="py-2.5 px-3.5">
                        {mainThumbnail ? (
                          <div className="w-12 h-14 rounded-xs overflow-hidden bg-neutral-900 border border-neutral-200 relative group">
                            <img src={mainThumbnail} alt={prod.title} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-14 rounded-xs bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-400">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                      </td>

                      {/* Title & SKU */}
                      <td className="py-2.5 px-3.5">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-neutral-900 text-xs line-clamp-1">
                            {prod.title}
                          </div>
                          <div className="text-[10px] font-mono text-neutral-400">
                            SKU: {prod.sku || `GDL-${prod.id}`}
                          </div>
                          <div className="text-[10px] text-neutral-500">
                            Sizes: {prod.sizes?.join(', ')}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-2.5 px-3.5">
                        <span className="inline-flex px-1.5 py-0.2 rounded-xs text-[10px] font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
                          {prod.category_name || prod.category_slug}
                        </span>
                        <div className="text-[10px] text-neutral-400 mt-0.5">{prod.gender_target}</div>
                      </td>

                      {/* Price & MRP */}
                      <td className="py-2.5 px-3.5">
                        <div className="font-semibold text-neutral-900">
                          ₹{Number(prod.price).toLocaleString('en-IN')}.00
                        </div>
                        {prod.original_price > prod.price && (
                          <div className="text-[10px] text-neutral-400 line-through">
                            ₹{Number(prod.original_price).toLocaleString('en-IN')}.00
                          </div>
                        )}
                        {prod.discount_label && (
                          <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded-xs border border-emerald-200">
                            {prod.discount_label}
                          </span>
                        )}
                      </td>

                      {/* Color Variants & Gallery stats */}
                      <td className="py-2.5 px-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            {prod.colors?.map((col, idx) => (
                              <span
                                key={idx}
                                className="w-3.5 h-3.5 rounded-full border border-neutral-300 shadow-2xs"
                                style={{ backgroundColor: col.hex }}
                                title={`${col.name} (${col.gallery?.length || 1} photos)`}
                              />
                            ))}
                          </div>
                          <div className="text-[10px] text-neutral-500 font-medium">
                            {prod.colors?.length || 0} Colors • {totalPhotosCount} Photos Total
                          </div>
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="py-2.5 px-3.5">
                        {(() => {
                          const sizeStockObj = (typeof prod.size_stock === 'object' && prod.size_stock !== null)
                            ? prod.size_stock
                            : (typeof prod.size_stock_json === 'string'
                                ? (() => { try { return JSON.parse(prod.size_stock_json); } catch { return {}; } })()
                                : (prod.size_stock_json || {}));
                          const stockEntries = Object.entries(sizeStockObj);
                          const totalUnits = Number(prod.stock ?? 0);

                          return (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className={`font-semibold text-xs ${
                                  totalUnits === 0 ? 'text-red-600' : totalUnits <= 5 ? 'text-amber-600' : 'text-neutral-900'
                                }`}>
                                  {totalUnits} units total
                                </span>
                              </div>

                              {stockEntries.length > 0 ? (
                                <div className="flex flex-wrap gap-1 max-w-[180px]">
                                  {stockEntries.map(([k, v]) => {
                                    const count = Number(v);
                                    const isOut = count === 0;
                                    const isLow = count > 0 && count <= 3;
                                    return (
                                      <span
                                        key={k}
                                        className={`inline-flex items-center px-1.5 py-0.5 rounded-xs text-[9px] font-medium border ${
                                          isOut
                                            ? 'bg-red-50 text-red-700 border-red-200'
                                            : isLow
                                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                                            : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                                        }`}
                                        title={`${k}: ${count} available`}
                                      >
                                        <span className="font-semibold">{k}:</span>&nbsp;{count}
                                        {isOut && <span className="ml-0.5 text-[8px] text-red-600 font-bold">(Out)</span>}
                                      </span>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="text-[10px] text-neutral-400">
                                  Default ({prod.sizes?.join('/') || 'S/M/L/XL'})
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3.5">
                        {(() => {
                          const sizeStockObj = (typeof prod.size_stock === 'object' && prod.size_stock !== null)
                            ? prod.size_stock
                            : (typeof prod.size_stock_json === 'string'
                                ? (() => { try { return JSON.parse(prod.size_stock_json); } catch { return {}; } })()
                                : (prod.size_stock_json || {}));
                          const totalUnits = Number(prod.stock ?? 0);
                          const hasOutVariants = Object.values(sizeStockObj).some(v => Number(v) === 0);
                          const hasLowVariants = Object.values(sizeStockObj).some(v => Number(v) > 0 && Number(v) <= 3);

                          if (totalUnits === 0) {
                            return (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-xs border border-red-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                <span>Out of Stock</span>
                              </span>
                            );
                          }

                          if (hasOutVariants || hasLowVariants) {
                            return (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-xs border border-amber-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                  <span>Low Stock Alert</span>
                                </span>
                              </div>
                            );
                          }

                          return (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-xs border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>In Stock</span>
                            </span>
                          );
                        })()}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingProduct(prod);
                              setIsEditModalOpen(true);
                            }}
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-sm transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(prod.id, prod.title)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors cursor-pointer"
                            title="Delete Product"
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

      {/* Edit Product Modal */}
      {isEditModalOpen && (
        <EditProductModal
          product={editingProduct}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingProduct(null);
          }}
          onProductUpdated={() => {
            fetchProducts();
          }}
        />
      )}

    </div>
  );
}
