import { PrismaClient } from '@prisma/client';
import logger from '../logger/logger.js';
const prisma = new PrismaClient();

/**
 * @description Initializes the database connections.
 * @returns {Promise<void>}
 */

export const initializeDatabases = async () => {
    try {
        // Connect to MongoDB if configured
        if (process.env.MONGODB_URI) {
            await connectMongoDB();
            logger.info('MongoDB connected successfully');
        }

        // Connect to MySQL if configured
        if (process.env.MYSQL_URL) {
            await connectMySQL();
            logger.info('MySQL connected successfully');
        }

        // Connect to PostgreSQL if configured
        if (process.env.DATABASE_URL) {
            await connectPostgres();
            logger.info('PostgreSQL connected successfully');
        }
    } catch (error) {
        logger.error('Failed to connect to databases:', error);
        process.exit(1);
    }
};

/**
 * @description Tests the database connection and returns a boolean indicating the success of the connection.
 * @returns {Promise<boolean>}
 */
export const testDbConnection = async () => {
    try {
        await prisma.$connect();
        console.log('\x1b[32m%s\x1b[0m', '✓ Database connection successful'); // Green color
        return true;
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', '✗ Database connection failed:', error); // Red color
        return false;
    } finally {
        await prisma.$disconnect();
    }
};
