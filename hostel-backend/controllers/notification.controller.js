const pool = require('../config/db');

// Helper to create notification in DB & log simulation event
const createNotification = async (userId, title, message, type) => {
  try {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, title, message, type]
    );

    // Simulate Email & SMS/WhatsApp integrations
    console.log(`\n=================== INTEGRATION ALERT ===================`);
    console.log(`[Notification ID: ${result.rows[0].id}]`);
    console.log(`[Type: ${type.toUpperCase()}] to User ID: ${userId}`);
    console.log(`[Title]: ${title}`);
    console.log(`[Message]: ${message}`);
    console.log(`--------------------------------------------------------`);
    console.log(`✉️  EMAIL SIMULATION: Sending email to user... [SUCCESS]`);
    console.log(`📱 SMS/WHATSAPP SIMULATION: Pushing Twilio event... [SUCCESS]`);
    console.log(`=========================================================\n`);

    return result.rows[0];
  } catch (err) {
    console.error('Create notification helper error:', err.message);
  }
};

// GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Get notifications error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// PATCH /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Mark as read error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// PATCH /api/notifications/read-all
const markAllAsRead = async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = $1',
      [req.user.id]
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Mark all as read error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead
};
