const db = require('../config/db');

// In-memory cache with 10-second TTL to keep queries fast while staying real-time
let cachedBrand = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 10000;

async function getBrandSettings(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedBrand && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedBrand;
  }

  const defaultBrand = {
    brand_name: 'Guidelya Activewear',
    brand_tagline: 'Engineered for Performance. Cut for Aesthetics.',
    logo_white: '',
    logo_black: '',
    support_email: 'support@guidelya.com',
    support_phone: '+91 98765 43210',
    office_address: 'Guidelya Performance Apparel Pvt Ltd, DLF Cyber City, Sector 24, Gurugram, Haryana - 122002',
    copyright_text: `© ${new Date().getFullYear()} Guidelya Activewear. All rights reserved.`,
  };

  try {
    const [rows] = await db.query(
      "SELECT setting_key, setting_value FROM store_settings WHERE setting_key LIKE 'brand_%' OR setting_key LIKE 'content_%' OR setting_key LIKE 'policy_%'"
    );

    const result = { ...defaultBrand };

    rows.forEach((r) => {
      // Normalize both 'brand_name' and 'brand_brand_name' to 'brand_name'
      let key = r.setting_key.replace(/^brand_|^content_|^policy_/, '');
      if (r.setting_key === 'brand_name' || r.setting_key === 'brand_brand_name') {
        key = 'brand_name';
      }
      if (r.setting_key === 'brand_tagline' || r.setting_key === 'brand_brand_tagline') {
        key = 'brand_tagline';
      }

      try {
        if (r.setting_value && (r.setting_value.startsWith('{') || r.setting_value.startsWith('['))) {
          result[key] = JSON.parse(r.setting_value);
        } else {
          result[key] = r.setting_value || result[key];
        }
      } catch (_) {
        result[key] = r.setting_value || result[key];
      }
    });

    // Make sure brand_name is always non-empty
    if (!result.brand_name || !result.brand_name.trim()) {
      result.brand_name = defaultBrand.brand_name;
    }

    cachedBrand = result;
    lastFetchTime = now;
    return result;
  } catch (err) {
    console.error('Error in getBrandSettings:', err.message);
    return defaultBrand;
  }
}

function clearBrandCache() {
  cachedBrand = null;
  lastFetchTime = 0;
}

module.exports = {
  getBrandSettings,
  clearBrandCache,
};
