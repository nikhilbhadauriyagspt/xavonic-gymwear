const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'xavonic_athletics_admin_super_secret_key_2026';

function verifyAdminToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: No authentication token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired session token. Please sign in again.',
    });
  }
}

module.exports = { verifyAdminToken };
