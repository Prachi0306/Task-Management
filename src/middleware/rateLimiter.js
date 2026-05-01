const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

const createLimiter = (options) => {
  let store;

  try {
    const client = getRedisClient();
    store = new RedisStore({
      sendCommand: (...args) => client.sendCommand(args),
      prefix: options.prefix || 'rl:',
    });
  } catch (err) {
    logger.warn('Redis unavailable for rate limiting — falling back to in-memory store');
    store = undefined; // express-rate-limit uses MemoryStore by default
  }

  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    store,
    message: {
      success: false,
      message: options.message || 'Too many requests, please try again later.',
    },
  });
};

const generalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  prefix: 'rl:general:',
  message: 'Too many requests from this IP, please try again after 15 minutes.',
});

const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  prefix: 'rl:auth:',
  message: 'Too many authentication attempts, please try again after 15 minutes.',
});

module.exports = { generalLimiter, authLimiter };
