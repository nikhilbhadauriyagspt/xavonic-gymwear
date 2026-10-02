const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runExport() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'guidelya_db',
    port: Number(process.env.DB_PORT) || 3306,
  });

  const tables = [
    'store_settings',
    'admins',
    'users',
    'categories',
    'products',
    'orders',
    'banners',
    'reviews',
    'stock_notifications',
    'admin_notifications',
    'otp_verifications',
  ];

  let dump = `-- GUIDELYA COMPLETE DATABASE BACKUP
-- Created at: ${new Date().toISOString()}

CREATE DATABASE IF NOT EXISTS \`guidelya_db\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`guidelya_db\`;

SET FOREIGN_KEY_CHECKS = 0;

`;

  for (const table of tables) {
    try {
      const [createRows] = await connection.query(`SHOW CREATE TABLE \`${table}\``);
      if (createRows && createRows[0]) {
        dump += `DROP TABLE IF EXISTS \`${table}\`;\n`;
        dump += `${createRows[0]['Create Table']};\n\n`;
      }

      const [rows] = await connection.query(`SELECT * FROM \`${table}\``);
      if (rows && rows.length > 0) {
        for (const row of rows) {
          const cols = Object.keys(row).map((c) => `\`${c}\``).join(', ');
          const vals = Object.values(row)
            .map((val) => {
              if (val === null || val === undefined) return 'NULL';
              if (typeof val === 'object' && !(val instanceof Date)) {
                return connection.escape(JSON.stringify(val));
              }
              return connection.escape(val);
            })
            .join(', ');
          dump += `INSERT INTO \`${table}\` (${cols}) VALUES (${vals});\n`;
        }
        dump += '\n';
      }
    } catch (err) {
      console.warn(`Notice on table ${table}:`, err.message);
    }
  }

  dump += `SET FOREIGN_KEY_CHECKS = 1;\n`;

  const outDir = path.join(__dirname, '../database');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const outFile = path.join(outDir, 'guidelya_db_backup.sql');
  fs.writeFileSync(outFile, dump, 'utf8');

  console.log(`✅ SQL Backup generated at: ${outFile} (${(dump.length / 1024).toFixed(2)} KB)`);
  await connection.end();
}

runExport().catch((err) => {
  console.error('Export error:', err);
  process.exit(1);
});
