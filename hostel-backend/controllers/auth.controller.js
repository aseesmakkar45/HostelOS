const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { 
      name, email, password, phone, 
      program, graduation_year, branch, address, 
      guardian_name, guardian_phone, gender, roll_number, 
      identity_proof_type, identity_proof_number, aadhaar_number,
      aadhaar_file, secondary_id_file, face_data
    } = req.body;

    // We hardcode role to student since this is a student sign up
    const role = 'student';

    if (!name || !email || !password || !aadhaar_number || !aadhaar_file || !identity_proof_type || !secondary_id_file) {
      return res.status(400).json({ success: false, error: 'Name, email, password, Aadhaar details, and secondary ID proof are required' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1 OR (roll_number = $2 AND roll_number IS NOT NULL)', [email, roll_number || '']);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'Email or Roll Number already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (
        name, email, password, role, phone, 
        program, graduation_year, branch, address, 
        guardian_name, guardian_phone, gender, roll_number, 
        identity_proof_type, identity_proof_number, aadhaar_number,
        aadhaar_file, secondary_id_file, face_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) 
      RETURNING id, name, email, role, phone, created_at`,
      [
        name, email, hashedPassword, role, phone || null,
        program || null, graduation_year || null, branch || null, address || null,
        guardian_name || null, guardian_phone || null, gender || null, roll_number || null,
        identity_proof_type || null, identity_proof_number || 'Uploaded Document', aadhaar_number || null,
        aadhaar_file || null, secondary_id_file || null, face_data || null
      ]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ success: true, data: { user, token } });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const result = await pool.query(
      `SELECT u.*, r.room_number 
       FROM users u
       LEFT JOIN allocations a ON u.id = a.student_id AND a.is_active = TRUE
       LEFT JOIN rooms r ON a.room_id = r.id
       WHERE u.email = $1`,
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

    const { password: _, ...userData } = user;
    res.json({ success: true, data: { user: userData, token } });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const me = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.phone, u.created_at, 
              u.program, u.graduation_year, u.branch, u.address, 
              u.guardian_name, u.guardian_phone, u.gender, u.roll_number, 
              u.identity_proof_type, u.identity_proof_number, u.aadhaar_number,
              u.aadhaar_file, u.secondary_id_file, u.mess_coupons,
              r.room_number 
       FROM users u
       LEFT JOIN allocations a ON u.id = a.student_id AND a.is_active = TRUE
       LEFT JOIN rooms r ON a.room_id = r.id
       WHERE u.id = $1`, 
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Me error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const {
      name, phone, address, guardian_name, guardian_phone,
      program, graduation_year, branch,
      identity_proof_type, identity_proof_number, aadhaar_number,
      aadhaar_file, secondary_id_file
    } = req.body;

    await pool.query(
      `UPDATE users SET
        name = COALESCE($1, name),
        phone = COALESCE($2, phone),
        address = COALESCE($3, address),
        guardian_name = COALESCE($4, guardian_name),
        guardian_phone = COALESCE($5, guardian_phone),
        program = COALESCE($6, program),
        graduation_year = COALESCE($7, graduation_year),
        branch = COALESCE($8, branch),
        identity_proof_type = COALESCE($9, identity_proof_type),
        identity_proof_number = COALESCE($10, identity_proof_number),
        aadhaar_number = COALESCE($11, aadhaar_number),
        aadhaar_file = COALESCE($12, aadhaar_file),
        secondary_id_file = COALESCE($13, secondary_id_file)
      WHERE id = $14`,
      [
        name || null, phone || null, address || null,
        guardian_name || null, guardian_phone || null,
        program || null, graduation_year || null, branch || null,
        identity_proof_type || null, identity_proof_number || 'Uploaded Document',
        aadhaar_number || null, aadhaar_file || null, secondary_id_file || null,
        req.user.id
      ]
    );

    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.phone, u.created_at,
              u.program, u.graduation_year, u.branch, u.address,
              u.guardian_name, u.guardian_phone, u.gender, u.roll_number,
              u.identity_proof_type, u.identity_proof_number, u.aadhaar_number,
              u.aadhaar_file, u.secondary_id_file, u.mess_coupons,
              r.room_number
       FROM users u
       LEFT JOIN allocations a ON u.id = a.student_id AND a.is_active = TRUE
       LEFT JOIN rooms r ON a.room_id = r.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Update profile error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

module.exports = { register, login, me, updateProfile };
