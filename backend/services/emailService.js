const nodemailer = require('nodemailer');
const db = require('../config/db');

// Helper to fetch SMTP Email settings from MySQL DB
async function getSmtpSettings() {
  try {
    const [rows] = await db.query(
      "SELECT setting_key, setting_value FROM store_settings WHERE setting_key LIKE 'smtp_%'"
    );

    const settings = {
      mode: 'test', // 'test' | 'live'
      host: 'smtp.gmail.com',
      port: '465',
      secure: 'true',
      user: '',
      pass: '',
      sender_name: 'Guidelya Athletics',
    };

    rows.forEach((r) => {
      if (r.setting_key === 'smtp_mode') settings.mode = r.setting_value;
      if (r.setting_key === 'smtp_host') settings.host = r.setting_value;
      if (r.setting_key === 'smtp_port') settings.port = r.setting_value;
      if (r.setting_key === 'smtp_secure') settings.secure = r.setting_value;
      if (r.setting_key === 'smtp_user') settings.user = r.setting_value;
      if (r.setting_key === 'smtp_pass') settings.pass = r.setting_value;
      if (r.setting_key === 'smtp_sender_name') settings.sender_name = r.setting_value;
    });

    return settings;
  } catch (err) {
    console.error('Error loading SMTP settings:', err.message);
    return { mode: 'test' };
  }
}

// Send OTP via Nodemailer Live SMTP or Test Simulator
async function sendEmailOtp(toEmail, otp) {
  const settings = await getSmtpSettings();
  const { getBrandSettings } = require('./brandService');
  const brand = await getBrandSettings();
  const brandName = brand.brand_name || 'Guidelya Activewear';
  const brandTagline = brand.brand_tagline || 'Engineered for Performance. Cut for Aesthetics.';

  console.log(`\n======================================================`);
  console.log(`📧 [Nodemailer Email Gateway] Triggering OTP for: ${toEmail}`);
  console.log(`🔑 Generated OTP Code: ${otp}`);
  console.log(`⚙️ Active Mode: ${settings.mode.toUpperCase()}`);

  // 1. LIVE MODE: Send real email using Nodemailer with Admin SMTP Credentials
  if (settings.mode === 'live' && settings.user && settings.pass) {
    try {
      console.log(`🚀 Dispatching real email via SMTP (${settings.host}:${settings.port})...`);

      const transporter = nodemailer.createTransport({
        host: settings.host,
        port: Number(settings.port) || 465,
        secure: settings.port === '465' || settings.secure === 'true',
        auth: {
          user: settings.user,
          pass: settings.pass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 6px; overflow: hidden;">
          <div style="background-color: #0d0d0f; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 2px; text-transform: uppercase;">
              ${brandName.toUpperCase()}
            </h1>
            <p style="color: #a3a3a3; font-size: 11px; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">
              ${brandTagline}
            </p>
          </div>
          <div style="padding: 30px 24px; text-align: center; color: #171717;">
            <h2 style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Your Authentication Code</h2>
            <p style="font-size: 13px; color: #737373; margin-bottom: 24px;">
              Use the single-use one-time password below to access your ${brandName} account.
            </p>
            <div style="background-color: #f8f9fa; border: 1px solid #e5e5e5; display: inline-block; padding: 12px 32px; border-radius: 4px; font-size: 28px; font-weight: 700; letter-spacing: 8px; color: #0d0d0f; font-family: monospace;">
              ${otp}
            </div>
            <p style="font-size: 11px; color: #a3a3a3; margin-top: 20px;">
              This code expires in 5 minutes. If you did not request this, please ignore this email.
            </p>
          </div>
          <div style="background-color: #fafafa; border-top: 1px solid #f0f0f0; padding: 16px; text-align: center; font-size: 10px; color: #a3a3a3;">
            ${brandName} • ${brand.support_email || 'support@guidelya.com'}
          </div>
        </div>
      `;

      const mailOptions = {
        from: `"${settings.sender_name || brandName}" <${settings.user}>`,
        to: toEmail,
        subject: `${otp} is your ${brandName} login code`,
        text: `Your ${brandName} login code is ${otp}. Valid for 5 minutes.`,
        html: htmlContent,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Live Email delivered! Message ID: ${info.messageId}`);
      console.log(`======================================================\n`);

      return {
        success: true,
        mode: 'live',
        messageId: info.messageId,
        message: `OTP delivered to ${toEmail}`,
      };
    } catch (smtpErr) {
      console.error('❌ Nodemailer SMTP Error:', smtpErr.message);
      console.log(`======================================================\n`);
      return {
        success: true,
        mode: 'test_fallback',
        smtpError: smtpErr.message,
        message: `Testing OTP: ${otp} (SMTP Error logged)`,
      };
    }
  }

  // 2. TEST MODE (Default fallback for seamless development)
  console.log(`🧪 Simulated Email delivery. Use test OTP: ${otp}`);
  console.log(`💡 To send live real emails, configure your SMTP Credentials in Admin Settings.`);
  console.log(`======================================================\n`);

  return {
    success: true,
    mode: 'test',
    message: `Test OTP sent: ${otp}`,
    testOtp: otp,
  };
}

// 3. Send Order Invoice & Confirmation Email
async function sendOrderInvoiceEmail(orderData) {
  const settings = await getSmtpSettings();
  const { getBrandSettings } = require('./brandService');
  const brand = await getBrandSettings();
  const brandName = brand.brand_name || 'Guidelya Activewear';
  const brandTagline = brand.brand_tagline || 'Official Order Confirmation & Tax Invoice';

  const toEmail = orderData.customer_email || orderData.customerEmail;
  if (!toEmail) return { success: false, message: 'No customer email provided' };

  const items = Array.isArray(orderData.items) ? orderData.items : [];
  const itemsHtml = items.map((it) => `
    <tr style="border-bottom: 1px solid #f0f0f0;">
      <td style="padding: 12px 8px; font-size: 13px; color: #171717;">
        <strong>${it.title || 'Product'}</strong><br/>
        <span style="font-size: 11px; color: #737373;">Size: ${it.selectedSize || it.size || 'M'} | Qty: ${it.quantity || 1}</span>
      </td>
      <td style="padding: 12px 8px; font-size: 13px; text-align: right; color: #171717; font-weight: 600;">
        ₹${((it.price || 0) * (it.quantity || 1)).toLocaleString('en-IN')}
      </td>
    </tr>
  `).join('');

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 6px; overflow: hidden;">
      <div style="background-color: #0d0d0f; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 2px; text-transform: uppercase;">
          ${brandName.toUpperCase()}
        </h1>
        <p style="color: #a3a3a3; font-size: 11px; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">
          Official Order Confirmation & Tax Invoice
        </p>
      </div>

      <div style="padding: 24px;">
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 12px 16px; margin-bottom: 20px;">
          <h2 style="color: #15803d; font-size: 15px; margin: 0 0 4px 0;">🎉 Order Confirmed!</h2>
          <p style="color: #166534; font-size: 12px; margin: 0;">
            Thank you for shopping with us, <strong>${orderData.customer_name || 'Customer'}</strong>. Your order is being packed.
          </p>
        </div>

        <table style="width: 100%; font-size: 12px; color: #525252; margin-bottom: 20px;">
          <tr>
            <td style="padding: 4px 0;"><strong>Order Number:</strong> #${orderData.order_number || orderData.orderNumber || orderData.id}</td>
            <td style="padding: 4px 0; text-align: right;"><strong>Payment Method:</strong> ${orderData.payment_method || 'Prepaid'}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;"><strong>Courier Partner:</strong> ${orderData.courier_partner || 'Bluedart Express'}</td>
            <td style="padding: 4px 0; text-align: right;"><strong>Tracking Code:</strong> ${orderData.tracking_number || 'Generated'}</td>
          </tr>
        </table>

        <div style="border: 1px solid #e5e5e5; border-radius: 4px; overflow: hidden; margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #fafafa; border-bottom: 1px solid #e5e5e5;">
                <th style="padding: 10px 8px; text-align: left; font-size: 11px; text-transform: uppercase; color: #737373;">Item Description</th>
                <th style="padding: 10px 8px; text-align: right; font-size: 11px; text-transform: uppercase; color: #737373;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <div style="background-color: #fafafa; padding: 14px 16px; border-radius: 4px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: #525252; margin-bottom: 6px;">
            <span>Subtotal:</span>
            <span>₹${Number(orderData.subtotal || 0).toLocaleString('en-IN')}</span>
          </div>
          ${Number(orderData.discount_amount || 0) > 0 ? `
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: #dc2626; margin-bottom: 6px;">
            <span>Discount:</span>
            <span>- ₹${Number(orderData.discount_amount).toLocaleString('en-IN')}</span>
          </div>` : ''}
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: #525252; margin-bottom: 6px;">
            <span>Shipping Fee:</span>
            <span>${Number(orderData.shipping_fee || 0) === 0 ? 'FREE' : `₹${orderData.shipping_fee}`}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: 700; color: #0d0d0f; border-top: 1px solid #e5e5e5; padding-top: 8px;">
            <span>Total Paid:</span>
            <span>₹${Number(orderData.total_amount || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div style="font-size: 11px; color: #737373; line-height: 1.6;">
          <strong>Delivering To:</strong><br />
          ${typeof orderData.shipping_address === 'string' ? orderData.shipping_address : `${orderData.shipping_address?.name || orderData.customer_name}, ${orderData.shipping_address?.addressLine || ''}, ${orderData.shipping_address?.city || ''}, ${orderData.shipping_address?.state || ''} - ${orderData.shipping_address?.pincode || ''}`}
        </div>
      </div>

      <div style="background-color: #fafafa; border-top: 1px solid #f0f0f0; padding: 16px; text-align: center; font-size: 11px; color: #a3a3a3;">
        ${brandName} • High Performance Activewear • ${brand.support_email || 'support@guidelya.com'}
      </div>
    </div>
  `;

  if (settings.mode === 'live' && settings.user && settings.pass) {
    try {
      const transporter = nodemailer.createTransport({
        host: settings.host,
        port: Number(settings.port) || 465,
        secure: settings.port === '465' || settings.secure === 'true',
        auth: { user: settings.user, pass: settings.pass },
        tls: { rejectUnauthorized: false },
      });

      await transporter.sendMail({
        from: `"${settings.sender_name || brandName}" <${settings.user}>`,
        to: toEmail,
        subject: `Order #${orderData.order_number || orderData.id} Confirmed - ${brandName} Invoice`,
        html: htmlContent,
      });

      console.log(`✅ Order invoice email sent successfully to ${toEmail}`);
      return { success: true, mode: 'live' };
    } catch (err) {
      console.warn('Could not send live invoice email:', err.message);
      return { success: false, error: err.message };
    }
  }

  console.log(`🧪 Simulated Invoice email for #${orderData.order_number || orderData.id} to ${toEmail}`);
  return { success: true, mode: 'test' };
}

// 4. Send Order Dispatched & Tracking Email
async function sendOrderDispatchEmail(orderData) {
  const settings = await getSmtpSettings();
  const { getBrandSettings } = require('./brandService');
  const brand = await getBrandSettings();
  const brandName = brand.brand_name || 'Guidelya Activewear';

  const toEmail = orderData.customer_email || orderData.customerEmail;
  if (!toEmail) return { success: false, message: 'No email provided' };

  const orderNum = orderData.order_number || orderData.orderNumber || orderData.id;
  const courier = orderData.courier_partner || 'Bluedart Express';
  const tracking = orderData.tracking_number || 'Generated';
  const trackingUrl = orderData.tracking_url || `https://shiprocket.co//tracking/${tracking}`;
  const estDelivery = orderData.estimated_delivery || 'Within 2–4 Business Days';

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e5e5; border-radius: 6px; overflow: hidden;">
      <div style="background-color: #09090b; padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 20px; letter-spacing: 2px; text-transform: uppercase;">${brandName.toUpperCase()}</h1>
        <p style="margin: 6px 0 0; font-size: 12px; color: #a1a1aa; text-transform: uppercase;">Shipment Notification</p>
      </div>

      <div style="padding: 24px;">
        <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 16px; margin-bottom: 20px; text-align: center;">
          <h2 style="margin: 0 0 6px; font-size: 16px; color: #065f46;">🚀 Your Order Has Been Dispatched!</h2>
          <p style="margin: 0; font-size: 13px; color: #047857;">Order #${orderNum} is handed over to ${courier} and is on its way to you.</p>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
            <strong style="color: #475569;">Courier Partner:</strong>
            <span style="color: #0f172a; font-weight: 600;">${courier}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
            <strong style="color: #475569;">Tracking AWB:</strong>
            <span style="color: #dc2626; font-family: monospace; font-weight: 700;">${tracking}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px;">
            <strong style="color: #475569;">Expected Delivery:</strong>
            <span style="color: #0f172a; font-weight: 600;">${estDelivery}</span>
          </div>
        </div>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${trackingUrl}" style="background-color: #dc2626; color: #ffffff; padding: 12px 28px; text-decoration: none; font-size: 13px; font-weight: 600; border-radius: 4px; display: inline-block; letter-spacing: 0.5px;">
            TRACK LIVE SHIPMENT
          </a>
        </div>

        <p style="font-size: 12px; color: #64748b; line-height: 1.5; text-align: center; margin-top: 20px;">
          If you have any questions regarding your delivery, simply reply to this email or reach out on WhatsApp concierge.
        </p>
      </div>

      <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8;">
        ${brandName} • ${brand.support_email || 'support@guidelya.com'}
      </div>
    </div>
  `;

  if (settings.mode === 'live' && settings.user && settings.pass) {
    try {
      const transporter = nodemailer.createTransport({
        host: settings.host,
        port: Number(settings.port) || 465,
        secure: settings.port === '465' || settings.secure === 'true',
        auth: { user: settings.user, pass: settings.pass },
        tls: { rejectUnauthorized: false },
      });

      await transporter.sendMail({
        from: `"${settings.sender_name || brandName}" <${settings.user}>`,
        to: toEmail,
        subject: `Your Order #${orderNum} is On Its Way! - ${brandName} Tracking`,
        html: htmlContent,
      });

      console.log(`✅ Dispatch notification email sent successfully to ${toEmail}`);
      return { success: true, mode: 'live' };
    } catch (err) {
      console.warn('Could not send live dispatch email:', err.message);
      return { success: false, error: err.message };
    }
  }

  console.log(`🧪 Simulated Dispatch email for #${orderNum} to ${toEmail}`);
  return { success: true, mode: 'test' };
}

module.exports = {
  getSmtpSettings,
  sendEmailOtp,
  sendOrderInvoiceEmail,
  sendOrderDispatchEmail,
};

