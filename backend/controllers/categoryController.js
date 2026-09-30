const db = require('../config/db');
const { uploadToCloudinary } = require('../services/cloudinaryService');

// 1. Get all categories (Hierarchical Tree or Flat List)
exports.getCategories = async (req, res) => {
  try {
    const { level, parent_id, gender } = req.query;

    let query = `
      SELECT 
        c.id, 
        c.name, 
        c.slug, 
        c.parent_id, 
        c.level, 
        c.gender_target, 
        c.image_url, 
        c.show_title_overlay, 
        c.subtitle, 
        c.sort_order, 
        c.status,
        c.show_in_dual_section,
        c.kicker_title,
        c.created_at,
        p.name as parent_name
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
    `;
    const params = [];
    const conditions = [];

    if (level) {
      conditions.push('c.level = ?');
      params.push(level);
    }
    if (parent_id) {
      conditions.push('c.parent_id = ?');
      params.push(parent_id);
    }
    if (gender) {
      conditions.push('(c.gender_target = ? OR c.gender_target = "Unisex")');
      params.push(gender);
    }
    if (req.query.show_in_dual === '1' || req.query.show_in_dual === 'true') {
      conditions.push('c.show_in_dual_section = 1');
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY c.sort_order ASC, c.id ASC`;

    const [categories] = await db.query(query, params);

    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (err) {
    console.error('Error fetching categories:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
};

// 2. Add New Category (Main Category, Subcategory, or Item Type) with Cloudinary Upload
exports.createCategory = async (req, res) => {
  try {
    const {
      name,
      slug,
      parent_id,
      level = 'main',
      gender_target = 'Men',
      show_title_overlay = 1,
      subtitle = '',
      sort_order = 0,
      status = 'active',
      show_in_dual_section = 0,
      kicker_title = '',
      image_url: customImageUrl,
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const cleanSlug = (slug || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    let finalImageUrl = customImageUrl || null;

    // If file was uploaded via multer, send to Cloudinary
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'guidelya/categories');
      finalImageUrl = uploadResult.secure_url;
    }

    const parentIdVal = parent_id ? Number(parent_id) : null;
    const showTitleVal = show_title_overlay === '0' || show_title_overlay === 0 || show_title_overlay === false ? 0 : 1;
    const showDualVal = show_in_dual_section === '1' || show_in_dual_section === 1 || show_in_dual_section === true ? 1 : 0;

    const [result] = await db.query(
      `INSERT INTO categories (name, slug, parent_id, level, gender_target, image_url, show_title_overlay, subtitle, sort_order, status, show_in_dual_section, kicker_title) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        cleanSlug,
        parentIdVal,
        level,
        gender_target,
        finalImageUrl,
        showTitleVal,
        subtitle,
        Number(sort_order) || 0,
        status,
        showDualVal,
        kicker_title || null,
      ]
    );

    const [newCat] = await db.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);

    return res.status(201).json({
      success: true,
      message: 'Category created successfully!',
      category: newCat[0],
    });
  } catch (err) {
    console.error('Error creating category:', err);
    return res.status(500).json({ success: false, message: 'Failed to create category. Slug may already exist.' });
  }
};

// 3. Update Category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      parent_id,
      level,
      gender_target,
      show_title_overlay,
      subtitle,
      sort_order,
      status,
      show_in_dual_section,
      kicker_title,
      image_url: customImageUrl,
    } = req.body;

    let finalImageUrl = customImageUrl;

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'guidelya/categories');
      finalImageUrl = uploadResult.secure_url;
    }

    const parentIdVal = parent_id !== undefined ? (parent_id ? Number(parent_id) : null) : undefined;
    const showTitleVal = show_title_overlay !== undefined ? (show_title_overlay === '0' || show_title_overlay === 0 || show_title_overlay === false ? 0 : 1) : undefined;
    const showDualVal = show_in_dual_section !== undefined ? (show_in_dual_section === '1' || show_in_dual_section === 1 || show_in_dual_section === true ? 1 : 0) : undefined;

    let updateQuery = `
      UPDATE categories SET 
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        level = COALESCE(?, level),
        gender_target = COALESCE(?, gender_target),
        subtitle = COALESCE(?, subtitle),
        sort_order = COALESCE(?, sort_order),
        status = COALESCE(?, status)
    `;
    const params = [
      name,
      slug,
      level,
      gender_target,
      subtitle,
      sort_order !== undefined ? Number(sort_order) : null,
      status,
    ];

    if (parentIdVal !== undefined) {
      updateQuery += `, parent_id = ?`;
      params.push(parentIdVal);
    }
    if (showTitleVal !== undefined) {
      updateQuery += `, show_title_overlay = ?`;
      params.push(showTitleVal);
    }
    if (showDualVal !== undefined) {
      updateQuery += `, show_in_dual_section = ?`;
      params.push(showDualVal);
    }
    if (kicker_title !== undefined) {
      updateQuery += `, kicker_title = ?`;
      params.push(kicker_title);
    }
    if (finalImageUrl !== undefined) {
      updateQuery += `, image_url = ?`;
      params.push(finalImageUrl);
    }

    updateQuery += ` WHERE id = ?`;
    params.push(id);

    await db.query(updateQuery, params);

    const [updated] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully!',
      category: updated[0],
    });
  } catch (err) {
    console.error('Error updating category:', err);
    return res.status(500).json({ success: false, message: 'Failed to update category.' });
  }
};

// 4. Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM categories WHERE id = ?', [id]);
    return res.status(200).json({ success: true, message: 'Category deleted successfully.' });
  } catch (err) {
    console.error('Error deleting category:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete category.' });
  }
};
