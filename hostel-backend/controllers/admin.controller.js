const pool = require('../config/db');

// GET /api/admin/students
const getStudents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, r.room_number, r.floor, a.allocated_at
       FROM users u
       LEFT JOIN allocations a ON u.id = a.student_id AND a.is_active = TRUE
       LEFT JOIN rooms r ON a.room_id = r.id
       WHERE u.role = 'student'
       ORDER BY u.name`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Admin get students error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// POST /api/admin/allocate
const allocateRoom = async (req, res) => {
  const client = await pool.connect();
  try {
    const { student_id, room_id } = req.body;
    if (!student_id || !room_id) {
      return res.status(400).json({ success: false, error: 'Student ID and Room ID are required' });
    }

    await client.query('BEGIN');

    // 1. Check if room exists and has capacity
    const roomRes = await client.query('SELECT * FROM rooms WHERE id = $1 FOR UPDATE', [room_id]);
    if (roomRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Room not found' });
    }

    const room = roomRes.rows[0];
    if (room.occupied >= room.capacity) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'Room is already at full capacity' });
    }

    // 2. Check if student already has active allocation for the same room
    const currentAllocRes = await client.query(
      'SELECT * FROM allocations WHERE student_id = $1 AND is_active = TRUE FOR UPDATE',
      [student_id]
    );

    if (currentAllocRes.rows.length > 0) {
      const activeAlloc = currentAllocRes.rows[0];
      if (activeAlloc.room_id === parseInt(room_id)) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, error: 'Student is already allocated to this room' });
      }

      // If allocated to a different room, vacate the old room first
      await client.query(
        'UPDATE allocations SET is_active = FALSE, vacated_at = NOW() WHERE id = $1',
        [activeAlloc.id]
      );
      await client.query(
        `UPDATE rooms 
         SET occupied = GREATEST(0, occupied - 1), 
             status = 'available'
         WHERE id = $1`,
        [activeAlloc.room_id]
      );
    }

    // 3. Create the new allocation
    const newAllocRes = await client.query(
      'INSERT INTO allocations (student_id, room_id) VALUES ($1, $2) RETURNING *',
      [student_id, room_id]
    );

    // 4. Update the new room's occupied count and status
    const newOccupied = room.occupied + 1;
    const newStatus = newOccupied >= room.capacity ? 'occupied' : 'available';
    await client.query(
      'UPDATE rooms SET occupied = $1, status = $2 WHERE id = $3',
      [newOccupied, newStatus, room_id]
    );

    await client.query('COMMIT');

    res.status(201).json({ success: true, data: newAllocRes.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Room allocation error:', err.message);
    res.status(500).json({ success: false, error: 'Server error during allocation' });
  } finally {
    client.release();
  }
};

// GET /api/admin/fees
const getFees = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.*, u.name as student_name, u.email as student_email
       FROM fees f
       JOIN users u ON f.student_id = u.id
       ORDER BY f.due_date DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Admin get fees error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// POST /api/admin/fee
const addFee = async (req, res) => {
  try {
    const { student_id, amount, fee_type, due_date } = req.body;
    if (!student_id || !amount || !fee_type || !due_date) {
      return res.status(400).json({ success: false, error: 'All fields (student_id, amount, fee_type, due_date) are required' });
    }

    const result = await pool.query(
      'INSERT INTO fees (student_id, amount, fee_type, due_date, status) VALUES ($1, $2, $3, $4, \'pending\') RETURNING *',
      [student_id, amount, fee_type, due_date]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Add fee error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// PATCH /api/admin/fee/:id
const updateFee = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    const paid_at = status === 'paid' ? new Date() : null;
    const result = await pool.query(
      'UPDATE fees SET status = $1, paid_at = $2 WHERE id = $3 RETURNING *',
      [status, paid_at, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Fee record not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Update fee error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const studentsRes = await pool.query("SELECT COUNT(*)::int as count FROM users WHERE role = 'student'");
    const roomsRes = await pool.query("SELECT COUNT(*)::int as count FROM rooms WHERE occupied > 0");
    const complaintsRes = await pool.query("SELECT COUNT(*)::int as count FROM complaints WHERE status = 'pending'");
    const feesRes = await pool.query("SELECT COALESCE(SUM(amount), 0.00)::float as sum FROM fees WHERE status = 'pending'");

    const chartRes = await pool.query("SELECT room_number, occupied FROM rooms ORDER BY room_number");

    res.json({
      success: true,
      data: {
        totalStudents: studentsRes.rows[0].count,
        roomsOccupied: roomsRes.rows[0].count,
        pendingComplaints: complaintsRes.rows[0].count,
        pendingFees: feesRes.rows[0].sum,
        chartData: chartRes.rows
      }
    });
  } catch (err) {
    console.error('Get stats error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// GET /api/admin/report
const getReport = async (req, res) => {
  try {
    const studentsPromise = pool.query(
      `SELECT u.name, u.email, u.phone, COALESCE(r.room_number, 'Unallocated') as room_number
       FROM users u
       LEFT JOIN allocations a ON u.id = a.student_id AND a.is_active = TRUE
       LEFT JOIN rooms r ON a.room_id = r.id
       WHERE u.role = 'student'
       ORDER BY u.name`
    );

    const feesPromise = pool.query(
      `SELECT u.name as student_name, f.amount, f.fee_type, f.due_date, f.status
       FROM fees f
       JOIN users u ON f.student_id = u.id
       ORDER BY f.due_date DESC`
    );

    const complaintsPromise = pool.query(
      `SELECT u.name as student_name, c.title, c.category, c.status, c.created_at
       FROM complaints c
       JOIN users u ON c.student_id = u.id
       ORDER BY c.created_at DESC`
    );

    const leavesPromise = pool.query(
      `SELECT u.name as student_name, l.from_date, l.to_date, l.reason, l.status, l.created_at
       FROM leave_requests l
       JOIN users u ON l.student_id = u.id
       ORDER BY l.created_at DESC`
    );

    const gateLogsPromise = pool.query(
      `SELECT u.name as student_name, gp.visitor_name, gp.purpose, gl.entry_time, gl.verified_by
       FROM gate_logs gl
       JOIN gate_passes gp ON gl.gate_pass_id = gp.id
       JOIN users u ON gp.student_id = u.id
       ORDER BY gl.entry_time DESC`
    );

    const [studentsRes, feesRes, complaintsRes, leavesRes, gateLogsRes] = await Promise.all([
      studentsPromise,
      feesPromise,
      complaintsPromise,
      leavesPromise,
      gateLogsPromise
    ]);

    res.json({
      success: true,
      data: {
        students: studentsRes.rows,
        fees: feesRes.rows,
        complaints: complaintsRes.rows,
        leaves: leavesRes.rows,
        gateLogs: gateLogsRes.rows
      }
    });
  } catch (err) {
    console.error('Get report error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// GET /api/admin/mess
const getMess = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM mess_menu 
       ORDER BY 
         CASE 
           WHEN day='Monday' THEN 1 
           WHEN day='Tuesday' THEN 2 
           WHEN day='Wednesday' THEN 3 
           WHEN day='Thursday' THEN 4 
           WHEN day='Friday' THEN 5 
           WHEN day='Saturday' THEN 6 
           WHEN day='Sunday' THEN 7 
           ELSE 8 
         END, 
         CASE 
           WHEN meal_type='breakfast' THEN 1 
           WHEN meal_type='lunch' THEN 2 
           WHEN meal_type='dinner' THEN 3 
           ELSE 4 
         END`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Get mess menu error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// POST /api/admin/mess
const updateMess = async (req, res) => {
  try {
    const { day, meal_type, items } = req.body;
    if (!day || !meal_type || !items) {
      return res.status(400).json({ success: false, error: 'Day, meal type, and items are required' });
    }

    const result = await pool.query(
      `INSERT INTO mess_menu (day, meal_type, items)
       VALUES ($1, $2, $3)
       ON CONFLICT (day, meal_type)
       DO UPDATE SET items = EXCLUDED.items
       RETURNING *`,
      [day, meal_type, items]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Update mess menu error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// GET /api/admin/rooms
const getRooms = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rooms ORDER BY room_number');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Admin get rooms error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

module.exports = {
  getStudents,
  allocateRoom,
  getFees,
  addFee,
  updateFee,
  getStats,
  getReport,
  getMess,
  updateMess,
  getRooms
};
