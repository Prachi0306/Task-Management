const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

class CacheService {
  /**
   * Get parsed value from cache
   * @param {string} key 
   * @returns {Object|null}
   */
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

  /**
   * Set value in cache with expiration
   * @param {string} key 
   * @param {Object} value 
   * @param {number} ttlInSeconds Default 5 minutes
   */
  async set(key, value, ttlInSeconds = 300) {
    try {
      const client = getRedisClient();
      await client.setEx(key, ttlInSeconds, JSON.stringify(value));
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Delete a specific key
   * @param {string} key 
   */
  async del(key) {
    try {
      const client = getRedisClient();
      await client.del(key);
    } catch (error) {
      logger.error(`Cache del error for key ${key}:`, error);
    }
  }

  /**
   * Invalidate all keys matching a pattern (e.g. "tasks:*")
   * @param {string} pattern 
   */
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
