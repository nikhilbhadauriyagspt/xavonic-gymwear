const db = require('../config/db');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Helper to check Cloudinary configuration
async function getCloudinaryConfig() {
  try {
    const [rows] = await db.query(
      `SELECT setting_key, setting_value FROM store_settings 
       WHERE setting_key IN ('cloudinary_cloud_name', 'cloudinary_api_key', 'cloudinary_api_secret')`
    );
    const settings = {};
    rows.forEach((r) => {
      settings[r.setting_key] = r.setting_value;
    });

    const cloudName = settings.cloudinary_cloud_name || process.env.CLOUDINARY_CLOUD_NAME || 'fwlidd7t';
    const apiKey = settings.cloudinary_api_key || process.env.CLOUDINARY_API_KEY || '887531852538712';
    const apiSecret = settings.cloudinary_api_secret || process.env.CLOUDINARY_API_SECRET || 'lkB-KXtVa7j9Zi8pzhTn1VhT5xU';

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    return true;
  } catch (err) {
    console.error('Error reading cloudinary config:', err.message);
    return false;
  }
}

// 1. PUBLIC: Get Active & Scheduled Valid Banners for Storefront
exports.getPublicBanners = async (req, res) => {
  try {
    const { slot } = req.query;
    let sql = `
      SELECT id, title, subtitle, slot, image_url, mobile_image_url, link_url, button_text, badge_text, sort_order, start_date, end_date
      FROM banners
      WHERE status = 'active'
        AND (start_date IS NULL OR start_date <= NOW())
        AND (end_date IS NULL OR end_date >= NOW())
    `;
    const params = [];

    if (slot && slot !== 'all') {
      sql += ' AND slot = ?';
      params.push(slot);
    }

    sql += ' ORDER BY sort_order ASC, created_at DESC';

    const [banners] = await db.query(sql, params);

    res.json({
      success: true,
      count: banners.length,
      banners,
    });
  } catch (error) {
    console.error('Error fetching public banners:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch banners', error: error.message });
  }
};

// 2. ADMIN: Get All Banners with Live Scheduling Metrics
exports.getAdminBanners = async (req, res) => {
  try {
    const { slot, status, search } = req.query;
    let sql = 'SELECT * FROM banners WHERE 1=1';
    const params = [];

    if (slot && slot !== 'all') {
      sql += ' AND slot = ?';
      params.push(slot);
    }

    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (search && search.trim()) {
      sql += ' AND (title LIKE ? OR subtitle LIKE ? OR link_url LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`, `%${search.trim()}%`);
    }

    sql += ' ORDER BY sort_order ASC, created_at DESC';

    const [banners] = await db.query(sql, params);

    // Calculate quick telemetry stats
    const now = new Date();
    let activeCount = 0;
    let scheduledCount = 0;
    let expiredCount = 0;
    let inactiveCount = 0;

    const enrichedBanners = banners.map((b) => {
      let scheduleState = 'Active';
      if (b.status === 'inactive') {
        scheduleState = 'Inactive';
        inactiveCount++;
      } else {
        const start = b.start_date ? new Date(b.start_date) : null;
        const end = b.end_date ? new Date(b.end_date) : null;

        if (start && start > now) {
          scheduleState = 'Scheduled (Upcoming)';
          scheduledCount++;
        } else if (end && end < now) {
          scheduleState = 'Expired';
          expiredCount++;
        } else {
          scheduleState = 'Live Now';
          activeCount++;
        }
      }

      return {
        ...b,
        scheduleState,
      };
    });

    res.json({
      success: true,
      total: banners.length,
      stats: {
        total: banners.length,
        active: activeCount,
        scheduled: scheduledCount,
        expired: expiredCount,
        inactive: inactiveCount,
      },
      banners: enrichedBanners,
    });
  } catch (error) {
    console.error('Error fetching admin banners:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admin banners', error: error.message });
  }
};

// 3. ADMIN: Create New Banner
exports.createBanner = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      slot = 'hero',
      image_url,
      mobile_image_url,
      link_url = '/collections',
      button_text = 'Shop Collection',
      badge_text,
      sort_order = 0,
      status = 'active',
      start_date,
      end_date,
    } = req.body;

    let finalImageUrl = image_url;

    // Handle Direct File Upload if file provided in request
    if (req.file) {
      await getCloudinaryConfig();
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'xavonic_banners', resource_type: 'auto' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });
      finalImageUrl = uploadResult.secure_url;
    }

    if (!finalImageUrl) {
      return res.status(400).json({ success: false, message: 'Banner image is required (either file upload or image URL)' });
    }

    const startDateVal = start_date && start_date.trim() ? start_date : null;
    const endDateVal = end_date && end_date.trim() ? end_date : null;

    const [result] = await db.query(
      `INSERT INTO banners (title, subtitle, slot, image_url, mobile_image_url, link_url, button_text, badge_text, sort_order, status, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title || 'New Banner',
        subtitle || '',
        slot,
        finalImageUrl,
        mobile_image_url || null,
        link_url || '/collections',
        button_text || 'Shop Now',
        badge_text || null,
        parseInt(sort_order, 10) || 0,
        status,
        startDateVal,
        endDateVal,
      ]
    );

    const [newBanner] = await db.query('SELECT * FROM banners WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      banner: newBanner[0],
    });
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ success: false, message: 'Failed to create banner', error: error.message });
  }
};

// 4. ADMIN: Update Banner Details
exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      subtitle,
      slot,
      image_url,
      mobile_image_url,
      link_url,
      button_text,
      badge_text,
      sort_order,
      status,
      start_date,
      end_date,
    } = req.body;

    const [existing] = await db.query('SELECT * FROM banners WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    let finalImageUrl = image_url || existing[0].image_url;

    // Handle new uploaded file if any
    if (req.file) {
      await getCloudinaryConfig();
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'xavonic_banners', resource_type: 'auto' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });
      finalImageUrl = uploadResult.secure_url;
    }

    const startDateVal = start_date !== undefined ? (start_date && start_date.trim() ? start_date : null) : existing[0].start_date;
    const endDateVal = end_date !== undefined ? (end_date && end_date.trim() ? end_date : null) : existing[0].end_date;

    await db.query(
      `UPDATE banners SET
         title = ?,
         subtitle = ?,
         slot = ?,
         image_url = ?,
         mobile_image_url = ?,
         link_url = ?,
         button_text = ?,
         badge_text = ?,
         sort_order = ?,
         status = ?,
         start_date = ?,
         end_date = ?
       WHERE id = ?`,
      [
        title !== undefined ? title : existing[0].title,
        subtitle !== undefined ? subtitle : existing[0].subtitle,
        slot !== undefined ? slot : existing[0].slot,
        finalImageUrl,
        mobile_image_url !== undefined ? mobile_image_url : existing[0].mobile_image_url,
        link_url !== undefined ? link_url : existing[0].link_url,
        button_text !== undefined ? button_text : existing[0].button_text,
        badge_text !== undefined ? badge_text : existing[0].badge_text,
        sort_order !== undefined ? parseInt(sort_order, 10) : existing[0].sort_order,
        status !== undefined ? status : existing[0].status,
        startDateVal,
        endDateVal,
        id,
      ]
    );

    const [updated] = await db.query('SELECT * FROM banners WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Banner updated successfully',
      banner: updated[0],
    });
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ success: false, message: 'Failed to update banner', error: error.message });
  }
};

// 5. ADMIN: Quick Toggle Active / Inactive Status
exports.toggleBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const [banner] = await db.query('SELECT id, status FROM banners WHERE id = ?', [id]);

    if (banner.length === 0) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    const newStatus = banner[0].status === 'active' ? 'inactive' : 'active';
    await db.query('UPDATE banners SET status = ? WHERE id = ?', [newStatus, id]);

    res.json({
      success: true,
      message: `Banner status set to ${newStatus}`,
      newStatus,
    });
  } catch (error) {
    console.error('Error toggling banner status:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle banner status', error: error.message });
  }
};

// 6. ADMIN: Delete Banner
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM banners WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    res.json({
      success: true,
      message: 'Banner deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ success: false, message: 'Failed to delete banner', error: error.message });
  }
};
