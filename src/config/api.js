// Centralized API configuration for local development and cloud production (Netlify / Render / Railway)
const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

export const API_ROOT = import.meta.env.VITE_API_BASE_URL || (isProduction ? 'https://xavonic-gymwear.onrender.com' : 'http://localhost:5000');
export const API_BASE = `${API_ROOT}/api`;
export const ADMIN_API_BASE = `${API_BASE}/admin`;
export const AUTH_API_BASE = `${API_BASE}/auth`;
export const REVIEWS_API_BASE = `${API_BASE}/reviews`;
export const ORDERS_API_BASE = `${API_BASE}/orders`;
export const BANNERS_API_BASE = `${API_BASE}/banners`;


