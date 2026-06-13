const pool = require('./config/db');
const bcrypt = require('bcrypt');

const seedDatabase = async () => {
  try {
    console.log('🔄 Drop existing tables if they exist...');
    await pool.query(`
      DROP TABLE IF EXISTS gate_logs CASCADE;
      DROP TABLE IF EXISTS gate_passes CASCADE;
      DROP TABLE IF EXISTS leave_requests CASCADE;
      DROP TABLE IF EXISTS complaints CASCADE;
      DROP TABLE IF EXISTS fees CASCADE;
      DROP TABLE IF EXISTS allocations CASCADE;
      DROP TABLE IF EXISTS rooms CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS mess_menu CASCADE;
    `);

    console.log('✅ Tables dropped.');

    console.log('🔄 Creating database tables...');
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) CHECK (role IN ('student', 'warden', 'admin')) NOT NULL,
        phone VARCHAR(15),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE rooms (
        id SERIAL PRIMARY KEY,
        room_number VARCHAR(10) UNIQUE NOT NULL,
        floor INT,
        capacity INT DEFAULT 2,
        occupied INT DEFAULT 0,
        room_type VARCHAR(20) DEFAULT 'double',
        status VARCHAR(20) DEFAULT 'available'
      );

      CREATE TABLE allocations (
        id SERIAL PRIMARY KEY,
        student_id INT REFERENCES users(id) ON DELETE CASCADE,
        room_id INT REFERENCES rooms(id) ON DELETE CASCADE,
        allocated_at TIMESTAMP DEFAULT NOW(),
        vacated_at TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE
      );

      CREATE TABLE fees (
        id SERIAL PRIMARY KEY,
        student_id INT REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10,2),
        fee_type VARCHAR(30) CHECK (fee_type IN ('hostel', 'electricity', 'mess')),
        due_date DATE,
        paid_at TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pending'
      );

      CREATE TABLE complaints (
        id SERIAL PRIMARY KEY,
        student_id INT REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200),
        description TEXT,
        category VARCHAR(50),
        ai_tag VARCHAR(100),
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        resolved_at TIMESTAMP
      );

      CREATE TABLE leave_requests (
        id SERIAL PRIMARY KEY,
        student_id INT REFERENCES users(id) ON DELETE CASCADE,
        from_date DATE,
        to_date DATE,
        reason TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        approved_by INT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE gate_passes (
        id SERIAL PRIMARY KEY,
        student_id INT REFERENCES users(id) ON DELETE CASCADE,
        visitor_name VARCHAR(100),
        visitor_phone VARCHAR(15),
        purpose TEXT,
        qr_code TEXT UNIQUE,
        valid_from TIMESTAMP,
        valid_until TIMESTAMP,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE gate_logs (
        id SERIAL PRIMARY KEY,
        gate_pass_id INT REFERENCES gate_passes(id) ON DELETE CASCADE,
        entry_time TIMESTAMP DEFAULT NOW(),
        verified_by VARCHAR(50) DEFAULT 'AI'
      );

      CREATE TABLE mess_menu (
        id SERIAL PRIMARY KEY,
        day VARCHAR(15),
        meal_type VARCHAR(20) CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
        items TEXT,
        UNIQUE (day, meal_type)
      );
    `);

    console.log('✅ Tables created.');

    console.log('🔄 Seeding users...');
    const adminHash = await bcrypt.hash('admin123', 10);
    const wardenHash = await bcrypt.hash('warden123', 10);
    const studentHash = await bcrypt.hash('student123', 10);

    const usersResult = await pool.query(`
      INSERT INTO users (name, email, password, role, phone) VALUES
      ('System Admin', 'admin@hostel.com', '${adminHash}', 'admin', '9876543210'),
      ('Warden Alice', 'warden@hostel.com', '${wardenHash}', 'warden', '9876543211'),
      ('John Doe', 'student1@hostel.com', '${studentHash}', 'student', '9876543212'),
      ('Jane Smith', 'student2@hostel.com', '${studentHash}', 'student', '9876543213'),
      ('Bob Johnson', 'student3@hostel.com', '${studentHash}', 'student', '9876543214')
      RETURNING id, name, email, role;
    `);

    const students = usersResult.rows.filter(u => u.role === 'student');
    console.log(`✅ Seeded ${usersResult.rows.length} users.`);

    console.log('🔄 Seeding rooms...');
    const roomsResult = await pool.query(`
      INSERT INTO rooms (room_number, floor, capacity, occupied, room_type, status) VALUES
      ('101', 1, 2, 0, 'double', 'available'),
      ('102', 1, 2, 0, 'double', 'available'),
      ('103', 1, 2, 0, 'double', 'available'),
      ('104', 1, 2, 0, 'double', 'available'),
      ('105', 1, 2, 0, 'double', 'available'),
      ('106', 2, 2, 0, 'double', 'available'),
      ('107', 2, 2, 0, 'double', 'available'),
      ('108', 2, 2, 0, 'double', 'available'),
      ('109', 2, 2, 0, 'double', 'available'),
      ('110', 2, 2, 0, 'double', 'available')
      RETURNING id, room_number;
    `);
    console.log(`✅ Seeded ${roomsResult.rows.length} rooms.`);

    console.log('🔄 Seeding allocations...');
    // Allocate Student 1 (John Doe) to Room 101
    const student1 = students[0];
    const room101 = roomsResult.rows.find(r => r.room_number === '101');

    await pool.query(`
      INSERT INTO allocations (student_id, room_id) VALUES
      (${student1.id}, ${room101.id});
    `);

    await pool.query(`
      UPDATE rooms SET occupied = 1, status = 'available' WHERE id = ${room101.id};
    `);
    console.log('✅ Allocated student1 to Room 101.');

    console.log('🔄 Seeding mess menu...');
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const meals = [
      { type: 'breakfast', items: 'Idli, Sambar, Coconut Chutney, Tea' },
      { type: 'lunch', items: 'Rice, Dal, Mixed Vegetable Sabzi, Roti, Curd' },
      { type: 'dinner', items: 'Paneer Butter Masala, Roti, Rice, Kheer' }
    ];

    for (const day of days) {
      for (const meal of meals) {
        await pool.query(`
          INSERT INTO mess_menu (day, meal_type, items) VALUES
          ('${day}', '${meal.type}', '${meal.items}');
        `);
      }
    }
    console.log('✅ Seeded mess menu.');

    console.log('🔄 Seeding complaints...');
    await pool.query(`
      INSERT INTO complaints (student_id, title, description, category, ai_tag, status) VALUES
      (${student1.id}, 'Ceiling Fan Not Working', 'The ceiling fan in my room makes too much noise and spins slowly.', 'Electrical', 'Electrical > Fan Issue', 'pending'),
      (${student1.id}, 'Water Leak in Bathroom', 'There is a minor leak in the faucet of the shared bathroom.', 'Plumbing', 'Plumbing > Water/Leak Issue', 'resolved')
    `);
    console.log('✅ Seeded complaints.');

    console.log('🔄 Seeding fees...');
    await pool.query(`
      INSERT INTO fees (student_id, amount, fee_type, due_date, status) VALUES
      (${student1.id}, 12000.00, 'hostel', '2026-07-01', 'pending'),
      (${student1.id}, 1500.00, 'electricity', '2026-06-30', 'pending'),
      (${student1.id}, 3000.00, 'mess', '2026-06-25', 'paid')
    `);
    console.log('✅ Seeded fees.');

    console.log('🎉 Database seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding database:', err.message);
    process.exit(1);
  }
};

seedDatabase();
