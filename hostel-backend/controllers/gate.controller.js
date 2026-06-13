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

    // 1. Fetch gate pass along with student details and room allocation in a single query
    const gatePassRes = await client.query(
      `SELECT gp.id, gp.used, gp.valid_until, u.name as student_name, r.room_number
       FROM gate_passes gp
       JOIN users u ON gp.student_id = u.id
       LEFT JOIN allocations a ON u.id = a.student_id AND a.is_active = TRUE
       LEFT JOIN rooms r ON a.room_id = r.id
       WHERE gp.qr_code = $1 FOR UPDATE`,
      [qr_code]
    );

    if (gatePassRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Invalid QR Code / Gate Pass not found' });
    }

    const gatePass = gatePassRes.rows[0];

    // 2. Validate usage status
    if (gatePass.used) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'Gate pass has already been used' });
    }

    // 3. Validate expiry
    const now = new Date();
    const validUntil = new Date(gatePass.valid_until);
    if (now > validUntil) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'Gate pass has expired' });
    }

    // 4. Mark gate pass as used
    await client.query(
      'UPDATE gate_passes SET used = TRUE WHERE id = $1',
      [gatePass.id]
    );

    // 5. Create gate log entry
    await client.query(
      "INSERT INTO gate_logs (gate_pass_id, entry_time, verified_by) VALUES ($1, NOW(), 'AI')",
      [gatePass.id]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      data: {
        student_name: gatePass.student_name,
        room_number: gatePass.room_number || 'Unallocated'
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
