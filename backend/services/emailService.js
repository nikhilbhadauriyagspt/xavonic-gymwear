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
              GUIDELYA <span style="color: #dc2626;">ATHLETICS</span>
            </h1>
            <p style="color: #a3a3a3; font-size: 11px; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">
              Verification & Security Telemetry
            </p>
          </div>
          <div style="padding: 30px 24px; text-align: center; color: #171717;">
            <h2 style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Your Authentication Code</h2>
            <p style="font-size: 13px; color: #737373; margin-bottom: 24px;">
              Use the single-use one-time password below to access your athlete portal.
            </p>
            <div style="background-color: #f8f9fa; border: 1px solid #e5e5e5; display: inline-block; padding: 12px 32px; border-radius: 4px; font-size: 28px; font-weight: 700; letter-spacing: 8px; color: #0d0d0f; font-family: monospace;">
              ${otp}
            </div>
            <p style="font-size: 11px; color: #a3a3a3; margin-top: 20px;">
              This code expires in 5 minutes. If you did not request this, please ignore this email.
            </p>
          </div>
          <div style="background-color: #fafafa; border-top: 1px solid #f0f0f0; padding: 16px; text-align: center; font-size: 10px; color: #a3a3a3;">
            Guidelya Aesthetics HQ • Engineered Activewear
          </div>
        </div>
      `;

      const mailOptions = {
        from: `"${settings.sender_name || 'Guidelya Athletics'}" <${settings.user}>`,
        to: toEmail,
        subject: `${otp} is your Guidelya Athletics login code`,
        text: `Your Guidelya Athletics login code is ${otp}. Valid for 5 minutes.`,
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

module.exports = {
  getSmtpSettings,
  sendEmailOtp,
};
