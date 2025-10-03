import { createClient } from 'redis';
import { logger } from '../utils/logger';

const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  password: process.env.REDIS_PASSWORD || undefined,
  socket: {
    connectTimeout: 10000,
    lazyConnect: true,
  },
  retry_strategy: (options: any) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      logger.error('Redis server connection refused');
      return new Error('Redis server connection refused');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      logger.error('Redis retry time exhausted');
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      logger.error('Redis max retry attempts reached');
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  },
};

export const redisClient = createClient(redisConfig);

export const connectRedis = async (): Promise<boolean> => {
  try {
    // Check if Redis URL is provided
    if (!process.env.REDIS_URL) {
      logger.warn('Redis URL not provided, skipping Redis connection');
      return false;
    }

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    redisClient.on('end', () => {
      logger.info('Redis client disconnected');
    });

    await redisClient.connect();
    logger.info('Redis connection established successfully');
    return true;
  } catch (error) {
    logger.warn('Redis connection failed, continuing without Redis:', error);
    return false;
  }
};

export const disconnectRedis = async (): Promise<void> => {
  try {
    await redisClient.quit();
    logger.info('Redis connection closed');
  } catch (error) {
    logger.error('Error closing Redis connection:', error);
    throw error;
  }
};

// Redis health check
export const checkRedisHealth = async (): Promise<boolean> => {
  try {
    await redisClient.ping();
    return true;
  } catch (error) {
    logger.error('Redis health check failed:', error);
    return false;
  }
};

// Cache utility functions
export const cache = {
  async get(key: string): Promise<string | null> {
    try {
      if (!redisClient.isOpen) {
        return null;
      }
      return await redisClient.get(key);
    } catch (error) {
      logger.error('Redis GET error:', error);
      return null;
    }
  },

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    try {
      if (!redisClient.isOpen) {
        return false;
      }
      if (ttl) {
        await redisClient.setEx(key, ttl, value);
      } else {
        await redisClient.set(key, value);
      }
      return true;
    } catch (error) {
      logger.error('Redis SET error:', error);
      return false;
    }
  },

  async del(key: string): Promise<boolean> {
    try {
      if (!redisClient.isOpen) {
        return false;
      }
      await redisClient.del(key);
      return true;
    } catch (error) {
      logger.error('Redis DEL error:', error);
      return false;
    }
  },

  async exists(key: string): Promise<boolean> {
    try {
      if (!redisClient.isOpen) {
        return false;
      }
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS error:', error);
      return false;
    }
  },

  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      if (!redisClient.isOpen) {
        return false;
      }
      await redisClient.expire(key, ttl);
      return true;
    } catch (error) {
      logger.error('Redis EXPIRE error:', error);
      return false;
    }
  },
};

export default redisClient;
