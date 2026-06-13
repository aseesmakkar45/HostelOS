const pool = require('../config/db');

// POST /api/gate/verify
const verifyGatePass = async (req, res) => {
  const client = await pool.connect();
  try {
    const { qr_code } = req.body;
    if (!qr_code) {
      return res.status(400).json({ success: false, error: 'QR Code is required' });
    }

    await client.query('BEGIN');

    // 1. Lock the gate pass row first (no outer joins, so FOR UPDATE is safe)
    const gatePassRes = await client.query(
      `SELECT gp.id, gp.used, gp.valid_until, gp.status, gp.student_id
       FROM gate_passes gp
       WHERE gp.qr_code = $1 FOR UPDATE`,
      [qr_code]
    );

    // Fetch student + room details separately (no lock needed)
    let studentName = null, roomNumber = null, faceData = null;
    if (gatePassRes.rows.length > 0) {
      const studentRes = await client.query(
        `SELECT u.name as student_name, r.room_number, u.face_data
         FROM users u
         LEFT JOIN allocations a ON u.id = a.student_id AND a.is_active = TRUE
         LEFT JOIN rooms r ON a.room_id = r.id
         WHERE u.id = $1`,
        [gatePassRes.rows[0].student_id]
      );
      if (studentRes.rows.length > 0) {
        studentName = studentRes.rows[0].student_name;
        roomNumber = studentRes.rows[0].room_number;
        faceData = studentRes.rows[0].face_data;
      }
    }

    // Merge into a single object for the rest of the logic
    const mergedGatePass = gatePassRes.rows.length > 0
      ? { ...gatePassRes.rows[0], student_name: studentName, room_number: roomNumber, face_data: faceData }
      : null;

    if (!mergedGatePass) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Invalid QR Code / Gate Pass not found' });
    }

    // Validate approval status
    if (mergedGatePass.status !== 'Approved') {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'Gate pass has not been approved by the warden yet' });
    }

    // 2. Validate usage status
    if (mergedGatePass.used) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'Gate pass has already been used' });
    }

    // 3. Validate expiry
    const now = new Date();
    const validUntil = new Date(mergedGatePass.valid_until);
    if (now > validUntil) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'Gate pass has expired' });
    }

    // 4. Mark gate pass as used
    await client.query(
      'UPDATE gate_passes SET used = TRUE WHERE id = $1',
      [mergedGatePass.id]
    );

    // 5. Create gate log entry
    await client.query(
      "INSERT INTO gate_logs (gate_pass_id, entry_time, verified_by) VALUES ($1, NOW(), 'AI')",
      [mergedGatePass.id]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      data: {
        student_name: mergedGatePass.student_name,
        room_number: mergedGatePass.room_number || 'Unallocated',
        face_data: mergedGatePass.face_data
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Verify gate pass error:', err.message);
    res.status(500).json({ success: false, error: 'Server error during gate verification' });
  } finally {
    client.release();
  }
};

module.exports = { verifyGatePass };
