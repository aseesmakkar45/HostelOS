const pool = require('./config/db');

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Adding AI analysis columns to complaints table...');
    await client.query(`
      ALTER TABLE complaints 
      ADD COLUMN IF NOT EXISTS assigned_staff_role VARCHAR(100),
      ADD COLUMN IF NOT EXISTS predicted_resolution_time VARCHAR(50),
      ADD COLUMN IF NOT EXISTS is_duplicate BOOLEAN DEFAULT FALSE;
    `);
    console.log('✅ AI analysis columns added successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

migrate();
