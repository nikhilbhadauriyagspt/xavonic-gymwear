const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runImport() {
  const sqlFile = path.join(__dirname, '../database/guidelya_db_backup.sql');
  if (!fs.existsSync(sqlFile)) {
    console.error(`❌ Backup file not found at ${sqlFile}`);
    process.exit(1);
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: Number(process.env.DB_PORT) || 3306,
    multipleStatements: true,
  });

  console.log('🔄 Importing SQL database dump...');
  const sql = fs.readFileSync(sqlFile, 'utf8');

  await connection.query(sql);

  console.log('✅ Database successfully imported with all tables, products, categories, settings & admin account!');
  await connection.end();
}

runImport().catch((err) => {
  console.error('Import error:', err);
  process.exit(1);
});
