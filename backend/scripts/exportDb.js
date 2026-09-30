const db = require('../config/db');
const fs = require('fs');
const path = require('path');

async function exportDatabase() {
  try {
    const tables = ['admins', 'users', 'otp_verifications', 'store_settings', 'categories', 'products', 'orders'];
    let sql = `-- ================================================\n-- GUIDELYA / XAVONIC FULL DATABASE BACKUP\n-- Generated: ${new Date().toISOString()}\n-- ================================================\n\nCREATE DATABASE IF NOT EXISTS \`guidelya_db\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\nUSE \`guidelya_db\`;\n\nSET FOREIGN_KEY_CHECKS = 0;\n\n`;

    for (const table of tables) {
      try {
        const [createRes] = await db.query(`SHOW CREATE TABLE \`${table}\``);
        sql += `-- ------------------------------------------------\n-- Structure for table \`${table}\`\n-- ------------------------------------------------\n`;
        sql += `DROP TABLE IF EXISTS \`${table}\`;\n`;
        sql += `${createRes[0]['Create Table']};\n\n`;

        const [rows] = await db.query(`SELECT * FROM \`${table}\``);
        if (rows.length > 0) {
          sql += `-- Dumping data for table \`${table}\` (${rows.length} rows)\n`;
          for (const row of rows) {
            const keys = Object.keys(row).map(k => `\`${k}\``);
            const values = Object.values(row).map(v => {
              if (v === null) return 'NULL';
              if (typeof v === 'number') return v;
              if (typeof v === 'boolean') return v ? 1 : 0;
              if (v instanceof Date) return `'${v.toISOString().slice(0, 19).replace('T', ' ')}'`;
              const escaped = String(v)
                .replace(/\\/g, '\\\\')
                .replace(/'/g, "\\'")
                .replace(/\n/g, '\\n')
                .replace(/\r/g, '\\r');
              return `'${escaped}'`;
            });
            sql += `INSERT INTO \`${table}\` (${keys.join(', ')}) VALUES (${values.join(', ')});\n`;
          }
          sql += '\n';
        }
      } catch (err) {
        console.warn(`Skipping table ${table}:`, err.message);
      }
    }

    sql += `SET FOREIGN_KEY_CHECKS = 1;\n`;

    const outDir = path.join(__dirname, '..', 'database');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    const outFile = path.join(outDir, 'guidelya_db.sql');
    fs.writeFileSync(outFile, sql, 'utf8');

    console.log(`✅ Database successfully exported to: ${outFile}`);
  } catch (err) {
    console.error('Error exporting database:', err);
  } finally {
    process.exit(0);
  }
}

exportDatabase();
