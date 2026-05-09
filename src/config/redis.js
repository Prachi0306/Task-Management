const { createClient } = require('redis');
const config = require('./index');
const logger = require('../utils/logger');

let redisClient;
let redisAvailable = false;

const initRedis = async () => {
  redisClient = createClient({
    url: config.redis.uri,
    socket: {
      connectTimeout: 5000,
      reconnectStrategy: (retries) => {
        if (retries > 3) {
          logger.warn('Redis max reconnect attempts reached — running without cache');
          return false; // Stop retrying
        }
        return Math.min(retries * 500, 3000);
      },
    },
  });

  redisClient.on('error', (err) => {
    if (redisAvailable) {
      logger.error('Redis Client Error', err);
    }
    redisAvailable = false;
  });

  redisClient.on('connect', () => {
    logger.info('✅ Redis connected successfully');
    redisAvailable = true;
  });

  try {
    await redisClient.connect();
  } catch (error) {
    logger.warn('Redis unavailable — server will run without cache');
    redisAvailable = false;
  }

  return redisClient;
};

const getRedisClient = () => {
  if (!redisClient || !redisAvailable) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};

module.exports = { initRedis, getRedisClient };
