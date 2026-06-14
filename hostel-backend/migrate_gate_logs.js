const pool = require('./config/db');

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Adding column student_gate_pass_id to gate_logs...');
    await client.query(`
      ALTER TABLE gate_logs 
      ADD COLUMN student_gate_pass_id INT REFERENCES student_gate_passes(id) ON DELETE CASCADE;
    `);
    console.log('Column added successfully.');
  } catch (err) {
    if (err.code === '42701') {
      console.log('Column already exists.');
    } else {
      console.error('Migration failed:', err);
    }
  } finally {
    client.release();
    process.exit(0);
  }
}

migrate();
