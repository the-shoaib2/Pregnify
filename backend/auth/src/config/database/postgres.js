import pg from 'pg';
import logger from '../logger.js';

const { Pool } = pg;

const connectPostgres = async () => {
  try {
    const pool = new Pool({
      connectionString: process.env.POSTGRES_DATABASE_URL,
    });

    // Test the connection
    await pool.query('SELECT NOW()');
    logger.info('PostgreSQL Connected Successfully..☘️');
    return pool;
  } catch (error) {
    logger.error('PostgreSQL Connection Error:', error);
    throw error;
  }
};

export default connectPostgres;
