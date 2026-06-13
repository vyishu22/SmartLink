require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const urlRoutes = require('./routes/urls');
const redirectRoutes = require('./routes/redirect');
const bulkRoutes = require('./routes/bulk');

const app = express();

// Connect DB
connectDB();

// Security
app.use(helmet());
app.set('trust proxy', 1);

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Auth rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

// Redirect rate limiter
const redirectLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: { success: false, message: 'Too many requests.' },
});

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'SmartLink API is running', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/urls', urlRoutes);
app.use('/api/bulk', bulkRoutes);

// Redirect routes (must be last before error handlers)
app.use('/', redirectLimiter, redirectRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = () => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 SmartLink server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use. Stop the existing process and try again.`);
    } else {
      console.error('❌ Server failed to start:', err);
    }
    process.exit(1);
  });

  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    server.close(() => process.exit(1));
  });

  return server;
};

if (require.main === module) {
  startServer();
}

module.exports = app;
