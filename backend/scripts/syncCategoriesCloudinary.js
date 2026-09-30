const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'fwlidd7t',
  api_key: '887531852538712',
  api_secret: 'lkB-KXtVa7j9Zi8pzhTn1VhT5xU',
  secure: true,
});

async function uploadOriginalAssetsToCloudinary() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'guidelya_db',
    port: process.env.DB_PORT || 3306,
  });

  console.log('Connected to MySQL to seed categories with Cloudinary...');

  const assetsDir = path.join(__dirname, '../../src/assets');

  const assetFiles = [
    { key: 'hero_compression', file: 'hero_compression.jpg' },
    { key: 'hero_oversized', file: 'hero_oversized.jpg' },
    { key: 'cat_dropcut', file: 'cat_dropcut.jpg' },
    { key: 'cat_stringers', file: 'cat_stringers.jpg' },
    { key: 'hero_joggers', file: 'hero_joggers.jpg' },
    { key: 'cat_trackpants', file: 'cat_trackpants.jpg' },
    { key: 'cat_shorts', file: 'cat_shorts.jpg' },
    { key: 'cat_hoodies', file: 'cat_hoodies.jpg' },
  ];

  const uploadedUrls = {};

  for (const item of assetFiles) {
    const fullPath = path.join(assetsDir, item.file);
    if (fs.existsSync(fullPath)) {
      console.log(`Uploading ${item.file} to Cloudinary...`);
      try {
        const result = await cloudinary.uploader.upload(fullPath, {
          folder: 'guidelya/categories',
          use_filename: true,
          unique_filename: false,
          overwrite: true,
        });
        uploadedUrls[item.key] = result.secure_url;
        console.log(`✅ Uploaded ${item.file} -> ${result.secure_url}`);
      } catch (uploadErr) {
        console.error(`❌ Failed to upload ${item.file}:`, uploadErr.message);
      }
    }
  }

  // Clear categories table to cleanly re-populate
  await connection.query('DELETE FROM categories');
  await connection.query('ALTER TABLE categories AUTO_INCREMENT = 1');

  // 1. Root Categories
  const [menRes] = await connection.query(
    'INSERT INTO categories (name, slug, level, gender_target, sort_order, status) VALUES (?, ?, ?, ?, ?, ?)',
    ['Men', 'men', 'main', 'Men', 1, 'active']
  );
  const menId = menRes.insertId;

  const [womenRes] = await connection.query(
    'INSERT INTO categories (name, slug, level, gender_target, sort_order, status) VALUES (?, ?, ?, ?, ?, ?)',
    ['Women', 'women', 'main', 'Women', 2, 'active']
  );
  const womenId = womenRes.insertId;

  // 2. Sub-categories under Men
  const [tshirtsRes] = await connection.query(
    'INSERT INTO categories (name, slug, parent_id, level, gender_target, sort_order, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['Gym T-Shirts & Tops', 'men-t-shirts', menId, 'sub', 'Men', 1, 'active']
  );
  const tshirtsId = tshirtsRes.insertId;

  const [lowersRes] = await connection.query(
    'INSERT INTO categories (name, slug, parent_id, level, gender_target, sort_order, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['Gym Lowers & Bottomwear', 'men-lowers-bottoms', menId, 'sub', 'Men', 2, 'active']
  );
  const lowersId = lowersRes.insertId;

  // 3. Exact Category Drops (Compression Tees, Dropcut, Oversized, Joggers, Lowers, Shorts)
  const categoryDrops = [
    {
      name: 'Compression T-Shirts',
      slug: 'compression',
      parent_id: tshirtsId,
      image_url: uploadedUrls['hero_compression'] || 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80',
      subtitle: '2nd Skin High Elastic Performance',
      sort_order: 1,
    },
    {
      name: 'Oversized T-Shirts',
      slug: 'oversized',
      parent_id: tshirtsId,
      image_url: uploadedUrls['hero_oversized'] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
      subtitle: 'Heavyweight Drop-Shoulder Relaxed Fit',
      sort_order: 2,
    },
    {
      name: 'Drop Cut T-Shirts',
      slug: 'drop-cut',
      parent_id: tshirtsId,
      image_url: uploadedUrls['cat_dropcut'] || 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80',
      subtitle: 'Extended Curved Hem Aesthetic',
      sort_order: 3,
    },
    {
      name: 'Stringers & Tanks',
      slug: 'tanks',
      parent_id: tshirtsId,
      image_url: uploadedUrls['cat_stringers'] || 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80',
      subtitle: 'Deep Armhole Maximum Mobility',
      sort_order: 4,
    },
    {
      name: 'Gym Lowers & Joggers',
      slug: 'lowers',
      parent_id: lowersId,
      image_url: uploadedUrls['hero_joggers'] || 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&q=80',
      subtitle: 'Tapered Ankle Athletic Fit',
      sort_order: 5,
    },
    {
      name: 'Athletic Trackpants',
      slug: 'trackpants',
      parent_id: lowersId,
      image_url: uploadedUrls['cat_trackpants'] || 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&q=80',
      subtitle: 'Breathable Training Performance',
      sort_order: 6,
    },
    {
      name: '5" Gym Shorts',
      slug: 'shorts',
      parent_id: lowersId,
      image_url: uploadedUrls['cat_shorts'] || 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80',
      subtitle: 'Tactical Inseam Quad Reveal',
      sort_order: 7,
    },
    {
      name: 'Cargo Gym Lowers',
      slug: 'cargo-lowers',
      parent_id: lowersId,
      image_url: uploadedUrls['cat_trackpants'] || 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&q=80',
      subtitle: 'Utility Multi-Pocket Stretch',
      sort_order: 8,
    },
  ];

  for (const item of categoryDrops) {
    await connection.query(
      'INSERT INTO categories (name, slug, parent_id, level, gender_target, image_url, show_title_overlay, subtitle, sort_order, status) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)',
      [item.name, item.slug, item.parent_id, 'item_type', 'Men', item.image_url, item.subtitle, item.sort_order, 'active']
    );
  }

  console.log('🎉 Successfully synced all Gym Lowers and T-Shirts categories with Cloudinary images!');
  await connection.end();
}

uploadOriginalAssetsToCloudinary().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
