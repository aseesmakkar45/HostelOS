const pool = require('./config/db');

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Adding column student_id to gate_logs...');
    await client.query(`
      ALTER TABLE gate_logs 
      ADD COLUMN IF NOT EXISTS student_id INT REFERENCES users(id) ON DELETE CASCADE;
    `);
    console.log('Column student_id added successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

migrate();
