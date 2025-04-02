import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: `${__dirname}/../../.env` });

async function resetDatabase() {
    try {
        // Create connection without database
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: ''
        });

        // Drop and recreate database
        await connection.query('DROP DATABASE IF EXISTS `PREGNIFY-DATABASE`');
        await connection.query('CREATE DATABASE `PREGNIFY-DATABASE`');

        console.log('Database reset successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error resetting database:', error);
        process.exit(1);
    }
}

resetDatabase();
