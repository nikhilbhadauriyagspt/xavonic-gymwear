// Centralized API configuration for local development and cloud production (Netlify / Render / Railway)
export const API_ROOT = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
export const API_BASE = `${API_ROOT}/api`;
export const ADMIN_API_BASE = `${API_BASE}/admin`;
