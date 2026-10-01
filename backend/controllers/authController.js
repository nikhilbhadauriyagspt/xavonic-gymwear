const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendWhatsAppOtp } = require('../services/whatsappService');
const { sendEmailOtp } = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'xavonic_athletics_admin_super_secret_key_2026';

// Helper to format user object returned to client
const formatUserResponse = (user) => {
  let addresses = [];
  try {
    if (user.addresses_json) {
      addresses = typeof user.addresses_json === 'string' ? JSON.parse(user.addresses_json) : user.addresses_json;
    }
  } catch (_) {
    addresses = [];
  }

  return {
    id: user.id,
    customerId: user.customer_id || `GDL-${String(user.id).padStart(5, '0')}`,
    name: user.name || '',
    phone: user.phone || '',
    phoneVerified: Boolean(user.phone_verified),
    email: user.email || '',
    emailVerified: Boolean(user.email_verified),
    gender: user.gender || 'Male',
    tier: user.tier || 'VIP Athlete Club',
    points: user.points || 100,
    chestSize: user.chest_size || 'L (42")',
    lowerSize: user.lower_size || 'M (32")',
    addresses: Array.isArray(addresses) ? addresses : [],
    createdAt: user.created_at,
  };
};

// 1. Send OTP to Customer WhatsApp Number
exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Mobile number is required.' });
    }

    const digitsOnly = phone.replace(/[^0-9]/g, '');
    if (digitsOnly.length < 10) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number.' });
    }

    const formattedPhone = digitsOnly.length === 10 ? `91${digitsOnly}` : digitsOnly;
    const otp = '1234';
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db.query(
      'INSERT INTO otp_verifications (identifier, phone, otp, expires_at, is_used) VALUES (?, ?, ?, ?, 0)',
      [formattedPhone, formattedPhone, otp, expiresAt]
    );

    const waResult = await sendWhatsAppOtp(formattedPhone, otp);

    return res.status(200).json({
      success: true,
      message: waResult.message || `OTP sent to +${formattedPhone}`,
      testOtp: otp,
      mode: waResult.mode,
      phone: formattedPhone,
    });
  } catch (err) {
    console.error('Error in sendOtp:', err);
    return res.status(500).json({ success: false, message: 'Failed to send OTP.' });
  }
};

// 2. Verify WhatsApp OTP & Authenticate Customer (No fake name / email prefilled)
exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone number and OTP are required.' });
    }

    const digitsOnly = phone.replace(/[^0-9]/g, '');
    const formattedPhone = digitsOnly.length === 10 ? `91${digitsOnly}` : digitsOnly;
    const cleanOtp = String(otp).trim();

    let isValid = false;

    if (cleanOtp === '1234') {
      isValid = true;
    } else {
      const [rows] = await db.query(
        'SELECT * FROM otp_verifications WHERE (phone = ? OR identifier = ?) AND otp = ? AND is_used = 0 AND expires_at > NOW() ORDER BY id DESC LIMIT 1',
        [formattedPhone, formattedPhone, cleanOtp]
      );
      if (rows && rows.length > 0) {
        isValid = true;
        await db.query('UPDATE otp_verifications SET is_used = 1 WHERE id = ?', [rows[0].id]);
      }
    }

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP. Use code: 1234' });
    }

    const raw10 = digitsOnly.length > 10 ? digitsOnly.slice(-10) : digitsOnly;
    const with91 = `91${raw10}`;

    const [existingUsers] = await db.query(
      'SELECT * FROM users WHERE phone = ? OR phone = ? OR phone = ?',
      [formattedPhone, with91, raw10]
    );

    let user;

    if (existingUsers && existingUsers.length > 0) {
      user = existingUsers[0];
      if (!user.customer_id) {
        const generatedCid = `GDL-${String(user.id).padStart(5, '0')}`;
        await db.query('UPDATE users SET customer_id = ? WHERE id = ?', [generatedCid, user.id]);
        user.customer_id = generatedCid;
      }
      await db.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP, phone_verified = 1 WHERE id = ?',
        [user.id]
      );
      user.phone_verified = 1;
    } else {
      // Create new user with verified phone, unique customer ID, and blank name/email
      const [insertResult] = await db.query(
        'INSERT INTO users (name, phone, phone_verified, email, email_verified, tier, points, gender) VALUES (?, ?, 1, NULL, 0, ?, ?, ?)',
        ['', formattedPhone, 'VIP Athlete Club', 100, 'Male']
      );

      const generatedCid = `GDL-${String(insertResult.insertId).padStart(5, '0')}`;
      await db.query('UPDATE users SET customer_id = ? WHERE id = ?', [generatedCid, insertResult.insertId]);

      const [newCreated] = await db.query('SELECT * FROM users WHERE id = ?', [insertResult.insertId]);
      user = newCreated[0];
    }

    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role || 'customer' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Mobile verified! Welcome to Guidelya.',
      token,
      user: formatUserResponse(user),
    });
  } catch (err) {
    console.error('Error in verifyOtp:', err);
    return res.status(500).json({ success: false, message: 'Authentication failed.' });
  }
};

// 3. Send Email OTP via Nodemailer
exports.sendEmailOtpHandler = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const otp = '1234';
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db.query(
      'INSERT INTO otp_verifications (identifier, email, otp, expires_at, is_used) VALUES (?, ?, ?, ?, 0)',
      [cleanEmail, cleanEmail, otp, expiresAt]
    );

    const emailResult = await sendEmailOtp(cleanEmail, otp);

    return res.status(200).json({
      success: true,
      message: emailResult.message || `OTP sent to ${cleanEmail}`,
      testOtp: otp,
      mode: emailResult.mode,
      email: cleanEmail,
    });
  } catch (err) {
    console.error('Error in sendEmailOtpHandler:', err);
    return res.status(500).json({ success: false, message: 'Failed to send email OTP.' });
  }
};

// 4. Verify Email OTP & Authenticate Customer (No fake phone / name prefilled)
exports.verifyEmailOtpHandler = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    let isValid = false;

    if (cleanOtp === '1234') {
      isValid = true;
    } else {
      const [rows] = await db.query(
        'SELECT * FROM otp_verifications WHERE (email = ? OR identifier = ?) AND otp = ? AND is_used = 0 AND expires_at > NOW() ORDER BY id DESC LIMIT 1',
        [cleanEmail, cleanEmail, cleanOtp]
      );
      if (rows && rows.length > 0) {
        isValid = true;
        await db.query('UPDATE otp_verifications SET is_used = 1 WHERE id = ?', [rows[0].id]);
      }
    }

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP. Use code: 1234' });
    }

    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [cleanEmail]);

    let user;

    if (existingUsers && existingUsers.length > 0) {
      user = existingUsers[0];
      await db.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP, email_verified = 1 WHERE id = ?',
        [user.id]
      );
      user.email_verified = 1;
    } else {
      // Create new user with verified email, but NO fake phone or dummy name
      const [insertResult] = await db.query(
        'INSERT INTO users (name, email, email_verified, phone, phone_verified, tier, points, gender) VALUES (?, ?, 1, NULL, 0, ?, ?, ?)',
        ['', cleanEmail, 'VIP Athlete Club', 100, 'Male']
      );

      const [newCreated] = await db.query('SELECT * FROM users WHERE id = ?', [insertResult.insertId]);
      user = newCreated[0];
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role || 'customer' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Email verified! Welcome to Guidelya.',
      token,
      user: formatUserResponse(user),
    });
  } catch (err) {
    console.error('Error in verifyEmailOtpHandler:', err);
    return res.status(500).json({ success: false, message: 'Email verification error.' });
  }
};

// 5. Login with Email & Password
exports.loginWithEmailPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [cleanEmail]);

    if (!users || users.length === 0) {
      return res.status(401).json({ success: false, message: 'No account found with this email.' });
    }

    const user = users[0];

    if (!user.password) {
      return res.status(400).json({ success: false, message: 'Account was created with OTP. Please sign in via OTP.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password.' });
    }

    await db.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role || 'customer' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name || 'Athlete'}!`,
      token,
      user: formatUserResponse(user),
    });
  } catch (err) {
    console.error('Error in loginWithEmailPassword:', err);
    return res.status(500).json({ success: false, message: 'Server error during sign in.' });
  }
};

// 6. Register with Email & Password
exports.registerWithEmailPassword = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [cleanEmail]);

    if (existing && existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Account already exists with this email.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : null;

    const [insertResult] = await db.query(
      'INSERT INTO users (name, email, email_verified, password, phone, phone_verified, tier, points, gender) VALUES (?, ?, 0, ?, ?, 0, ?, ?, ?)',
      [name || '', cleanEmail, hashedPassword, cleanPhone, 'VIP Athlete Club', 100, 'Male']
    );

    const [newCreated] = await db.query('SELECT * FROM users WHERE id = ?', [insertResult.insertId]);
    const user = newCreated[0];

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role || 'customer' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: formatUserResponse(user),
    });
  } catch (err) {
    console.error('Error in registerWithEmailPassword:', err);
    return res.status(500).json({ success: false, message: 'Registration error.' });
  }
};

// 7. Profile: Link & Verify Secondary Email
exports.linkEmailSendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const otp = '1234';
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db.query(
      'INSERT INTO otp_verifications (identifier, email, otp, expires_at, is_used) VALUES (?, ?, ?, ?, 0)',
      [`link_${cleanEmail}`, cleanEmail, otp, expiresAt]
    );

    const emailResult = await sendEmailOtp(cleanEmail, otp);

    return res.status(200).json({
      success: true,
      message: `OTP sent to ${cleanEmail}`,
      testOtp: otp,
      mode: emailResult.mode,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to send verification OTP.' });
  }
};

exports.verifyLinkEmail = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const { email, otp } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    if (cleanOtp !== '1234') {
      const [rows] = await db.query(
        'SELECT * FROM otp_verifications WHERE (email = ? OR identifier = ?) AND otp = ? AND is_used = 0 AND expires_at > NOW() ORDER BY id DESC LIMIT 1',
        [cleanEmail, `link_${cleanEmail}`, cleanOtp]
      );
      if (!rows || rows.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid OTP. Use code: 1234' });
      }
      await db.query('UPDATE otp_verifications SET is_used = 1 WHERE id = ?', [rows[0].id]);
    }

    // Update authenticated user's email and set email_verified = 1
    await db.query('UPDATE users SET email = ?, email_verified = 1 WHERE id = ?', [cleanEmail, decoded.id]);

    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
    const updatedUser = users[0];

    return res.status(200).json({
      success: true,
      message: 'Email verified and linked successfully!',
      user: formatUserResponse(updatedUser),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to verify email.' });
  }
};

// 8. Profile: Link & Verify Secondary Mobile
exports.linkPhoneSendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    const digitsOnly = phone ? phone.replace(/[^0-9]/g, '') : '';
    if (digitsOnly.length < 10) {
      return res.status(400).json({ success: false, message: 'Valid 10-digit mobile number required.' });
    }

    const formattedPhone = digitsOnly.length === 10 ? `91${digitsOnly}` : digitsOnly;
    const otp = '1234';
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db.query(
      'INSERT INTO otp_verifications (identifier, phone, otp, expires_at, is_used) VALUES (?, ?, ?, ?, 0)',
      [`link_${formattedPhone}`, formattedPhone, otp, expiresAt]
    );

    const waResult = await sendWhatsAppOtp(formattedPhone, otp);

    return res.status(200).json({
      success: true,
      message: `WhatsApp OTP sent to +${formattedPhone}`,
      testOtp: otp,
      mode: waResult.mode,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to send WhatsApp verification OTP.' });
  }
};

exports.verifyLinkPhone = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const { phone, otp } = req.body;
    const digitsOnly = phone.replace(/[^0-9]/g, '');
    const formattedPhone = digitsOnly.length === 10 ? `91${digitsOnly}` : digitsOnly;
    const cleanOtp = String(otp).trim();

    if (cleanOtp !== '1234') {
      const [rows] = await db.query(
        'SELECT * FROM otp_verifications WHERE (phone = ? OR identifier = ?) AND otp = ? AND is_used = 0 AND expires_at > NOW() ORDER BY id DESC LIMIT 1',
        [formattedPhone, `link_${formattedPhone}`, cleanOtp]
      );
      if (!rows || rows.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid OTP. Use code: 1234' });
      }
      await db.query('UPDATE otp_verifications SET is_used = 1 WHERE id = ?', [rows[0].id]);
    }

    // Update authenticated user's phone and set phone_verified = 1
    await db.query('UPDATE users SET phone = ?, phone_verified = 1 WHERE id = ?', [formattedPhone, decoded.id]);

    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
    const updatedUser = users[0];

    return res.status(200).json({
      success: true,
      message: 'Mobile number verified and linked successfully!',
      user: formatUserResponse(updatedUser),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to verify phone.' });
  }
};

// 9. Update Profile Information (Name, Gender, Sizes)
exports.updateProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const { name, gender, chestSize, lowerSize } = req.body;

    await db.query(
      'UPDATE users SET name = ?, gender = ?, chest_size = ?, lower_size = ? WHERE id = ?',
      [name || '', gender || 'Male', chestSize || 'L (42")', lowerSize || 'M (32")', decoded.id]
    );

    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.id]);

    return res.status(200).json({
      success: true,
      message: 'Profile details saved successfully in database!',
      user: formatUserResponse(users[0]),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to save profile.' });
  }
};

// 10. Get Current Customer Profile
exports.getMe = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      user: formatUserResponse(rows[0]),
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Session expired' });
  }
};

// 11. Address Book: Add or Update Address (Home / Office / Other)
exports.saveAddress = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let existingAddresses = [];
    try {
      if (users[0].addresses_json) {
        existingAddresses = typeof users[0].addresses_json === 'string'
          ? JSON.parse(users[0].addresses_json)
          : users[0].addresses_json;
      }
    } catch (_) {
      existingAddresses = [];
    }

    const {
      id: addressId,
      type = 'Home',
      name,
      phone,
      addressLine,
      apartment,
      city,
      state,
      pincode,
      latitude,
      longitude,
      isDefault,
    } = req.body;

    if (!addressLine || !city || !pincode) {
      return res.status(400).json({ success: false, message: 'Street address, city, and pincode are required.' });
    }

    const finalType = ['Home', 'Office', 'Other'].includes(type) ? type : 'Home';
    const targetId = addressId || `addr-${Date.now()}`;
    const makeDefault = isDefault || existingAddresses.length === 0;

    // If setting as default, unmark others
    if (makeDefault) {
      existingAddresses = existingAddresses.map((a) => ({ ...a, isDefault: false }));
    }

    const newAddressObj = {
      id: targetId,
      type: finalType,
      name: name || users[0].name || '',
      phone: phone || users[0].phone || '',
      addressLine,
      apartment: apartment || '',
      city,
      state: state || 'India',
      pincode,
      latitude: latitude || null,
      longitude: longitude || null,
      isDefault: makeDefault,
      updatedAt: new Date().toISOString(),
    };

    const existingIdx = existingAddresses.findIndex((a) => a.id === targetId);
    if (existingIdx > -1) {
      existingAddresses[existingIdx] = newAddressObj;
    } else {
      existingAddresses.push(newAddressObj);
    }

    await db.query('UPDATE users SET addresses_json = ? WHERE id = ?', [
      JSON.stringify(existingAddresses),
      decoded.id,
    ]);

    const [updatedUsers] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.id]);

    return res.status(200).json({
      success: true,
      message: 'Address saved to address book successfully!',
      addresses: existingAddresses,
      user: formatUserResponse(updatedUsers[0]),
    });
  } catch (err) {
    console.error('Error saving address:', err);
    return res.status(500).json({ success: false, message: 'Failed to save address.' });
  }
};

// 12. Address Book: Delete Address
exports.deleteAddress = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const { addressId } = req.params;

    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let existingAddresses = [];
    try {
      if (users[0].addresses_json) {
        existingAddresses = typeof users[0].addresses_json === 'string'
          ? JSON.parse(users[0].addresses_json)
          : users[0].addresses_json;
      }
    } catch (_) {
      existingAddresses = [];
    }

    const filtered = existingAddresses.filter((a) => a.id !== addressId);
    // If deleted address was default, promote first remaining address to default
    if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
      filtered[0].isDefault = true;
    }

    await db.query('UPDATE users SET addresses_json = ? WHERE id = ?', [
      JSON.stringify(filtered),
      decoded.id,
    ]);

    const [updatedUsers] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.id]);

    return res.status(200).json({
      success: true,
      message: 'Address removed from address book.',
      addresses: filtered,
      user: formatUserResponse(updatedUsers[0]),
    });
  } catch (err) {
    console.error('Error deleting address:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete address.' });
  }
};

// 13. Address Book: Set Default Address
exports.setDefaultAddress = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const { addressId } = req.params;

    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let existingAddresses = [];
    try {
      if (users[0].addresses_json) {
        existingAddresses = typeof users[0].addresses_json === 'string'
          ? JSON.parse(users[0].addresses_json)
          : users[0].addresses_json;
      }
    } catch (_) {
      existingAddresses = [];
    }

    const updated = existingAddresses.map((a) => ({
      ...a,
      isDefault: a.id === addressId,
    }));

    await db.query('UPDATE users SET addresses_json = ? WHERE id = ?', [
      JSON.stringify(updated),
      decoded.id,
    ]);

    const [updatedUsers] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.id]);

    return res.status(200).json({
      success: true,
      message: 'Default shipping address updated.',
      addresses: updated,
      user: formatUserResponse(updatedUsers[0]),
    });
  } catch (err) {
    console.error('Error setting default address:', err);
    return res.status(500).json({ success: false, message: 'Failed to set default address.' });
  }
};

// 14. Out of Stock: Subscribe to "Notify Me" Alert
exports.createStockNotification = async (req, res) => {
  try {
    const {
      productId,
      productTitle,
      variantSize = 'All',
      variantColor = '',
      email,
      phone,
      name,
    } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    if (!email && !phone) {
      return res.status(400).json({ success: false, message: 'Please provide either an Email address or WhatsApp phone number.' });
    }

    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch (_) {}
    }

    await db.query(
      `INSERT INTO stock_notifications (product_id, product_title, variant_size, variant_color, customer_email, customer_phone, customer_name, user_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        productId,
        productTitle || 'Gymwear Product',
        variantSize || 'All',
        variantColor || '',
        email || null,
        phone ? phone.replace(/[^0-9]/g, '') : null,
        name || '',
        userId,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "You're on the waitlist! We'll alert you on WhatsApp/Email as soon as this item is back in stock.",
    });
  } catch (err) {
    console.error('Error in createStockNotification:', err);
    return res.status(500).json({ success: false, message: 'Failed to register stock notification request.' });
  }
};

