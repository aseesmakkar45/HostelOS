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

    // 1. Try to find in Visitor passes
    let isStudentPass = false;
    let gatePassRes = await client.query(
      `SELECT gp.id, gp.used, gp.valid_until, gp.status, gp.student_id
       FROM gate_passes gp
       WHERE gp.qr_code = $1 FOR UPDATE`,
      [qr_code]
    );

    // If not found in visitor passes, check student passes
    if (gatePassRes.rows.length === 0) {
      isStudentPass = true;
      gatePassRes = await client.query(
        `SELECT sgp.id, sgp.used_for_exit, sgp.used_for_return, sgp.expected_return as valid_until, sgp.permission_status as status, sgp.student_id
         FROM student_gate_passes sgp
         WHERE sgp.qr_code = $1 FOR UPDATE`,
        [qr_code]
      );
    }

    if (gatePassRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Invalid QR Code / Gate Pass not found' });
    }

    const passData = gatePassRes.rows[0];

    // Validate approval status
    if (passData.status !== 'Approved') {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'Gate pass has not been approved by the warden yet' });
    }

    // Validate usage and expiry
    let actionType = 'Entry';
    const now = new Date();
    const validUntil = new Date(passData.valid_until);

    if (isStudentPass) {
      if (passData.used_for_exit && passData.used_for_return) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, error: 'Gate pass has already been fully used' });
      }

      if (!passData.used_for_exit) {
        // Exiting
        actionType = 'Exit';
        // Only check expiry on exit
        if (now > validUntil) {
          await client.query('ROLLBACK');
          return res.status(400).json({ success: false, error: 'Gate pass has expired' });
        }
        await client.query(
          'UPDATE student_gate_passes SET used_for_exit = TRUE WHERE id = $1',
          [passData.id]
        );
      } else {
        // Returning
        actionType = 'Entry';
        await client.query(
          'UPDATE student_gate_passes SET used_for_return = TRUE WHERE id = $1',
          [passData.id]
        );
      }
    } else {
      // Visitor pass logic
      if (passData.used) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, error: 'Gate pass has already been used' });
      }
      if (now > validUntil) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, error: 'Gate pass has expired' });
      }
      await client.query(
        'UPDATE gate_passes SET used = TRUE WHERE id = $1',
        [passData.id]
      );
    }

    // Fetch student + room details separately (no lock needed)
    let studentName = null, roomNumber = null, faceData = null;
    const studentRes = await client.query(
      `SELECT u.name as student_name, r.room_number, u.face_data
       FROM users u
       LEFT JOIN allocations a ON u.id = a.student_id AND a.is_active = TRUE
       LEFT JOIN rooms r ON a.room_id = r.id
       WHERE u.id = $1`,
      [passData.student_id]
    );
    if (studentRes.rows.length > 0) {
      studentName = studentRes.rows[0].student_name;
      roomNumber = studentRes.rows[0].room_number;
      faceData = studentRes.rows[0].face_data;
    }

    // 5. Create gate log entry
    if (isStudentPass) {
      await client.query(
        "INSERT INTO gate_logs (student_gate_pass_id, student_id, action, entry_time, verified_by) VALUES ($1, $2, $3, NOW(), 'AI-QR')",
        [passData.id, passData.student_id, actionType]
      );
    } else {
      await client.query(
        "INSERT INTO gate_logs (gate_pass_id, student_id, action, entry_time, verified_by) VALUES ($1, $2, $3, NOW(), 'AI-QR')",
        [passData.id, passData.student_id, 'Entry']
      );
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      data: {
        student_name: studentName,
        room_number: roomNumber || 'Unallocated',
        face_data: faceData,
        action: actionType,
        is_student_pass: isStudentPass
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

const getRegisteredFaces = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.face_data, r.room_number
       FROM users u
       LEFT JOIN allocations a ON u.id = a.student_id AND a.is_active = TRUE
       LEFT JOIN rooms r ON a.room_id = r.id
       WHERE u.face_data IS NOT NULL`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Get registered faces error:', err.message);
    res.status(500).json({ success: false, error: 'Server error retrieving face data' });
  }
};

const verifyFaceEntry = async (req, res) => {
  const client = await pool.connect();
  try {
    const { student_id } = req.body;
    if (!student_id) {
      return res.status(400).json({ success: false, error: 'Student ID is required' });
    }

    await client.query('BEGIN');

    // Get user and room details
    const userRes = await client.query(
      `SELECT u.name as student_name, u.roll_number, r.room_number 
       FROM users u
       LEFT JOIN allocations a ON u.id = a.student_id AND a.is_active = TRUE
       LEFT JOIN rooms r ON a.room_id = r.id
       WHERE u.id = $1`,
      [student_id]
    );

    if (userRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    const { student_name, roll_number, room_number } = userRes.rows[0];

    // Check if there is an active approved student_gate_pass that was used for exit but not return
    const activePassRes = await client.query(
      `SELECT id
       FROM student_gate_passes
       WHERE student_id = $1 AND permission_status = 'Approved' 
         AND used_for_exit = TRUE AND used_for_return = FALSE
       ORDER BY created_at DESC LIMIT 1 FOR UPDATE`,
      [student_id]
    );

    let actionType = 'Entry';

    if (activePassRes.rows.length > 0) {
      const passId = activePassRes.rows[0].id;
      await client.query('UPDATE student_gate_passes SET used_for_return = TRUE WHERE id = $1', [passId]);
      
      await client.query(
        "INSERT INTO gate_logs (student_gate_pass_id, student_id, action, entry_time, verified_by) VALUES ($1, $2, $3, NOW(), 'AI-Face')",
        [passId, student_id, 'Entry']
      );
    } else {
      // General Entry Logging (No active exit pass found, maybe they were out informally)
      await client.query(
        "INSERT INTO gate_logs (student_id, action, entry_time, verified_by) VALUES ($1, $2, NOW(), 'AI-Face')",
        [student_id, 'Entry']
      );
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      data: {
        student_name,
        roll_number: roll_number || '',
        room_number: room_number || 'Unallocated',
        action: actionType,
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Verify face entry error:', err.message);
    res.status(500).json({ success: false, error: 'Server error during face verification' });
  } finally {
    client.release();
  }
};

// GET /api/gate/logbook
const getLogBook = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         gl.id,
         gl.entry_time,
         gl.verified_by,
         gl.action,
         CASE
           WHEN gl.gate_pass_id IS NOT NULL THEN 'visitor'
           WHEN gl.action = 'Exit' THEN 'student-exit'
           ELSE 'student-entry'
         END AS log_type,
         CASE
           WHEN gl.gate_pass_id IS NOT NULL THEN gp.visitor_name
           ELSE u.name
         END AS person_name,
         CASE
           WHEN gl.gate_pass_id IS NOT NULL THEN gp.purpose
           WHEN gl.student_gate_pass_id IS NOT NULL THEN 'Gate Pass'
           ELSE 'Face Recognition'
         END AS purpose,
         CASE
           WHEN gl.gate_pass_id IS NOT NULL THEN u.name
           ELSE NULL
         END AS host_name,
         u.roll_number,
         COALESCE(r.room_number, 'Unallocated') AS room_number
       FROM gate_logs gl
       LEFT JOIN users u ON gl.student_id = u.id
       LEFT JOIN gate_passes gp ON gl.gate_pass_id = gp.id
       LEFT JOIN student_gate_passes sgp ON gl.student_gate_pass_id = sgp.id
       LEFT JOIN allocations a ON (
         CASE 
           WHEN gl.gate_pass_id IS NOT NULL THEN gp.student_id 
           ELSE gl.student_id 
         END
       ) = a.student_id AND a.is_active = TRUE
       LEFT JOIN rooms r ON a.room_id = r.id
       ORDER BY gl.entry_time DESC
       LIMIT 200`
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Get logbook error:', err.message);
    res.status(500).json({ success: false, error: 'Server error fetching logbook' });
  }
};

const runMigrations = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE gate_logs 
      ADD COLUMN IF NOT EXISTS student_id INT REFERENCES users(id) ON DELETE CASCADE;
    `);
    await client.query(`
      ALTER TABLE gate_logs 
      ADD COLUMN IF NOT EXISTS action VARCHAR(20) DEFAULT 'Entry';
    `);
    res.json({ success: true, message: 'Migrations ran successfully' });
  } catch (err) {
    console.error('Migration error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
};

module.exports = { verifyGatePass, getRegisteredFaces, verifyFaceEntry, getLogBook, runMigrations };
