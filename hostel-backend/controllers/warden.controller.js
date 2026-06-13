const pool = require('../config/db');

const getComplaints = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, u.name as student_name, u.email as student_email
       FROM complaints c
       JOIN users u ON c.student_id = u.id
       ORDER BY c.created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Warden get complaints error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    const resolved_at = status === 'resolved' ? new Date() : null;
    const result = await pool.query(
      'UPDATE complaints SET status = $1, resolved_at = $2 WHERE id = $3 RETURNING *',
      [status, resolved_at, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Update complaint error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const getLeaves = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT l.*, u.name as student_name, u.email as student_email
       FROM leave_requests l
       JOIN users u ON l.student_id = u.id
       ORDER BY l.created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Warden get leaves error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const updateLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    const approved_by = status === 'approved' ? req.user.id : null;
    const result = await pool.query(
      'UPDATE leave_requests SET status = $1, approved_by = $2 WHERE id = $3 RETURNING *',
      [status, approved_by, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Leave request not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Update leave error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const getRooms = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rooms ORDER BY room_number');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Warden get rooms error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

module.exports = { getComplaints, updateComplaint, getLeaves, updateLeave, getRooms };
