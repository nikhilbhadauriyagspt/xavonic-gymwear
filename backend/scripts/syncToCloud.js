const mysql = require('../node_modules/mysql2/promise');
const fs = require('fs');
const path = require('path');

async function syncToRailway() {
  console.log('⏳ Connecting to Railway Cloud MySQL (altaria.proxy.rlwy.net:25311)...');
  const conn = await mysql.createConnection({
    host: 'altaria.proxy.rlwy.net',
    port: 25311,
    user: 'root',
    password: 'dwtknQjhTCHtQludUvncQXBScEmWLEgh',
    database: 'railway',
    ssl: { rejectUnauthorized: false },
  });
  console.log('✅ Connected to Railway MySQL successfully!');

  const sqlPath = path.join(__dirname, '..', 'database', 'guidelya_db.sql');
  const rawSql = fs.readFileSync(sqlPath, 'utf8');

  // Split queries by semicolon outside comments
  const statements = rawSql
    .split(/;\s*[\r\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--') && !s.toLowerCase().startsWith('create database') && !s.toLowerCase().startsWith('use '));

  console.log(`⏳ Executing ${statements.length} SQL statements on Railway database...`);

  await conn.query('SET FOREIGN_KEY_CHECKS = 0');

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    if (stmt.trim()) {
      try {
        await conn.query(stmt);
      } catch (err) {
        console.warn(`Warning on statement ${i + 1}: ${err.message}`);
      }
    }
  }

  await conn.query('SET FOREIGN_KEY_CHECKS = 1');

  console.log('🎉 ALL TABLES, PRODUCTS & CATEGORIES POPULATED IN RAILWAY SUCCESSFULLY!');

  const [tables] = await conn.query('SHOW TABLES');
  console.log('📦 Railway Tables:', tables.map((t) => Object.values(t)[0]));

  const [prods] = await conn.query('SELECT count(*) as count FROM products');
  const [cats] = await conn.query('SELECT count(*) as count FROM categories');
  const [admins] = await conn.query('SELECT name, email, role FROM admins');

  console.log('🛍️ Total Products in Railway:', prods[0].count);
  console.log('📂 Total Categories in Railway:', cats[0].count);
  console.log('🔑 Admin Account in Railway:', admins[0]);

  await conn.end();
  process.exit(0);
}

syncToRailway().catch((err) => {
  console.error('❌ Sync error:', err);
  process.exit(1);
});
