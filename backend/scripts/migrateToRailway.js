const mysql = require('../node_modules/mysql2/promise');

async function directMigrate() {
  console.log('⏳ Connecting to Local MySQL (Source)...');
  const localConn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'guidelya_db',
  });

  console.log('⏳ Connecting to Railway Cloud MySQL (Target)...');
  const cloudConn = await mysql.createConnection({
    host: 'altaria.proxy.rlwy.net',
    port: 25311,
    user: 'root',
    password: 'dwtknQjhTCHtQludUvncQXBScEmWLEgh',
    database: 'railway',
    ssl: { rejectUnauthorized: false },
  });

  const tables = ['admins', 'store_settings', 'categories', 'products', 'users', 'orders', 'otp_verifications'];

  await cloudConn.query('SET FOREIGN_KEY_CHECKS = 0');

  for (const table of tables) {
    console.log(`📦 Syncing table: ${table}...`);
    // Get table structure
    const [createRes] = await localConn.query(`SHOW CREATE TABLE \`${table}\``);
    await cloudConn.query(`DROP TABLE IF EXISTS \`${table}\``);
    await cloudConn.query(createRes[0]['Create Table']);

    // Get rows from local
    const [rows] = await localConn.query(`SELECT * FROM \`${table}\``);
    if (rows.length > 0) {
      for (const row of rows) {
        const keys = Object.keys(row);
        const placeholders = keys.map(() => '?').join(', ');
        const values = Object.values(row).map(v => {
          if (v !== null && typeof v === 'object' && !(v instanceof Date)) {
            return JSON.stringify(v);
          }
          return v;
        });

        await cloudConn.query(
          `INSERT INTO \`${table}\` (\`${keys.join('`, `')}\`) VALUES (${placeholders})`,
          values
        );
      }
      console.log(`  ✅ Synced ${rows.length} rows to ${table}`);
    }
  }

  await cloudConn.query('SET FOREIGN_KEY_CHECKS = 1');

  const [prods] = await cloudConn.query('SELECT count(*) as total FROM products');
  const [cats] = await cloudConn.query('SELECT count(*) as total FROM categories');
  console.log(`🎉 SUCCESS! Railway now has ${prods[0].total} Products and ${cats[0].total} Categories.`);

  await localConn.end();
  await cloudConn.end();
  process.exit(0);
}

directMigrate().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
