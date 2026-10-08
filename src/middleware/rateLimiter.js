const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

const createLimiter = (options) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: options.message || 'Too many requests, please try again later.',
    },
  });
};

const generalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP, please try again after 15 minutes.',
});

const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again after 15 minutes.',
});

module.exports = { generalLimiter, authLimiter };

