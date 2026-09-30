const db = require('../config/db');

// 1. Get all registered customers from database
exports.getCustomers = async (req, res) => {
  try {
    const { search, page = 1, limit = 25 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = `
      SELECT 
        id, 
        customer_id,
        name, 
        phone, 
        phone_verified, 
        email, 
        email_verified, 
        gender, 
        tier, 
        points, 
        chest_size, 
        lower_size, 
        created_at, 
        last_login 
      FROM users 
    `;
    const params = [];

    if (search && search.trim() !== '') {
      const s = `%${search.trim()}%`;
      query += ` WHERE name LIKE ? OR phone LIKE ? OR email LIKE ?`;
      params.push(s, s, s);
    }

    query += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const [customers] = await db.query(query, params);

    // Count total query
    let countQuery = `SELECT COUNT(*) as total FROM users`;
    let countParams = [];
    if (search && search.trim() !== '') {
      const s = `%${search.trim()}%`;
      countQuery += ` WHERE name LIKE ? OR phone LIKE ? OR email LIKE ?`;
      countParams.push(s, s, s);
    }
    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0]?.total || 0;

    return res.status(200).json({
      success: true,
      customers,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error('Error in getCustomers:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch customers.' });
  }
};

// 2. Delete customer
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    return res.status(200).json({ success: true, message: 'Customer deleted successfully.' });
  } catch (err) {
    console.error('Error deleting customer:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete customer.' });
  }
};
