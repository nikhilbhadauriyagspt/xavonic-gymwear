const db = require('../config/db');
const { sendWhatsAppOtp } = require('../services/whatsappService');
const { sendEmailOtp } = require('../services/emailService');

// 1. Get WhatsApp Gateway Configuration
exports.getWhatsAppConfig = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT setting_key, setting_value FROM store_settings WHERE setting_key LIKE 'whatsapp_%'"
    );

    const config = {
      mode: 'test',
      meta_token: '',
      phone_number_id: '',
      waba_id: '',
      template_name: 'guidelya_otp_auth',
    };

    rows.forEach((r) => {
      if (r.setting_key === 'whatsapp_mode') config.mode = r.setting_value;
      if (r.setting_key === 'whatsapp_meta_token') config.meta_token = r.setting_value;
      if (r.setting_key === 'whatsapp_phone_number_id') config.phone_number_id = r.setting_value;
      if (r.setting_key === 'whatsapp_waba_id') config.waba_id = r.setting_value;
      if (r.setting_key === 'whatsapp_template_name') config.template_name = r.setting_value;
    });

    return res.status(200).json({
      success: true,
      config,
    });
  } catch (err) {
    console.error('Error in getWhatsAppConfig:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve WhatsApp configuration.',
    });
  }
};

// 2. Save WhatsApp Gateway Configuration
exports.saveWhatsAppConfig = async (req, res) => {
  try {
    const { mode, meta_token, phone_number_id, waba_id, template_name } = req.body;

    const updates = [
      { key: 'whatsapp_mode', value: mode || 'test' },
      { key: 'whatsapp_meta_token', value: meta_token || '' },
      { key: 'whatsapp_phone_number_id', value: phone_number_id || '' },
      { key: 'whatsapp_waba_id', value: waba_id || '' },
      { key: 'whatsapp_template_name', value: template_name || 'guidelya_otp_auth' },
    ];

    for (const item of updates) {
      await db.query(
        'INSERT INTO store_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [item.key, item.value, item.value]
      );
    }

    return res.status(200).json({
      success: true,
      message: 'WhatsApp gateway configuration saved successfully.',
    });
  } catch (err) {
    console.error('Error in saveWhatsAppConfig:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to save configuration.',
    });
  }
};

// 3. Send Test WhatsApp Message to Admin phone
exports.testWhatsAppGateway = async (req, res) => {
  try {
    const { test_phone } = req.body;

    if (!test_phone) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a test WhatsApp mobile number.',
      });
    }

    const testOtp = Math.floor(1000 + Math.random() * 9000);
    const result = await sendWhatsAppOtp(test_phone, String(testOtp));

    return res.status(200).json({
      success: true,
      message: `Test OTP ${testOtp} dispatched to +${test_phone.replace(/[^0-9]/g, '')}`,
      result,
    });
  } catch (err) {
    console.error('Error testing WhatsApp gateway:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to send test WhatsApp message.',
      error: err.message,
    });
  }
};

// 4. Get Nodemailer SMTP Email Configuration
exports.getSmtpConfig = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT setting_key, setting_value FROM store_settings WHERE setting_key LIKE 'smtp_%'"
    );

    const config = {
      mode: 'test',
      host: 'smtp.gmail.com',
      port: '465',
      secure: 'true',
      user: '',
      pass: '',
      sender_name: 'Guidelya Athletics',
    };

    rows.forEach((r) => {
      if (r.setting_key === 'smtp_mode') config.mode = r.setting_value;
      if (r.setting_key === 'smtp_host') config.host = r.setting_value;
      if (r.setting_key === 'smtp_port') config.port = r.setting_value;
      if (r.setting_key === 'smtp_secure') config.secure = r.setting_value;
      if (r.setting_key === 'smtp_user') config.user = r.setting_value;
      if (r.setting_key === 'smtp_pass') config.pass = r.setting_value;
      if (r.setting_key === 'smtp_sender_name') config.sender_name = r.setting_value;
    });

    return res.status(200).json({
      success: true,
      config,
    });
  } catch (err) {
    console.error('Error in getSmtpConfig:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve SMTP configuration.',
    });
  }
};

// 5. Save Nodemailer SMTP Email Configuration
exports.saveSmtpConfig = async (req, res) => {
  try {
    const { mode, host, port, secure, user, pass, sender_name } = req.body;

    const updates = [
      { key: 'smtp_mode', value: mode || 'test' },
      { key: 'smtp_host', value: host || 'smtp.gmail.com' },
      { key: 'smtp_port', value: port || '465' },
      { key: 'smtp_secure', value: secure !== undefined ? String(secure) : 'true' },
      { key: 'smtp_user', value: user || '' },
      { key: 'smtp_pass', value: pass || '' },
      { key: 'smtp_sender_name', value: sender_name || 'Guidelya Athletics' },
    ];

    for (const item of updates) {
      await db.query(
        'INSERT INTO store_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [item.key, item.value, item.value]
      );
    }

    console.log('✅ Nodemailer SMTP Settings saved in database.');

    return res.status(200).json({
      success: true,
      message: 'Email SMTP settings saved successfully.',
    });
  } catch (err) {
    console.error('Error in saveSmtpConfig:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to save SMTP settings.',
    });
  }
};

// 6. Test Send Email via SMTP
exports.testSmtpEmail = async (req, res) => {
  try {
    const { test_email } = req.body;

    if (!test_email || !test_email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid test email address.',
      });
    }

    const testOtp = Math.floor(1000 + Math.random() * 9000);
    const result = await sendEmailOtp(test_email, String(testOtp));

    return res.status(200).json({
      success: true,
      message: `Test OTP ${testOtp} dispatched to ${test_email}`,
      result,
    });
  } catch (err) {
    console.error('Error in testSmtpEmail:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to send test email.',
      error: err.message,
    });
  }
};

// 7. Get Cloudinary Configuration
exports.getCloudinaryConfig = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT setting_key, setting_value FROM store_settings WHERE setting_key LIKE 'cloudinary_%'"
    );

    const config = {
      cloud_name: 'fwlidd7t',
      api_key: '887531852538712',
      api_secret: 'lkB-KXtVa7j9Zi8pzhTn1VhT5xU',
    };

    rows.forEach((r) => {
      if (r.setting_key === 'cloudinary_cloud_name') config.cloud_name = r.setting_value;
      if (r.setting_key === 'cloudinary_api_key') config.api_key = r.setting_value;
      if (r.setting_key === 'cloudinary_api_secret') config.api_secret = r.setting_value;
    });

    return res.status(200).json({ success: true, config });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch Cloudinary configuration.' });
  }
};

// 8. Save Cloudinary Configuration
exports.saveCloudinaryConfig = async (req, res) => {
  try {
    const updates = [
      { key: 'cloudinary_cloud_name', value: cloud_name || '' },
      { key: 'cloudinary_api_key', value: api_key || '' },
      { key: 'cloudinary_api_secret', value: api_secret || '' },
    ];

    for (const item of updates) {
      await db.query(
        'INSERT INTO store_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [item.key, item.value, item.value]
      );
    }

    return res.status(200).json({ success: true, message: 'Cloudinary configuration saved successfully.' });
  } catch (err) {
    console.error('Error in saveCloudinaryConfig:', err);
    return res.status(500).json({ success: false, message: 'Failed to save Cloudinary configuration.' });
  }
};

// 9. Get Global Offers & Discounts Configuration (Bundle rules, Prepaid, Cart Tiers, Coupons)
exports.getOffersConfig = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT setting_key, setting_value FROM store_settings WHERE setting_key = 'global_offers_config'"
    );

    let config = {
      bundle_offers_enabled: true,
      bundle_headline: 'No Soft Fits Allowed.',
      bundle_buy_2_discount: 5, // 5% off
      bundle_buy_3_discount: 10, // 10% off
      bundle_buy_4_discount: 15, // 15% off
      prepaid_discount_enabled: true,
      prepaid_discount_percent: 10, // 10% off on prepaid
      prepaid_discount_label: 'Extra 10% OFF on prepaid orders',
      new_user_discount_enabled: true,
      new_user_discount_amount: 150, // Flat ₹150 off on 1st order
      free_shipping_threshold: 999, // Free shipping above ₹999
      cart_tier_1_min: 1999,
      cart_tier_1_discount: 200, // Flat ₹200 off above 1999
      cart_tier_2_min: 2999,
      cart_tier_2_discount: 500, // Flat ₹500 off above 2999
      coupons: [
        { code: 'VIP10', discount_type: 'percent', value: 10, min_cart: 999, description: '10% OFF on all activewear' },
        { code: 'PUMP200', discount_type: 'flat', value: 200, min_cart: 1499, description: 'Flat ₹200 OFF on orders above ₹1499' }
      ]
    };

    if (rows.length > 0 && rows[0].setting_value) {
      try {
        config = { ...config, ...JSON.parse(rows[0].setting_value) };
      } catch (_) {}
    }

    return res.status(200).json({ success: true, config });
  } catch (err) {
    console.error('Error in getOffersConfig:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve offers config.' });
  }
};

// 10. Save Global Offers & Discounts Configuration
exports.saveOffersConfig = async (req, res) => {
  try {
    const configData = req.body;
    const jsonString = JSON.stringify(configData);

    await db.query(
      'INSERT INTO store_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
      ['global_offers_config', jsonString, jsonString]
    );

    return res.status(200).json({
      success: true,
      message: 'Global Offers & Discounts configuration saved successfully!',
    });
  } catch (err) {
    console.error('Error saving offers config:', err);
    return res.status(500).json({ success: false, message: 'Failed to save offers configuration.' });
  }
};

// 11. Get Google Maps & Geocoding Configuration
exports.getGoogleMapsConfig = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT setting_key, setting_value FROM store_settings WHERE setting_key LIKE 'google_maps_%'"
    );

    const config = {
      api_key: 'AIzaSyAWnFjD1hsIsyYB7nQs_fAUd2BVuziu0xE',
      enable_places_autocomplete: true,
      enable_gps_geocoding: true,
    };

    return res.status(200).json({ success: true, config });
  } catch (err) {
    console.error('Error in getGoogleMapsConfig:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve Google Maps configuration.' });
  }
};

// 12. Save Google Maps & Geocoding Configuration
exports.saveGoogleMapsConfig = async (req, res) => {
  try {
    const { api_key, enable_places_autocomplete, enable_gps_geocoding } = req.body;

    const updates = [
      { key: 'google_maps_api_key', value: (api_key || '').trim() },
      { key: 'google_maps_places_enabled', value: enable_places_autocomplete !== false ? 'true' : 'false' },
      { key: 'google_maps_gps_enabled', value: enable_gps_geocoding !== false ? 'true' : 'false' },
    ];

    for (const item of updates) {
      await db.query(
        'INSERT INTO store_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [item.key, item.value, item.value]
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Google Maps configuration saved successfully!',
    });
  } catch (err) {
    console.error('Error saving Google Maps config:', err);
    return res.status(500).json({ success: false, message: 'Failed to save Google Maps configuration.' });
  }
};

// 13. Get Shipping & Delivery Configuration (Public & Admin)
exports.getShippingConfig = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT setting_key, setting_value FROM store_settings WHERE setting_key LIKE 'shipping_%'"
    );

    const config = {
      free_shipping_threshold: 999,
      standard_shipping_charge: 99,
      cod_enabled: true,
      cod_extra_charge: 0,
      cod_min_order: 0,
      cod_max_order: 15000,
      estimated_delivery_days: '2-4 Business Days',
      courier_partner: 'Bluedart Express',
      express_shipping_enabled: false,
      express_shipping_charge: 149,
    };

    rows.forEach((r) => {
      if (r.setting_key === 'shipping_free_threshold') config.free_shipping_threshold = Number(r.setting_value) || 999;
      if (r.setting_key === 'shipping_charge') config.standard_shipping_charge = Number(r.setting_value) || 0;
      if (r.setting_key === 'shipping_cod_enabled') config.cod_enabled = r.setting_value === 'true';
      if (r.setting_key === 'shipping_cod_charge') config.cod_extra_charge = Number(r.setting_value) || 0;
      if (r.setting_key === 'shipping_cod_min_order') config.cod_min_order = Number(r.setting_value) || 0;
      if (r.setting_key === 'shipping_cod_max_order') config.cod_max_order = Number(r.setting_value) || 15000;
      if (r.setting_key === 'shipping_estimated_days' && r.setting_value) config.estimated_delivery_days = r.setting_value;
      if (r.setting_key === 'shipping_courier_partner' && r.setting_value) config.courier_partner = r.setting_value;
      if (r.setting_key === 'shipping_express_enabled') config.express_shipping_enabled = r.setting_value === 'true';
      if (r.setting_key === 'shipping_express_charge') config.express_shipping_charge = Number(r.setting_value) || 149;
    });

    return res.status(200).json({ success: true, config });
  } catch (err) {
    console.error('Error in getShippingConfig:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve shipping configuration.' });
  }
};

// 14. Save Shipping & Delivery Configuration (Admin Protected)
exports.saveShippingConfig = async (req, res) => {
  try {
    const {
      free_shipping_threshold,
      standard_shipping_charge,
      cod_enabled,
      cod_extra_charge,
      cod_min_order,
      cod_max_order,
      estimated_delivery_days,
      courier_partner,
      express_shipping_enabled,
      express_shipping_charge,
    } = req.body;

    const updates = [
      { key: 'shipping_free_threshold', value: String(free_shipping_threshold ?? 999) },
      { key: 'shipping_charge', value: String(standard_shipping_charge ?? 99) },
      { key: 'shipping_cod_enabled', value: cod_enabled !== false ? 'true' : 'false' },
      { key: 'shipping_cod_charge', value: String(cod_extra_charge ?? 0) },
      { key: 'shipping_cod_min_order', value: String(cod_min_order ?? 0) },
      { key: 'shipping_cod_max_order', value: String(cod_max_order ?? 15000) },
      { key: 'shipping_estimated_days', value: (estimated_delivery_days || '2-4 Business Days').trim() },
      { key: 'shipping_courier_partner', value: (courier_partner || 'Bluedart Express').trim() },
      { key: 'shipping_express_enabled', value: express_shipping_enabled === true ? 'true' : 'false' },
      { key: 'shipping_express_charge', value: String(express_shipping_charge ?? 149) },
    ];

    for (const item of updates) {
      await db.query(
        'INSERT INTO store_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [item.key, item.value, item.value]
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Shipping & COD settings saved successfully in database!',
    });
  } catch (err) {
    console.error('Error saving shipping config:', err);
    return res.status(500).json({ success: false, message: 'Failed to save shipping configuration.' });
  }
};

// 15. Get Brand Assets, About Us Story, Social Media & Policy Pages (Public & Admin)
exports.getBrandContent = async (req, res) => {
  try {
    const { getBrandSettings } = require('../services/brandService');
    const content = await getBrandSettings();

    return res.status(200).json({ success: true, content });
  } catch (err) {
    console.error('Error fetching brand content:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve brand content.' });
  }
};

// 16. Save Brand Assets, About Us, Social Media & Policy Pages (Admin Protected)
exports.saveBrandContent = async (req, res) => {
  try {
    const { clearBrandCache } = require('../services/brandService');
    const payload = req.body;
    
    // Process each field and insert/update in store_settings
    for (const [rawKey, rawVal] of Object.entries(payload)) {
      let settingKey = rawKey;
      if (!rawKey.startsWith('brand_') && !rawKey.startsWith('content_') && !rawKey.startsWith('policy_')) {
        if (rawKey.includes('policy') || rawKey.includes('terms') || rawKey.includes('returns') || rawKey.includes('shipping_policy')) {
          settingKey = `policy_${rawKey}`;
        } else if (rawKey.startsWith('about_') || rawKey === 'popular_searches') {
          settingKey = `content_${rawKey}`;
        } else {
          settingKey = `brand_${rawKey}`;
        }
      }

      const stringValue = typeof rawVal === 'object' ? JSON.stringify(rawVal) : String(rawVal ?? '');

      await db.query(
        'INSERT INTO store_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [settingKey, stringValue, stringValue]
      );

      // If updating brand name, also sync direct key
      if (rawKey === 'brand_name' || settingKey === 'brand_brand_name') {
        await db.query(
          'INSERT INTO store_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
          ['brand_name', stringValue, stringValue]
        );
        await db.query(
          'INSERT INTO store_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
          ['brand_brand_name', stringValue, stringValue]
        );
      }
    }

    clearBrandCache();

    return res.status(200).json({
      success: true,
      message: 'Brand identity, About story, social links & policy pages updated successfully!',
    });
  } catch (err) {
    console.error('Error saving brand content:', err);
    return res.status(500).json({ success: false, message: 'Failed to save brand content.' });
  }
};

// 17. Upload Brand Logo directly to Cloudinary & update settings (Admin Protected)
exports.uploadBrandLogo = async (req, res) => {
  try {
    const { uploadToCloudinary } = require('../services/cloudinaryService');
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }

    const { logo_type } = req.body; // 'logo_white' or 'logo_black'
    const result = await uploadToCloudinary(req.file.buffer, 'guidelya/brand');
    const secureUrl = result.secure_url;

    if (logo_type === 'logo_white' || logo_type === 'logo_black') {
      const settingKey = `brand_${logo_type}`;
      await db.query(
        'INSERT INTO store_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [settingKey, secureUrl, secureUrl]
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Logo uploaded successfully to cloud storage!',
      url: secureUrl,
      logo_type,
    });
  } catch (err) {
    console.error('Error in uploadBrandLogo:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload logo to cloud storage.',
      error: err.message,
    });
  }
};

// 18. Get Courier & Logistics Configuration (Shiprocket, NimbusPost, Manual)
exports.getLogisticsConfig = async (req, res) => {
  try {
    const { getCourierSettings } = require('../services/courierService');
    const config = await getCourierSettings();
    return res.status(200).json({ success: true, config });
  } catch (err) {
    console.error('Error fetching logistics config:', err);
    return res.status(500).json({ success: false, message: 'Failed to load logistics config.' });
  }
};

// 19. Save Courier & Logistics Configuration
exports.saveLogisticsConfig = async (req, res) => {
  try {
    const { saveCourierSettings } = require('../services/courierService');
    const result = await saveCourierSettings(req.body);
    return res.status(result.success ? 200 : 500).json(result);
  } catch (err) {
    console.error('Error saving logistics config:', err);
    return res.status(500).json({ success: false, message: 'Failed to save logistics config.' });
  }
};

// 20. Test Shiprocket API Credentials
exports.testShiprocketGateway = async (req, res) => {
  try {
    const { testShiprocketAuth } = require('../services/courierService');
    const { email, password } = req.body;
    const result = await testShiprocketAuth(email, password);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error('Error testing Shiprocket gateway:', err);
    return res.status(500).json({ success: false, message: 'Shiprocket test request failed.' });
  }
};

// 21. Test NimbusPost API Credentials
exports.testNimbusPostGateway = async (req, res) => {
  try {
    const { testNimbusPostAuth } = require('../services/courierService');
    const { email, token } = req.body;
    const result = await testNimbusPostAuth(email, token);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error('Error testing NimbusPost gateway:', err);
    return res.status(500).json({ success: false, message: 'NimbusPost test request failed.' });
  }
};

// 22. 1-Click Ship Order via Shiprocket, NimbusPost or Manual Dispatch
exports.shipAdminOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { processOrderShipment } = require('../services/courierService');
    const result = await processOrderShipment({
      orderId,
      ...req.body,
    });
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error('Error shipping order:', err);
    return res.status(500).json({ success: false, message: 'Failed to ship order.' });
  }
};

// 23. Get Razorpay Gateway Settings (Admin Protected)
exports.getRazorpayGatewayConfig = async (req, res) => {
  try {
    const { getRazorpayConfig } = require('../services/razorpayService');
    const config = await getRazorpayConfig(true);

    return res.status(200).json({
      success: true,
      config,
    });
  } catch (err) {
    console.error('Error in getRazorpayGatewayConfig:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve Razorpay configuration.' });
  }
};

// 24. Save Razorpay Gateway Settings (Admin Protected)
exports.saveRazorpayGatewayConfig = async (req, res) => {
  try {
    const {
      enabled,
      mode,
      key_id,
      key_secret,
      webhook_secret,
      account_name,
      theme_color,
    } = req.body;

    const updates = [
      { key: 'razorpay_enabled', value: enabled !== false ? 'true' : 'false' },
      { key: 'razorpay_mode', value: mode || 'test' },
      { key: 'razorpay_key_id', value: (key_id || '').trim() },
      { key: 'razorpay_key_secret', value: (key_secret || '').trim() },
      { key: 'razorpay_webhook_secret', value: (webhook_secret || '').trim() },
      { key: 'razorpay_account_name', value: (account_name || 'Guidelya Activewear').trim() },
      { key: 'razorpay_theme_color', value: (theme_color || '#09090b').trim() },
    ];

    for (const item of updates) {
      await db.query(
        'INSERT INTO store_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [item.key, item.value, item.value]
      );
    }

    const { clearRazorpayCache } = require('../services/razorpayService');
    clearRazorpayCache();

    return res.status(200).json({
      success: true,
      message: 'Razorpay payment gateway configuration saved successfully!',
    });
  } catch (err) {
    console.error('Error saving Razorpay configuration:', err);
    return res.status(500).json({ success: false, message: 'Failed to save Razorpay configuration.' });
  }
};

// 25. Test Razorpay API Connection (Admin Protected)
exports.testRazorpayGateway = async (req, res) => {
  try {
    const { key_id, key_secret } = req.body;
    if (!key_id || !key_secret) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both Razorpay Key ID and Key Secret to test connection.',
      });
    }

    const { testRazorpayAuth } = require('../services/razorpayService');
    const result = await testRazorpayAuth(key_id, key_secret);

    return res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error('Error testing Razorpay gateway:', err);
    return res.status(500).json({ success: false, message: 'Razorpay connection test request failed.' });
  }
};




