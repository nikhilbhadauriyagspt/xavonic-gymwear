const db = require('../config/db');

async function migrateProductsTable() {
  console.log('🔄 Checking & Altering MySQL products table columns...');
  try {
    const columns = [
      { name: 'sku', type: 'VARCHAR(100) UNIQUE NULL' },
      { name: 'category_slug', type: "VARCHAR(150) NOT NULL DEFAULT ''" },
      { name: 'category_name', type: "VARCHAR(150) NOT NULL DEFAULT ''" },
      { name: 'gender_target', type: "ENUM('Men', 'Women', 'Unisex') DEFAULT 'Men'" },
      { name: 'discount_label', type: "VARCHAR(50) NULL DEFAULT ''" },
      { name: 'in_stock', type: 'TINYINT(1) DEFAULT 1' },
      { name: 'rating', type: 'DECIMAL(3, 2) DEFAULT 4.90' },
      { name: 'reviews_count', type: 'INT DEFAULT 0' },
      { name: 'sizes_json', type: 'JSON NULL' },
      { name: 'colors_json', type: 'JSON NULL' },
      { name: 'features_json', type: 'JSON NULL' },
      { name: 'fabric', type: "VARCHAR(255) NULL DEFAULT ''" },
      { name: 'fit', type: "VARCHAR(255) NULL DEFAULT ''" },
      { name: 'model_stats', type: "VARCHAR(255) NULL DEFAULT ''" },
      { name: 'description', type: 'TEXT NULL' },
      { name: 'care_instructions', type: 'TEXT NULL' },
    ];

    for (const col of columns) {
      try {
        await db.query(`ALTER TABLE products ADD COLUMN ${col.name} ${col.type}`);
        console.log(`✅ Added column: ${col.name}`);
      } catch (e) {
        // Column likely already exists
      }
    }

    console.log('🎉 Products table migration completed successfully!');
  } catch (err) {
    console.error('Migration error:', err);
  }
}

migrateProductsTable().then(() => process.exit(0));
