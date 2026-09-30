import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Search, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Edit2, 
  Image as ImageIcon, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  EyeOff, 
  ChevronRight, 
  ExternalLink 
} from 'lucide-react';
import { toast } from 'sonner';
import EditCategoryModal from './EditCategoryModal';

export default function AllCategoriesTab({ onNavigateToAdd }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('ALL'); // 'ALL' | 'Men' | 'Women'
  const [levelFilter, setLevelFilter] = useState('ALL');

  // Edit Modal State
  const [editingCategory, setEditingCategory] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
      } else {
        toast.error('Failed to load categories');
      }
    } catch (err) {
      toast.error('Could not connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;

    try {
      const token = localStorage.getItem('xavonic_admin_token');
      const res = await fetch(`http://localhost:5000/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Category "${name}" deleted`);
        setCategories(prev => prev.filter(c => c.id !== id));
      } else {
        toast.error(data.message || 'Failed to delete');
      }
    } catch (err) {
      toast.error('Error deleting category');
    }
  };

  // Filter categories
  const filtered = categories.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.slug.toLowerCase().includes(search.toLowerCase());
    const matchesGender = genderFilter === 'ALL' || c.gender_target === genderFilter || c.gender_target === 'Unisex';
    const matchesLevel = levelFilter === 'ALL' || c.level === levelFilter;
    return matchesSearch && matchesGender && matchesLevel;
  });

  return (
    <div className="space-y-5 font-sans">
      
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 border border-neutral-200 rounded-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-neutral-900">
              Category Hierarchy & Banners
            </h2>
            <span className="px-2 py-0.5 text-xs font-semibold bg-neutral-100 text-neutral-800 rounded-xs border border-neutral-200">
              {categories.length} Total
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage Men / Women root categories, sub-categories, and Cloudinary banner images
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToAdd && (
            <button
              onClick={onNavigateToAdd}
              className="px-3.5 py-1.5 bg-neutral-900 hover:bg-red-600 text-white rounded-sm text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Category</span>
            </button>
          )}

          <button
            onClick={fetchCategories}
            disabled={loading}
            className="p-2 border border-neutral-200 hover:border-neutral-900 rounded-sm text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer bg-white"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Search & Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 border border-neutral-200 rounded-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search category name or slug..."
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

          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="bg-neutral-50 border border-neutral-200 rounded-sm px-2.5 py-1.5 text-[11px] text-neutral-800 outline-none"
          >
            <option value="ALL">All Levels</option>
            <option value="main">Main (Root)</option>
            <option value="sub">Sub Category</option>
            <option value="item_type">Item Type (Drop)</option>
          </select>
        </div>
      </div>

      {/* 3. Categories Grid & Table */}
      <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2 text-neutral-400">
            <RefreshCw className="w-5 h-5 animate-spin text-neutral-900" />
            <span className="text-xs font-medium">Loading Cloudinary & MySQL categories...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Layers className="w-8 h-8 text-neutral-300 mx-auto" />
            <h4 className="text-xs font-semibold text-neutral-800">No Categories Found</h4>
            <p className="text-[11px] text-neutral-400">
              Create your first category hierarchy using the "Add Category" button.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/70 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3.5">Banner Image</th>
                  <th className="py-2.5 px-3.5">Category Name & Hierarchy</th>
                  <th className="py-2.5 px-3.5">Slug</th>
                  <th className="py-2.5 px-3.5">Level</th>
                  <th className="py-2.5 px-3.5">Gender</th>
                  <th className="py-2.5 px-3.5">Home Dual Slider</th>
                  <th className="py-2.5 px-3.5">Title Overlay</th>
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-normal">
                {filtered.map((cat) => (
                  <tr key={cat.id} className="hover:bg-neutral-50/80 transition-colors">
                    
                    {/* Banner Image Preview */}
                    <td className="py-2.5 px-3.5">
                      {cat.image_url ? (
                        <div className="w-12 h-14 rounded-xs overflow-hidden bg-neutral-900 border border-neutral-200 relative group">
                          <img
                            src={cat.image_url}
                            alt={cat.name}
                            className="w-full h-full object-cover"
                          />
                          <a
                            href={cat.image_url}
                            target="_blank"
                            rel="noreferrer"
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                            title="View full Cloudinary image"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ) : (
                        <div className="w-12 h-14 rounded-xs bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-400">
                          <ImageIcon className="w-4 h-4 stroke-[1.5]" />
                        </div>
                      )}
                    </td>

                    {/* Name & Hierarchy Path */}
                    <td className="py-2.5 px-3.5">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-neutral-900 text-xs flex items-center gap-1.5">
                          <span>{cat.name}</span>
                        </div>
                        {cat.parent_name && (
                          <div className="text-[10px] text-neutral-400 flex items-center gap-1">
                            <span>Under:</span>
                            <span className="font-medium text-neutral-700">{cat.parent_name}</span>
                          </div>
                        )}
                        {cat.subtitle && (
                          <div className="text-[10px] text-neutral-400 italic">
                            "{cat.subtitle}"
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="py-2.5 px-3.5 font-mono text-[11px] text-neutral-500">
                      /{cat.slug}
                    </td>

                    {/* Level */}
                    <td className="py-2.5 px-3.5">
                      <span className={`inline-flex px-1.5 py-0.2 rounded-xs text-[10px] font-semibold uppercase tracking-wider border ${
                        cat.level === 'main'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : cat.level === 'sub'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                      }`}>
                        {cat.level === 'item_type' ? 'Item Drop' : cat.level}
                      </span>
                    </td>

                    {/* Gender */}
                    <td className="py-2.5 px-3.5">
                      <span className="font-medium text-neutral-700 text-xs">
                        {cat.gender_target}
                      </span>
                    </td>

                    {/* Dual Section Featured Slider Toggle */}
                    <td className="py-2.5 px-3.5">
                      <button
                        type="button"
                        onClick={async () => {
                          const nextVal = cat.show_in_dual_section ? 0 : 1;
                          try {
                            const token = localStorage.getItem('xavonic_admin_token');
                            const res = await fetch(`http://localhost:5000/api/admin/categories/${cat.id}`, {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                              },
                              body: JSON.stringify({ show_in_dual_section: nextVal })
                            });
                            const data = await res.json();
                            if (data.success) {
                              toast.success(`Category "${cat.name}" dual slider updated`);
                              setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, show_in_dual_section: nextVal } : c));
                            }
                          } catch (err) {
                            toast.error('Failed to update dual slider status');
                          }
                        }}
                        className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-xs border cursor-pointer transition-colors ${
                          Boolean(cat.show_in_dual_section)
                            ? 'bg-red-50 text-red-700 border-red-200 font-semibold'
                            : 'bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-neutral-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${Boolean(cat.show_in_dual_section) ? 'bg-red-600' : 'bg-neutral-400'}`} />
                        <span>{Boolean(cat.show_in_dual_section) ? 'Featured in Dual' : 'Not in Dual'}</span>
                      </button>
                      {cat.kicker_title && (
                        <div className="text-[9px] text-zinc-400 mt-0.5 font-mono">[{cat.kicker_title}]</div>
                      )}
                    </td>

                    {/* Title Overlay Toggle Indicator */}
                    <td className="py-2.5 px-3.5">
                      {Boolean(cat.show_title_overlay) ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-xs border border-emerald-200">
                          <Eye className="w-2.5 h-2.5" />
                          <span>Overlay ON</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-neutral-600 bg-neutral-100 px-1.5 py-0.2 rounded-xs border border-neutral-200">
                          <EyeOff className="w-2.5 h-2.5" />
                          <span>Banner Only</span>
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Active</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-sm transition-colors cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors cursor-pointer"
                          title="Delete Category"
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

      {/* Edit Category Modal */}
      {isEditModalOpen && (
        <EditCategoryModal
          category={editingCategory}
          allCategories={categories}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingCategory(null);
          }}
          onCategoryUpdated={() => {
            fetchCategories();
          }}
        />
      )}

    </div>
  );
}
