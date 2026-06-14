const pool = require('./config/db');
const bcrypt = require('bcrypt');

const seedDatabase = async () => {
  const client = await pool.connect();
  try {
    console.log('🔄 Drop existing tables if they exist...');
    await client.query('DROP TABLE IF EXISTS gate_logs CASCADE');
    await client.query('DROP TABLE IF EXISTS gate_passes CASCADE');
    await client.query('DROP TABLE IF EXISTS student_gate_passes CASCADE');
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
        program VARCHAR(100),
        graduation_year INT,
        branch VARCHAR(100),
        address TEXT,
        guardian_name VARCHAR(100),
        guardian_phone VARCHAR(15),
        gender VARCHAR(20),
        roll_number VARCHAR(50) UNIQUE,
        identity_proof_type VARCHAR(50),
        identity_proof_number VARCHAR(100),
        aadhaar_number VARCHAR(20),
        aadhaar_file TEXT,
        secondary_id_file TEXT,
        mess_coupons INT DEFAULT 45,
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
        status VARCHAR(20) DEFAULT 'available',
        block VARCHAR(20) NOT NULL DEFAULT 'Block A'
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
        resolved_at TIMESTAMP,
        assigned_staff_role VARCHAR(100),
        predicted_resolution_time VARCHAR(50)
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
      CREATE TABLE student_gate_passes (
        id SERIAL PRIMARY KEY,
        student_id INT REFERENCES users(id) ON DELETE CASCADE,
        departure_time TIMESTAMP,
        expected_return TIMESTAMP,
        reason TEXT,
        permission_status VARCHAR(20) DEFAULT 'Pending',
        is_night_stay BOOLEAN DEFAULT FALSE,
        qr_code TEXT UNIQUE,
        used_for_exit BOOLEAN DEFAULT FALSE,
        used_for_return BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE gate_logs (
        id SERIAL PRIMARY KEY,
        gate_pass_id INT REFERENCES gate_passes(id) ON DELETE CASCADE,
        student_gate_pass_id INT REFERENCES student_gate_passes(id) ON DELETE CASCADE,
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

    const admins = [
      { name: 'Rajesh Kumar (Admin)', email: 'admin@hostel.com', phone: '9876543210' },
      { name: 'Karan Johar (Campus Admin)', email: 'admin@campusstay.com', phone: '9876543215' }
    ];

    const wardens = [
      { name: 'Priya Sharma (Warden)', email: 'warden@hostel.com', phone: '9876543211' },
      { name: 'Sunita Devi (Warden)', email: 'warden@campusstay.com', phone: '9876543216' },
      { name: 'Amit Singhal (Warden)', email: 'warden3@hostel.com', phone: '9876543231' },
      { name: 'Rekha Verma (Warden)', email: 'warden4@hostel.com', phone: '9876543232' },
      { name: 'Rajesh Singh (Security Officer)', email: 'security@hostel.com', phone: '+91 90000 33333' }
    ];

    const initialStudents = [
      { name: 'Aarav Sharma', email: 'student1@hostel.com', phone: '9876543212', gender: 'Male' },
      { name: 'Ananya Patel', email: 'student2@hostel.com', phone: '9876543213', gender: 'Female' },
      { name: 'Rohan Gupta', email: 'student3@hostel.com', phone: '9876543214', gender: 'Male' },
      { name: 'Rahul Verma', email: 'student@campusstay.com', phone: '9876543217', gender: 'Male' },
      { name: 'Aditi Rao', email: 'student4@hostel.com', phone: '9876543218', gender: 'Female' },
      { name: 'Vikram Malhotra', email: 'student5@hostel.com', phone: '9876543219', gender: 'Male' },
      { name: 'Deepak Reddy', email: 'student6@hostel.com', phone: '9876543220', gender: 'Male' },
      { name: 'Neha Joshi', email: 'student7@hostel.com', phone: '9876543221', gender: 'Female' },
      { name: 'Amit Mishra', email: 'student8@hostel.com', phone: '9876543222', gender: 'Male' },
      { name: 'Pooja Choudhury', email: 'student9@hostel.com', phone: '9876543223', gender: 'Female' }
    ];

    const indianFirstNamesMale = ['Siddharth', 'Varun', 'Yash', 'Ishaan', 'Kabir', 'Arjun', 'Dev', 'Gaurav', 'Pranav', 'Aryan', 'Ritvik', 'Abhinav', 'Mayank', 'Shreyas', 'Kunal', 'Harish', 'Nikhil', 'Vivek', 'Akash', 'Manish', 'Sanjay'];
    const indianFirstNamesFemale = ['Riya', 'Sneha', 'Kiara', 'Meera', 'Diya', 'Tanvi', 'Sakshi', 'Shruti', 'Anjali', 'Kavya', 'Preeti', 'Divya', 'Ekta', 'Shalini', 'Rashmi', 'Swati', 'Jyoti', 'Ritu', 'Poonam'];
    const indianLastNames = [
      'Sharma', 'Patel', 'Gupta', 'Verma', 'Rao', 'Malhotra', 'Reddy', 'Joshi', 'Mishra', 'Choudhury',
      'Mehta', 'Singh', 'Kapoor', 'Deshmukh', 'Chawla', 'Nair', 'Pillai', 'Bose', 'Chatterjee', 'Dubey'
    ];

    const studentUsers = [...initialStudents];
    for (let i = 10; i <= 50; i++) {
      const isFemale = i % 2 === 0;
      const fnList = isFemale ? indianFirstNamesFemale : indianFirstNamesMale;
      const fn = fnList[i % fnList.length];
      const ln = indianLastNames[i % indianLastNames.length];
      const name = `${fn} ${ln}`;
      const email = `student${i}@hostel.com`;
      const phone = `98765432${30 + i}`;
      const gender = isFemale ? 'Female' : 'Male';
      studentUsers.push({ name, email, phone, gender });
    }

    // Insert Admins
    for (const a of admins) {
      await client.query(
        `INSERT INTO users (name, email, password, role, phone) VALUES ($1, $2, $3, $4, $5)`,
        [a.name, a.email, adminHash, 'admin', a.phone]
      );
    }
    // Insert Wardens
    for (const w of wardens) {
      await client.query(
        `INSERT INTO users (name, email, password, role, phone) VALUES ($1, $2, $3, $4, $5)`,
        [w.name, w.email, wardenHash, 'warden', w.phone]
      );
    }
    // Insert Students
    const studentDbRows = [];
    for (let i = 0; i < studentUsers.length; i++) {
      const s = studentUsers[i];
      const program = 'B.Tech';
      const branch = ['Computer Science', 'Electronics', 'Mechanical', 'Civil'][i % 4];
      const graduation_year = 2024 + (i % 4);
      const roll_number = `ROLL${2000 + i}`;
      const address = '123 Fake Street, City, India';
      const guardian_name = `${s.name.split(' ')[1]} Senior`;
      const guardian_phone = `98765432${50 + i}`;
      const identity_proof_type = 'College ID';
      const identity_proof_number = `COLL-${2000 + i}`;
      const aadhaar_number = `1234 5678 ${1000 + i}`;

      const mess_coupons = 30 + (i % 20);
      const res = await client.query(
        `INSERT INTO users (name, email, password, role, phone, gender, program, branch, graduation_year, roll_number, address, guardian_name, guardian_phone, identity_proof_type, identity_proof_number, aadhaar_number, mess_coupons) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING id, name, email, role`,
        [s.name, s.email, studentHash, 'student', s.phone, s.gender, program, branch, graduation_year, roll_number, address, guardian_name, guardian_phone, identity_proof_type, identity_proof_number, aadhaar_number, mess_coupons]
      );
      studentDbRows.push(res.rows[0]);
    }

    console.log(`✅ Seeded ${admins.length} admins, ${wardens.length} wardens, and ${studentDbRows.length} students.`);

    console.log('🔄 Seeding rooms...');
    const roomValues = [];
    const blocksList = ['A', 'B', 'C'];
    for (const block of blocksList) {
      for (let f = 1; f <= 3; f++) {
        for (let r = 1; r <= 10; r++) {
          const roomNum = `${block}${f}${String(r).padStart(2, '0')}`;
          const capacity = r % 2 === 0 ? 2 : 1;
          const roomType = r % 2 === 0 ? 'double' : 'single';
          roomValues.push(`('${roomNum}', ${f}, ${capacity}, 0, '${roomType}', 'available', 'Block ${block}')`);
        }
      }
    }
    const roomsResult = await client.query(`
      INSERT INTO rooms (room_number, floor, capacity, occupied, room_type, status, block) VALUES
      ${roomValues.join(',\n')}
      RETURNING id, room_number, capacity, block
    `);
    console.log(`✅ Seeded ${roomsResult.rows.length} rooms.`);

    console.log('🔄 Seeding allocations...');
    const roomsSorted = roomsResult.rows.sort((a, b) => a.room_number.localeCompare(b.room_number));
    
    // Group rooms by block
    const blockRooms = {
      'A': roomsSorted.filter(r => r.room_number.startsWith('A')),
      'B': roomsSorted.filter(r => r.room_number.startsWith('B')),
      'C': roomsSorted.filter(r => r.room_number.startsWith('C'))
    };

    // Assign students: first 26 to Block A, next 16 to Block B, remaining 8 to Block C
    for (let i = 0; i < studentDbRows.length; i++) {
      const student = studentDbRows[i];
      let block = 'A';
      let localIndex = i;
      
      if (i >= 26 && i < 42) {
        block = 'B';
        localIndex = i - 26;
      } else if (i >= 42) {
        block = 'C';
        localIndex = i - 42;
      }

      const roomsList = blockRooms[block];
      const doubleRooms = roomsList.filter(r => r.capacity === 2);
      const roomIndex = Math.floor(localIndex / 2);
      const room = doubleRooms[roomIndex % doubleRooms.length];

      await client.query(
        `INSERT INTO allocations (student_id, room_id) VALUES ($1, $2)`,
        [student.id, room.id]
      );
      
      await client.query(
        `UPDATE rooms SET occupied = occupied + 1 WHERE id = $1`,
        [room.id]
      );
    }

    // Update room status based on occupancy and capacity
    await client.query(`
      UPDATE rooms 
      SET status = CASE 
        WHEN occupied >= capacity THEN 'occupied'
        ELSE 'available'
      END
    `);

    // Mark specific rooms as maintenance
    const maintenanceRooms = ['A109', 'B108', 'B302', 'C110', 'C205'];
    await client.query(
      `UPDATE rooms SET status = 'maintenance' WHERE room_number = ANY($1)`,
      [maintenanceRooms]
    );

    console.log('✅ Allocated students to rooms.');

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

    const wardenUserResult = await client.query("SELECT id FROM users WHERE email = 'warden@hostel.com'");
    const wardenId = wardenUserResult.rows[0].id;

    console.log('🔄 Seeding complaints...');
    const complaintsToSeed = [
      { studentIndex: 0, title: 'Ceiling Fan Not Working', desc: 'The ceiling fan in my room makes too much noise and spins very slowly.', cat: 'Electrical', tag: 'Electrical > Fan Issue', status: 'pending' },
      { studentIndex: 0, title: 'Water Leak in Bathroom', desc: 'There is a minor leak in the faucet of the shared bathroom on the 1st floor.', cat: 'Plumbing', tag: 'Plumbing > Water/Leak Issue', status: 'resolved' },
      { studentIndex: 3, title: 'AC Filter Clogged', desc: 'AC unit is not cooling efficiently in the afternoon. Filter seems clogged.', cat: 'Electrical', tag: 'Electrical > AC Issue', status: 'pending' },
      { studentIndex: 1, title: 'Slow Wi-Fi Connection', desc: 'Internet speed is less than 2 Mbps. Hard to attend online lectures.', cat: 'Internet / Wi-Fi', tag: 'Internet > Speed Issue', status: 'pending' },
      { studentIndex: 2, title: 'Room Lock Jammed', desc: 'The key is getting stuck in the door lock of room 102 regularly.', cat: 'Housekeeping', tag: 'Lock > Jammed', status: 'resolved' },
      { studentIndex: 4, title: 'Broken Window Glass', desc: 'The left side window pane in Room 103 is cracked and needs replacement.', cat: 'Housekeeping', tag: 'Window > Cracked Pane', status: 'in-progress' },
      { studentIndex: 5, title: 'Mosquito Problem', desc: 'Too many mosquitoes in the corridor area on the 2nd floor.', cat: 'Health / Hygiene', tag: 'Hygiene > Pest Issue', status: 'pending' },
      { studentIndex: 6, title: 'Hot Water Not Available', desc: 'Geyser in Block B bathroom is not working for the past 3 days.', cat: 'Plumbing', tag: 'Plumbing > Geyser Issue', status: 'in-progress' },
      { studentIndex: 12, title: 'Bulb Fused', desc: 'The main tube light fused in the room.', cat: 'Electrical', tag: 'Electrical > Lighting Issue', status: 'pending' },
      { studentIndex: 15, title: 'Bed Frame Loose', desc: 'The bed frame screeches when moving, screws might be loose.', cat: 'Housekeeping', tag: 'Furniture > Bed Issue', status: 'pending' },
      { studentIndex: 20, title: 'Clogged Drainage', desc: 'Water is not draining from the washbasin.', cat: 'Plumbing', tag: 'Plumbing > Drainage Issue', status: 'resolved' },
      { studentIndex: 25, title: 'Door Hinges Creaking', desc: 'Main room door is creaking loudly.', cat: 'Housekeeping', tag: 'Lock > Door Issue', status: 'pending' },
      { studentIndex: 30, title: 'Extension Board Faulty', desc: 'Power socket is sparking when plug is inserted.', cat: 'Electrical', tag: 'Electrical > Socket Issue', status: 'pending' }
    ];

    const SEED_STAFF_MAPPING = {
      'electrical': 'Maintenance Staff',
      'plumbing': 'Plumber',
      'internet / wi-fi': 'Wi-Fi Desk Technician',
      'housekeeping': 'Housekeeping Lead',
      'health / hygiene': 'Warden Assistant'
    };

    const SEED_RESOLUTION_MAPPING = {
      'electrical': '4 Hours',
      'plumbing': '8 Hours',
      'internet / wi-fi': '2 Hours',
      'housekeeping': '12 Hours',
      'health / hygiene': '24 Hours'
    };

    for (const c of complaintsToSeed) {
      const studentId = studentDbRows[c.studentIndex].id;
      const resolvedAt = c.status === 'resolved' ? 'NOW()' : 'NULL';
      const catLower = c.cat.toLowerCase();
      const staffRole = SEED_STAFF_MAPPING[catLower] || 'Warden Assistant';
      const mttr = SEED_RESOLUTION_MAPPING[catLower] || '24 Hours';

      await client.query(`
        INSERT INTO complaints (student_id, title, description, category, ai_tag, status, resolved_at, assigned_staff_role, predicted_resolution_time)
        VALUES (${studentId}, $1, $2, $3, $4, $5, ${resolvedAt}, $6, $7)
      `, [c.title, c.desc, c.cat, c.tag, c.status, staffRole, mttr]);
    }
    console.log('✅ Seeded complaints.');

    console.log('🔄 Seeding leave requests...');
    const leavesToSeed = [
      { studentIndex: 0, from: '2026-06-20', to: '2026-06-25', reason: 'Going home for sister\'s wedding in Jaipur.', status: 'approved', approvedBy: wardenId },
      { studentIndex: 3, from: '2026-07-02', to: '2026-07-05', reason: 'Routine medical checkup at AIIMS Delhi.', status: 'pending', approvedBy: null },
      { studentIndex: 1, from: '2026-06-18', to: '2026-06-22', reason: 'Attending cousin\'s engagement ceremony in Ahmedabad.', status: 'pending', approvedBy: null },
      { studentIndex: 2, from: '2026-05-10', to: '2026-05-15', reason: 'Summer vacation with family in Shimla.', status: 'rejected', approvedBy: wardenId },
      { studentIndex: 4, from: '2026-06-25', to: '2026-06-28', reason: 'Going home for Ganesh Chaturthi festival in Pune.', status: 'approved', approvedBy: wardenId },
      { studentIndex: 5, from: '2026-07-10', to: '2026-07-12', reason: 'Family function in Chandigarh.', status: 'pending', approvedBy: null },
      { studentIndex: 6, from: '2026-06-15', to: '2026-06-17', reason: 'Attending tech conference at IIT Hyderabad.', status: 'approved', approvedBy: wardenId },
      { studentIndex: 11, from: '2026-06-22', to: '2026-06-26', reason: 'Emergency visit to home town.', status: 'pending', approvedBy: null },
      { studentIndex: 18, from: '2026-06-29', to: '2026-07-02', reason: 'Attending hackathon at IIT Bombay.', status: 'approved', approvedBy: wardenId }
    ];

    for (const l of leavesToSeed) {
      const studentId = studentDbRows[l.studentIndex].id;
      const appBy = l.approvedBy ? l.approvedBy : 'NULL';
      await client.query(`
        INSERT INTO leave_requests (student_id, from_date, to_date, reason, status, approved_by)
        VALUES (${studentId}, $1, $2, $3, $4, ${appBy})
      `, [l.from, l.to, l.reason, l.status]);
    }
    console.log('✅ Seeded leave requests.');

    console.log('🔄 Seeding gate passes...');
    const passesToSeed = [
      { studentIndex: 0, visitor: 'Suresh Sharma', phone: '9999988888', purpose: 'Visit by Father', code: 'GP-AARAV-001', used: false, status: 'Approved' },
      { studentIndex: 3, visitor: 'Sneha Verma', phone: '9999977777', purpose: 'Visit by Sister', code: 'GP-RAHUL-001', used: true, status: 'Approved' },
      { studentIndex: 1, visitor: 'Piyush Patel', phone: '9999966666', purpose: 'Visit by Friend from College', code: 'GP-ANANYA-001', used: false, status: 'Pending' },
      { studentIndex: 2, visitor: 'Rakesh Gupta', phone: '9999955555', purpose: 'Visit by Uncle from Lucknow', code: 'GP-ROHAN-001', used: false, status: 'Rejected' },
      { studentIndex: 4, visitor: 'Karan Rao', phone: '9999944444', purpose: 'Visit by Brother', code: 'GP-ADITI-001', used: true, status: 'Approved' },
      { studentIndex: 5, visitor: 'Harpreet Singh', phone: '9999933333', purpose: 'Parent Visit from Amritsar', code: 'GP-VIKRAM-001', used: false, status: 'Pending' },
      { studentIndex: 6, visitor: 'Lakshmi Reddy', phone: '9999922222', purpose: 'Visit by Mother', code: 'GP-DEEPAK-001', used: true, status: 'Approved' }
    ];

    const seededPasses = [];
    for (const p of passesToSeed) {
      const studentId = studentDbRows[p.studentIndex].id;
      const res = await client.query(`
        INSERT INTO gate_passes (student_id, visitor_name, visitor_phone, purpose, qr_code, valid_from, valid_until, used, status)
        VALUES (${studentId}, $1, $2, $3, $4, NOW() - INTERVAL '3 hours', NOW() + INTERVAL '1 day', $5, $6)
        RETURNING id, qr_code
      `, [p.visitor, p.phone, p.purpose, p.code, p.used, p.status]);
      seededPasses.push(res.rows[0]);
    }
    console.log('✅ Seeded gate passes.');

    console.log('🔄 Seeding gate logs...');
    const passRahul = seededPasses.find(p => p.qr_code === 'GP-RAHUL-001');
    const passAditi = seededPasses.find(p => p.qr_code === 'GP-ADITI-001');
    const passDeepak = seededPasses.find(p => p.qr_code === 'GP-DEEPAK-001');

    await client.query(`
      INSERT INTO gate_logs (gate_pass_id, entry_time, verified_by) VALUES
      (${passRahul.id}, NOW() - INTERVAL '30 minutes', 'AI Kiosk'),
      (${passAditi.id}, NOW() - INTERVAL '1 hour', 'AI Kiosk'),
      (${passDeepak.id}, NOW() - INTERVAL '2 hours', 'Security Guard')
    `);
    console.log('✅ Seeded gate logs.');

    console.log('🔄 Seeding fees in INR...');
    for (let i = 0; i < studentDbRows.length; i++) {
      const student = studentDbRows[i];
      const hostelStatus = (i % 3 === 0) ? 'paid' : 'pending';
      const electricityStatus = (i % 2 === 0) ? 'paid' : 'pending';
      const hostelPaidAt = hostelStatus === 'paid' ? "NOW() - INTERVAL '10 days'" : 'NULL';
      const electricityPaidAt = electricityStatus === 'paid' ? "NOW() - INTERVAL '5 days'" : 'NULL';

      // Hostel fee
      await client.query(`
        INSERT INTO fees (student_id, amount, fee_type, due_date, status, paid_at)
        VALUES (${student.id}, 12000.00, 'hostel', '2026-07-01', '${hostelStatus}', ${hostelPaidAt})
      `);

      // Electricity fee
      await client.query(`
        INSERT INTO fees (student_id, amount, fee_type, due_date, status, paid_at)
        VALUES (${student.id}, 1500.00, 'electricity', '2026-06-30', '${electricityStatus}', ${electricityPaidAt})
      `);

      // Mess fee
      await client.query(`
        INSERT INTO fees (student_id, amount, fee_type, due_date, status, paid_at)
        VALUES (${student.id}, 3500.00, 'mess', '2026-05-25', 'paid', NOW() - INTERVAL '15 days')
      `);
    }
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
