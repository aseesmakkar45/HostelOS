const pool = require('./config/db');

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Adding column action to gate_logs...');
    await client.query(`
      ALTER TABLE gate_logs 
      ADD COLUMN IF NOT EXISTS action VARCHAR(20) DEFAULT 'Entry';
    `);
    console.log('Column action added successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

migrate();
