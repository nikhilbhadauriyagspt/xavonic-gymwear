const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'xavonic_athletics_admin_super_secret_key_2026';

// Admin Login Handler with MySQL / phpMyAdmin DB
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const [admins] = await db.query('SELECT * FROM admins WHERE email = ?', [cleanEmail]);

    if (!admins || admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or account not found in database.',
      });
    }

    const admin = admins[0];

    // Verify hashed password
    const isPasswordValid = bcrypt.compareSync(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password. Please check your credentials.',
      });
    }

    // Update last login timestamp in phpMyAdmin DB
    await db.query('UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [admin.id]);

    // Generate JWT Token
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Admin authentication successful.',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Login error in MySQL:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while verifying credentials.',
      error: error.message,
    });
  }
};

// Get Authenticated Admin Profile
exports.getAdminProfile = async (req, res) => {
  try {
    const [admins] = await db.query(
      'SELECT id, name, email, role, created_at, last_login FROM admins WHERE id = ?',
      [req.admin.id]
    );

    if (!admins || admins.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found.',
      });
    }

    return res.status(200).json({
      success: true,
      admin: admins[0],
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin profile.',
    });
  }
};

// Update Admin Password (Admin Protected)
exports.updateAdminPassword = async (req, res) => {
  try {
    const { current_password, new_password, confirm_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current password and new password.',
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    if (confirm_password && new_password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match.',
      });
    }

    // Fetch current admin password hash from DB
    const [admins] = await db.query('SELECT * FROM admins WHERE id = ?', [req.admin.id]);
    if (!admins || admins.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found.',
      });
    }

    const admin = admins[0];

    // Verify current password
    const isCurrentValid = bcrypt.compareSync(current_password, admin.password);
    if (!isCurrentValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect. Please try again.',
      });
    }

    // Hash new password
    const hashedPassword = bcrypt.hashSync(new_password, 10);

    // Update in MySQL DB
    await db.query('UPDATE admins SET password = ? WHERE id = ?', [hashedPassword, req.admin.id]);

    return res.status(200).json({
      success: true,
      message: 'Admin password updated successfully! Please use your new password next time you sign in.',
    });
  } catch (error) {
    console.error('Password update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update password.',
      error: error.message,
    });
  }
};

// Update Admin Profile Details (Admin Protected)
exports.updateAdminProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if email taken by another admin
    const [existing] = await db.query('SELECT id FROM admins WHERE email = ? AND id != ?', [cleanEmail, req.admin.id]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'This email address is already in use by another admin.',
      });
    }

    await db.query('UPDATE admins SET name = ?, email = ? WHERE id = ?', [name.trim(), cleanEmail, req.admin.id]);

    return res.status(200).json({
      success: true,
      message: 'Admin profile details updated successfully.',
      admin: {
        id: req.admin.id,
        name: name.trim(),
        email: cleanEmail,
        role: req.admin.role,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update admin profile.',
      error: error.message,
    });
  }
};

