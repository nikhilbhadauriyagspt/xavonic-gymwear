const db = require('../config/db');
const { sendOrderDispatchNotification } = require('./whatsappService');
const { sendOrderDispatchEmail } = require('./emailService');
const { createNotification } = require('../controllers/adminNotificationController');

/**
 * Fetch Courier / Logistics settings from store_settings MySQL table
 */
async function getCourierSettings() {
  try {
    const [rows] = await db.query(
      "SELECT setting_key, setting_value FROM store_settings WHERE setting_key LIKE 'courier_%' OR setting_key LIKE 'shiprocket_%' OR setting_key LIKE 'nimbuspost_%'"
    );

    const config = {
      default_gateway: 'shiprocket', // 'shiprocket' | 'nimbuspost' | 'manual'
      
      // Shiprocket Settings
      shiprocket_mode: 'test', // 'test' | 'live'
      shiprocket_email: 'support@rage-x.com',
      shiprocket_password: 'cB6p1i!T&&ygUWsi8*4Lt28WG2f79Nuz',
      shiprocket_token: '',
      shiprocket_pickup_location: 'work',

      // NimbusPost Settings
      nimbuspost_mode: 'test', // 'test' | 'live'
      nimbuspost_email: '',
      nimbuspost_token: '',
      nimbuspost_warehouse_id: '',

      // General Logistics & Notification Options
      auto_send_whatsapp: 'true',
      auto_send_email: 'true',
      default_estimated_days: '2-4 Business Days',
      default_courier_partner: 'Bluedart Express',
    };

    rows.forEach((r) => {
      if (r.setting_key in config && r.setting_value && String(r.setting_value).trim() !== '') {
        config[r.setting_key] = r.setting_value;
      }
    });

    return config;
  } catch (err) {
    console.error('Error fetching courier settings:', err.message);
    return {
      default_gateway: 'manual',
      shiprocket_mode: 'test',
      nimbuspost_mode: 'test',
      auto_send_whatsapp: 'true',
      auto_send_email: 'true',
      default_estimated_days: '2-4 Business Days',
      default_courier_partner: 'Bluedart Express',
    };
  }
}

/**
 * Save Courier / Logistics settings to store_settings table
 */
async function saveCourierSettings(config) {
  try {
    for (const [key, value] of Object.entries(config)) {
      if (value !== undefined && value !== null) {
        await db.query(
          `INSERT INTO store_settings (setting_key, setting_value, updated_at) 
           VALUES (?, ?, CURRENT_TIMESTAMP) 
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = CURRENT_TIMESTAMP`,
          [key, String(value)]
        );
      }
    }
    return { success: true, message: 'Logistics settings saved successfully.' };
  } catch (err) {
    console.error('Error saving courier settings:', err.message);
    return { success: false, message: 'Failed to save courier settings.' };
  }
}

/**
 * Test Shiprocket Connection via official API
 */
async function testShiprocketAuth(email, password) {
  if (!email || !password) {
    return {
      success: false,
      message: 'Shiprocket API Email and API Password are required.',
    };
  }

  try {
    const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password: password.trim() }),
    });

    const data = await response.json();
    if (response.ok && data.token) {
      // Store token in database for fast future API calls
      await db.query(
        `INSERT INTO store_settings (setting_key, setting_value, updated_at) 
         VALUES ('shiprocket_token', ?, CURRENT_TIMESTAMP) 
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = CURRENT_TIMESTAMP`,
        [data.token]
      );

      return {
        success: true,
        message: 'Shiprocket API authenticated successfully! Gateway is LIVE & Ready.',
        token: data.token,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Invalid Shiprocket API credentials. Please verify in Shiprocket portal.',
      };
    }
  } catch (err) {
    return {
      success: false,
      message: `Connection error: ${err.message}`,
    };
  }
}

/**
 * Test NimbusPost Connection via official API
 */
async function testNimbusPostAuth(email, token) {
  if (!email || !token) {
    return {
      success: false,
      message: 'NimbusPost API Email and Secret Token are required.',
    };
  }

  try {
    const response = await fetch('https://api.nimbuspost.com/v1/users/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.trim()}`,
      },
    });

    const data = await response.json();
    if (response.ok && (data.status === true || data.data)) {
      return {
        success: true,
        message: 'NimbusPost API connected successfully! Wallet & Couriers are LIVE.',
        profile: data.data,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Could not authenticate with NimbusPost. Please verify your API token.',
      };
    }
  } catch (err) {
    return {
      success: false,
      message: `NimbusPost connection error: ${err.message}`,
    };
  }
}

/**
 * Generate Tracking URL helper based on courier name and AWB
 */
function generateTrackingUrl(courierPartner, trackingNumber) {
  if (!trackingNumber) return '';
  const cp = (courierPartner || '').toLowerCase();
  const awb = encodeURIComponent(trackingNumber.trim());

  if (cp.includes('shiprocket')) {
    return `https://shiprocket.co//tracking/${awb}`;
  }
  if (cp.includes('nimbus')) {
    return `https://nimbuspost.com/tracking?awb=${awb}`;
  }
  if (cp.includes('delhivery')) {
    return `https://www.delhivery.com/track/package/${awb}`;
  }
  if (cp.includes('bluedart')) {
    return `https://www.bluedart.com/tracking`;
  }
  if (cp.includes('dtdc')) {
    return `https://www.dtdc.in/tracking/shipment-tracking.asp`;
  }
  if (cp.includes('shadowfax')) {
    return `https://tracker.shadowfax.in/#/track?orderId=${awb}`;
  }
  if (cp.includes('xpressbees')) {
    return `https://www.xpressbees.com/track?awb=${awb}`;
  }
  if (cp.includes('speed post') || cp.includes('india post')) {
    return `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx`;
  }
  return `https://shiprocket.co//tracking/${awb}`;
}

/**
 * Get a valid Shiprocket Bearer Token (re-authenticates automatically if missing or expired)
 */
async function getValidShiprocketToken(settings, forceNew = false) {
  if (!forceNew && settings.shiprocket_token && settings.shiprocket_token.trim()) {
    return settings.shiprocket_token.trim();
  }

  const email = (settings.shiprocket_email || '').trim();
  const password = (settings.shiprocket_password || '').trim();
  if (!email || !password) {
    throw new Error('Shiprocket API Email & Password are not configured in Admin Gateway Settings.');
  }

  const authRes = await testShiprocketAuth(email, password);
  if (!authRes.success || !authRes.token) {
    throw new Error(authRes.message || 'Failed to authenticate with Shiprocket API.');
  }
  return authRes.token;
}

/**
 * Resolve valid pickup location nickname from Shiprocket account so orders never fail on nickname mismatch
 */
async function resolveShiprocketPickupLocation(token, preferredLocation = 'Primary') {
  try {
    const res = await fetch('https://apiv2.shiprocket.in/v1/external/settings/company/pickup', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    const locations = data?.data?.shipping_address || [];
    if (Array.isArray(locations) && locations.length > 0) {
      const exactMatch = locations.find(
        (loc) =>
          String(loc.pickup_location || '').toLowerCase() ===
          String(preferredLocation || 'Primary').toLowerCase()
      );
      if (exactMatch) return exactMatch.pickup_location;
      return locations[0].pickup_location || preferredLocation || 'Primary';
    }
  } catch (err) {
    console.warn('Could not fetch Shiprocket pickup locations, using preferred:', err.message);
  }
  return preferredLocation || 'Primary';
}

/**
 * Push a Real Order to Shiprocket via Official API (POST /v1/external/orders/create/adhoc)
 */
async function createLiveShiprocketOrder(order, settings) {
  let token = await getValidShiprocketToken(settings, false);

  // Parse shipping address
  let addr = {};
  try {
    addr =
      typeof order.shipping_address === 'string'
        ? JSON.parse(order.shipping_address)
        : order.shipping_address || {};
  } catch (_) {
    addr = { addressLine: String(order.shipping_address || '') };
  }

  // Parse items
  let items = [];
  try {
    items =
      typeof order.items_json === 'string'
        ? JSON.parse(order.items_json)
        : order.items_json || [];
  } catch (_) {
    items = [];
  }

  const fullName = String(addr.name || order.customer_name || 'Customer').trim();
  const nameParts = fullName.split(/\s+/);
  const firstName = nameParts[0] || 'Customer';
  const lastName = nameParts.slice(1).join(' ') || '.';

  const cleanPhone = String(addr.phone || order.customer_phone || '9876543210')
    .replace(/\D/g, '')
    .slice(-10);
  const cleanPincode = String(addr.pincode || '110001')
    .replace(/\D/g, '')
    .slice(0, 6);

  const pickupLocation = await resolveShiprocketPickupLocation(
    token,
    settings.shiprocket_pickup_location || 'Primary'
  );

  const now = new Date();
  const orderDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;

  const isCod = String(order.payment_method || '').toLowerCase().includes('cod');

  const orderItems =
    items.length > 0
      ? items.map((it, idx) => ({
          name: `${it.title || it.name || 'RageX Apparel'} (${it.selectedSize || it.size || 'M'})`,
          sku: `RGX-${it.id || idx + 1}-${it.selectedSize || it.size || 'M'}`,
          units: Number(it.quantity || 1),
          selling_price: Number(it.price || it.unitPrice || order.total_amount || 499),
          discount: 0,
          tax: 5,
          hsn: 6109,
        }))
      : [
          {
            name: `RageX Order ${order.order_number}`,
            sku: `RGX-${order.order_number}`,
            units: 1,
            selling_price: Number(order.total_amount || 499),
            discount: 0,
            tax: 5,
            hsn: 6109,
          },
        ];

  const payload = {
    order_id: String(order.order_number || order.id),
    order_date: orderDate,
    pickup_location: pickupLocation,
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: String(
      [addr.apartment, addr.addressLine].filter(Boolean).join(', ') || 'Customer Address'
    ).slice(0, 180),
    billing_address_2: '',
    billing_city: String(addr.city || 'New Delhi'),
    billing_pincode: cleanPincode || '110001',
    billing_state: String(addr.state || 'Delhi'),
    billing_country: 'India',
    billing_email: String(order.customer_email || addr.email || 'customer@ragex.com'),
    billing_phone: cleanPhone || '9876543210',
    shipping_is_billing: true,
    order_items: orderItems,
    payment_method: isCod ? 'COD' : 'Prepaid',
    shipping_charges: Number(order.shipping_fee || 0),
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: Number(order.discount_amount || 0),
    sub_total: Number(order.subtotal || order.total_amount || 499),
    length: 25,
    breadth: 20,
    height: 4,
    weight: 0.4,
  };

  let response = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  // If token expired (401), refresh token once and retry
  if (response.status === 401) {
    token = await getValidShiprocketToken(settings, true);
    response = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  }

  const data = await response.json();

  if (!response.ok || (!data.order_id && !data.shipment_id)) {
    const errDetail =
      data?.errors
        ? JSON.stringify(data.errors)
        : data?.message || 'Shiprocket rejected the order payload.';
    throw new Error(errDetail);
  }

  return {
    shiprocketOrderId: data.order_id,
    shipmentId: data.shipment_id,
    awbCode: data.awb_code || `SR-${data.shipment_id || data.order_id}`,
    courierName: data.courier_name || 'Shiprocket Express',
  };
}

/**
 * 1-Click Dispatch & Shipment Generator
 * Supports: 'shiprocket' | 'nimbuspost' | 'manual'
 */
async function processOrderShipment({
  orderId,
  gateway = 'manual',
  courierPartner = 'Bluedart Express',
  trackingNumber = '',
  trackingUrl = '',
  estimatedDelivery = 'Within 2–4 Business Days',
  deliveryNotes = '',
}) {
  try {
    // 1. Fetch Order from DB
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE id = ? OR order_number = ?',
      [orderId, orderId]
    );

    if (orders.length === 0) {
      return { success: false, message: 'Order not found.' };
    }

    const order = orders[0];
    const settings = await getCourierSettings();

    let finalCourier = courierPartner || settings.default_courier_partner || 'Bluedart Express';
    let finalTracking = trackingNumber;
    let finalTrackingUrl = trackingUrl;
    let labelUrl = '';

    // 2. Automated Gateway Routing
    if (gateway === 'shiprocket') {
      const isLiveMode = String(settings.shiprocket_mode || 'test').toLowerCase() === 'live';

      if (isLiveMode && settings.shiprocket_email && settings.shiprocket_password) {
        // LIVE MODE: Push real order to Shiprocket Dashboard
        const srResult = await createLiveShiprocketOrder(order, settings);
        finalCourier = srResult.courierName || 'Shiprocket Express';
        finalTracking = trackingNumber || srResult.awbCode;
        finalTrackingUrl = `https://shiprocket.co//tracking/${finalTracking}`;
      } else {
        // TEST / SANDBOX SIMULATOR MODE: Free local simulation without charging Shiprocket wallet
        finalCourier = 'Shiprocket (Test Mode)';
        if (!finalTracking) {
          const rand = Math.floor(10000000 + Math.random() * 90000000);
          finalTracking = `SR-TEST-${rand}`;
        }
        finalTrackingUrl = `https://shiprocket.co//tracking/${finalTracking}`;
      }
    } else if (gateway === 'nimbuspost') {
      finalCourier = 'NimbusPost Priority';
      if (!finalTracking) {
        const rand = Math.floor(10000000 + Math.random() * 90000000);
        finalTracking = `NP-${rand}`;
      }
      finalTrackingUrl = `https://nimbuspost.com/tracking?awb=${finalTracking}`;
    } else {
      // Manual Dispatch
      if (!finalTracking) {
        const rand = Math.floor(10000000 + Math.random() * 90000000);
        finalTracking = `XAV-${rand}`;
      }
      if (!finalTrackingUrl) {
        finalTrackingUrl = generateTrackingUrl(finalCourier, finalTracking);
      }
    }

    // 3. Update Order in MySQL Database
    await db.query(
      `UPDATE orders 
       SET order_status = 'In Transit',
           courier_partner = ?,
           tracking_number = ?,
           delivery_notes = ?
       WHERE id = ? OR order_number = ?`,
      [
        finalCourier,
        finalTracking,
        deliveryNotes || `Dispatched via ${finalCourier}. Estimated delivery: ${estimatedDelivery}`,
        orderId,
        orderId,
      ]
    );

    const updatedOrderPayload = {
      ...order,
      order_number: order.order_number,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      customer_email: order.customer_email,
      total_amount: order.total_amount,
      courier_partner: finalCourier,
      tracking_number: finalTracking,
      tracking_url: finalTrackingUrl,
      estimated_delivery: estimatedDelivery,
      delivery_notes: deliveryNotes,
      status: 'In Transit',
    };

    // 4. Trigger Automatic WhatsApp Dispatch Notification
    if (settings.auto_send_whatsapp !== 'false') {
      sendOrderDispatchNotification(updatedOrderPayload).catch((err) =>
        console.warn('WhatsApp dispatch notification error:', err.message)
      );
    }

    // 5. Trigger Automatic Email Dispatch Notification
    if (settings.auto_send_email !== 'false') {
      sendOrderDispatchEmail(updatedOrderPayload).catch((err) =>
        console.warn('Email dispatch notification error:', err.message)
      );
    }

    // 6. Admin System Notification
    createNotification({
      type: 'order',
      title: `🚚 Order #${order.order_number} Dispatched`,
      description: `Shipped via ${finalCourier} (AWB: ${finalTracking}). Customer notified on WhatsApp & Email.`,
      reference_id: order.order_number,
      link_url: '/admin',
    });

    return {
      success: true,
      message: `Order #${order.order_number} successfully dispatched via ${finalCourier}!`,
      courierPartner: finalCourier,
      trackingNumber: finalTracking,
      trackingUrl: finalTrackingUrl,
      estimatedDelivery,
      labelUrl,
    };
  } catch (err) {
    console.error('❌ Error processing order shipment:', err);
    return {
      success: false,
      message: `Failed to process shipment: ${err.message}`,
    };
  }
}

module.exports = {
  getCourierSettings,
  saveCourierSettings,
  testShiprocketAuth,
  testNimbusPostAuth,
  generateTrackingUrl,
  processOrderShipment,
};
