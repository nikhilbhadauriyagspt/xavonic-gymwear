require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

// JSON and URL-encoded parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Guidelya / Xavonic Athletics Backend API is running with WhatsApp & MySQL integration.',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found on this server.`,
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`===========================================`);
  console.log(`🚀 Guidelya Backend Server listening on port ${PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`📱 Customer WhatsApp Auth: http://localhost:${PORT}/api/auth/send-whatsapp-otp`);
  console.log(`🔒 Admin Login Endpoint: http://localhost:${PORT}/api/admin/login`);
  console.log(`===========================================`);
});
