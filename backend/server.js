require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const orderRoutes = require('./routes/orderRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');

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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Root & Health check
app.get('/api', (req, res) => {
  res.json({
    success: true,
    name: 'RageX Activewear API Server',
    status: 'online',
    message: 'Backend server is running smoothly.',
    healthCheck: '/api/health',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'RageX Athletics Backend API is running with WhatsApp & MySQL integration.',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/whatsapp', whatsappRoutes);

// Serve frontend static assets if built (for unified Hostinger / Render deployment)
const path = require('path');
const fs = require('fs');
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.originalUrl.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      success: true,
      name: 'RageX Activewear API Server',
      status: 'online',
      message: 'Backend server is running smoothly.',
      healthCheck: '/api/health',
      timestamp: new Date().toISOString(),
    });
  });
}

// 404 Handler for unhandled API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found on this server.`,
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`===========================================`);
  console.log(`🚀 RageX Backend Server listening on port ${PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`📱 Customer WhatsApp Auth: http://localhost:${PORT}/api/auth/send-whatsapp-otp`);
  console.log(`🔒 Admin Login Endpoint: http://localhost:${PORT}/api/admin/login`);
  console.log(`===========================================`);
});
