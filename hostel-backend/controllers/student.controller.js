const pool = require('../config/db');

const getRoom = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.room_number, r.floor, r.capacity, r.occupied, r.room_type, r.status,
              a.allocated_at
       FROM allocations a
       JOIN rooms r ON a.room_id = r.id
       WHERE a.student_id = $1 AND a.is_active = TRUE`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.json({ success: true, data: null });
    }

    // Get roommates
    const allocation = result.rows[0];
    const roommates = await pool.query(
      `SELECT u.name, u.email FROM allocations a
       JOIN users u ON a.student_id = u.id
       JOIN rooms r ON a.room_id = r.id
       WHERE r.room_number = $1 AND a.is_active = TRUE AND a.student_id != $2`,
      [allocation.room_number, req.user.id]
    );

    res.json({
      success: true,
      data: { ...allocation, roommates: roommates.rows }
    });
  } catch (err) {
    console.error('Get room error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const getFees = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM fees WHERE student_id = $1 ORDER BY due_date DESC',
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Get fees error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const createComplaint = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    if (!title || !description || !category) {
      return res.status(400).json({ success: false, error: 'Title, description, and category are required' });
    }

    // Simple AI tagging based on keywords
    let ai_tag = category;
    const desc = (title + ' ' + description).toLowerCase();
    if (desc.includes('fan')) ai_tag = `${category} > Fan Issue`;
    else if (desc.includes('light') || desc.includes('bulb')) ai_tag = `${category} > Lighting Issue`;
    else if (desc.includes('water') || desc.includes('leak')) ai_tag = `${category} > Water/Leak Issue`;
    else if (desc.includes('ac') || desc.includes('air conditioner')) ai_tag = `${category} > AC Issue`;
    else if (desc.includes('toilet') || desc.includes('bathroom')) ai_tag = `${category} > Bathroom Issue`;
    else if (desc.includes('wifi') || desc.includes('internet')) ai_tag = `${category} > Internet Issue`;
    else if (desc.includes('door') || desc.includes('lock')) ai_tag = `${category} > Lock/Door Issue`;
    else if (desc.includes('pest') || desc.includes('cockroach') || desc.includes('rat')) ai_tag = `${category} > Pest Control`;
    else ai_tag = `${category} > General`;

    const result = await pool.query(
      'INSERT INTO complaints (student_id, title, description, category, ai_tag) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, title, description, category, ai_tag]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Create complaint error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const getComplaints = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM complaints WHERE student_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Get complaints error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const createLeave = async (req, res) => {
  try {
    const { from_date, to_date, reason } = req.body;
    if (!from_date || !to_date || !reason) {
      return res.status(400).json({ success: false, error: 'From date, to date, and reason are required' });
    }

    const result = await pool.query(
      'INSERT INTO leave_requests (student_id, from_date, to_date, reason) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, from_date, to_date, reason]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Create leave error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const getLeaves = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM leave_requests WHERE student_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Get leaves error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const createGatePass = async (req, res) => {
  try {
    const { visitor_name, visitor_phone, purpose, valid_from, valid_until } = req.body;
    if (!visitor_name || !purpose || !valid_from || !valid_until) {
      return res.status(400).json({ success: false, error: 'Visitor name, purpose, valid_from, and valid_until are required' });
    }

    const { v4: uuidv4 } = require('uuid');
    const qr_code = `HOSTEL-GP-${uuidv4()}`;

    const result = await pool.query(
      `INSERT INTO gate_passes (student_id, visitor_name, visitor_phone, purpose, qr_code, valid_from, valid_until)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.id, visitor_name, visitor_phone || null, purpose, qr_code, valid_from, valid_until]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Create gate pass error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const getGatePasses = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM gate_passes WHERE student_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Get gate passes error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

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
    console.error('Student get mess menu error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const payFee = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE fees SET status = 'paid', paid_at = NOW() WHERE id = $1 AND student_id = $2 RETURNING *",
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Fee record not found or unauthorized' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Pay fee error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

module.exports = { getRoom, getFees, createComplaint, getComplaints, createLeave, getLeaves, createGatePass, getGatePasses, getMess, payFee };
