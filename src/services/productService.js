import { allProducts as fallbackProducts, allCategories as fallbackCategories } from '../data/productsData.js';
import { ADMIN_API_BASE as API_BASE } from '../config/api.js';

// Normalize a product coming from MySQL DB to match frontend component formats
export function normalizeProduct(p) {
  if (!p) return null;

  // Parse colors_json
  let colors = [];
  if (Array.isArray(p.colors)) {
    colors = p.colors;
  } else if (typeof p.colors_json === 'string') {
    try {
      colors = JSON.parse(p.colors_json);
    } catch {
      colors = [];
    }
  } else if (Array.isArray(p.colors_json)) {
    colors = p.colors_json;
  }

  // Parse sizes_json
  let sizes = ['S', 'M', 'L', 'XL'];
  if (Array.isArray(p.sizes)) {
    sizes = p.sizes;
  } else if (typeof p.sizes_json === 'string') {
    try {
      sizes = JSON.parse(p.sizes_json);
    } catch {
      sizes = ['S', 'M', 'L', 'XL'];
    }
  } else if (Array.isArray(p.sizes_json)) {
    sizes = p.sizes_json;
  }

  // Parse features_json
  let features = [];
  if (Array.isArray(p.features)) {
    features = p.features;
  } else if (typeof p.features_json === 'string') {
    try {
      features = JSON.parse(p.features_json);
    } catch {
      features = [];
    }
  } else if (Array.isArray(p.features_json)) {
    features = p.features_json;
  }

  // Determine front & back images and gallery
  let imageFront = '';
  let imageBack = '';
  let gallery = [];

  if (colors.length > 0) {
    imageFront = colors[0].image || (colors[0].gallery && colors[0].gallery[0]) || '';
    if (colors[0].gallery && colors[0].gallery.length > 1) {
      imageBack = colors[0].gallery[1];
      gallery = colors[0].gallery;
    } else if (colors.length > 1) {
      imageBack = colors[1].image || imageFront;
      gallery = colors.map((c) => c.image).filter(Boolean);
    }
  }

  if (gallery.length === 0 && imageFront) {
    gallery = [imageFront];
    if (imageBack && imageBack !== imageFront) gallery.push(imageBack);
  }

  const priceNum = Number(p.price || 0);
  const originalPriceNum = Number(p.original_price || p.originalPrice || priceNum);

  return {
    id: p.id ? String(p.id) : p.slug,
    dbId: p.id,
    title: p.title,
    slug: p.slug,
    sku: p.sku,
    category: p.category_slug || p.category || 'oversized',
    categoryName: p.category_name || 'Activewear',
    genderTarget: p.gender_target || 'Men',
    price: priceNum,
    originalPrice: originalPriceNum,
    discount: p.discount_label || p.discount || '',
    fabric: p.fabric || 'Premium Athletic Performance Fabric',
    fit: p.fit || 'Athletic Fit',
    modelStats: p.model_stats || p.modelStats || "Model is 6'0\" wearing size L",
    description: p.description || '',
    features,
    gallery,
    colors: colors.map((c) => ({
      name: c.name || 'Standard',
      hex: c.hex || '#000000',
      image: c.image || (c.gallery && c.gallery[0]) || imageFront,
      gallery: c.gallery || [c.image || imageFront],
    })),
    sizes,
    imageFront: imageFront || gallery[0],
    imageBack: imageBack || gallery[1] || imageFront || gallery[0],
    rating: Number(p.rating || 4.9),
    reviewsCount: Number(p.reviews_count || p.reviewsCount || 48),
    stock: Number(p.stock ?? 50),
    size_stock: p.size_stock || (typeof p.size_stock_json === 'string' ? (() => { try { return JSON.parse(p.size_stock_json); } catch { return {}; } })() : (p.size_stock_json || {})),
    inStock: Boolean(p.in_stock ?? true),
    status: p.status || 'active',
  };
}

export async function fetchLiveProducts() {
  try {
    const res = await fetch(`${API_BASE}/products`);
    if (res.ok) {
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.products || data.data || []);
      if (Array.isArray(list) && list.length > 0) {
        return list.map(normalizeProduct);
      }
    }
  } catch (err) {
    console.warn('Backend products fetch warning (using fallback data):', err.message);
  }
  return fallbackProducts.map(normalizeProduct);
}

export async function fetchLiveProductBySlugOrId(slugOrId) {
  try {
    const res = await fetch(`${API_BASE}/products/${slugOrId}`);
    if (res.ok) {
      const data = await res.json();
      const item = data.product || data.data || data;
      if (item && item.title) {
        return normalizeProduct(item);
      }
    }
  } catch (err) {
    console.warn(`Backend product ${slugOrId} fetch warning:`, err.message);
  }
  
  // Fallback to local
  const found = fallbackProducts.find(
    (p) => String(p.id) === String(slugOrId) || p.slug === slugOrId
  );
  return found ? normalizeProduct(found) : normalizeProduct(fallbackProducts[0]);
}

export async function fetchLiveCategories(params = '') {
  try {
    const url = params ? `${API_BASE}/categories?${params}` : `${API_BASE}/categories`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.categories || data.data || []);
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    }
  } catch (err) {
    console.warn('Backend categories fetch warning:', err.message);
  }
  return fallbackCategories;
}

export async function fetchDualFeaturedCategories() {
  try {
    const res = await fetch(`${API_BASE}/categories?show_in_dual=1`);
    if (res.ok) {
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.categories || data.data || []);
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    }
  } catch (err) {
    console.warn('Dual featured categories fetch warning:', err.message);
  }

  // Fallback to categories marked with show_in_dual_section or top 2
  const fallback = fallbackCategories.slice(0, 2);
  return fallback;
}
