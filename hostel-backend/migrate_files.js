const pool = require('./config/db');

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Adding columns aadhaar_file and secondary_id_file to users table...');
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS aadhaar_file TEXT,
      ADD COLUMN IF NOT EXISTS secondary_id_file TEXT;
    `);
    console.log('Columns added successfully or already existed.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

migrate();
