const db = require('../config/db');

// Helper to fetch store settings from DB
async function getWhatsAppSettings() {
  try {
    const [rows] = await db.query(
      "SELECT setting_key, setting_value FROM store_settings WHERE setting_key LIKE 'whatsapp_%'"
    );

    const settings = {
      mode: 'test', // 'test' | 'live'
      meta_token: '',
      phone_number_id: '',
      waba_id: '',
      template_name: 'guidelya_otp_auth',
    };

    rows.forEach((r) => {
      if (r.setting_key === 'whatsapp_mode') settings.mode = r.setting_value;
      if (r.setting_key === 'whatsapp_meta_token') settings.meta_token = r.setting_value;
      if (r.setting_key === 'whatsapp_phone_number_id') settings.phone_number_id = r.setting_value;
      if (r.setting_key === 'whatsapp_waba_id') settings.waba_id = r.setting_value;
      if (r.setting_key === 'whatsapp_template_name') settings.template_name = r.setting_value;
    });

    return settings;
  } catch (err) {
    console.error('Error loading WhatsApp settings:', err.message);
    return { mode: 'test' };
  }
}

// Send OTP via Meta Cloud API or Test Simulator
async function sendWhatsAppOtp(phone, otp) {
  const settings = await getWhatsAppSettings();
  const cleanPhone = phone.replace(/[^0-9]/g, '');

  console.log(`\n======================================================`);
  console.log(`📲 [WhatsApp Gateway] Triggering OTP for: +${cleanPhone}`);
  console.log(`🔑 Generated OTP Code: ${otp}`);
  console.log(`⚙️ Active Mode: ${settings.mode.toUpperCase()}`);

  // 1. LIVE MODE: Use Meta WhatsApp Cloud API if credentials are provided
  if (settings.mode === 'live' && settings.meta_token && settings.phone_number_id) {
    try {
      console.log(`🚀 Dispatching real WhatsApp message via Meta Cloud API...`);
      const metaUrl = `https://graph.facebook.com/v19.0/${settings.phone_number_id}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'text',
        text: {
          preview_url: false,
          body: `Your Guidelya Activewear login OTP is: *${otp}*\n\nValid for 5 minutes. Do not share this code with anyone.`,
        },
      };

      const response = await fetch(metaUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.meta_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const metaData = await response.json();

      if (response.ok && metaData.messages) {
        console.log(`✅ Live WhatsApp OTP sent successfully! Message ID:`, metaData.messages[0]?.id);
        console.log(`======================================================\n`);
        return {
          success: true,
          mode: 'live',
          messageId: metaData.messages[0]?.id,
          message: 'OTP delivered to your WhatsApp number.',
        };
      } else {
        console.warn(`⚠️ Meta API warning / fallback:`, metaData);
        console.log(`======================================================\n`);
        return {
          success: true,
          mode: 'test_fallback',
          metaError: metaData.error?.message,
          message: `Testing OTP: ${otp} (Meta API response logged)`,
        };
      }
    } catch (apiErr) {
      console.error('❌ Meta API Request error:', apiErr.message);
      console.log(`======================================================\n`);
      return {
        success: true,
        mode: 'test_fallback',
        message: `Testing OTP: ${otp}`,
      };
    }
  }

  // 2. TEST MODE (Default developer friendly mode)
  console.log(`🧪 Simulated WhatsApp delivery. Use test OTP: ${otp}`);
  console.log(`💡 To switch to Real WhatsApp delivery, add Meta Credentials in Admin Settings.`);
  console.log(`======================================================\n`);

  return {
    success: true,
    mode: 'test',
    message: `Test OTP sent: ${otp}`,
    testOtp: otp,
  };
}

// 3. Send Order Confirmation WhatsApp Message
async function sendOrderWhatsAppNotification(orderData) {
  const settings = await getWhatsAppSettings();
  const phone = orderData.customer_phone || orderData.customerPhone;
  if (!phone) return { success: false, message: 'No phone number provided' };

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const orderNum = orderData.order_number || orderData.orderNumber || orderData.id;
  const total = Number(orderData.total_amount || 0).toLocaleString('en-IN');
  const tracking = orderData.tracking_number || 'Generated';

  const messageText = `🎉 *Order Confirmed! #${orderNum}*\n\nHey ${orderData.customer_name || 'Athlete'},\nThank you for ordering with *XAVONIC Athletics*!\n\n📦 *Order Total:* ₹${total}\n🚚 *Courier:* ${orderData.courier_partner || 'Bluedart Express'}\n📍 *Tracking Code:* ${tracking}\n\nYour performance gear is being dispatched shortly!`;

  if (settings.mode === 'live' && settings.meta_token && settings.phone_number_id) {
    try {
      const metaUrl = `https://graph.facebook.com/v19.0/${settings.phone_number_id}/messages`;
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'text',
        text: { preview_url: false, body: messageText },
      };

      await fetch(metaUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.meta_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log(`✅ Order notification sent via WhatsApp to +${cleanPhone}`);
      return { success: true, mode: 'live' };
    } catch (err) {
      console.warn('Could not send live WhatsApp message:', err.message);
      return { success: false, error: err.message };
    }
  }

  console.log(`🧪 Simulated WhatsApp Order message for #${orderNum} to +${cleanPhone}`);
  return { success: true, mode: 'test' };
}

module.exports = {
  getWhatsAppSettings,
  sendWhatsAppOtp,
  sendOrderWhatsAppNotification,
};

