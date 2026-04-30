const { createClient } = require('redis');
const config = require('./index');
const logger = require('../utils/logger');

let redisClient;

const initRedis = async () => {
  redisClient = createClient({
    url: config.redis.uri,
  });

  redisClient.on('error', (err) => logger.error('Redis Client Error', err));
  redisClient.on('connect', () => logger.info('✅ Redis connected successfully'));

  try {
    await redisClient.connect();
  } catch (error) {
    logger.error('Failed to connect to Redis', error);
  }

  return redisClient;
};

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};

module.exports = { initRedis, getRedisClient };
