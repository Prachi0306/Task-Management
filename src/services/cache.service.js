const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

class CacheService {
  async get(key) {
    try {
      const client = getRedisClient();
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key, value, ttlInSeconds = 300) {
    try {
      const client = getRedisClient();
      await client.setEx(key, ttlInSeconds, JSON.stringify(value));
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  async del(key) {
    try {
      const client = getRedisClient();
      await client.del(key);
    } catch (error) {
      logger.error(`Cache del error for key ${key}:`, error);
    }
  }

  async invalidatePattern(pattern) {
    try {
      const client = getRedisClient();
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
    } catch (error) {
      logger.error(`Cache invalidatePattern error for pattern ${pattern}:`, error);
    }
  }
}

module.exports = new CacheService();
