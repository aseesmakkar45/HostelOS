const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');
const wardenRoutes = require('./routes/warden.routes');
const adminRoutes = require('./routes/admin.routes');
const gateRoutes = require('./routes/gate.routes');

const app = express();

// ─── CORS ──────────────────────────────────────────────────────────────────────
// In development, allow all origins. In production, restrict to the deployed
// frontend URL (set FRONTEND_URL in your Vercel backend env variables).
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? (origin, callback) => {
      // Allow the configured frontend URL + any vercel.app preview deployment
      const allowed = [
        process.env.FRONTEND_URL,
      ].filter(Boolean);
      if (!origin || allowed.some(o => origin.startsWith(o)) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  : true; // allow all in development

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/warden', wardenRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/gate', gateRoutes);

// Health check — Vercel and uptime monitors hit this
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'HostelOS API is running',
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// ─── Error handling ───────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

module.exports = app; // needed for Vercel serverless export
