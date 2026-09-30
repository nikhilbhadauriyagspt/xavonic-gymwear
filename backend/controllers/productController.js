const db = require('../config/db');
const { uploadToCloudinary } = require('../services/cloudinaryService');

// 1. Get All Products (Filtered by category, gender, search, status)
exports.getProducts = async (req, res) => {
  try {
    const { category, gender, search, status, limit = 50, page = 1 } = req.query;

    let query = `
      SELECT 
        p.*,
        c.name as category_title,
        c.slug as category_slug_ref
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
    `;
    const params = [];
    const conditions = [];

    if (category) {
      conditions.push('(p.category_slug = ? OR c.slug = ?)');
      params.push(category, category);
    }

    if (gender) {
      conditions.push('(p.gender_target = ? OR p.gender_target = "Unisex")');
      params.push(gender);
    }

    if (status) {
      conditions.push('p.status = ?');
      params.push(status);
    }

    if (search) {
      conditions.push('(p.title LIKE ? OR p.sku LIKE ? OR p.slug LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY p.id DESC`;

    const [products] = await db.query(query, params);

    // Format JSON fields
    const parsedProducts = products.map((item) => {
      let sizes = [];
      let colors = [];
      let features = [];
      try {
        sizes = typeof item.sizes_json === 'string' ? JSON.parse(item.sizes_json) : (item.sizes_json || ['S', 'M', 'L', 'XL']);
      } catch (_) { sizes = ['S', 'M', 'L', 'XL']; }

      try {
        colors = typeof item.colors_json === 'string' ? JSON.parse(item.colors_json) : (item.colors_json || []);
      } catch (_) { colors = []; }

      try {
        features = typeof item.features_json === 'string' ? JSON.parse(item.features_json) : (item.features_json || []);
      } catch (_) { features = []; }

      // Build top-level gallery from color variants
      const allGalleries = colors.flatMap((c) => c.gallery || []).filter(Boolean);

      return {
        ...item,
        sizes,
        colors,
        features,
        gallery: allGalleries.length > 0 ? allGalleries : (colors[0]?.image ? [colors[0].image] : []),
      };
    });

    return res.status(200).json({
      success: true,
      total: parsedProducts.length,
      products: parsedProducts,
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch products.' });
  }
};

// 2. Get Single Product by ID or Slug
exports.getProductByIdOrSlug = async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    const [rows] = await db.query(
      `SELECT p.*, c.name as category_title, c.slug as category_slug_ref 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = ? OR p.slug = ? LIMIT 1`,
      [idOrSlug, idOrSlug]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const item = rows[0];
    let sizes = ['S', 'M', 'L', 'XL'];
    let colors = [];
    let features = [];

    try { sizes = typeof item.sizes_json === 'string' ? JSON.parse(item.sizes_json) : (item.sizes_json || sizes); } catch (_) {}
    try { colors = typeof item.colors_json === 'string' ? JSON.parse(item.colors_json) : (item.colors_json || []); } catch (_) {}
    try { features = typeof item.features_json === 'string' ? JSON.parse(item.features_json) : (item.features_json || []); } catch (_) {}

    const allGalleries = colors.flatMap((c) => c.gallery || []).filter(Boolean);

    return res.status(200).json({
      success: true,
      product: {
        ...item,
        sizes,
        colors,
        features,
        gallery: allGalleries.length > 0 ? allGalleries : (colors[0]?.image ? [colors[0].image] : []),
      },
    });
  } catch (err) {
    console.error('Error fetching product by ID/Slug:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch product.' });
  }
};

// 3. Create Product with Multi-Color Galleries & Cloudinary Uploads
exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      slug,
      sku,
      category_id,
      category_slug,
      category_name,
      gender_target = 'Men',
      price = 0,
      original_price = 0,
      discount_label = '',
      stock = 50,
      in_stock = 1,
      fabric = '',
      fit = '',
      model_stats = '',
      description = '',
      care_instructions = '',
      status = 'active',
      sizes_json,
      colors_json,
      features_json,
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Product title is required.' });
    }

    const cleanSlug = (slug || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const autoSku = sku || `GDL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Process Color Variants & Upload Files to Cloudinary if attached
    let parsedColors = [];
    try {
      parsedColors = typeof colors_json === 'string' ? JSON.parse(colors_json) : (colors_json || []);
    } catch (_) {
      parsedColors = [];
    }

    // If files uploaded via multer (field names like `color_0_image_0`, `color_1_image_2`, etc.)
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // match fieldname like color_<index>_image_<imgIndex>
        const match = file.fieldname.match(/^color_(\d+)_image/);
        if (match) {
          const colorIndex = parseInt(match[1], 10);
          if (parsedColors[colorIndex]) {
            const uploadRes = await uploadToCloudinary(file.buffer, 'guidelya/products');
            if (!parsedColors[colorIndex].gallery) parsedColors[colorIndex].gallery = [];
            parsedColors[colorIndex].gallery.push(uploadRes.secure_url);
            if (!parsedColors[colorIndex].image) {
              parsedColors[colorIndex].image = uploadRes.secure_url;
            }
          }
        }
      }
    }

    // Set first image for each color if missing
    parsedColors = parsedColors.map((c) => ({
      ...c,
      image: c.image || (c.gallery && c.gallery[0]) || '',
    }));

    // Parse Sizes
    let parsedSizes = ['S', 'M', 'L', 'XL', 'XXL'];
    try {
      if (sizes_json) parsedSizes = typeof sizes_json === 'string' ? JSON.parse(sizes_json) : sizes_json;
    } catch (_) {}

    // Parse Features
    let parsedFeatures = [];
    try {
      if (features_json) parsedFeatures = typeof features_json === 'string' ? JSON.parse(features_json) : features_json;
    } catch (_) {}

    const [result] = await db.query(
      `INSERT INTO products (
        title, slug, sku, category_id, category_slug, category_name, gender_target,
        price, original_price, discount_label, stock, in_stock,
        sizes_json, colors_json, features_json,
        fabric, fit, model_stats, description, care_instructions, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        cleanSlug,
        autoSku,
        category_id ? Number(category_id) : null,
        category_slug || '',
        category_name || '',
        gender_target,
        Number(price) || 0,
        Number(original_price) || 0,
        discount_label,
        Number(stock) || 0,
        in_stock ? 1 : 0,
        JSON.stringify(parsedSizes),
        JSON.stringify(parsedColors),
        JSON.stringify(parsedFeatures),
        fabric,
        fit,
        model_stats,
        description,
        care_instructions,
        status,
      ]
    );

    const [newProduct] = await db.query('SELECT * FROM products WHERE id = ?', [result.insertId]);

    return res.status(201).json({
      success: true,
      message: 'Product created and color galleries saved to Cloudinary & MySQL!',
      product: newProduct[0],
    });
  } catch (err) {
    console.error('Error creating product:', err);
    return res.status(500).json({ success: false, message: 'Failed to create product. Slug or SKU may already exist.' });
  }
};

// 4. Update Product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      sku,
      category_id,
      category_slug,
      category_name,
      gender_target,
      price,
      original_price,
      discount_label,
      stock,
      in_stock,
      fabric,
      fit,
      model_stats,
      description,
      care_instructions,
      status,
      sizes_json,
      colors_json,
      features_json,
    } = req.body;

    let parsedColors = [];
    try {
      parsedColors = typeof colors_json === 'string' ? JSON.parse(colors_json) : (colors_json || []);
    } catch (_) {
      parsedColors = [];
    }

    // Process new uploaded images
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const match = file.fieldname.match(/^color_(\d+)_image/);
        if (match) {
          const colorIndex = parseInt(match[1], 10);
          if (parsedColors[colorIndex]) {
            const uploadRes = await uploadToCloudinary(file.buffer, 'guidelya/products');
            if (!parsedColors[colorIndex].gallery) parsedColors[colorIndex].gallery = [];
            parsedColors[colorIndex].gallery.push(uploadRes.secure_url);
            if (!parsedColors[colorIndex].image) {
              parsedColors[colorIndex].image = uploadRes.secure_url;
            }
          }
        }
      }
    }

    let parsedSizes = ['S', 'M', 'L', 'XL'];
    try {
      if (sizes_json) parsedSizes = typeof sizes_json === 'string' ? JSON.parse(sizes_json) : sizes_json;
    } catch (_) {}

    let parsedFeatures = [];
    try {
      if (features_json) parsedFeatures = typeof features_json === 'string' ? JSON.parse(features_json) : features_json;
    } catch (_) {}

    await db.query(
      `UPDATE products SET 
        title = COALESCE(?, title),
        slug = COALESCE(?, slug),
        sku = COALESCE(?, sku),
        category_id = ?,
        category_slug = COALESCE(?, category_slug),
        category_name = COALESCE(?, category_name),
        gender_target = COALESCE(?, gender_target),
        price = COALESCE(?, price),
        original_price = COALESCE(?, original_price),
        discount_label = COALESCE(?, discount_label),
        stock = COALESCE(?, stock),
        in_stock = COALESCE(?, in_stock),
        sizes_json = ?,
        colors_json = ?,
        features_json = ?,
        fabric = COALESCE(?, fabric),
        fit = COALESCE(?, fit),
        model_stats = COALESCE(?, model_stats),
        description = COALESCE(?, description),
        care_instructions = COALESCE(?, care_instructions),
        status = COALESCE(?, status)
      WHERE id = ?`,
      [
        title,
        slug,
        sku,
        category_id ? Number(category_id) : null,
        category_slug,
        category_name,
        gender_target,
        price !== undefined ? Number(price) : null,
        original_price !== undefined ? Number(original_price) : null,
        discount_label,
        stock !== undefined ? Number(stock) : null,
        in_stock !== undefined ? (in_stock ? 1 : 0) : null,
        JSON.stringify(parsedSizes),
        JSON.stringify(parsedColors),
        JSON.stringify(parsedFeatures),
        fabric,
        fit,
        model_stats,
        description,
        care_instructions,
        status,
        id,
      ]
    );

    const [updated] = await db.query('SELECT * FROM products WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully!',
      product: updated[0],
    });
  } catch (err) {
    console.error('Error updating product:', err);
    return res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
};

// 5. Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM products WHERE id = ?', [id]);
    return res.status(200).json({ success: true, message: 'Product deleted successfully.' });
  } catch (err) {
    console.error('Error deleting product:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
};
