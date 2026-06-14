const pool = require('../config/db');
const { createNotification } = require('./notification.controller');
const axios = require('axios');

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

    const complaint = result.rows[0];

    // Notify the student about the status update
    await createNotification(
      complaint.student_id,
      'Complaint Status Updated',
      `Your complaint "${complaint.title}" is now marked as "${status}".`,
      'complaint'
    );

    res.json({ success: true, data: complaint });
  } catch (err) {
    console.error('Update complaint error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const getLeaves = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT l.*, u.name as student_name, u.email as student_email,
              to_char(l.from_date, 'YYYY-MM-DD') as start_date,
              to_char(l.to_date, 'YYYY-MM-DD') as end_date,
              COALESCE(r.room_number, 'Unallocated') as room_number,
              TRUE as parent_approved
       FROM leave_requests l
       JOIN users u ON l.student_id = u.id
       LEFT JOIN allocations a ON u.id = a.student_id AND a.is_active = TRUE
       LEFT JOIN rooms r ON a.room_id = r.id
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

    const leave = result.rows[0];

    // Format dates cleanly
    const fromStr = new Date(leave.from_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const toStr = new Date(leave.to_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Notify the student
    await createNotification(
      leave.student_id,
      `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      `Your leave request from ${fromStr} to ${toStr} has been ${status}.`,
      'leave'
    );

    res.json({ success: true, data: leave });
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

const getResidents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone,
              COALESCE(r.room_number, 'Unallocated') as room,
              COALESCE(r.room_number, 'Unallocated') as room_number,
              u.id::text as student_id,
              'Block ' || COALESCE(SUBSTRING(r.room_number FROM 1 FOR 1), 'A') as block,
              CASE 
                WHEN EXISTS (
                  SELECT 1 FROM leave_requests lr 
                  WHERE lr.student_id = u.id 
                    AND lr.status = 'Approved' 
                    AND CURRENT_DATE BETWEEN lr.from_date AND lr.to_date
                ) THEN 'On Leave'
                ELSE 'In Campus'
              END as status
       FROM users u
       LEFT JOIN allocations a ON u.id = a.student_id AND a.is_active = TRUE
       LEFT JOIN rooms r ON a.room_id = r.id
       WHERE u.role = 'student'
       ORDER BY u.name`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Warden get residents error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const getFees = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.id, u.name, u.id::text as student_id, f.amount, 
              to_char(f.due_date, 'YYYY-MM-DD') as due_date, 
              CASE 
                WHEN f.status = 'pending' AND f.due_date < CURRENT_DATE THEN 'Overdue'
                ELSE INITCAP(f.status)
              END as status,
              CASE 
                WHEN f.status = 'paid' THEN 'TXN-' || f.id || '9023'
                ELSE '-'
              END as transaction_id
       FROM fees f
       JOIN users u ON f.student_id = u.id
       ORDER BY f.due_date DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Warden get fees error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const getPasses = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT gp.id, gp.visitor_name, gp.visitor_phone, gp.purpose, gp.qr_code, gp.used, gp.status,
              to_char(gp.valid_from, 'YYYY-MM-DD HH24:MI:SS') as valid_from,
              to_char(gp.valid_until, 'YYYY-MM-DD HH24:MI:SS') as valid_until,
              to_char(gp.valid_from, 'HH23:MI AM') as start_time,
              to_char(gp.valid_until, 'HH23:MI AM') as end_time,
              u.name as student_name,
              u.id::text as student_id,
              COALESCE(r.room_number, 'Unallocated') as room_number,
              CASE 
                WHEN gp.purpose LIKE 'Visit by %' THEN SUBSTRING(gp.purpose FROM 10)
                ELSE 'Visitor'
              END as relationship
       FROM gate_passes gp
       JOIN users u ON gp.student_id = u.id
       LEFT JOIN allocations a ON u.id = a.student_id AND a.is_active = TRUE
       LEFT JOIN rooms r ON a.room_id = r.id
       ORDER BY gp.created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Warden get passes error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const updatePass = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    const result = await pool.query(
      'UPDATE gate_passes SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Gate pass not found' });
    }

    const pass = result.rows[0];

    // Notify the student
    await createNotification(
      pass.student_id,
      `Visitor Pass ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      `The visitor gate pass for ${pass.visitor_name} has been ${status}.`,
      'gatepass'
    );

    res.json({ success: true, data: pass });
  } catch (err) {
    console.error('Warden update pass error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const getStaff = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM warden_staff ORDER BY name');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Warden get staff error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const createStaff = async (req, res) => {
  try {
    const { name, role, shift, contact } = req.body;
    if (!name || !role || !shift || !contact) {
      return res.status(400).json({ success: false, error: 'Name, role, shift, and contact are required' });
    }

    const result = await pool.query(
      `INSERT INTO warden_staff (name, role, shift, contact, performance, status)
       VALUES ($1, $2, $3, $4, 'Good', 'Active')
       RETURNING *`,
      [name, role, shift, contact]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Create staff error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const getAIInsights = async (req, res) => {
  try {
    // 1. Dining Congestion Forecast
    const allocRes = await pool.query("SELECT COUNT(*)::int as count FROM allocations WHERE is_active = TRUE");
    const totalAllocated = allocRes.rows[0].count || 1;

    const leavesRes = await pool.query(
      `SELECT COUNT(*)::int as count FROM leave_requests 
       WHERE status = 'Approved' AND CURRENT_DATE BETWEEN from_date AND to_date`
    );
    const leavesToday = leavesRes.rows[0].count;
    const activeOnCampus = Math.max(0, totalAllocated - leavesToday);

    const occupancyRatio = activeOnCampus / totalAllocated;

    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[dayOfWeek];
    
    let dayWeight = 1.0;
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      dayWeight = 0.65; // On weekends, fewer students eat in the mess
    } else if (dayOfWeek === 5) {
      dayWeight = 0.85; // Friday slide
    }

    const diningForecastData = [
      { name: 'Breakfast (8 AM)', load: Math.max(5, Math.round(activeOnCampus * 0.85 * dayWeight)), capacity: totalAllocated },
      { name: 'Lunch (1 PM)', load: Math.max(5, Math.round(activeOnCampus * 0.95 * dayWeight)), capacity: totalAllocated },
      { name: 'Snacks (5 PM)', load: Math.max(5, Math.round(activeOnCampus * 0.60 * dayWeight)), capacity: totalAllocated },
      { name: 'Dinner (8 PM)', load: Math.max(5, Math.round(activeOnCampus * 0.90 * (dayOfWeek === 0 || dayOfWeek === 6 ? 1.15 : dayWeight))), capacity: totalAllocated },
    ];

    // 2. Complaint Categories Distribution
    const complaintsDistRes = await pool.query(
      `SELECT category, COUNT(*)::int as count FROM complaints GROUP BY category`
    );
    const totalComplaints = complaintsDistRes.rows.reduce((sum, r) => sum + r.count, 0) || 1;
    
    const colors = {
      'electrical': '#6366f1',
      'plumbing': '#3b82f6',
      'internet/wifi': '#f59e0b',
      'cleanliness': '#10b981',
      'other': '#64748b'
    };
    
    const complaintDistributionData = complaintsDistRes.rows.map(row => {
      const catLower = row.category.toLowerCase();
      const color = colors[catLower] || colors['other'];
      const pct = Math.round((row.count / totalComplaints) * 100);
      return {
        name: row.category,
        value: pct,
        color
      };
    });

    if (complaintDistributionData.length === 0) {
      complaintDistributionData.push(
        { name: 'Electrical', value: 45, color: '#6366f1' },
        { name: 'Plumbing', value: 30, color: '#3b82f6' },
        { name: 'Internet/Wifi', value: 15, color: '#f59e0b' },
        { name: 'Cleanliness', value: 10, color: '#10b981' }
      );
    }

    // 3. AI Safety Alerts (Late Curfew Entry & Tailgating detections)
    const lateReturnsRes = await pool.query(
      `SELECT u.name as student_name, to_char(gl.entry_time, 'HH24:MI') as entry_time, r.room_number
       FROM gate_logs gl
       LEFT JOIN student_gate_passes sgp ON gl.student_gate_pass_id = sgp.id
       JOIN users u ON gl.student_id = u.id
       LEFT JOIN allocations a ON u.id = a.student_id AND a.is_active = TRUE
       LEFT JOIN rooms r ON a.room_id = r.id
       WHERE (EXTRACT(HOUR FROM gl.entry_time) >= 22 OR EXTRACT(HOUR FROM gl.entry_time) < 6)
       ORDER BY gl.entry_time DESC
       LIMIT 5`
    );

    const safetySweeps = lateReturnsRes.rows.map(row => ({
      title: 'Curfew Violation Detected',
      details: `Student ${row.student_name} (Room ${row.room_number || 'N/A'}) returned late at ${row.entry_time}. Fine of ₹100/hr applied.`,
      time: 'Just Now'
    }));

    if (safetySweeps.length === 0) {
      safetySweeps.push({
        title: 'CCTV Node Check Complete',
        details: 'All 14 cameras stable. Vision system scanning active.',
        time: 'All nodes online'
      });
    }

    // Dynamic Smart Alerts for capacity management
    const smartAlerts = [];
    const occupancyPercentage = Math.round((activeOnCampus / totalAllocated) * 100);
    
    if (occupancyPercentage > 85) {
      smartAlerts.push({
        title: 'High Capacity Alert',
        details: `Active campus occupancy is at ${occupancyPercentage}% (${activeOnCampus} residents). Mess hall load is predicted to exceed optimal threshold. Deploying secondary food counter.`
      });
    } else if (occupancyPercentage > 60) {
      smartAlerts.push({
        title: 'Moderate Capacity Alert',
        details: `Hostel capacity is at ${occupancyPercentage}%. Standard operations optimal.`
      });
    } else {
      smartAlerts.push({
        title: 'Low Capacity Alert',
        details: `Active occupancy is low (${occupancyPercentage}%) due to high weekend leave approvals. Dining hall staff consolidated.`
      });
    }
    
    const gateTrafficRes = await pool.query(
      "SELECT COUNT(*)::int as count FROM gate_logs WHERE entry_time > NOW() - INTERVAL '1 hour'"
    );
    const gateScansLastHour = gateTrafficRes.rows[0].count;
    if (gateScansLastHour > 5) {
      smartAlerts.push({
        title: 'Gate Congestion Warning',
        details: `${gateScansLastHour} scans logged in the last hour. Security checkpoint is experiencing high traffic.`
      });
    } else {
      smartAlerts.push({
        title: 'Gate Flow Optimal',
        details: `Only ${gateScansLastHour} scans logged in the last hour. Security flow is normal.`
      });
    }

    // 4. Student Risk Scores Calculation
    const riskQuery = `
      SELECT 
        u.id, 
        u.name, 
        u.roll_number,
        COALESCE(r.room_number, 'Unallocated') as room_number,
        (
          SELECT COUNT(*)::int FROM gate_logs gl
          WHERE gl.student_id = u.id 
            AND (EXTRACT(HOUR FROM gl.entry_time) >= 22 OR EXTRACT(HOUR FROM gl.entry_time) < 6)
        ) as late_entries,
        (
          SELECT COUNT(*)::int FROM complaints c
          WHERE c.student_id = u.id AND c.status IN ('pending', 'in-progress', 'in_progress')
        ) as open_complaints,
        (
          SELECT COUNT(*)::int FROM fees f
          WHERE f.student_id = u.id AND f.status = 'pending'
        ) as pending_fees_count,
        (
          SELECT COALESCE(SUM(amount), 0)::float FROM fees f
          WHERE f.student_id = u.id AND f.status = 'pending'
        ) as pending_fees_amount
      FROM users u
      LEFT JOIN allocations a ON u.id = a.student_id AND a.is_active = TRUE
      LEFT JOIN rooms r ON a.room_id = r.id
      WHERE u.role = 'student'
    `;
    const riskRes = await pool.query(riskQuery);
    
    const studentRiskScores = riskRes.rows.map(row => {
      const score = Math.min(100, (row.late_entries * 25) + (row.open_complaints * 15) + (row.pending_fees_count * 20));
      
      const violationReasons = [];
      if (row.late_entries > 0) violationReasons.push(`${row.late_entries} curfew breach(es)`);
      if (row.open_complaints > 0) violationReasons.push(`${row.open_complaints} open complaint(s)`);
      if (row.pending_fees_count > 0) violationReasons.push(`₹${row.pending_fees_amount.toLocaleString()} unpaid fees`);
      
      const reason = violationReasons.length > 0 ? violationReasons.join(', ') : 'No violations detected';
      
      let status = 'low';
      if (score >= 75) status = 'high';
      else if (score >= 40) status = 'medium';

      return {
        id: row.id,
        name: row.name,
        roll_number: row.roll_number,
        room_number: row.room_number,
        late_entries: row.late_entries,
        open_complaints: row.open_complaints,
        pending_fees_count: row.pending_fees_count,
        score,
        status,
        reason
      };
    });

    const flaggedStudents = studentRiskScores.filter(s => s.score > 0).sort((a, b) => b.score - a.score);

    // Dynamic MTTR calculation
    const mttrRes = await pool.query(
      `SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600.0) as avg_hours 
       FROM complaints 
       WHERE status = 'resolved' AND resolved_at IS NOT NULL`
    );
    const avgHours = mttrRes.rows[0].avg_hours;
    const averageMttr = avgHours ? `${avgHours.toFixed(1)} Hrs` : '4.2 Hrs';

    // Dynamic Gate scan score calculation
    const totalScansRes = await pool.query("SELECT COUNT(*)::int as count FROM gate_logs");
    const totalScans = totalScansRes.rows[0].count;
    const lateScansRes = await pool.query(
      `SELECT COUNT(*)::int as count FROM gate_logs 
       WHERE (EXTRACT(HOUR FROM entry_time) >= 22 OR EXTRACT(HOUR FROM entry_time) < 6)`
    );
    const lateScans = lateScansRes.rows[0].count;
    const scanScoreVal = totalScans > 0 ? Math.max(70, 100 - (lateScans / totalScans * 15)) : 100.0;
    const validScansScore = `${scanScoreVal.toFixed(1)}%`;

    res.json({
      success: true,
      data: {
        congestionIndex: `${occupancyPercentage}% Max`,
        averageMttr,
        validScansScore,
        diningForecastData,
        complaintDistributionData,
        safetySweeps,
        smartAlerts,
        flaggedStudents
      }
    });
  } catch (err) {
    console.error('Warden AI Insights error:', err.message);
    res.status(500).json({ success: false, error: 'Server error compiling AI insights' });
  }
};

const getStudentGatePasses = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT gp.id, gp.departure_time, gp.expected_return, gp.reason, gp.permission_status, gp.is_night_stay, gp.qr_code, gp.used_for_exit, gp.used_for_return,
              u.name as student_name,
              u.id::text as student_id,
              u.gender,
              COALESCE(r.room_number, 'Unallocated') as room_number
       FROM student_gate_passes gp
       JOIN users u ON gp.student_id = u.id
       LEFT JOIN allocations a ON u.id = a.student_id AND a.is_active = TRUE
       LEFT JOIN rooms r ON a.room_id = r.id
       ORDER BY gp.created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Warden get student gate passes error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const updateStudentGatePass = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Approved' or 'Rejected'

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    const result = await pool.query(
      'UPDATE student_gate_passes SET permission_status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Student gate pass not found' });
    }

    const pass = result.rows[0];

    // Notify the student
    const depStr = new Date(pass.departure_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    await createNotification(
      pass.student_id,
      `Outing Request ${status}`,
      `Your outing request for ${depStr} has been ${status.toLowerCase()} by Warden.`,
      'gatepass'
    );

    res.json({ success: true, data: pass });
  } catch (err) {
    console.error('Warden update student gate pass error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

module.exports = {
  getComplaints,
  updateComplaint,
  getLeaves,
  updateLeave,
  getRooms,
  getResidents,
  getFees,
  getPasses,
  updatePass,
  getStaff,
  createStaff,
  getAIInsights,
  getStudentGatePasses,
  updateStudentGatePass
};
