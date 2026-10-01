const db = require('../config/db');

// 1. Get all registered customers from database with spending & order stats
exports.getCustomers = async (req, res) => {
  try {
    const { search, page = 1, limit = 25 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = '';
    const params = [];

    if (search && search.trim() !== '') {
      const s = `%${search.trim()}%`;
      whereClause = ` WHERE (u.name LIKE ? OR u.phone LIKE ? OR u.email LIKE ? OR u.customer_id LIKE ?)`;
      params.push(s, s, s, s);
    }

    let query = `
      SELECT 
        u.id, 
        u.customer_id,
        u.name, 
        u.phone, 
        u.phone_verified, 
        u.email, 
        u.email_verified, 
        u.gender, 
        u.tier, 
        u.points, 
        u.chest_size, 
        u.lower_size, 
        u.addresses_json,
        u.created_at, 
        u.last_login,
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(CASE WHEN o.order_status != 'Cancelled' THEN o.total_amount ELSE 0 END), 0) as total_spent,
        MAX(o.created_at) as last_order_date
      FROM users u
      LEFT JOIN orders o ON (
        o.user_id = u.id 
        OR (u.phone IS NOT NULL AND u.phone != '' AND o.customer_phone = u.phone) 
        OR (u.customer_id IS NOT NULL AND o.customer_id = u.customer_id)
      )
      ${whereClause}
      GROUP BY u.id
      ORDER BY u.id DESC 
      LIMIT ? OFFSET ?
    `;
    params.push(Number(limit), Number(offset));

    const [customers] = await db.query(query, params);

    // Count total query
    let countQuery = `SELECT COUNT(*) as total FROM users u`;
    let countParams = [];
    if (search && search.trim() !== '') {
      const s = `%${search.trim()}%`;
      countQuery += ` WHERE (u.name LIKE ? OR u.phone LIKE ? OR u.email LIKE ? OR u.customer_id LIKE ?)`;
      countParams.push(s, s, s, s);
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

// 2. Get full Customer Profile with Orders, Addresses & Spending Analytics
exports.getCustomerDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }
    const customer = users[0];

    // Fetch all orders placed by this customer (by user_id, customer_id, phone or email)
    const [orders] = await db.query(
      `SELECT * FROM orders 
       WHERE user_id = ? 
          OR (customer_id IS NOT NULL AND customer_id != '' AND customer_id = ?) 
          OR (customer_phone IS NOT NULL AND customer_phone != '' AND customer_phone = ?) 
          OR (customer_email IS NOT NULL AND customer_email != '' AND customer_email = ?)
       ORDER BY id DESC`,
      [customer.id, customer.customer_id || 'NONE', customer.phone || 'NONE', customer.email || 'NONE']
    );

    // Parse items_json and shipping_address for each order
    const formattedOrders = orders.map((o) => {
      let items = [];
      let address = null;
      try {
        items = typeof o.items_json === 'string' ? JSON.parse(o.items_json) : (o.items_json || []);
      } catch (_) {}
      try {
        address = typeof o.shipping_address === 'string' ? JSON.parse(o.shipping_address) : (o.shipping_address || null);
      } catch (_) {}
      return {
        ...o,
        items,
        shipping_address: address,
      };
    });

    // Extract all unique addresses (from user profile + from orders)
    let savedAddresses = [];
    try {
      savedAddresses = typeof customer.addresses_json === 'string' ? JSON.parse(customer.addresses_json) : (customer.addresses_json || []);
    } catch (_) {}

    const orderAddresses = formattedOrders
      .map((o) => o.shipping_address)
      .filter((addr) => addr && (addr.address || addr.street || addr.city || addr.pincode));

    // Combine and deduplicate addresses by address text or pincode
    const allAddresses = [...savedAddresses];
    orderAddresses.forEach((oa) => {
      const isDuplicate = allAddresses.some(
        (sa) => ((sa.address && sa.address === oa.address) || (sa.street && sa.street === oa.street)) && (sa.pincode === oa.pincode || sa.postalCode === oa.postalCode)
      );
      if (!isDuplicate) {
        allAddresses.push(oa);
      }
    });

    const totalOrders = formattedOrders.length;
    const totalSpent = formattedOrders.reduce((acc, o) => {
      if (o.order_status !== 'Cancelled') {
        return acc + Number(o.total_amount || 0);
      }
      return acc;
    }, 0);
    const avgOrderValue = totalOrders > 0 ? (totalSpent / totalOrders) : 0;

    return res.status(200).json({
      success: true,
      customer: {
        ...customer,
        total_orders: totalOrders,
        total_spent: totalSpent,
        avg_order_value: avgOrderValue,
      },
      orders: formattedOrders,
      addresses: allAddresses,
    });
  } catch (err) {
    console.error('Error fetching customer detail:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch customer details.' });
  }
};

// 3. Delete customer
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
