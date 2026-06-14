const pool = require('./config/db');
const bcrypt = require('bcrypt');

async function run() {
  const client = await pool.connect();
  try {
    console.log('Inserting security officer account...');
    const passwordHash = await bcrypt.hash('security123', 10);
    
    // Check if security officer already exists
    const checkRes = await client.query("SELECT id FROM users WHERE email = 'security@hostel.com'");
    if (checkRes.rows.length === 0) {
      await client.query(`
        INSERT INTO users (name, email, password, role, phone)
        VALUES ('Rajesh Singh (Security Officer)', 'security@hostel.com', $1, 'warden', '+91 90000 33333');
      `, [passwordHash]);
      console.log('✅ Security officer account created successfully!');
    } else {
      console.log('Security officer account already exists.');
    }
  } catch (err) {
    console.error('Failed to insert security officer:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

run();
