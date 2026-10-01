import { BANNERS_API_BASE, ADMIN_API_BASE } from '../config/api';

/**
 * Fetch active storefront banners by slot ('hero', 'mid_banner', 'mid_feature', 'last_mid', 'all')
 */
export async function getPublicBanners(slot = 'hero') {
  try {
    const url = slot && slot !== 'all' ? `${BANNERS_API_BASE}?slot=${slot}` : BANNERS_API_BASE;
    const res = await fetch(url);
    const data = await res.json();
    return data.success ? data.banners : [];
  } catch (error) {
    console.error('Failed to fetch public banners:', error);
    return [];
  }
}

/**
 * Fetch all banners for Admin dashboard with status, stats and date metrics
 */
export async function getAdminBanners({ slot = 'all', status = 'all', search = '' } = {}) {
  try {
    const token = localStorage.getItem('xavonic_admin_token');
    const queryParams = new URLSearchParams();
    if (slot && slot !== 'all') queryParams.append('slot', slot);
    if (status && status !== 'all') queryParams.append('status', status);
    if (search) queryParams.append('search', search);

    const url = `${ADMIN_API_BASE}/banners?${queryParams.toString()}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch admin banners:', error);
    return { success: false, banners: [], stats: { total: 0, active: 0, scheduled: 0, expired: 0, inactive: 0 } };
  }
}

/**
 * Create a new banner (supports FormData for image upload or direct JSON)
 */
export async function createAdminBanner(payload) {
  try {
    const token = localStorage.getItem('xavonic_admin_token');
    const isFormData = payload instanceof FormData;

    const res = await fetch(`${ADMIN_API_BASE}/banners`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      },
      body: isFormData ? payload : JSON.stringify(payload),
    });
    return await res.json();
  } catch (error) {
    console.error('Failed to create banner:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Update banner details
 */
export async function updateAdminBanner(id, payload) {
  try {
    const token = localStorage.getItem('xavonic_admin_token');
    const isFormData = payload instanceof FormData;

    const res = await fetch(`${ADMIN_API_BASE}/banners/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      },
      body: isFormData ? payload : JSON.stringify(payload),
    });
    return await res.json();
  } catch (error) {
    console.error('Failed to update banner:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Quick toggle active/inactive status
 */
export async function toggleAdminBannerStatus(id) {
  try {
    const token = localStorage.getItem('xavonic_admin_token');
    const res = await fetch(`${ADMIN_API_BASE}/banners/${id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return await res.json();
  } catch (error) {
    console.error('Failed to toggle banner status:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Delete banner
 */
export async function deleteAdminBanner(id) {
  try {
    const token = localStorage.getItem('xavonic_admin_token');
    const res = await fetch(`${ADMIN_API_BASE}/banners/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return await res.json();
  } catch (error) {
    console.error('Failed to delete banner:', error);
    return { success: false, message: error.message };
  }
}
