const pool = require('../config/db');
const { createNotification } = require('./notification.controller');
const { analyzeComplaint, checkDuplicateComplaint } = require('../services/ai.service');

const getRoom = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.room_number, r.floor, r.capacity, r.occupied, r.room_type, r.status, r.block,
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

    // 1. Check for duplicate complaint
    const isDuplicate = await checkDuplicateComplaint(req.user.id, title, description);

    // 2. Perform AI / Local NLP Analysis
    const aiAnalysis = await analyzeComplaint(title, description, category);

    // 3. Insert complaint record with AI metadata
    const result = await pool.query(
      `INSERT INTO complaints (student_id, title, description, category, ai_tag, assigned_staff_role, predicted_resolution_time, is_duplicate) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        req.user.id,
        title,
        description,
        category,
        aiAnalysis.ai_tag,
        aiAnalysis.assigned_staff_role,
        aiAnalysis.predicted_resolution_time,
        isDuplicate
      ]
    );

    const complaint = result.rows[0];

    // 4. Send notification to the student
    const studentMessage = isDuplicate
      ? `Your complaint "${title}" has been registered. AI flagged this as a duplicate of a recent submission.`
      : `Your complaint "${title}" has been registered. AI has assigned this to "${aiAnalysis.assigned_staff_role}" with an estimated resolution of ${aiAnalysis.predicted_resolution_time}.`;
    await createNotification(
      req.user.id,
      isDuplicate ? 'Duplicate Complaint Flagged' : 'Complaint Registered Successfully',
      studentMessage,
      'complaint'
    );

    // 5. Send notification to all wardens
    const wardenRes = await pool.query("SELECT id FROM users WHERE role = 'warden'");
    for (const w of wardenRes.rows) {
      await createNotification(
        w.id,
        'New Complaint Registered',
        `Student ${req.user.name || 'Resident'} registered a complaint: "${title}". Assigned to: ${aiAnalysis.assigned_staff_role}.`,
        'complaint'
      );
    }

    res.status(201).json({ success: true, data: complaint });
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

    // Notify the student
    await createNotification(
      req.user.id,
      'Leave Request Submitted',
      `Your leave request from ${from_date} to ${to_date} has been submitted for review.`,
      'leave'
    );

    // Notify all wardens
    const wardenRes = await pool.query("SELECT id FROM users WHERE role = 'warden'");
    for (const w of wardenRes.rows) {
      await createNotification(
        w.id,
        'New Leave Request',
        `Student ${req.user.name || 'Resident'} requested leave from ${from_date} to ${to_date}.`,
        'leave'
      );
    }

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

    // Notify the student
    await createNotification(
      req.user.id,
      'Visitor Gate Pass Generated',
      `Visitor pass for ${visitor_name} has been generated and is pending warden approval.`,
      'gatepass'
    );

    // Notify all wardens
    const wardenRes = await pool.query("SELECT id FROM users WHERE role = 'warden'");
    for (const w of wardenRes.rows) {
      await createNotification(
        w.id,
        'New Visitor Request',
        `Student ${req.user.name || 'Resident'} created a visitor pass for: ${visitor_name}.`,
        'gatepass'
      );
    }

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

const getFaceStatus = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT face_data IS NOT NULL AS has_face FROM users WHERE id = $1',
      [req.user.id]
    );
    const hasFace = result.rows[0]?.has_face || false;
    res.json({ success: true, registered: hasFace });
  } catch (err) {
    console.error('Get face status error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const registerFace = async (req, res) => {
  try {
    const { face_data } = req.body;
    if (!face_data) {
      return res.status(400).json({ success: false, error: 'Face data is required' });
    }

    const result = await pool.query(
      'UPDATE users SET face_data = $1 WHERE id = $2 RETURNING id, name, email',
      [face_data, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Student profile not found' });
    }

    res.json({ success: true, message: 'Face ID registered successfully', data: result.rows[0] });
  } catch (err) {
    console.error('Register face error:', err.message);
    res.status(500).json({ success: false, error: 'Server error during Face ID registration' });
  }
};

const createStudentGatePass = async (req, res) => {
  try {
    const { departure_time, expected_return, reason, is_night_stay } = req.body;
    if (!departure_time || !expected_return || !reason) {
      return res.status(400).json({ success: false, error: 'Departure time, expected return, and reason are required' });
    }

    // Get user details to check gender
    const userResult = await pool.query('SELECT gender FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];

    let permission_status = 'Pending';
    if (user.gender === 'Male' && !is_night_stay) {
      permission_status = 'Approved';
    }

    const { v4: uuidv4 } = require('uuid');
    const qr_code = `STUDENT-GP-${uuidv4()}`;

    const result = await pool.query(
      `INSERT INTO student_gate_passes (student_id, departure_time, expected_return, reason, is_night_stay, permission_status, qr_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.id, departure_time, expected_return, reason, is_night_stay || false, permission_status, qr_code]
    );

    const gatePass = result.rows[0];

    // Notify the student
    if (permission_status === 'Approved') {
      await createNotification(
        req.user.id,
        'Gate Pass Auto-Approved',
        `Your student gate pass for outing on ${departure_time} has been auto-approved.`,
        'gatepass'
      );
    } else {
      await createNotification(
        req.user.id,
        'Gate Pass Request Pending',
        `Your gate pass request for outing on ${departure_time} is pending warden approval.`,
        'gatepass'
      );

      // Notify all wardens for pending requests
      const wardenRes = await pool.query("SELECT id FROM users WHERE role = 'warden'");
      for (const w of wardenRes.rows) {
        await createNotification(
          w.id,
          'New Outing Request Pending',
          `Student ${req.user.name || 'Resident'} requested outing gate pass: "${reason}".`,
          'gatepass'
        );
      }
    }

    res.status(201).json({ success: true, data: gatePass });
  } catch (err) {
    console.error('Create student gate pass error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const getStudentGatePasses = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM student_gate_passes WHERE student_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Get student gate passes error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const getAISuggestions = async (req, res) => {
  try {
    const studentId = req.user.id;
    
    // 1. Get student profile details
    const studentRes = await pool.query(
      'SELECT id, name, gender, program, branch, graduation_year FROM users WHERE id = $1',
      [studentId]
    );
    const student = studentRes.rows[0] || {};

    // 2. Get active room allocation & roommates
    const roomRes = await pool.query(
      `SELECT r.id, r.room_number, r.room_type, r.occupied, r.capacity, r.floor
       FROM allocations a
       JOIN rooms r ON a.room_id = r.id
       WHERE a.student_id = $1 AND a.is_active = TRUE`,
      [studentId]
    );
    const room = roomRes.rows[0];
    let roommates = [];
    if (room) {
      const roommatesRes = await pool.query(
        `SELECT u.name, u.program, u.branch, u.graduation_year FROM allocations a
         JOIN users u ON a.student_id = u.id
         WHERE a.room_id = $1 AND a.student_id != $2 AND a.is_active = TRUE`,
        [room.id, studentId]
      );
      roommates = roommatesRes.rows;
    }

    // 3. Get pending fees
    const feesRes = await pool.query(
      "SELECT amount, fee_type, due_date FROM fees WHERE student_id = $1 AND status = 'pending' ORDER BY due_date ASC",
      [studentId]
    );
    const pendingFees = feesRes.rows;

    // 4. Get active complaints
    const complaintsRes = await pool.query(
      "SELECT title, assigned_staff_role, predicted_resolution_time FROM complaints WHERE student_id = $1 AND status IN ('pending', 'in-progress', 'in_progress') ORDER BY created_at DESC LIMIT 1",
      [studentId]
    );
    const activeComplaint = complaintsRes.rows[0];

    // 5. Get overall hostel occupancy ratio and leaves to calculate mess load
    const allocRes = await pool.query("SELECT COUNT(*)::int as count FROM allocations WHERE is_active = TRUE");
    const totalAllocated = allocRes.rows[0].count || 1;

    const leavesRes = await pool.query(
      `SELECT COUNT(*)::int as count FROM leave_requests 
       WHERE status = 'Approved' AND CURRENT_DATE BETWEEN from_date AND to_date`
    );
    const leavesToday = leavesRes.rows[0].count;
    const activeOnCampus = Math.max(0, totalAllocated - leavesToday);

    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 Sunday, 6 Saturday
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[dayOfWeek];
    
    let dayWeight = 1.0;
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      dayWeight = 0.65; // weekend low
    } else if (dayOfWeek === 5) {
      dayWeight = 0.85; // friday slide
    }

    const predictedMessLoad = Math.min(100, Math.round((activeOnCampus / totalAllocated) * 100 * dayWeight));
    
    // Generate AI recommendations
    let suggestions = [];
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const prompt = `
          You are the HostelOS AI Coordinator. 
          Generate a list of 3 tailored, dynamic, context-specific, and non-hardcoded AI alerts/suggestions for this student.
          Do NOT output markdown. Return a JSON array of strings.
          
          Context:
          - Student Name: ${student.name}
          - Program/Branch: ${student.program} ${student.branch} (Graduating: ${student.graduation_year})
          - Room: ${room ? `Room ${room.room_number} (${room.room_type})` : 'Unallocated'}
          - Roommates: ${roommates.length > 0 ? roommates.map(r => `${r.name} (${r.program} ${r.branch})`).join(', ') : 'None'}
          - Pending Fees: ${pendingFees.length > 0 ? pendingFees.map(f => `₹${f.amount} for ${f.fee_type} due on ${f.due_date}`).join(', ') : 'None'}
          - Active Complaint: ${activeComplaint ? `"${activeComplaint.title}" assigned to ${activeComplaint.assigned_staff_role} (predicted resolution in ${activeComplaint.predicted_resolution_time})` : 'None'}
          - Current Day: ${currentDay}
          - Active on campus: ${activeOnCampus} / ${totalAllocated} students
          - Mess Congestion Prediction: ${predictedMessLoad}% load expected during peak hours

          Return exactly 3 suggestions/alerts. One should be a dining hall peak alert, one should address room/roommate compatibility or academic cohort study synergy, and one should address fee dues or complaint resolution expectancy.
          Be precise, friendly, under 15 words per suggestion.
        `;

        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json"
            }
          },
          { timeout: 4000 }
        );
        const textResponse = response.data.contents[0].parts[0].text;
        suggestions = JSON.parse(textResponse);
      } catch (err) {
        console.warn('Gemini student suggestions failed, falling back:', err.message);
      }
    }

    if (suggestions.length === 0) {
      // Local NLP Fallback
      suggestions.push(
        `AI Dining Peak: ${currentDay} dining load predicted at ${predictedMessLoad}%. Dine 15 mins early to avoid the queue!`
      );
      
      if (roommates.length > 0) {
        const roommate = roommates[0];
        suggestions.push(
          `Roommate Study Sync: You and ${roommate.name} share graduation year (${student.graduation_year}). Perfect for joint study!`
        );
      } else {
        suggestions.push(
          `Roommate Sync: No roommates allocated yet. AI will pair you with similar program peers.`
        );
      }

      if (activeComplaint) {
        suggestions.push(
          `Complaint MTTR: "${activeComplaint.title}" is being resolved by ${activeComplaint.assigned_staff_role} in ~${activeComplaint.predicted_resolution_time}.`
        );
      } else if (pendingFees.length > 0) {
        const fee = pendingFees[0];
        const dueDate = new Date(fee.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        suggestions.push(
          `Dues Reminder: Pending ${fee.fee_type} fee of ₹${fee.amount} due by ${dueDate}. Pay to avoid late fees.`
        );
      } else {
        suggestions.push(
          `AI Gate Advisor: Curfew is at 10 PM. Make sure student gate pass is generated and approved for late outings.`
        );
      }
    }

    res.json({ success: true, data: suggestions });
  } catch (err) {
    console.error('Get student AI suggestions error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

module.exports = { 
  getRoom, getFees, createComplaint, getComplaints, 
  createLeave, getLeaves, createGatePass, getGatePasses, 
  getMess, payFee, getFaceStatus, registerFace,
  createStudentGatePass, getStudentGatePasses,
  getAISuggestions
};
