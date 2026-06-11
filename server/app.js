const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const criminalRoutes = require('./routes/criminalRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const itemRoutes = require('./routes/itemRoutes');
const qrRoutes = require('./routes/qrRoutes');
const matchRoutes = require('./routes/matchRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes mapping
app.use('/api/auth', authRoutes);
app.use('/api/criminals', criminalRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/matches', matchRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Police Theft Management System API'
  });
});

// Fallback 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Express Error Handler]:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
