const db = require('../config/db');

// Helper to push an admin notification directly from controllers (Order, Customer, Review, Inventory)
exports.createNotification = async ({ type = 'order', title, description, reference_id = null, link_url = null }) => {
  try {
    if (!title || !description) return;
    await db.query(
      `INSERT INTO admin_notifications (type, title, description, reference_id, link_url, is_read) 
       VALUES (?, ?, ?, ?, ?, 0)`,
      [type, title, description, reference_id, link_url]
    );
  } catch (err) {
    console.warn('Could not record admin notification:', err.message);
  }
};

// 1. GET all admin notifications with unread count
exports.getAdminNotifications = async (req, res) => {
  try {
    const { limit = 20, unreadOnly = 'false' } = req.query;
    let sql = 'SELECT * FROM admin_notifications';
    const params = [];

    if (unreadOnly === 'true') {
      sql += ' WHERE is_read = 0';
    }

    sql += ' ORDER BY id DESC LIMIT ?';
    params.push(Number(limit));

    const [notifications] = await db.query(sql, params);
    const [unreadResult] = await db.query('SELECT COUNT(*) as unread FROM admin_notifications WHERE is_read = 0');
    const unreadCount = unreadResult[0]?.unread || 0;

    return res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (err) {
    console.error('Error fetching admin notifications:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve notifications.' });
  }
};

// 2. Mark specific notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE admin_notifications SET is_read = 1 WHERE id = ?', [id]);
    return res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    console.error('Error updating notification:', err);
    return res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
};

// 3. Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await db.query('UPDATE admin_notifications SET is_read = 1 WHERE is_read = 0');
    return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    console.error('Error marking all notifications read:', err);
    return res.status(500).json({ success: false, message: 'Failed to update notifications.' });
  }
};

// 4. Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM admin_notifications WHERE id = ?', [id]);
    return res.status(200).json({ success: true, message: 'Notification removed.' });
  } catch (err) {
    console.error('Error deleting notification:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete notification.' });
  }
};
