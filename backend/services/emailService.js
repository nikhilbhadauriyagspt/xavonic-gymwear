const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');

// Helper to resolve inline logo attachment for Nodemailer so Gmail/Outlook always display the brand logo
function getLogoAttachmentAndSrc(brand = {}) {
  const remoteLogo = brand.logo_white || '';
  if (remoteLogo && /^https?:\/\//i.test(remoteLogo) && !remoteLogo.includes('localhost')) {
    return { logoSrc: remoteLogo, attachments: [] };
  }

  const localWhiteLogo = path.join(__dirname, '../../src/assets/logo_white.png');
  if (fs.existsSync(localWhiteLogo)) {
    return {
      logoSrc: 'cid:ragexbrandlogo',
      attachments: [
        {
          filename: 'ragex-logo.png',
          path: localWhiteLogo,
          cid: 'ragexbrandlogo',
        },
      ],
    };
  }

  return { logoSrc: '', attachments: [] };
}

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
      sender_name: 'RageX Athletics',
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
  const brandName = brand.brand_name || 'RageX Activewear';
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

      const { logoSrc, attachments } = getLogoAttachmentAndSrc(brand);
      const headerBrandHtml = logoSrc
        ? `<img src="${logoSrc}" alt="${brandName}" style="height: 36px; width: auto; display: block; margin: 0 auto 8px auto; border: 0;" />`
        : `<h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase;">${brandName.toUpperCase()}</h1>`;

      const htmlContent = `
        <div style="background-color: #f4f4f5; padding: 32px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden;">
            <tr>
              <td style="background-color: #09090b; padding: 28px 24px; text-align: center;">
                ${headerBrandHtml}
                <p style="color: #a1a1aa; font-size: 10px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">
                  ${brandTagline}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 36px 28px; text-align: center; color: #18181b;">
                <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #059669; margin: 0 0 8px 0;">
                  Email Verification
                </p>
                <h2 style="font-size: 20px; font-weight: 700; margin: 0 0 10px 0; color: #09090b;">
                  Your Verification Code
                </h2>
                <p style="font-size: 13px; color: #52525b; line-height: 1.6; margin: 0 0 24px 0;">
                  Please enter the 4-digit verification code below to verify your email address for ${brandName}.
                </p>
                <div style="background-color: #f8fafc; border: 1px solid #e4e4e7; display: inline-block; padding: 14px 36px; border-radius: 8px; font-size: 30px; font-weight: 800; letter-spacing: 10px; color: #09090b; font-family: 'Courier New', Courier, monospace;">
                  ${otp}
                </div>
                <p style="font-size: 11px; color: #a1a1aa; margin: 24px 0 0 0;">
                  This code is valid for 5 minutes. For your security, never share this code with anyone.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #fafafa; border-top: 1px solid #f4f4f5; padding: 18px 24px; text-align: center; font-size: 11px; color: #71717a;">
                <strong>${brandName}</strong> • ${brand.support_email || 'support@ragex.com'}
              </td>
            </tr>
          </table>
        </div>
      `;

      const mailOptions = {
        from: `"${settings.sender_name || brandName}" <${settings.user}>`,
        to: toEmail,
        subject: `${otp} is your ${brandName} verification code`,
        text: `Your ${brandName} verification code is ${otp}. Valid for 5 minutes.`,
        html: htmlContent,
        attachments,
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
  const brandName = brand.brand_name || 'RageX Activewear';

  const toEmail = orderData.customer_email || orderData.customerEmail;
  if (!toEmail) return { success: false, message: 'No customer email provided' };

  const { logoSrc, attachments } = getLogoAttachmentAndSrc(brand);
  const headerBrandHtml = logoSrc
    ? `<img src="${logoSrc}" alt="${brandName}" style="height: 38px; width: auto; display: block; margin: 0 auto 8px auto; border: 0;" />`
    : `<h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase;">${brandName.toUpperCase()}</h1>`;

  const orderId = String(orderData.order_number || orderData.orderNumber || orderData.id || '').replace(/^#/, '');
  const orderDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const rawPaymentMethod = String(orderData.payment_method || orderData.paymentMethod || 'Online Prepaid');
  const isCod = rawPaymentMethod.toLowerCase().includes('cod');
  const displayPaymentMethod = isCod ? 'Cash on Delivery (COD)' : 'Online Prepaid';
  const paymentBadgeText = isCod ? 'PAY ON DELIVERY' : 'PAYMENT VERIFIED';
  const paymentBadgeBg = isCod ? '#fef3c7' : '#dcfce7';
  const paymentBadgeColor = isCod ? '#92400e' : '#166534';
  const totalLabel = isCod ? 'Total Payable on Delivery' : 'Total Paid';

  const items = Array.isArray(orderData.items) ? orderData.items : [];
  const itemsHtml = items
    .map((it) => {
      const qty = Number(it.quantity || 1);
      const unitPrice = Number(it.price || 0);
      const lineTotal = unitPrice * qty;
      const size = it.selectedSize || it.size || 'M';
      const imgUrl = it.image || it.imageFront || '';
      const hasValidRemoteImg = /^https?:\/\//i.test(imgUrl) && !imgUrl.includes('localhost');

      return `
        <tr>
          <td style="padding: 14px 12px; border-bottom: 1px solid #f4f4f5; vertical-align: middle;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                ${
                  hasValidRemoteImg
                    ? `<td width="52" style="padding-right: 12px; vertical-align: top;">
                        <img src="${imgUrl}" alt="${it.title || 'Product'}" width="48" height="60" style="width: 48px; height: 60px; object-fit: cover; border-radius: 6px; border: 1px solid #e4e4e7; display: block;" />
                      </td>`
                    : ''
                }
                <td style="vertical-align: middle;">
                  <div style="font-size: 13px; font-weight: 700; color: #09090b; margin-bottom: 4px;">
                    ${it.title || 'Performance Apparel'}
                  </div>
                  <div style="font-size: 11px; color: #71717a;">
                    <span style="background-color: #f4f4f5; padding: 2px 6px; border-radius: 4px; color: #3f3f46; font-weight: 600;">Size: ${size}</span>
                    &nbsp;•&nbsp;
                    <span>Qty: <strong>${qty}</strong></span>
                    &nbsp;•&nbsp;
                    <span>₹${unitPrice.toLocaleString('en-IN')} / unit</span>
                  </div>
                </td>
              </tr>
            </table>
          </td>
          <td style="padding: 14px 12px; border-bottom: 1px solid #f4f4f5; text-align: right; vertical-align: middle; font-size: 13px; font-weight: 700; color: #09090b; white-space: nowrap;">
            ₹${lineTotal.toLocaleString('en-IN')}.00
          </td>
        </tr>
      `;
    })
    .join('');

  // Structured Delivery Address
  const addrObj =
    typeof orderData.shipping_address === 'object' && orderData.shipping_address !== null
      ? orderData.shipping_address
      : null;

  const recipientName = addrObj?.name || orderData.customer_name || 'Customer';
  const recipientPhone = addrObj?.phone || orderData.customer_phone || '';
  const formattedAddressHtml = addrObj
    ? `
      <div style="font-size: 13px; font-weight: 700; color: #09090b; margin-bottom: 3px;">${recipientName}</div>
      <div style="font-size: 12px; color: #52525b; line-height: 1.6;">
        ${addrObj.addressLine || ''}<br/>
        ${addrObj.city || ''}, ${addrObj.state || ''} — <strong>${addrObj.pincode || ''}</strong>
      </div>
      ${recipientPhone ? `<div style="font-size: 12px; color: #52525b; margin-top: 6px;">Phone: <strong style="color: #18181b;">${recipientPhone}</strong></div>` : ''}
    `
    : `<div style="font-size: 12px; color: #52525b; line-height: 1.6;">${orderData.shipping_address || ''}</div>`;

  const subtotalVal = Number(orderData.subtotal || 0);
  const discountVal = Number(orderData.discount_amount || 0);
  const shippingVal = Number(orderData.shipping_fee || 0);
  const totalVal = Number(orderData.total_amount || 0);
  const estDelivery = orderData.estimatedDelivery || '2–4 Business Days';

  const htmlContent = `
    <div style="background-color: #f4f4f5; padding: 28px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181b;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 14px; overflow: hidden;">
        
        <!-- 1. Brand Dark Header with Official Logo -->
        <tr>
          <td style="background-color: #09090b; padding: 28px 24px; text-align: center;">
            ${headerBrandHtml}
            <p style="color: #a1a1aa; font-size: 10px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">
              Official Order Confirmation &amp; Tax Receipt
            </p>
          </td>
        </tr>

        <!-- 2. Hero Greeting & Order Status Banner -->
        <tr>
          <td style="padding: 28px 24px 20px 24px; border-bottom: 1px solid #f4f4f5;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <span style="display: inline-block; background-color: ${paymentBadgeBg}; color: ${paymentBadgeColor}; font-size: 10px; font-weight: 800; letter-spacing: 1px; padding: 4px 10px; border-radius: 4px; text-transform: uppercase;">
                    ${paymentBadgeText}
                  </span>
                  <h2 style="font-size: 20px; font-weight: 800; color: #09090b; margin: 10px 0 6px 0; letter-spacing: -0.3px;">
                    Thank you for your order, ${String(recipientName).split(' ')[0]}!
                  </h2>
                  <p style="font-size: 12px; color: #52525b; margin: 0; line-height: 1.6;">
                    We have received your order <strong>#${orderId}</strong> and our warehouse team is preparing it for quality check &amp; dispatch.
                  </p>
                </td>
              </tr>
            </table>

            <!-- 4-Step Delivery Progress Table -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px; background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 10px; padding: 14px 12px;">
              <tr>
                <td width="25%" align="center" style="padding: 4px;">
                  <div style="width: 24px; height: 24px; line-height: 24px; border-radius: 12px; background-color: #059669; color: #ffffff; font-size: 12px; font-weight: 800; margin: 0 auto 6px auto;">✓</div>
                  <div style="font-size: 11px; font-weight: 700; color: #059669;">Confirmed</div>
                  <div style="font-size: 10px; color: #71717a;">Order received</div>
                </td>
                <td width="25%" align="center" style="padding: 4px;">
                  <div style="width: 24px; height: 24px; line-height: 24px; border-radius: 12px; background-color: #09090b; color: #ffffff; font-size: 11px; font-weight: 700; margin: 0 auto 6px auto;">2</div>
                  <div style="font-size: 11px; font-weight: 700; color: #09090b;">Processing</div>
                  <div style="font-size: 10px; color: #71717a;">Quality check</div>
                </td>
                <td width="25%" align="center" style="padding: 4px;">
                  <div style="width: 24px; height: 24px; line-height: 24px; border-radius: 12px; background-color: #e4e4e7; color: #71717a; font-size: 11px; font-weight: 700; margin: 0 auto 6px auto;">3</div>
                  <div style="font-size: 11px; font-weight: 600; color: #a1a1aa;">Shipped</div>
                  <div style="font-size: 10px; color: #a1a1aa;">In transit</div>
                </td>
                <td width="25%" align="center" style="padding: 4px;">
                  <div style="width: 24px; height: 24px; line-height: 24px; border-radius: 12px; background-color: #e4e4e7; color: #71717a; font-size: 11px; font-weight: 700; margin: 0 auto 6px auto;">4</div>
                  <div style="font-size: 11px; font-weight: 600; color: #a1a1aa;">Delivered</div>
                  <div style="font-size: 10px; color: #a1a1aa;">${estDelivery}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- 3. Key Order Metadata Grid (Gmail-Safe Table) -->
        <tr>
          <td style="padding: 18px 24px; background-color: #fafafa; border-bottom: 1px solid #e4e4e7;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 12px;">
              <tr>
                <td width="50%" style="padding-bottom: 10px; vertical-align: top;">
                  <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #71717a;">Order Number</div>
                  <div style="font-size: 13px; font-weight: 800; color: #09090b; margin-top: 2px;">#${orderId}</div>
                </td>
                <td width="50%" align="right" style="padding-bottom: 10px; vertical-align: top;">
                  <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #71717a;">Order Date</div>
                  <div style="font-size: 13px; font-weight: 700; color: #09090b; margin-top: 2px;">${orderDate}</div>
                </td>
              </tr>
              <tr>
                <td width="50%" style="vertical-align: top;">
                  <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #71717a;">Payment Method</div>
                  <div style="font-size: 12px; font-weight: 700; color: #09090b; margin-top: 2px;">${displayPaymentMethod}</div>
                </td>
                <td width="50%" align="right" style="vertical-align: top;">
                  <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #71717a;">Estimated Delivery</div>
                  <div style="font-size: 12px; font-weight: 700; color: #059669; margin-top: 2px;">${estDelivery}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- 4. Order Items Table -->
        <tr>
          <td style="padding: 24px 24px 12px 24px;">
            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #09090b; margin-bottom: 10px;">
              Order Summary (${items.length} ${items.length === 1 ? 'Item' : 'Items'})
            </div>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #e4e4e7; border-radius: 8px; overflow: hidden;">
              <thead>
                <tr style="background-color: #fafafa;">
                  <th align="left" style="padding: 10px 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #71717a; border-bottom: 1px solid #e4e4e7;">Item Description</th>
                  <th align="right" style="padding: 10px 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #71717a; border-bottom: 1px solid #e4e4e7;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </td>
        </tr>

        <!-- 5. Financial Breakdown Table (Gmail-Safe Left/Right Columns) -->
        <tr>
          <td style="padding: 8px 24px 24px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 14px 16px;">
              <tr>
                <td align="left" style="padding: 5px 0; font-size: 12px; color: #52525b;">Bag Subtotal</td>
                <td align="right" style="padding: 5px 0; font-size: 12px; font-weight: 600; color: #09090b;">₹${subtotalVal.toLocaleString('en-IN')}.00</td>
              </tr>
              ${
                discountVal > 0
                  ? `<tr>
                      <td align="left" style="padding: 5px 0; font-size: 12px; color: #059669;">Total Savings &amp; Discount</td>
                      <td align="right" style="padding: 5px 0; font-size: 12px; font-weight: 700; color: #059669;">- ₹${discountVal.toLocaleString('en-IN')}.00</td>
                    </tr>`
                  : ''
              }
              <tr>
                <td align="left" style="padding: 5px 0 10px 0; font-size: 12px; color: #52525b;">Shipping &amp; Handling</td>
                <td align="right" style="padding: 5px 0 10px 0; font-size: 12px; font-weight: 700; color: #059669;">${shippingVal === 0 ? 'FREE' : `₹${shippingVal}.00`}</td>
              </tr>
              <tr>
                <td align="left" style="padding: 12px 0 2px 0; border-top: 1px solid #e4e4e7; font-size: 14px; font-weight: 800; color: #09090b;">
                  ${totalLabel}
                </td>
                <td align="right" style="padding: 12px 0 2px 0; border-top: 1px solid #e4e4e7; font-size: 16px; font-weight: 800; color: #09090b;">
                  ₹${totalVal.toLocaleString('en-IN')}.00
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- 6. Delivery Destination Box -->
        <tr>
          <td style="padding: 0 24px 28px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #e4e4e7; border-radius: 8px; padding: 16px;">
              <tr>
                <td>
                  <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #71717a; margin-bottom: 6px;">
                    Delivery Address
                  </div>
                  ${formattedAddressHtml}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- 7. Footer -->
        <tr>
          <td style="background-color: #09090b; padding: 22px 24px; text-align: center; color: #a1a1aa; font-size: 11px; line-height: 1.6;">
            <div style="color: #ffffff; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px;">
              ${brandName}
            </div>
            <div>
              Need help with your order? Contact us at
              <a href="mailto:${brand.support_email || 'support@ragex.com'}" style="color: #ffffff; text-decoration: underline;">${brand.support_email || 'support@ragex.com'}</a>
            </div>
            <div style="font-size: 10px; color: #71717a; margin-top: 8px;">
              © ${new Date().getFullYear()} ${brandName}. All rights reserved.
            </div>
          </td>
        </tr>

      </table>
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
        subject: `Order Confirmed #${orderId} — ${brandName}`,
        html: htmlContent,
        attachments,
      });

      console.log(`✅ Order invoice email sent successfully to ${toEmail}`);
      return { success: true, mode: 'live' };
    } catch (err) {
      console.warn('Could not send live invoice email:', err.message);
      return { success: false, error: err.message };
    }
  }

  console.log(`🧪 Simulated Invoice email for #${orderId} to ${toEmail}`);
  return { success: true, mode: 'test' };
}

// 4. Send Order Dispatched & Tracking Email
async function sendOrderDispatchEmail(orderData) {
  const settings = await getSmtpSettings();
  const { getBrandSettings } = require('./brandService');
  const brand = await getBrandSettings();
  const brandName = brand.brand_name || 'RageX Activewear';

  const toEmail = orderData.customer_email || orderData.customerEmail;
  if (!toEmail) return { success: false, message: 'No email provided' };

  const { logoSrc, attachments } = getLogoAttachmentAndSrc(brand);
  const headerBrandHtml = logoSrc
    ? `<img src="${logoSrc}" alt="${brandName}" style="height: 36px; width: auto; display: block; margin: 0 auto 8px auto; border: 0;" />`
    : `<h1 style="margin: 0; font-size: 20px; letter-spacing: 2px; text-transform: uppercase; color: #ffffff;">${brandName.toUpperCase()}</h1>`;

  const orderNum = String(orderData.order_number || orderData.orderNumber || orderData.id || '').replace(/^#/, '');
  const courier = orderData.courier_partner || 'Express Courier';
  const tracking = orderData.tracking_number || 'Assigned';
  const trackingUrl = orderData.tracking_url || `https://shiprocket.co//tracking/${tracking}`;
  const estDelivery = orderData.estimated_delivery || '2–4 Business Days';

  const htmlContent = `
    <div style="background-color: #f4f4f5; padding: 28px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 14px; overflow: hidden;">
        <tr>
          <td style="background-color: #09090b; padding: 26px 24px; text-align: center; color: #ffffff;">
            ${headerBrandHtml}
            <p style="margin: 4px 0 0; font-size: 10px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">Shipment Dispatch Notification</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 28px 24px;">
            <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; margin-bottom: 20px; text-align: center;">
              <h2 style="margin: 0 0 6px; font-size: 16px; color: #065f46; font-weight: 800;">Your Order Has Been Dispatched</h2>
              <p style="margin: 0; font-size: 13px; color: #047857;">Order <strong>#${orderNum}</strong> has been handed over to <strong>${courier}</strong> and is on its way to you.</p>
            </div>

            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-size: 13px;">
              <tr>
                <td align="left" style="padding: 6px 0; color: #52525b;"><strong>Courier Partner</strong></td>
                <td align="right" style="padding: 6px 0; color: #09090b; font-weight: 700;">${courier}</td>
              </tr>
              <tr>
                <td align="left" style="padding: 6px 0; color: #52525b;"><strong>Tracking AWB</strong></td>
                <td align="right" style="padding: 6px 0; color: #09090b; font-family: monospace; font-weight: 800;">${tracking}</td>
              </tr>
              <tr>
                <td align="left" style="padding: 6px 0; color: #52525b;"><strong>Expected Delivery</strong></td>
                <td align="right" style="padding: 6px 0; color: #059669; font-weight: 700;">${estDelivery}</td>
              </tr>
            </table>

            <div style="text-align: center; margin: 24px 0;">
              <a href="${trackingUrl}" style="background-color: #09090b; color: #ffffff; padding: 12px 28px; text-decoration: none; font-size: 12px; font-weight: 700; text-transform: uppercase; border-radius: 6px; display: inline-block; letter-spacing: 1px;">
                Track Live Shipment
              </a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background-color: #09090b; padding: 18px 24px; text-align: center; font-size: 11px; color: #a1a1aa;">
            <strong style="color: #ffffff;">${brandName}</strong> • ${brand.support_email || 'support@ragex.com'}
          </td>
        </tr>
      </table>
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
        subject: `Order #${orderNum} Dispatched — ${brandName}`,
        html: htmlContent,
        attachments,
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

