const bcrypt = require('bcrypt');
const bcryptSync = bcrypt;

function createMockPool() {
  console.log('📦 Mock Pool database instance initialized.');

  // Pre-seeded database state
  const state = {
    users: [
      { id: 1, name: 'System Admin', email: 'admin@hostel.com', password: bcryptSync.hashSync('admin123', 10), role: 'admin', phone: '9876543210', created_at: new Date() },
      { id: 2, name: 'Warden Alice', email: 'warden@hostel.com', password: bcryptSync.hashSync('warden123', 10), role: 'warden', phone: '9876543211', created_at: new Date() },
      { id: 3, name: 'John Doe', email: 'student1@hostel.com', password: bcryptSync.hashSync('student123', 10), role: 'student', phone: '9876543212', created_at: new Date() },
      { id: 4, name: 'Jane Smith', email: 'student2@hostel.com', password: bcryptSync.hashSync('student123', 10), role: 'student', phone: '9876543213', created_at: new Date() },
      { id: 5, name: 'Bob Johnson', email: 'student3@hostel.com', password: bcryptSync.hashSync('student123', 10), role: 'student', phone: '9876543214', created_at: new Date() },
      { id: 6, name: 'Campus Admin', email: 'admin@campusstay.com', password: bcryptSync.hashSync('admin123', 10), role: 'admin', phone: '9876543215', created_at: new Date() },
      { id: 7, name: 'Campus Warden', email: 'warden@campusstay.com', password: bcryptSync.hashSync('warden123', 10), role: 'warden', phone: '9876543216', created_at: new Date() },
      { id: 8, name: 'Campus Student', email: 'student@campusstay.com', password: bcryptSync.hashSync('student123', 10), role: 'student', phone: '9876543217', created_at: new Date() }
    ],
    rooms: [
      { id: 1, room_number: '101', floor: 1, capacity: 2, occupied: 1, room_type: 'double', status: 'available' },
      { id: 2, room_number: '102', floor: 1, capacity: 2, occupied: 0, room_type: 'double', status: 'available' },
      { id: 3, room_number: '103', floor: 1, capacity: 2, occupied: 0, room_type: 'double', status: 'available' },
      { id: 4, room_number: '104', floor: 1, capacity: 2, occupied: 0, room_type: 'double', status: 'available' },
      { id: 5, room_number: '105', floor: 1, capacity: 2, occupied: 0, room_type: 'double', status: 'available' },
      { id: 6, room_number: '106', floor: 2, capacity: 2, occupied: 0, room_type: 'double', status: 'available' },
      { id: 7, room_number: '107', floor: 2, capacity: 2, occupied: 0, room_type: 'double', status: 'available' },
      { id: 8, room_number: '108', floor: 2, capacity: 2, occupied: 0, room_type: 'double', status: 'available' },
      { id: 9, room_number: '109', floor: 2, capacity: 2, occupied: 0, room_type: 'double', status: 'available' },
      { id: 10, room_number: '110', floor: 2, capacity: 2, occupied: 0, room_type: 'double', status: 'available' }
    ],
    allocations: [
      { id: 1, student_id: 3, room_id: 1, allocated_at: new Date(), vacated_at: null, is_active: true },
      { id: 2, student_id: 8, room_id: 1, allocated_at: new Date(), vacated_at: null, is_active: true }
    ],
    mess_menu: [],
    complaints: [
      { id: 1, student_id: 3, title: 'Ceiling Fan Not Working', description: 'The ceiling fan makes noise.', category: 'Electrical', ai_tag: 'Electrical > Fan Issue', status: 'pending', created_at: new Date(), resolved_at: null },
      { id: 2, student_id: 3, title: 'Water Leak in Bathroom', description: 'Bathroom faucet is leaking.', category: 'Plumbing', ai_tag: 'Plumbing > Water/Leak Issue', status: 'resolved', created_at: new Date(), resolved_at: new Date() },
      { id: 3, student_id: 8, title: 'AC Filter Clogged', description: 'AC unit is not cooling efficiently.', category: 'Electrical', ai_tag: 'Electrical > AC Issue', status: 'pending', created_at: new Date(), resolved_at: null }
    ],
    fees: [
      { id: 1, student_id: 3, amount: 12000.00, fee_type: 'hostel', due_date: new Date('2026-07-01'), paid_at: null, status: 'pending' },
      { id: 2, student_id: 3, amount: 1500.00, fee_type: 'electricity', due_date: new Date('2026-06-30'), paid_at: null, status: 'pending' },
      { id: 3, student_id: 3, amount: 3000.00, fee_type: 'mess', due_date: new Date('2026-06-25'), paid_at: new Date(), status: 'paid' },
      { id: 4, student_id: 8, amount: 12000.00, fee_type: 'hostel', due_date: new Date('2026-07-01'), paid_at: null, status: 'pending' },
      { id: 5, student_id: 8, amount: 1500.00, fee_type: 'electricity', due_date: new Date('2026-06-30'), paid_at: null, status: 'pending' },
      { id: 6, student_id: 8, amount: 3000.00, fee_type: 'mess', due_date: new Date('2026-06-25'), paid_at: new Date(), status: 'paid' }
    ],
    leave_requests: [
      { id: 1, student_id: 3, from_date: new Date('2026-06-15'), to_date: new Date('2026-06-18'), reason: 'Family Function', status: 'pending', approved_by: null, created_at: new Date() },
      { id: 2, student_id: 8, from_date: new Date('2026-06-20'), to_date: new Date('2026-06-25'), reason: 'Semester Break', status: 'pending', approved_by: null, created_at: new Date() }
    ],
    gate_passes: [
      { id: 1, student_id: 3, visitor_name: 'David Beckham Sr', visitor_phone: '+91 99999 88888', purpose: 'Weekend Visit', qr_code: 'HOSTEL-GP-MOCK-1', valid_from: new Date(), valid_until: new Date(Date.now() + 86400000), used: false, status: 'Pending', created_at: new Date() },
      { id: 2, student_id: 8, visitor_name: 'Robert Stark', visitor_phone: '+91 99999 77777', purpose: 'Visit by Parent', qr_code: 'HOSTEL-GP-MOCK-2', valid_from: new Date(), valid_until: new Date(Date.now() + 86400000), used: false, status: 'Pending', created_at: new Date() }
    ],
    gate_logs: []
  };

  // Passwords are now hashed synchronously in the user objects above

  // Seed mess menu
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const meals = [
    { type: 'breakfast', items: 'Idli, Sambar, Coconut Chutney, Tea' },
    { type: 'lunch', items: 'Rice, Dal, Mixed Vegetable Sabzi, Roti, Curd' },
    { type: 'dinner', items: 'Paneer Butter Masala, Roti, Rice, Kheer' }
  ];
  let menuId = 1;
  for (const day of days) {
    for (const meal of meals) {
      state.mess_menu.push({
        id: menuId++,
        day,
        meal_type: meal.type,
        items: meal.items
      });
    }
  }

  // Helper to match queries and return mock rows
  const resolveQuery = async (text, params = []) => {
    const sql = text.trim().replace(/\s+/g, ' ').toLowerCase();

    // Transaction control statements (used by gate.controller connect client)
    if (sql === 'begin' || sql === 'commit' || sql === 'rollback') {
      return [];
    }

    // Seeding/initialization statement fallbacks
    if (sql.includes('drop table') || sql.includes('create table')) {
      return [];
    }
    if (sql.includes('insert into users') && sql.includes('values')) {
      return state.users;
    }
    if (sql.includes('insert into rooms') && sql.includes('values')) {
      return state.rooms;
    }
    if (sql.includes('insert into allocations') && sql.includes('values')) {
      return [{ id: 1, student_id: 3, room_id: 1 }];
    }
    if (sql.includes('update rooms') && sql.includes('occupied = 1')) {
      return [];
    }
    if (sql.includes('insert into mess_menu') && sql.includes('values')) {
      return [];
    }
    if (sql.includes('insert into complaints') && sql.includes('values')) {
      return [];
    }
    if (sql.includes('insert into fees') && sql.includes('values')) {
      return [];
    }

    // 1. SELECT id FROM users WHERE email = $1 / SELECT * FROM users WHERE email = $1
    if (sql.includes('select') && sql.includes('users') && sql.includes('email =')) {
      const email = params[0];
      const user = state.users.find(u => u.email === email);
      return user ? [user] : [];
    }

    // 2. INSERT INTO users ... RETURNING *
    if (sql.includes('insert into users')) {
      const [name, email, password, role, phone] = params;
      const newUser = {
        id: state.users.length + 1,
        name,
        email,
        password,
        role,
        phone: phone || null,
        created_at: new Date()
      };
      state.users.push(newUser);
      return [newUser];
    }

    // 3. SELECT id, name, email, role, phone, created_at FROM users WHERE id = $1
    // Must NOT match complex join queries (e.g. warden/residents)
    if (sql.includes('select') && sql.includes('from users') && sql.includes('where id = $1') && !sql.includes('join')) {
      const id = parseInt(params[0]);
      const user = state.users.find(u => u.id === id);
      return user ? [user] : [];
    }

    // 4. Student room query (join allocations + rooms)
    if (sql.includes('from allocations a join rooms r')) {
      const studentId = parseInt(params[0]);
      const alloc = state.allocations.find(a => a.student_id === studentId && a.is_active);
      if (!alloc) return [];
      const room = state.rooms.find(r => r.id === alloc.room_id);
      if (!room) return [];
      return [{
        room_number: room.room_number,
        floor: room.floor,
        capacity: room.capacity,
        occupied: room.occupied,
        room_type: room.room_type,
        status: room.status,
        allocated_at: alloc.allocated_at
      }];
    }

    // 5. Roommates query
    if (sql.includes('from allocations a join users u join rooms r')) {
      const roomNumber = params[0];
      const studentId = parseInt(params[1]);
      const room = state.rooms.find(r => r.room_number === roomNumber);
      if (!room) return [];
      const activeAllocs = state.allocations.filter(a => a.room_id === room.id && a.is_active && a.student_id !== studentId);
      const roommates = activeAllocs.map(a => {
        const u = state.users.find(user => user.id === a.student_id);
        return { name: u?.name || 'Roommate', email: u?.email || '' };
      });
      return roommates;
    }

    // 6. Student fees query
    if (sql.includes('from fees where student_id =')) {
      const studentId = parseInt(params[0]);
      const studentFees = state.fees.filter(f => f.student_id === studentId);
      // Sort desc by due_date
      return studentFees.sort((a, b) => b.due_date - a.due_date);
    }

    // 7. Pay fee
    if (sql.includes("update fees set status = 'paid'")) {
      const id = parseInt(params[0]);
      const studentId = parseInt(params[1]);
      const fee = state.fees.find(f => f.id === id && f.student_id === studentId);
      if (fee) {
        fee.status = 'paid';
        fee.paid_at = new Date();
        return [fee];
      }
      return [];
    }

    // 8. Create complaint
    if (sql.includes('insert into complaints')) {
      const [student_id, title, description, category, ai_tag] = params;
      const newComplaint = {
        id: state.complaints.length + 1,
        student_id: parseInt(student_id),
        title,
        description,
        category,
        ai_tag,
        status: 'pending',
        created_at: new Date(),
        resolved_at: null
      };
      state.complaints.push(newComplaint);
      return [newComplaint];
    }

    // 9. Student complaints query
    if (sql.includes('from complaints where student_id =')) {
      const studentId = parseInt(params[0]);
      const list = state.complaints.filter(c => c.student_id === studentId);
      return list.sort((a, b) => b.created_at - a.created_at);
    }

    // 10. Create leave request
    if (sql.includes('insert into leave_requests')) {
      const [student_id, from_date, to_date, reason] = params;
      const newLeave = {
        id: state.leave_requests.length + 1,
        student_id: parseInt(student_id),
        from_date: new Date(from_date),
        to_date: new Date(to_date),
        reason,
        status: 'pending',
        approved_by: null,
        created_at: new Date()
      };
      state.leave_requests.push(newLeave);
      return [newLeave];
    }

    // 11. Student leaves query
    if (sql.includes('from leave_requests where student_id =')) {
      const studentId = parseInt(params[0]);
      const list = state.leave_requests.filter(l => l.student_id === studentId);
      return list.sort((a, b) => b.created_at - a.created_at);
    }

    // 12. Create gate pass
    if (sql.includes('insert into gate_passes')) {
      const [student_id, visitor_name, visitor_phone, purpose, qr_code, valid_from, valid_until] = params;
      const newPass = {
        id: state.gate_passes.length + 1,
        student_id: parseInt(student_id),
        visitor_name,
        visitor_phone: visitor_phone || null,
        purpose,
        qr_code,
        valid_from: new Date(valid_from),
        valid_until: new Date(valid_until),
        used: false,
        status: 'Pending',
        created_at: new Date()
      };
      state.gate_passes.push(newPass);
      return [newPass];
    }

    // 13. Student gate passes query
    if (sql.includes('from gate_passes where student_id =')) {
      const studentId = parseInt(params[0]);
      const list = state.gate_passes.filter(g => g.student_id === studentId);
      return list.sort((a, b) => b.created_at - a.created_at);
    }

    // 14. Mess menu query
    if (sql.includes('from mess_menu')) {
      return state.mess_menu;
    }

    // 15. Admin get students / Warden get residents
    if (sql.includes('select u.id, u.name, u.email, u.phone') && sql.includes('u.role = \'student\'')) {
      return state.users.filter(u => u.role === 'student').map(u => {
        const alloc = state.allocations.find(a => a.student_id === u.id && a.is_active);
        const room = alloc ? state.rooms.find(r => r.id === alloc.room_id) : null;
        
        // Compute status based on approved leave requests today
        const hasApprovedLeave = state.leave_requests.some(lr => 
          lr.student_id === u.id && 
          lr.status === 'Approved' && 
          new Date() >= lr.from_date && 
          new Date() <= lr.to_date
        );
        const status = hasApprovedLeave ? 'On Leave' : 'In Campus';
        
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          room: room ? room.room_number : 'Unallocated',
          room_number: room ? room.room_number : 'Unallocated',
          floor: room ? room.floor : null,
          block: room ? `Block ${room.room_number.substring(0, 1)}` : 'Block A',
          student_id: String(u.id),
          status,
          allocated_at: alloc ? alloc.allocated_at : null
        };
      });
    }

    // 16. Admin get fees / Warden get fees
    if (sql.includes('from fees f join users u')) {
      return state.fees.map(f => {
        const u = state.users.find(user => user.id === f.student_id);
        const isOverdue = f.status === 'pending' && new Date(f.due_date) < new Date();
        return {
          id: f.id,
          student_id: String(f.student_id),
          student_name: u?.name || 'Unknown Student',
          name: u?.name || 'Unknown Student',
          student_email: u?.email || '',
          amount: f.amount,
          fee_type: f.fee_type,
          due_date: new Date(f.due_date).toISOString().split('T')[0],
          status: isOverdue ? 'Overdue' : f.status.charAt(0).toUpperCase() + f.status.slice(1),
          transaction_id: f.status === 'paid' ? `TXN-${f.id}9023` : '-'
        };
      }).sort((a, b) => new Date(b.due_date) - new Date(a.due_date));
    }

    // 17. Admin add fee
    if (sql.includes('insert into fees')) {
      const [student_id, amount, fee_type, due_date] = params;
      const newFee = {
        id: state.fees.length + 1,
        student_id: parseInt(student_id),
        amount: parseFloat(amount),
        fee_type,
        due_date: new Date(due_date),
        paid_at: null,
        status: 'pending'
      };
      state.fees.push(newFee);
      return [newFee];
    }

    // 18. Admin update fee
    if (sql.includes('update fees set status = $1')) {
      const [status, paid_at, id] = params;
      const fee = state.fees.find(f => f.id === parseInt(id));
      if (fee) {
        fee.status = status;
        fee.paid_at = paid_at ? new Date(paid_at) : null;
        return [fee];
      }
      return [];
    }

    // 19. Admin stats — each query arrives separately
    if (sql.includes("count(*)::int as count from users where role = 'student'")) {
      return [{ count: state.users.filter(u => u.role === 'student').length }];
    }
    if (sql.includes("count(*)::int as count from rooms where occupied > 0")) {
      return [{ count: state.rooms.filter(r => r.occupied > 0).length }];
    }
    if (sql.includes("count(*)::int as count from complaints where status = 'pending'")) {
      return [{ count: state.complaints.filter(c => c.status === 'pending').length }];
    }
    if (sql.includes("coalesce(sum(amount), 0.00)::float as sum from fees where status = 'pending'")) {
      return [{ sum: state.fees.filter(f => f.status === 'pending').reduce((s, f) => s + parseFloat(f.amount), 0) }];
    }
    if (sql.includes('select room_number, occupied from rooms')) {
      return state.rooms.map(r => ({ room_number: r.room_number, occupied: r.occupied }));
    }

    // 19.5 Admin finance sub-queries
    if (sql.includes("coalesce(sum(occupied), 0)::int as occupied, coalesce(sum(capacity), 0)::int as capacity from rooms")) {
      const occupied = state.rooms.reduce((s, r) => s + (r.occupied || 0), 0);
      const capacity = state.rooms.reduce((s, r) => s + (r.capacity || 0), 0);
      return [{ occupied, capacity }];
    }
    if (sql.includes("coalesce(sum(amount), 0.00)::float as sum from fees") && !sql.includes("where")) {
      return [{ sum: state.fees.reduce((s, f) => s + parseFloat(f.amount), 0) }];
    }
    if (sql.includes("coalesce(sum(amount), 0.00)::float as sum from fees where status = 'paid'")) {
      return [{ sum: state.fees.filter(f => f.status === 'paid').reduce((s, f) => s + parseFloat(f.amount), 0) }];
    }
    if (sql.includes("to_char(paid_at, 'mon') as month") && sql.includes("from fees")) {
      const monthlyMap = {};
      state.fees.filter(f => f.status === 'paid' && f.paid_at).forEach(f => {
        const date = new Date(f.paid_at);
        const mon = date.toLocaleString('default', { month: 'short' });
        monthlyMap[mon] = (monthlyMap[mon] || 0) + parseFloat(f.amount);
      });
      return Object.keys(monthlyMap).map(m => ({ month: m, revenue: monthlyMap[m] }));
    }
    if (sql.includes("f.fee_type as type") && sql.includes("join users u on f.student_id = u.id")) {
      return state.fees.map(f => {
        const u = state.users.find(user => user.id === f.student_id);
        return {
          id: f.id,
          date: f.due_date ? f.due_date.substring(0, 10) : '',
          name: u ? u.name : 'Unknown Student',
          type: f.fee_type,
          amount: parseFloat(f.amount),
          status: f.status ? f.status.charAt(0).toUpperCase() + f.status.slice(1) : 'Pending'
        };
      }).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
    }


    // 20. Admin mess menu update
    if (sql.includes('insert into mess_menu') && sql.includes('on conflict')) {
      const [day, meal_type, items] = params;
      let menu = state.mess_menu.find(m => m.day === day && m.meal_type === meal_type);
      if (menu) {
        menu.items = items;
      } else {
        menu = {
          id: state.mess_menu.length + 1,
          day,
          meal_type,
          items
        };
        state.mess_menu.push(menu);
      }
      return [menu];
    }

    // 21. Admin get rooms / Warden get rooms
    if (sql.includes('from rooms')) {
      return state.rooms.sort((a, b) => a.room_number.localeCompare(b.room_number));
    }

    // 22. Room allocation transaction support
    if (sql.includes('select * from rooms where id = $1')) {
      const id = parseInt(params[0]);
      const room = state.rooms.find(r => r.id === id);
      return room ? [room] : [];
    }
    if (sql.includes('select * from allocations where student_id = $1 and is_active = true')) {
      const studentId = parseInt(params[0]);
      const alloc = state.allocations.find(a => a.student_id === studentId && a.is_active);
      return alloc ? [alloc] : [];
    }
    if (sql.includes('update allocations set is_active = false')) {
      const id = parseInt(params[0]);
      const alloc = state.allocations.find(a => a.id === id);
      if (alloc) {
        alloc.is_active = false;
        alloc.vacated_at = new Date();
        return [alloc];
      }
      return [];
    }
    if (sql.includes('update rooms set occupied = greatest(0, occupied - 1)')) {
      const id = parseInt(params[0]);
      const room = state.rooms.find(r => r.id === id);
      if (room) {
        room.occupied = Math.max(0, room.occupied - 1);
        room.status = 'available';
        return [room];
      }
      return [];
    }
    if (sql.includes('insert into allocations (student_id, room_id)')) {
      const [student_id, room_id] = params;
      const newAlloc = {
        id: state.allocations.length + 1,
        student_id: parseInt(student_id),
        room_id: parseInt(room_id),
        allocated_at: new Date(),
        vacated_at: null,
        is_active: true
      };
      state.allocations.push(newAlloc);
      return [newAlloc];
    }
    if (sql.includes('update rooms set occupied = $1, status = $2 where id = $3')) {
      const [occupied, status, id] = params;
      const room = state.rooms.find(r => r.id === parseInt(id));
      if (room) {
        room.occupied = parseInt(occupied);
        room.status = status;
        return [room];
      }
      return [];
    }

    // 23. Warden get complaints
    if (sql.includes('from complaints c join users u')) {
      return state.complaints.map(c => {
        const u = state.users.find(user => user.id === c.student_id);
        return {
          id: c.id,
          student_id: String(c.student_id),
          title: c.title,
          description: c.description,
          category: c.category,
          ai_tag: c.ai_tag,
          status: c.status,
          created_at: c.created_at,
          resolved_at: c.resolved_at,
          student_name: u?.name || 'Unknown Student',
          student_email: u?.email || ''
        };
      }).sort((a, b) => b.created_at - a.created_at);
    }

    // 24. Warden update complaint
    if (sql.includes('update complaints set status = $1')) {
      const [status, resolved_at, id] = params;
      const comp = state.complaints.find(c => c.id === parseInt(id));
      if (comp) {
        comp.status = status;
        comp.resolved_at = resolved_at ? new Date(resolved_at) : null;
        return [comp];
      }
      return [];
    }

    // 25. Warden get leaves
    if (sql.includes('from leave_requests l join users u')) {
      return state.leave_requests.map(l => {
        const u = state.users.find(user => user.id === l.student_id);
        const alloc = state.allocations.find(a => a.student_id === l.student_id && a.is_active);
        const room = alloc ? state.rooms.find(r => r.id === alloc.room_id) : null;
        return {
          id: l.id,
          student_id: String(l.student_id),
          student_name: u?.name || 'Unknown Student',
          student_email: u?.email || '',
          reason: l.reason,
          status: l.status.charAt(0).toUpperCase() + l.status.slice(1).toLowerCase(), // e.g. Pending, Approved, Rejected
          from_date: l.from_date,
          to_date: l.to_date,
          start_date: new Date(l.from_date).toISOString().split('T')[0],
          end_date: new Date(l.to_date).toISOString().split('T')[0],
          room_number: room ? room.room_number : 'Unallocated',
          parent_approved: (l.id % 2 === 1) // Dynamic parent consent simulation
        };
      }).sort((a, b) => b.created_at - a.created_at);
    }

    // 26. Warden update leave
    if (sql.includes('update leave_requests set status = $1')) {
      const [status, approved_by, id] = params;
      const leave = state.leave_requests.find(l => l.id === parseInt(id));
      if (leave) {
        leave.status = status;
        leave.approved_by = approved_by ? parseInt(approved_by) : null;
        return [leave];
      }
      return [];
    }

    // 27. Gate kiosk verify gate pass — MUST come before the broad gate_passes handler
    if (sql.includes('from gate_passes gp') && sql.includes('join users u') && sql.includes('gp.qr_code = $1')) {
      const qr_code = params[0];
      const pass = state.gate_passes.find(gp => gp.qr_code === qr_code);
      if (!pass) return [];
      const u = state.users.find(user => user.id === pass.student_id);
      const alloc = u ? state.allocations.find(a => a.student_id === u.id && a.is_active) : null;
      const room = alloc ? state.rooms.find(r => r.id === alloc.room_id) : null;
      return [{
        id: pass.id,
        used: pass.used,
        valid_until: pass.valid_until,
        student_name: u?.name || 'Student',
        room_number: room ? room.room_number : 'Unallocated',
        status: pass.status
      }];
    }
    if (sql.includes('update gate_passes set used = true')) {
      const id = parseInt(params[0]);
      const pass = state.gate_passes.find(gp => gp.id === id);
      if (pass) {
        pass.used = true;
        return [pass];
      }
      return [];
    }
    if (sql.includes('insert into gate_logs')) {
      const gate_pass_id = params[0];
      const log = {
        id: state.gate_logs.length + 1,
        gate_pass_id: parseInt(gate_pass_id),
        entry_time: new Date(),
        verified_by: 'AI'
      };
      state.gate_logs.push(log);
      return [log];
    }

    // 28. Warden / Student get gate passes (broad match — excludes verify queries)
    if (sql.includes('from gate_passes') && !sql.includes('qr_code')) {
      return state.gate_passes.map(gp => {
        const u = state.users.find(user => user.id === gp.student_id);
        const alloc = u ? state.allocations.find(a => a.student_id === u.id && a.is_active) : null;
        const room = alloc ? state.rooms.find(r => r.id === alloc.room_id) : null;
        return {
          id: gp.id,
          student_id: String(gp.student_id),
          student_name: u?.name || 'Unknown Student',
          visitor_name: gp.visitor_name,
          visitor_phone: gp.visitor_phone,
          purpose: gp.purpose,
          qr_code: gp.qr_code,
          valid_from: gp.valid_from,
          valid_until: gp.valid_until,
          start_time: new Date(gp.valid_from).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          end_time: new Date(gp.valid_until).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          used: gp.used,
          status: gp.status,
          room_number: room ? room.room_number : 'Unallocated',
          relationship: gp.purpose.includes('Visit by') ? gp.purpose.replace('Visit by ', '') : 'Visitor',
          created_at: gp.created_at
        };
      }).sort((a, b) => b.created_at - a.created_at);
    }

    // 29. Warden update gate pass
    if (sql.includes('update gate_passes set status = $1')) {
      const [status, id] = params;
      const pass = state.gate_passes.find(gp => gp.id === parseInt(id));
      if (pass) {
        pass.status = status;
        return [pass];
      }
      return [];
    }

    // 30. Warden get staff logs /シフト (shift schedule directory)
    if (sql.includes('warden_staff') || sql.includes('staff')) {
      return [
        { id: 1, name: 'Robert Baratheon', role: 'Maintenance Staff', shift: 'Morning Shift', contact: '+91 90000 11111', performance: 'Excellent', status: 'Active' },
        { id: 2, name: 'Cersei Lannister', role: 'Mess Supervisor', shift: 'Evening Shift', contact: '+91 90000 22222', performance: 'Good', status: 'Active' },
        { id: 3, name: 'Ned Stark', role: 'Security Supervisor', shift: 'Night Shift', contact: '+91 90000 33333', performance: 'Outstanding', status: 'Active' },
        { id: 4, name: 'Tyrion Lannister', role: 'Warden Assistant', shift: 'Flexible Shift', contact: '+91 90000 44444', performance: 'Good', status: 'On Leave' }
      ];
    }

    console.warn('⚠️ Mock SQL query not explicitly mapped, returning empty list:', sql);
    return [];
  };

  const poolMock = {
    query: async (text, params) => {
      const rows = await resolveQuery(text, params);
      return { rows };
    },
    connect: async () => {
      const client = {
        query: async (text, params) => {
          const rows = await resolveQuery(text, params);
          return { rows };
        },
        release: () => {}
      };
      return client;
    },
    on: (event, handler) => {
      // Mock event registration
    }
  };

  return poolMock;
}

module.exports = createMockPool();
