const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');
const wardenRoutes = require('./routes/warden.routes');
const adminRoutes = require('./routes/admin.routes');
const gateRoutes = require('./routes/gate.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes mapping
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/warden', wardenRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/gate', gateRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ success: true, message: 'HostelOS API is running smoothly' });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
