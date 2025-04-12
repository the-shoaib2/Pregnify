const mysql = require('mysql2');
const { Pool } = require('pg');

class DatabaseManager {
    constructor() {
        this.connections = new Map();
        this.connectionPools = new Map();
    }

    async createConnection(type, config) {
        try {
            let pool;
            switch (type.toLowerCase()) {
                case 'mysql':
                    pool = mysql.createPool({
                        host: config.host,
                        user: config.user,
                        password: config.password,
                        database: config.database,
                        waitForConnections: true,
                        connectionLimit: 10,
                        queueLimit: 0
                    }).promise();
                    break;
                case 'postgres':
                    pool = new Pool({
                        user: config.user,
                        host: config.host,
                        database: config.database,
                        password: config.password,
                        port: config.port,
                        max: 10
                    });
                    break;
                default:
                    throw new Error('Unsupported database type');
            }
            
            this.connectionPools.set(config.database, pool);
            return pool;
        } catch (error) {
            console.error('Error creating database connection:', error);
            throw error;
        }
    }

    async executeQuery(dbName, query, params = []) {
        const pool = this.connectionPools.get(dbName);
        if (!pool) {
            throw new Error('Database connection not found');
        }

        try {
            const [results] = await pool.query(query, params);
            return results;
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;
        }
    }

    async getTableSchema(dbName, tableName) {
        const pool = this.connectionPools.get(dbName);
        if (!pool) {
            throw new Error('Database connection not found');
        }

        const query = `
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
        `;

        try {
            const [columns] = await pool.query(query, [dbName, tableName]);
            return columns;
        } catch (error) {
            console.error('Error getting table schema:', error);
            throw error;
        }
    }

    async getAllTables(dbName) {
        const pool = this.connectionPools.get(dbName);
        if (!pool) {
            throw new Error('Database connection not found');
        }

        const query = `
            SELECT TABLE_NAME
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = ?
        `;

        try {
            const [tables] = await pool.query(query, [dbName]);
            return tables.map(table => table.TABLE_NAME);
        } catch (error) {
            console.error('Error getting tables:', error);
            throw error;
        }
    }
}

module.exports = new DatabaseManager();
