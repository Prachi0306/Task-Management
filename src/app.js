const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');

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
app.use((req, _res, next) => {
  next(AppError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
});

// ── Global Error Handler ──
app.use(errorHandler);

module.exports = app;
