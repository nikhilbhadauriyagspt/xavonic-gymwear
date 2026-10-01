const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'guidelya_db';
const DB_PORT = Number(process.env.DB_PORT) || 3306;
const DB_SSL = process.env.DB_SSL === 'true' || (DB_HOST !== 'localhost' && DB_HOST !== '127.0.0.1');

const sslConfig = DB_SSL ? { rejectUnauthorized: false } : undefined;

// 1. Connection Pool options
const poolConfig = {
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT,
  ssl: sslConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// 2. MySQL Connection Pool for the application
const pool = mysql.createPool(poolConfig);

// 3. Initial connection to create database if on localhost
if (DB_HOST === 'localhost' || DB_HOST === '127.0.0.1') {
  const initialConnection = mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    port: DB_PORT,
  });

  initialConnection.connect((err) => {
    if (err) {
      console.error('❌ Could not connect to MySQL Server:', err.message);
      return;
    }
    console.log('✅ Connected to MySQL Server successfully.');

    // Create DB in phpMyAdmin if it does not exist
    initialConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
      (dbErr) => {
        if (dbErr) {
          console.error(`❌ Error creating database ${DB_NAME}:`, dbErr.message);
        } else {
          console.log(`📦 phpMyAdmin Database verified/created: [ ${DB_NAME} ]`);
          initDatabaseTables();
        }
        initialConnection.end();
      }
    );
  });
} else {
  // Remote Cloud Database (Render / Aiven / Railway)
  console.log(`🌐 Connecting to Cloud MySQL Database: ${DB_HOST}:${DB_PORT} [${DB_NAME}] (SSL: ${DB_SSL ? 'Active' : 'Off'})...`);
  initDatabaseTables();
}

function initDatabaseTables() {
  const promisePool = pool.promise();

  // Create Admins Table
  const createAdminsTable = `
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'Super Admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP NULL DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  // Create Users (Customers) Table with unique customer_id support
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id VARCHAR(50) UNIQUE NULL,
      name VARCHAR(100) DEFAULT '',
      phone VARCHAR(20) NULL,
      phone_verified TINYINT(1) DEFAULT 0,
      email VARCHAR(150) NULL,
      email_verified TINYINT(1) DEFAULT 0,
      password VARCHAR(255) NULL,
      role VARCHAR(20) DEFAULT 'customer',
      gender VARCHAR(20) DEFAULT 'Male',
      tier VARCHAR(50) DEFAULT 'VIP Athlete Club',
      points INT DEFAULT 100,
      chest_size VARCHAR(20) DEFAULT 'L (42")',
      lower_size VARCHAR(20) DEFAULT 'M (32")',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP NULL DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  // Create OTP Verifications Table (supports both phone & email OTPs)
  const createOtpTable = `
    CREATE TABLE IF NOT EXISTS otp_verifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      identifier VARCHAR(150) NOT NULL,
      phone VARCHAR(20) NULL,
      email VARCHAR(150) NULL,
      otp VARCHAR(10) NOT NULL,
      expires_at DATETIME NOT NULL,
      is_used TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  // Create Store Settings Table (For dynamic WhatsApp & Nodemailer SMTP Credentials)
  const createSettingsTable = `
    CREATE TABLE IF NOT EXISTS store_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      setting_key VARCHAR(100) UNIQUE NOT NULL,
      setting_value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  // Create Categories Hierarchy Table (Parent: Men/Women -> Subcategory: T-Shirts/Shorts -> Sub-subcategory: Oversized/Dropcut)
  const createCategoriesTable = `
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      slug VARCHAR(150) UNIQUE NOT NULL,
      parent_id INT NULL,
      level ENUM('main', 'sub', 'item_type') DEFAULT 'main',
      gender_target ENUM('Men', 'Women', 'Unisex') DEFAULT 'Men',
      image_url VARCHAR(500) NULL,
      show_title_overlay TINYINT(1) DEFAULT 1,
      subtitle VARCHAR(255) NULL,
      sort_order INT DEFAULT 0,
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  // Create Products Table with Color-wise Multi-Galleries, Fabric Specs & Sizes
  const createProductsTable = `
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      sku VARCHAR(100) UNIQUE NULL,
      category_id INT NULL,
      category_slug VARCHAR(150) NOT NULL DEFAULT '',
      category_name VARCHAR(150) NOT NULL DEFAULT '',
      gender_target ENUM('Men', 'Women', 'Unisex') DEFAULT 'Men',
      price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      original_price DECIMAL(10, 2) NULL DEFAULT 0.00,
      discount_label VARCHAR(50) NULL DEFAULT '',
      stock INT DEFAULT 50,
      in_stock TINYINT(1) DEFAULT 1,
      rating DECIMAL(3, 2) DEFAULT 4.90,
      reviews_count INT DEFAULT 0,
      sizes_json JSON NULL,
      colors_json JSON NULL,
      features_json JSON NULL,
      fabric VARCHAR(255) NULL DEFAULT '',
      fit VARCHAR(255) NULL DEFAULT '',
      model_stats VARCHAR(255) NULL DEFAULT '',
      description TEXT NULL,
      care_instructions TEXT NULL,
      status ENUM('active', 'draft', 'archived') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  // Create Orders Table
  const createOrdersTable = `
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_number VARCHAR(50) UNIQUE NOT NULL,
      user_id INT NULL,
      customer_id VARCHAR(50) NULL,
      customer_name VARCHAR(150) NOT NULL,
      customer_email VARCHAR(150) NULL,
      customer_phone VARCHAR(20) NOT NULL,
      items_json JSON NOT NULL,
      items_count INT DEFAULT 1,
      subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      coupon_code VARCHAR(50) NULL,
      shipping_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      payment_method VARCHAR(50) DEFAULT 'COD',
      payment_status ENUM('Pending', 'Paid', 'Failed', 'Refunded') DEFAULT 'Pending',
      order_status ENUM('Pending', 'Processing', 'Confirmed', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled') DEFAULT 'Processing',
      shipping_address JSON NULL,
      tracking_number VARCHAR(100) NULL,
      courier_partner VARCHAR(100) DEFAULT 'Bluedart Express',
      delivery_notes TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_order_num (order_number),
      INDEX idx_cust_phone (customer_phone),
      INDEX idx_status (order_status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  // Create Product Reviews & Ratings Table
  const createReviewsTable = `
    CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      product_title VARCHAR(255) DEFAULT '',
      user_id INT NULL,
      customer_id VARCHAR(50) NULL,
      author_name VARCHAR(150) NOT NULL,
      author_email VARCHAR(150) DEFAULT '',
      author_phone VARCHAR(50) NULL,
      rating INT NOT NULL DEFAULT 5,
      title VARCHAR(255) DEFAULT '',
      comment TEXT NOT NULL,
      size_purchased VARCHAR(50) DEFAULT 'M',
      fit_feedback VARCHAR(50) DEFAULT 'True to Size',
      images_json JSON NULL,
      is_verified_buyer TINYINT(1) DEFAULT 1,
      order_number VARCHAR(50) NULL,
      order_date VARCHAR(50) NULL,
      order_amount DECIMAL(10,2) NULL,
      status ENUM('approved', 'pending', 'rejected') DEFAULT 'approved',
      helpful_votes INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_prod (product_id),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  Promise.all([
    promisePool.query(createAdminsTable),
    promisePool.query(createUsersTable),
    promisePool.query(createOtpTable),
    promisePool.query(createSettingsTable),
    promisePool.query(createCategoriesTable),
    promisePool.query(createProductsTable),
    promisePool.query(createOrdersTable),
    promisePool.query(createReviewsTable),
  ])
    .then(async () => {
      console.log('✅ MySQL Tables verified in phpMyAdmin (admins, users, otp_verifications, store_settings, categories, products, orders, reviews)');
      
      // Auto-migrate users table columns if missing
      try {
        await promisePool.query('ALTER TABLE users ADD COLUMN customer_id VARCHAR(50) UNIQUE NULL AFTER id');
      } catch (_) {}

      try {
        await promisePool.query('ALTER TABLE users ADD COLUMN phone_verified TINYINT(1) DEFAULT 0 AFTER phone');
      } catch (_) {}

      try {
        await promisePool.query('ALTER TABLE users ADD COLUMN email_verified TINYINT(1) DEFAULT 0 AFTER email');
      } catch (_) {}

      try {
        await promisePool.query('ALTER TABLE users ADD COLUMN password VARCHAR(255) NULL AFTER email_verified');
      } catch (_) {}

      try {
        await promisePool.query('ALTER TABLE users ADD COLUMN addresses_json JSON NULL AFTER lower_size');
      } catch (_) {}

      // Auto-migrate orders table columns for rich tracking and items
      try {
        await promisePool.query('ALTER TABLE orders ADD COLUMN user_id INT NULL AFTER order_number');
      } catch (_) {}

      try {
        await promisePool.query('ALTER TABLE orders ADD COLUMN customer_id VARCHAR(50) NULL AFTER user_id');
      } catch (_) {}

      try {
        await promisePool.query('ALTER TABLE orders ADD COLUMN items_json JSON NULL AFTER customer_phone');
      } catch (_) {}

      try {
        await promisePool.query('ALTER TABLE orders ADD COLUMN items_count INT DEFAULT 1 AFTER items_json');
      } catch (_) {}

      try {
        await promisePool.query('ALTER TABLE orders ADD COLUMN subtotal DECIMAL(10, 2) DEFAULT 0.00 AFTER items_count');
      } catch (_) {}

      try {
        await promisePool.query('ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10, 2) DEFAULT 0.00 AFTER subtotal');
      } catch (_) {}

      try {
        await promisePool.query('ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(50) NULL AFTER discount_amount');
      } catch (_) {}

      try {
        await promisePool.query('ALTER TABLE orders ADD COLUMN shipping_fee DECIMAL(10, 2) DEFAULT 0.00 AFTER coupon_code');
      } catch (_) {}

      try {
        await promisePool.query('ALTER TABLE orders ADD COLUMN tracking_number VARCHAR(100) NULL AFTER shipping_address');
      } catch (_) {}

      try {
        await promisePool.query('ALTER TABLE orders ADD COLUMN courier_partner VARCHAR(100) DEFAULT "Bluedart Express" AFTER tracking_number');
      } catch (_) {}

      try {
        await promisePool.query('ALTER TABLE orders ADD COLUMN delivery_notes TEXT NULL AFTER courier_partner');
      } catch (_) {}

      // Auto-migrate orders table for Cancel, Return & Refund workflow
      try {
        await promisePool.query('ALTER TABLE orders ADD COLUMN cancellation_reason VARCHAR(255) NULL AFTER delivery_notes');
      } catch (_) {}

      try {
        await promisePool.query('ALTER TABLE orders ADD COLUMN cancelled_at TIMESTAMP NULL AFTER cancellation_reason');
      } catch (_) {}

      try {
        await promisePool.query("ALTER TABLE orders ADD COLUMN return_status ENUM('None', 'Requested', 'Approved', 'Rejected', 'Item Picked Up', 'Item Received', 'Completed') DEFAULT 'None' AFTER cancelled_at");
      } catch (_) {}

      try {
        await promisePool.query('ALTER TABLE orders ADD COLUMN return_reason VARCHAR(255) NULL AFTER return_status');
      } catch (_) {}

      try {
        await promisePool.query('ALTER TABLE orders ADD COLUMN return_comment TEXT NULL AFTER return_reason');
      } catch (_) {}

      try {
        await promisePool.query('ALTER TABLE orders ADD COLUMN return_requested_at TIMESTAMP NULL AFTER return_comment');
      } catch (_) {}

      try {
        await promisePool.query("ALTER TABLE orders ADD COLUMN refund_status ENUM('None', 'Initiated', 'Processing', 'Refunded', 'Failed') DEFAULT 'None' AFTER return_requested_at");
      } catch (_) {}

      try {
        await promisePool.query('ALTER TABLE orders ADD COLUMN refund_amount DECIMAL(10, 2) DEFAULT 0.00 AFTER refund_status');
      } catch (_) {}

      try {
        await promisePool.query('ALTER TABLE orders ADD COLUMN refund_method VARCHAR(50) NULL AFTER refund_amount');
      } catch (_) {}

      try {
        await promisePool.query('ALTER TABLE orders ADD COLUMN refund_transaction_id VARCHAR(100) NULL AFTER refund_method');
      } catch (_) {}

      try {
        await promisePool.query('ALTER TABLE orders ADD COLUMN refund_notes TEXT NULL AFTER refund_transaction_id');
      } catch (_) {}

      try {
        await promisePool.query('ALTER TABLE orders ADD COLUMN refunded_at TIMESTAMP NULL AFTER refund_notes');
      } catch (_) {}

      // Auto-migrate reviews table columns for customer & order linkage
      try {
        await promisePool.query('ALTER TABLE reviews ADD COLUMN customer_id VARCHAR(50) NULL AFTER user_id');
      } catch (_) {}

      try {
        await promisePool.query('ALTER TABLE reviews ADD COLUMN author_phone VARCHAR(50) NULL AFTER author_name');
      } catch (_) {}

      try {
        await promisePool.query('ALTER TABLE reviews ADD COLUMN order_number VARCHAR(50) NULL AFTER is_verified_buyer');
      } catch (_) {}

      try {
        await promisePool.query('ALTER TABLE reviews ADD COLUMN order_date VARCHAR(50) NULL AFTER order_number');
      } catch (_) {}

      try {
        await promisePool.query('ALTER TABLE reviews ADD COLUMN order_amount DECIMAL(10,2) NULL AFTER order_date');
      } catch (_) {}

      // Auto-migrate products table for size-wise and color-wise variant inventory
      try {
        await promisePool.query('ALTER TABLE products ADD COLUMN size_stock_json JSON NULL AFTER stock');
      } catch (_) {}

      seedDefaultAdmin(promisePool);
      seedDefaultSettings(promisePool);
      seedDefaultCategories(promisePool);
    })
    .catch((tableErr) => {
      console.error('❌ Error initializing tables:', tableErr.message);
    });
}

// Seed default master admin in phpMyAdmin DB
async function seedDefaultAdmin(promisePool) {
  try {
    const defaultEmail = 'admin@xavonic.com';
    const defaultPass = 'admin123';

    const [rows] = await promisePool.query('SELECT * FROM admins WHERE email = ?', [defaultEmail]);

    if (rows.length === 0) {
      const hashedPassword = bcrypt.hashSync(defaultPass, 10);
      await promisePool.query(
        'INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Master Admin', defaultEmail, hashedPassword, 'Super Admin']
      );
      console.log(`🔑 Default Admin seeded in phpMyAdmin: ${defaultEmail} (Password: ${defaultPass})`);
    }
  } catch (err) {
    console.error('❌ Error seeding admin user:', err.message);
  }
}

// Seed default settings for Cloudinary, WhatsApp & Nodemailer
async function seedDefaultSettings(promisePool) {
  try {
    const defaultSettings = [
      // Cloudinary Image Storage Settings (Pre-configured with your keys)
      { key: 'cloudinary_cloud_name', value: 'fwlidd7t' },
      { key: 'cloudinary_api_key', value: '887531852538712' },
      { key: 'cloudinary_api_secret', value: 'lkB-KXtVa7j9Zi8pzhTn1VhT5xU' },

      // WhatsApp Settings
      { key: 'whatsapp_mode', value: 'test' }, // 'test' | 'live'
      { key: 'whatsapp_meta_token', value: '' },
      { key: 'whatsapp_phone_number_id', value: '' },
      { key: 'whatsapp_waba_id', value: '' },
      { key: 'whatsapp_template_name', value: 'guidelya_otp_auth' },

      // Nodemailer SMTP Email Settings
      { key: 'smtp_mode', value: 'test' }, // 'test' | 'live'
      { key: 'smtp_host', value: 'smtp.gmail.com' },
      { key: 'smtp_port', value: '465' },
      { key: 'smtp_secure', value: 'true' },
      { key: 'smtp_user', value: '' },
      { key: 'smtp_pass', value: '' },
      { key: 'smtp_sender_name', value: 'Guidelya Athletics' },
    ];

    for (const item of defaultSettings) {
      await promisePool.query(
        'INSERT INTO store_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)',
        [item.key, item.value]
      );
    }
  } catch (err) {
    console.error('❌ Error seeding store settings:', err.message);
  }
}

// Seed Initial Categories Tree (Main Category -> Sub Category -> Sub-sub Categories)
async function seedDefaultCategories(promisePool) {
  try {
    const [count] = await promisePool.query('SELECT COUNT(*) as total FROM categories');
    if (count[0].total > 0) return;

    // 1. Main Root Categories
    const [menResult] = await promisePool.query(
      'INSERT INTO categories (name, slug, level, gender_target, sort_order) VALUES (?, ?, ?, ?, ?)',
      ['Men', 'men', 'main', 'Men', 1]
    );
    const menId = menResult.insertId;

    const [womenResult] = await promisePool.query(
      'INSERT INTO categories (name, slug, level, gender_target, sort_order) VALUES (?, ?, ?, ?, ?)',
      ['Women', 'women', 'main', 'Women', 2]
    );
    const womenId = womenResult.insertId;

    // 2. Sub-categories under Men
    // 2A. T-Shirts
    const [tshirtResult] = await promisePool.query(
      'INSERT INTO categories (name, slug, parent_id, level, gender_target, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      ['T-Shirts & Tops', 'men-t-shirts', menId, 'sub', 'Men', 1]
    );
    const tshirtId = tshirtResult.insertId;

    // 2B. Bottoms / Shorts
    const [bottomsResult] = await promisePool.query(
      'INSERT INTO categories (name, slug, parent_id, level, gender_target, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      ['Shorts & Lowers', 'men-bottoms', menId, 'sub', 'Men', 2]
    );
    const bottomsId = bottomsResult.insertId;

    // 2C. Outerwear / Hoodies
    const [outerwearResult] = await promisePool.query(
      'INSERT INTO categories (name, slug, parent_id, level, gender_target, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      ['Hoodies & Jackets', 'men-hoodies-jackets', menId, 'sub', 'Men', 3]
    );
    const outerwearId = outerwearResult.insertId;

    // 3. Sub-Sub Categories (T-Shirt Types) under T-Shirts
    const subTypes = [
      { name: 'Muscle Fit Compression T-Shirt', slug: 'men-compression-tees', parent_id: tshirtId, gender: 'Men', image_url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80', show_title: 1, sort: 1 },
      { name: 'Heavyweight Oversized Dropcut Tee', slug: 'men-dropcut-tees', parent_id: tshirtId, gender: 'Men', image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80', show_title: 1, sort: 2 },
      { name: 'Stringers & Gym Tank Tops', slug: 'men-stringers-tanks', parent_id: tshirtId, gender: 'Men', image_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80', show_title: 1, sort: 3 },
      { name: '5" Tactical Inseam Gym Shorts', slug: 'men-gym-shorts', parent_id: bottomsId, gender: 'Men', image_url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80', show_title: 1, sort: 4 },
      { name: 'Performance Tapered Joggers', slug: 'men-compression-lowers', parent_id: bottomsId, gender: 'Men', image_url: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&q=80', show_title: 1, sort: 5 },
      { name: 'Therma-Tech Zip Hoodie', slug: 'men-zip-hoodie', parent_id: outerwearId, gender: 'Men', image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80', show_title: 1, sort: 6 },
    ];

    for (const sub of subTypes) {
      await promisePool.query(
        'INSERT INTO categories (name, slug, parent_id, level, gender_target, image_url, show_title_overlay, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [sub.name, sub.slug, sub.parent_id, 'item_type', sub.gender, sub.image_url, sub.show_title, sub.sort]
      );
    }

    console.log('✅ Initial Hierarchical Categories Tree seeded (Men/Women -> Sub -> Item Types)');
  } catch (err) {
    console.error('❌ Error seeding categories:', err.message);
  }
}

module.exports = pool.promise();


