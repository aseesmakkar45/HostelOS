const pool = require('./config/db');
const bcrypt = require('bcrypt');

const seedDatabase = async () => {
  const client = await pool.connect();
  try {
    console.log('🔄 Drop existing tables if they exist...');
    await client.query('DROP TABLE IF EXISTS gate_logs CASCADE');
    await client.query('DROP TABLE IF EXISTS gate_passes CASCADE');
    await client.query('DROP TABLE IF EXISTS leave_requests CASCADE');
    await client.query('DROP TABLE IF EXISTS complaints CASCADE');
    await client.query('DROP TABLE IF EXISTS fees CASCADE');
    await client.query('DROP TABLE IF EXISTS allocations CASCADE');
    await client.query('DROP TABLE IF EXISTS rooms CASCADE');
    await client.query('DROP TABLE IF EXISTS users CASCADE');
    await client.query('DROP TABLE IF EXISTS mess_menu CASCADE');
    await client.query('DROP TABLE IF EXISTS warden_staff CASCADE');
    console.log('✅ Tables dropped.');

    console.log('🔄 Creating database tables...');
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) CHECK (role IN ('student', 'warden', 'admin')) NOT NULL,
        phone VARCHAR(15),
        face_data TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE rooms (
        id SERIAL PRIMARY KEY,
        room_number VARCHAR(10) UNIQUE NOT NULL,
        floor INT,
        capacity INT DEFAULT 2,
        occupied INT DEFAULT 0,
        room_type VARCHAR(20) DEFAULT 'double',
        status VARCHAR(20) DEFAULT 'available'
      )
    `);
    await client.query(`
      CREATE TABLE allocations (
        id SERIAL PRIMARY KEY,
        student_id INT REFERENCES users(id) ON DELETE CASCADE,
        room_id INT REFERENCES rooms(id) ON DELETE CASCADE,
        allocated_at TIMESTAMP DEFAULT NOW(),
        vacated_at TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE
      )
    `);
    await client.query(`
      CREATE TABLE fees (
        id SERIAL PRIMARY KEY,
        student_id INT REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10,2),
        fee_type VARCHAR(30) CHECK (fee_type IN ('hostel', 'electricity', 'mess')),
        due_date DATE,
        paid_at TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pending'
      )
    `);
    await client.query(`
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
      )
    `);
    await client.query(`
      CREATE TABLE leave_requests (
        id SERIAL PRIMARY KEY,
        student_id INT REFERENCES users(id) ON DELETE CASCADE,
        from_date DATE,
        to_date DATE,
        reason TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        approved_by INT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await client.query(`
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
        status VARCHAR(20) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE gate_logs (
        id SERIAL PRIMARY KEY,
        gate_pass_id INT REFERENCES gate_passes(id) ON DELETE CASCADE,
        entry_time TIMESTAMP DEFAULT NOW(),
        verified_by VARCHAR(50) DEFAULT 'AI'
      )
    `);
    await client.query(`
      CREATE TABLE mess_menu (
        id SERIAL PRIMARY KEY,
        day VARCHAR(15),
        meal_type VARCHAR(20) CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
        items TEXT,
        UNIQUE (day, meal_type)
      )
    `);
    await client.query(`
      CREATE TABLE warden_staff (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(100) NOT NULL,
        shift VARCHAR(50) NOT NULL,
        contact VARCHAR(20) NOT NULL,
        performance VARCHAR(50) DEFAULT 'Good',
        status VARCHAR(20) DEFAULT 'Active'
      )
    `);
    console.log('✅ Tables created.');

    console.log('🔄 Seeding users with Indian names...');
    const adminHash = await bcrypt.hash('admin123', 10);
    const wardenHash = await bcrypt.hash('warden123', 10);
    const studentHash = await bcrypt.hash('student123', 10);

    const usersResult = await client.query(`
      INSERT INTO users (name, email, password, role, phone) VALUES
      ('Rajesh Kumar (Admin)', 'admin@hostel.com', '${adminHash}', 'admin', '9876543210'),
      ('Priya Sharma (Warden)', 'warden@hostel.com', '${wardenHash}', 'warden', '9876543211'),
      ('Aarav Sharma', 'student1@hostel.com', '${studentHash}', 'student', '9876543212'),
      ('Ananya Patel', 'student2@hostel.com', '${studentHash}', 'student', '9876543213'),
      ('Rohan Gupta', 'student3@hostel.com', '${studentHash}', 'student', '9876543214'),
      ('Karan Johar (Campus Admin)', 'admin@campusstay.com', '${adminHash}', 'admin', '9876543215'),
      ('Sunita Devi (Warden)', 'warden@campusstay.com', '${wardenHash}', 'warden', '9876543216'),
      ('Rahul Verma', 'student@campusstay.com', '${studentHash}', 'student', '9876543217'),
      ('Aditi Rao', 'student4@hostel.com', '${studentHash}', 'student', '9876543218'),
      ('Vikram Malhotra', 'student5@hostel.com', '${studentHash}', 'student', '9876543219'),
      ('Deepak Reddy', 'student6@hostel.com', '${studentHash}', 'student', '9876543220'),
      ('Neha Joshi', 'student7@hostel.com', '${studentHash}', 'student', '9876543221'),
      ('Amit Mishra', 'student8@hostel.com', '${studentHash}', 'student', '9876543222'),
      ('Pooja Choudhury', 'student9@hostel.com', '${studentHash}', 'student', '9876543223')
      RETURNING id, name, email, role
    `);

    const students = usersResult.rows.filter(u => u.role === 'student');
    const wardenUser = usersResult.rows.find(u => u.email === 'warden@hostel.com');
    console.log(`✅ Seeded ${usersResult.rows.length} users.`);

    console.log('🔄 Seeding rooms...');
    const roomsResult = await client.query(`
      INSERT INTO rooms (room_number, floor, capacity, occupied, room_type, status) VALUES
      ('101', 1, 2, 0, 'double', 'available'),
      ('102', 1, 2, 0, 'double', 'available'),
      ('103', 1, 2, 0, 'double', 'available'),
      ('104', 1, 2, 0, 'double', 'available'),
      ('105', 1, 2, 0, 'double', 'available'),
      ('201', 2, 2, 0, 'double', 'available'),
      ('202', 2, 2, 0, 'double', 'available'),
      ('203', 2, 2, 0, 'double', 'available'),
      ('204', 2, 2, 0, 'double', 'available'),
      ('205', 2, 2, 0, 'double', 'available')
      RETURNING id, room_number
    `);
    console.log(`✅ Seeded ${roomsResult.rows.length} rooms.`);

    console.log('🔄 Seeding allocations...');
    const aarav = students.find(s => s.email === 'student1@hostel.com');
    const rahul = students.find(s => s.email === 'student@campusstay.com');
    const ananya = students.find(s => s.email === 'student2@hostel.com');
    const rohan = students.find(s => s.email === 'student3@hostel.com');
    const aditi = students.find(s => s.email === 'student4@hostel.com');
    const vikram = students.find(s => s.email === 'student5@hostel.com');
    const deepak = students.find(s => s.email === 'student6@hostel.com');
    const neha = students.find(s => s.email === 'student7@hostel.com');

    const r101 = roomsResult.rows.find(r => r.room_number === '101');
    const r102 = roomsResult.rows.find(r => r.room_number === '102');
    const r103 = roomsResult.rows.find(r => r.room_number === '103');
    const r104 = roomsResult.rows.find(r => r.room_number === '104');
    const r201 = roomsResult.rows.find(r => r.room_number === '201');

    await client.query(`
      INSERT INTO allocations (student_id, room_id) VALUES
      (${aarav.id}, ${r101.id}),
      (${rahul.id}, ${r101.id}),
      (${ananya.id}, ${r102.id}),
      (${rohan.id}, ${r102.id}),
      (${aditi.id}, ${r103.id}),
      (${vikram.id}, ${r103.id}),
      (${deepak.id}, ${r104.id}),
      (${neha.id}, ${r201.id})
    `);

    await client.query(`UPDATE rooms SET occupied = 2, status = 'occupied' WHERE id = ${r101.id}`);
    await client.query(`UPDATE rooms SET occupied = 2, status = 'occupied' WHERE id = ${r102.id}`);
    await client.query(`UPDATE rooms SET occupied = 2, status = 'occupied' WHERE id = ${r103.id}`);
    await client.query(`UPDATE rooms SET occupied = 1, status = 'available' WHERE id = ${r104.id}`);
    await client.query(`UPDATE rooms SET occupied = 1, status = 'available' WHERE id = ${r201.id}`);
    console.log('✅ Allocated students and updated room occupant counts.');

    console.log('🔄 Seeding mess menu...');
    const menuData = {
      Monday:    { breakfast: 'Poha, Jalebi, Chai', lunch: 'Rajma Chawal, Raita, Roti, Salad', dinner: 'Paneer Butter Masala, Jeera Rice, Roti, Gulab Jamun' },
      Tuesday:   { breakfast: 'Idli, Sambar, Coconut Chutney, Filter Coffee', lunch: 'Chole Bhature, Pickle, Onion Salad', dinner: 'Dal Tadka, Aloo Gobi, Rice, Roti, Kheer' },
      Wednesday: { breakfast: 'Aloo Paratha, Dahi, Pickle, Chai', lunch: 'Kadhi Pakora, Rice, Mixed Veg, Roti', dinner: 'Egg Curry / Paneer Korma, Rice, Roti, Fruit Custard' },
      Thursday:  { breakfast: 'Upma, Vada, Chutney, Coffee', lunch: 'Dal Makhani, Bhindi Fry, Rice, Roti, Papad', dinner: 'Chicken Biryani / Veg Biryani, Raita, Salad' },
      Friday:    { breakfast: 'Chole Bhature, Lassi', lunch: 'Sambar Rice, Poriyal, Appalam, Curd', dinner: 'Malai Kofta, Naan, Rice, Ice Cream' },
      Saturday:  { breakfast: 'Dosa, Sambar, Chutney, Coffee', lunch: 'Veg Pulao, Dal Fry, Boondi Raita, Roti', dinner: 'Shahi Paneer, Butter Naan, Rice, Rasmalai' },
      Sunday:    { breakfast: 'Puri Bhaji, Halwa, Chai', lunch: 'Mutton Rogan Josh / Soya Chaap, Rice, Roti, Sweet', dinner: 'Pav Bhaji, Masala Papad, Falooda' },
    };

    for (const [day, meals] of Object.entries(menuData)) {
      for (const [mealType, items] of Object.entries(meals)) {
        await client.query(
          `INSERT INTO mess_menu (day, meal_type, items) VALUES ($1, $2, $3)`,
          [day, mealType, items]
        );
      }
    }
    console.log('✅ Seeded mess menu.');

    console.log('🔄 Seeding complaints...');
    await client.query(`
      INSERT INTO complaints (student_id, title, description, category, ai_tag, status) VALUES
      (${aarav.id}, 'Ceiling Fan Not Working', 'The ceiling fan in my room makes too much noise and spins very slowly.', 'Electrical', 'Electrical > Fan Issue', 'pending'),
      (${aarav.id}, 'Water Leak in Bathroom', 'There is a minor leak in the faucet of the shared bathroom on the 1st floor.', 'Plumbing', 'Plumbing > Water/Leak Issue', 'resolved'),
      (${rahul.id}, 'AC Filter Clogged', 'AC unit is not cooling efficiently in the afternoon. Filter seems clogged.', 'Electrical', 'Electrical > AC Issue', 'pending'),
      (${ananya.id}, 'Slow Wi-Fi Connection', 'Internet speed is less than 2 Mbps. Hard to attend online lectures.', 'Internet / Wi-Fi', 'Internet > Speed Issue', 'pending'),
      (${rohan.id}, 'Room Lock Jammed', 'The key is getting stuck in the door lock of room 102 regularly.', 'Housekeeping', 'Lock > Jammed', 'resolved'),
      (${aditi.id}, 'Broken Window Glass', 'The left side window pane in Room 103 is cracked and needs replacement.', 'Housekeeping', 'Window > Cracked Pane', 'in-progress'),
      (${vikram.id}, 'Mosquito Problem', 'Too many mosquitoes in the corridor area on the 2nd floor.', 'Health / Hygiene', 'Hygiene > Pest Issue', 'pending'),
      (${deepak.id}, 'Hot Water Not Available', 'Geyser in Block B bathroom is not working for the past 3 days.', 'Plumbing', 'Plumbing > Geyser Issue', 'in-progress')
    `);
    console.log('✅ Seeded complaints.');

    console.log('🔄 Seeding leave requests...');
    await client.query(`
      INSERT INTO leave_requests (student_id, from_date, to_date, reason, status, approved_by) VALUES
      (${aarav.id}, '2026-06-20', '2026-06-25', 'Going home for sister''s wedding in Jaipur.', 'approved', ${wardenUser.id}),
      (${rahul.id}, '2026-07-02', '2026-07-05', 'Routine medical checkup at AIIMS Delhi.', 'pending', null),
      (${ananya.id}, '2026-06-18', '2026-06-22', 'Attending cousin''s engagement ceremony in Ahmedabad.', 'pending', null),
      (${rohan.id}, '2026-05-10', '2026-05-15', 'Summer vacation with family in Shimla.', 'rejected', ${wardenUser.id}),
      (${aditi.id}, '2026-06-25', '2026-06-28', 'Going home for Ganesh Chaturthi festival in Pune.', 'approved', ${wardenUser.id}),
      (${vikram.id}, '2026-07-10', '2026-07-12', 'Family function in Chandigarh.', 'pending', null),
      (${deepak.id}, '2026-06-15', '2026-06-17', 'Attending tech conference at IIT Hyderabad.', 'approved', ${wardenUser.id})
    `);
    console.log('✅ Seeded leave requests.');

    console.log('🔄 Seeding gate passes with Indian visitors...');
    const passesRes = await client.query(`
      INSERT INTO gate_passes (student_id, visitor_name, visitor_phone, purpose, qr_code, valid_from, valid_until, used, status) VALUES
      (${aarav.id}, 'Suresh Sharma', '9999988888', 'Visit by Father', 'GP-AARAV-001', NOW(), NOW() + INTERVAL '1 day', false, 'Approved'),
      (${rahul.id}, 'Sneha Verma', '9999977777', 'Visit by Sister', 'GP-RAHUL-001', NOW() - INTERVAL '1 hour', NOW() + INTERVAL '2 hours', true, 'Approved'),
      (${ananya.id}, 'Piyush Patel', '9999966666', 'Visit by Friend from College', 'GP-ANANYA-001', NOW() + INTERVAL '2 days', NOW() + INTERVAL '3 days', false, 'Pending'),
      (${rohan.id}, 'Rakesh Gupta', '9999955555', 'Visit by Uncle from Lucknow', 'GP-ROHAN-001', NOW(), NOW() + INTERVAL '1 day', false, 'Rejected'),
      (${aditi.id}, 'Karan Rao', '9999944444', 'Visit by Brother', 'GP-ADITI-001', NOW() - INTERVAL '2 hours', NOW() + INTERVAL '4 hours', true, 'Approved'),
      (${vikram.id}, 'Harpreet Singh', '9999933333', 'Parent Visit from Amritsar', 'GP-VIKRAM-001', NOW() + INTERVAL '1 day', NOW() + INTERVAL '2 days', false, 'Pending'),
      (${deepak.id}, 'Lakshmi Reddy', '9999922222', 'Visit by Mother', 'GP-DEEPAK-001', NOW() - INTERVAL '3 hours', NOW() + INTERVAL '5 hours', true, 'Approved')
      RETURNING id, qr_code
    `);
    console.log('✅ Seeded gate passes.');

    console.log('🔄 Seeding gate logs...');
    const passRahul = passesRes.rows.find(p => p.qr_code === 'GP-RAHUL-001');
    const passAditi = passesRes.rows.find(p => p.qr_code === 'GP-ADITI-001');
    const passDeepak = passesRes.rows.find(p => p.qr_code === 'GP-DEEPAK-001');

    await client.query(`
      INSERT INTO gate_logs (gate_pass_id, entry_time, verified_by) VALUES
      (${passRahul.id}, NOW() - INTERVAL '30 minutes', 'AI Kiosk'),
      (${passAditi.id}, NOW() - INTERVAL '1 hour', 'AI Kiosk'),
      (${passDeepak.id}, NOW() - INTERVAL '2 hours', 'Security Guard')
    `);
    console.log('✅ Seeded gate logs.');

    console.log('🔄 Seeding fees in INR...');
    await client.query(`
      INSERT INTO fees (student_id, amount, fee_type, due_date, status, paid_at) VALUES
      (${aarav.id}, 12000.00, 'hostel', '2026-07-01', 'pending', null),
      (${aarav.id}, 1500.00, 'electricity', '2026-06-30', 'pending', null),
      (${aarav.id}, 3500.00, 'mess', '2026-05-25', 'paid', NOW() - INTERVAL '15 days'),
      (${rahul.id}, 12000.00, 'hostel', '2026-07-01', 'pending', null),
      (${rahul.id}, 1800.00, 'electricity', '2026-06-30', 'pending', null),
      (${rahul.id}, 3500.00, 'mess', '2026-05-25', 'paid', NOW() - INTERVAL '12 days'),
      (${ananya.id}, 12000.00, 'hostel', '2026-05-01', 'pending', null),
      (${ananya.id}, 2000.00, 'electricity', '2026-05-15', 'pending', null),
      (${rohan.id}, 12000.00, 'hostel', '2026-07-01', 'pending', null),
      (${rohan.id}, 3500.00, 'mess', '2026-06-25', 'paid', NOW() - INTERVAL '1 day'),
      (${aditi.id}, 12000.00, 'hostel', '2026-05-01', 'pending', null),
      (${aditi.id}, 1500.00, 'electricity', '2026-06-30', 'paid', NOW() - INTERVAL '5 days'),
      (${vikram.id}, 3500.00, 'mess', '2026-07-01', 'pending', null),
      (${vikram.id}, 12000.00, 'hostel', '2026-07-01', 'pending', null),
      (${deepak.id}, 12000.00, 'hostel', '2026-06-01', 'pending', null),
      (${deepak.id}, 3500.00, 'mess', '2026-06-25', 'paid', NOW() - INTERVAL '3 days'),
      (${neha.id}, 12000.00, 'hostel', '2026-07-01', 'pending', null),
      (${neha.id}, 1500.00, 'electricity', '2026-06-30', 'pending', null)
    `);
    console.log('✅ Seeded fees.');

    console.log('🔄 Seeding staff with Indian names...');
    await client.query(`
      INSERT INTO warden_staff (name, role, shift, contact, performance, status) VALUES
      ('Ramesh Kumar', 'Maintenance Staff', 'Morning Shift', '+91 90000 11111', 'Excellent', 'Active'),
      ('Sunita Sharma', 'Mess Supervisor', 'Evening Shift', '+91 90000 22222', 'Good', 'Active'),
      ('Rajesh Singh', 'Security Supervisor', 'Night Shift', '+91 90000 33333', 'Outstanding', 'Active'),
      ('Sanjay Dutt', 'Warden Assistant', 'Flexible Shift', '+91 90000 44444', 'Good', 'On Leave'),
      ('Vijay Kumar', 'Gate Security Guard', 'Night Shift', '+91 90000 55555', 'Excellent', 'Active'),
      ('Meena Devi', 'Housekeeping Lead', 'Morning Shift', '+91 90000 66666', 'Outstanding', 'Active'),
      ('Harish Prasad', 'Plumber', 'Flexible Shift', '+91 90000 77777', 'Good', 'Active'),
      ('Kriti Sen', 'Wi-Fi Desk Technician', 'Evening Shift', '+91 90000 88888', 'Outstanding', 'Active')
    `);
    console.log('✅ Seeded staff.');

    console.log('🎉 Database seeding complete!');
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding database:', err.message);
    console.error(err.stack);
    client.release();
    process.exit(1);
  }
};

seedDatabase();
