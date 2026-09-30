const db = require('../config/db');
const fs = require('fs');
const path = require('path');

async function restoreDatabase() {
  try {
    const sqlPath = path.join(__dirname, '..', 'database', 'guidelya_db.sql');
    if (!fs.existsSync(sqlPath)) {
      console.error(`❌ SQL dump file not found at: ${sqlPath}`);
      process.exit(1);
    }

    const rawSql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split queries by semicolon outside of strings
    const statements = rawSql
      .split(/;\s*[\r\n]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`⏳ Executing ${statements.length} SQL statements to restore database...`);

    for (const statement of statements) {
      if (statement.trim()) {
        await db.query(statement);
      }
    }

    console.log('✅ Full database restored successfully into guidelya_db!');
  } catch (err) {
    console.error('❌ Error restoring database:', err);
  } finally {
    process.exit(0);
  }
}

restoreDatabase();
