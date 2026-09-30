const mysql = require('mysql2/promise');
require('dotenv').config();

async function cleanDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'guidelya_db',
    port: process.env.DB_PORT || 3306,
  });

  console.log('Connected to MySQL to clean test data...');

  // Delete all users and reset auto-increment
  await connection.query('TRUNCATE TABLE users;');
  console.log('✅ Cleared table: [ users ] (Fresh IDs will start from 1: GDL-00001)');

  // Clear all OTP records
  await connection.query('TRUNCATE TABLE otp_verifications;');
  console.log('✅ Cleared table: [ otp_verifications ]');

  await connection.end();
  console.log('🚀 Database is now 100% fresh for clean testing!');
}

cleanDatabase().catch(err => {
  console.error('Error cleaning database:', err);
  process.exit(1);
});
