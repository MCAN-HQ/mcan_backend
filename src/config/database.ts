import knex from 'knex';
import { logger } from '../utils/logger';

const config = {
  client: 'pg',
  connection: process.env.DATABASE_URL || {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'mcan_db',
    user: process.env.DB_USER || 'mcan_user',
    password: process.env.DB_PASSWORD || 'mcan_secure_password_2024',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  },
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,
  },
  migrations: {
    directory: './database/migrations',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: './database/seeds',
  },
  debug: process.env.NODE_ENV === 'development',
};

export const db = knex(config);

export const connectDatabase = async (): Promise<void> => {
  try {
    // Test the connection
    await db.raw('SELECT 1');
    logger.info('Database connection established successfully');
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await db.destroy();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
    throw error;
  }
};

// Database health check
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await db.raw('SELECT 1');
    return true;
  } catch (error) {
    logger.error('Database health check failed:', error);
    return false;
  }
};

export default db;
