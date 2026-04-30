const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');

const app = express();

// ── Security Middleware ──
app.use(helmet());
app.use(cors(config.cors));

// ── Body Parsers ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── API Routes ──
app.use('/api', routes);

// ── 404 Handler ──
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ── Global Error Handler (placeholder — enhanced in Step 2) ──
app.use((err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(config.env === 'development' && { stack: err.stack }),
  });
});

module.exports = app;
