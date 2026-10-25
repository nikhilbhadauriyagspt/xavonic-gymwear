const db = require('../config/db');

// Helper to fetch store settings from DB
async function getWhatsAppSettings() {
  try {
    const [rows] = await db.query(
      "SELECT setting_key, setting_value FROM store_settings WHERE setting_key LIKE 'whatsapp_%'"
    );

    const settings = {
      mode: process.env.WHATSAPP_MODE || 'live', // 'test' | 'live'
      meta_token: process.env.WHATSAPP_META_TOKEN || 'EAAz17rrKDQwBSxwenML9suGSz3B0WmVDx3ZBlQUAGlUG2OcZCpHdNRnlPaa1djVyzOPbIf6aB7CsH9ZBC3TOW3W8YGupjFKVE3FkcIZAXXZA7UZCslhGHswOWPJJpUodGYhybMoIITVrLzA46MeJfwtj1cefy25vhp9lQssqg3Pbryts3NZBMYnWtpiNNFCIyrhGE18geRfoKoPSUJm0YblhgoZCHIZCeL1UMQ3UmKbv6G0pXJHvMxL7NoZCZCehWURkBAZBOHjgr6ZAKGU7I2D4nPGW3',
      phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID || '1390115774180863',
      waba_id: process.env.WHATSAPP_WABA_ID || '959954196738025',
      template_name: 'ragex_otp_auth',
    };

    rows.forEach((r) => {
      if (r.setting_key === 'whatsapp_mode' && r.setting_value) settings.mode = r.setting_value;
      if (r.setting_key === 'whatsapp_meta_token' && r.setting_value) settings.meta_token = r.setting_value;
      if (r.setting_key === 'whatsapp_phone_number_id' && r.setting_value) settings.phone_number_id = r.setting_value;
      if (r.setting_key === 'whatsapp_waba_id' && r.setting_value) settings.waba_id = r.setting_value;
      if (r.setting_key === 'whatsapp_template_name' && r.setting_value) settings.template_name = r.setting_value;
    });

    return settings;
  } catch (err) {
    console.error('Error loading WhatsApp settings from DB, using live defaults:', err.message);
    return {
      mode: process.env.WHATSAPP_MODE || 'live',
      meta_token: process.env.WHATSAPP_META_TOKEN || 'EAAz17rrKDQwBSxwenML9suGSz3B0WmVDx3ZBlQUAGlUG2OcZCpHdNRnlPaa1djVyzOPbIf6aB7CsH9ZBC3TOW3W8YGupjFKVE3FkcIZAXXZA7UZCslhGHswOWPJJpUodGYhybMoIITVrLzA46MeJfwtj1cefy25vhp9lQssqg3Pbryts3NZBMYnWtpiNNFCIyrhGE18geRfoKoPSUJm0YblhgoZCHIZCeL1UMQ3UmKbv6G0pXJHvMxL7NoZCZCehWURkBAZBOHjgr6ZAKGU7I2D4nPGW3',
      phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID || '1390115774180863',
      waba_id: process.env.WHATSAPP_WABA_ID || '959954196738025',
      template_name: 'ragex_otp_auth',
    };
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
      const { getBrandSettings } = require('./brandService');
      const brand = await getBrandSettings();
      const brandName = brand.brand_name || 'RageX Activewear';

      console.log(`🚀 Dispatching real WhatsApp message via Meta Cloud API...`);
      const metaUrl = `https://graph.facebook.com/v21.0/${settings.phone_number_id}/messages`;
      
      const templateName = settings.template_name || 'ragex_otp_auth';

      const templatePayload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'en_US' },
          components: [
            {
              type: 'body',
              parameters: [
                {
                  type: 'text',
                  text: String(otp),
                },
              ],
            },
            {
              type: 'button',
              sub_type: 'url',
              index: '0',
              parameters: [
                {
                  type: 'text',
                  text: String(otp),
                },
              ],
            },
          ],
        },
      };

      const fallbackTextPayload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'text',
        text: {
          preview_url: false,
          body: `Your ${brandName} login OTP is: *${otp}*\n\nValid for 5 minutes. Do not share this code with anyone.`,
        },
      };

      let response = await fetch(metaUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.meta_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templatePayload),
      });

      let metaData = await response.json();

      // If template call fails, fallback to raw text message
      if (!response.ok || !metaData.messages) {
        console.warn(`⚠️ Template dispatch warning, trying text payload...`, metaData);
        response = await fetch(metaUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${settings.meta_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(fallbackTextPayload),
        });
        metaData = await response.json();
      }

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

  const { getBrandSettings } = require('./brandService');
  const brand = await getBrandSettings();
  const brandName = brand.brand_name || 'RageX Activewear';

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const orderNum = orderData.order_number || orderData.orderNumber || orderData.id;
  const total = Number(orderData.total_amount || 0).toLocaleString('en-IN');
  const tracking = orderData.tracking_number || 'Generated';

  const messageText = `🎉 *Order Confirmed! #${orderNum}*\n\nHey ${orderData.customer_name || 'Customer'},\nThank you for ordering with *${brandName}*!\n\n📦 *Order Total:* ₹${total}\n🚚 *Courier:* ${orderData.courier_partner || 'Bluedart Express'}\n📍 *Tracking Code:* ${tracking}\n\nYour order is being dispatched shortly!`;

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

  console.log(`🧪 Simulated WhatsApp order notification for #${orderNum} to +${cleanPhone}`);
  return { success: true, mode: 'test' };
}

// 4. Send Order Dispatched & Tracking WhatsApp Notification
async function sendOrderDispatchNotification(orderData) {
  const settings = await getWhatsAppSettings();
  const phone = orderData.customer_phone || orderData.customerPhone;
  if (!phone) return { success: false, message: 'No phone number provided' };

  const { getBrandSettings } = require('./brandService');
  const brand = await getBrandSettings();
  const brandName = brand.brand_name || 'RageX Activewear';

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const orderNum = orderData.order_number || orderData.orderNumber || orderData.id;
  const courier = orderData.courier_partner || 'Bluedart Express';
  const tracking = orderData.tracking_number || 'Generated';
  const trackingUrl = orderData.tracking_url || `https://shiprocket.co//tracking/${tracking}`;
  const estDelivery = orderData.estimated_delivery || 'Within 2–4 Business Days';

  const messageText = `🚀 *Your Order is On Its Way! #${orderNum}*\n\nHey ${orderData.customer_name || 'Customer'},\nYour order from *${brandName}* has been dispatched via *${courier}*!\n\n📦 *Tracking AWB:* ${tracking}\n🚚 *Courier Partner:* ${courier}\n📅 *Expected Delivery:* ${estDelivery}\n\n🔗 *Track Live Order Status:*\n${trackingUrl}\n\nNeed help? Reply directly to this message. Thank you for shopping with ${brandName}!`;

  if (settings.mode === 'live' && settings.meta_token && settings.phone_number_id) {
    try {
      const metaUrl = `https://graph.facebook.com/v19.0/${settings.phone_number_id}/messages`;
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'text',
        text: { preview_url: true, body: messageText },
      };

      await fetch(metaUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.meta_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log(`✅ Dispatch notification sent via WhatsApp to +${cleanPhone}`);
      return { success: true, mode: 'live' };
    } catch (err) {
      console.warn('Could not send live dispatch WhatsApp message:', err.message);
      return { success: false, error: err.message };
    }
  }

  console.log(`🧪 Simulated WhatsApp Dispatch alert for #${orderNum} to +${cleanPhone}`);
  console.log(`🚚 Courier: ${courier} | AWB: ${tracking} | Track: ${trackingUrl}`);
  return { success: true, mode: 'test' };
}

module.exports = {
  getWhatsAppSettings,
  sendWhatsAppOtp,
  sendOrderWhatsAppNotification,
  sendOrderDispatchNotification,
};

