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
