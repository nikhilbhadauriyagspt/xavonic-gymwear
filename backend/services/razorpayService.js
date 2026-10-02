const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../config/db');

// In-memory cache for Razorpay credentials
let cachedConfig = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 10000;

/**
 * Load Razorpay Gateway configuration from store_settings table in MySQL
 */
async function getRazorpayConfig(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedConfig && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedConfig;
  }

  const config = {
    enabled: true,
    mode: 'test', // 'test' | 'live'
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
    account_name: 'Guidelya Activewear',
    theme_color: '#09090b',
  };

  try {
    const [rows] = await db.query(
      "SELECT setting_key, setting_value FROM store_settings WHERE setting_key LIKE 'razorpay_%'"
    );

    rows.forEach((r) => {
      if (r.setting_key === 'razorpay_enabled') config.enabled = r.setting_value === 'true';
      if (r.setting_key === 'razorpay_mode') config.mode = r.setting_value || 'test';
      if (r.setting_key === 'razorpay_key_id') config.key_id = r.setting_value || config.key_id;
      if (r.setting_key === 'razorpay_key_secret') config.key_secret = r.setting_value || config.key_secret;
      if (r.setting_key === 'razorpay_webhook_secret') config.webhook_secret = r.setting_value || config.webhook_secret;
      if (r.setting_key === 'razorpay_account_name') config.account_name = r.setting_value || config.account_name;
      if (r.setting_key === 'razorpay_theme_color') config.theme_color = r.setting_value || config.theme_color;
    });

    cachedConfig = config;
    lastFetchTime = now;
    return config;
  } catch (err) {
    console.error('Error fetching Razorpay config:', err.message);
    return config;
  }
}

function clearRazorpayCache() {
  cachedConfig = null;
  lastFetchTime = 0;
}

/**
 * Get an initialized Razorpay instance
 */
async function getRazorpayInstance() {
  const config = await getRazorpayConfig();

  if (!config.key_id || !config.key_secret) {
    throw new Error('Razorpay Key ID and Secret are not configured in Admin Settings.');
  }

  return new Razorpay({
    key_id: config.key_id,
    key_secret: config.key_secret,
  });
}

/**
 * Create an official Razorpay Order ID for frontend checkout
 * @param {number} amountInRupees - Amount in INR
 * @param {string} receiptId - Order receipt reference
 * @param {object} notes - Custom metadata / order items
 */
async function createRazorpayOrder(amountInRupees, receiptId, notes = {}) {
  const config = await getRazorpayConfig();
  const instance = await getRazorpayInstance();

  const amountInPaise = Math.round(Number(amountInRupees) * 100);

  const options = {
    amount: amountInPaise,
    currency: 'INR',
    receipt: receiptId ? String(receiptId).substring(0, 40) : `rcpt_${Date.now()}`,
    payment_capture: 1, // Auto-capture payment on success
    notes: {
      ...notes,
      source: 'guidelya_native_checkout',
    },
  };

  const razorpayOrder = await instance.orders.create(options);
  console.log(`💳 Razorpay Order Created: ${razorpayOrder.id} for ₹${amountInRupees} (${amountInPaise} paise)`);

  return {
    orderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    receipt: razorpayOrder.receipt,
    keyId: config.key_id,
  };
}

/**
 * Cryptographically verify Razorpay payment signature
 */
async function verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature) {
  const config = await getRazorpayConfig();
  if (!config.key_secret) {
    throw new Error('Missing Razorpay Secret Key for signature verification.');
  }

  const generatedSignature = crypto
    .createHmac('sha256', config.key_secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  const isValid = generatedSignature === razorpay_signature;
  return isValid;
}

/**
 * Test authentication credentials with Razorpay API
 */
async function testRazorpayAuth(key_id, key_secret) {
  try {
    const testInstance = new Razorpay({
      key_id: (key_id || '').trim(),
      key_secret: (key_secret || '').trim(),
    });

    // Test with a lightweight API call (fetch last 1 payment or order)
    const payments = await testInstance.payments.all({ count: 1 });
    return {
      success: true,
      message: 'Razorpay API credentials verified successfully! Connection established.',
      count: payments.items?.length || 0,
    };
  } catch (err) {
    return {
      success: false,
      message: err.error?.description || err.message || 'Authentication failed. Please verify Key ID and Key Secret.',
    };
  }
}

module.exports = {
  getRazorpayConfig,
  clearRazorpayCache,
  getRazorpayInstance,
  createRazorpayOrder,
  verifyPaymentSignature,
  testRazorpayAuth,
};
