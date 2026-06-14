const pool = require('./config/db');

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Adding column aadhaar_number to users...');
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS aadhaar_number VARCHAR(20);
    `);
    console.log('Column added successfully or already existed.');

    console.log('Migrating existing Aadhaar data...');
    // Copy identity_proof_number to aadhaar_number for users whose identity_proof_type is 'Aadhaar'
    await client.query(`
      UPDATE users 
      SET aadhaar_number = identity_proof_number
      WHERE identity_proof_type = 'Aadhaar' AND (aadhaar_number IS NULL OR aadhaar_number = '');
    `);

    // For those migrated, set secondary proof to College ID with a placeholder/roll_number
    await client.query(`
      UPDATE users 
      SET identity_proof_type = 'College ID',
          identity_proof_number = COALESCE('COLL-' || roll_number, 'COLL-TEMP')
      WHERE identity_proof_type = 'Aadhaar';
    `);

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

migrate();
