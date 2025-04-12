const db = require('../config/database');
const { createLogger } = require('../utils/logger');

const logger = createLogger('ModelController');

class ModelController {
    async create(req, res) {
        try {
            const { tableName, data } = req.body;
            const columns = Object.keys(data).join(', ');
            const values = Object.values(data);
            const placeholders = values.map(() => '?').join(', ');

            const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
            const result = await db.executeQuery(req.dbName, query, values);

            logger.info(`Created record in ${tableName}`, { tableName, data });
            res.json({ success: true, id: result.insertId });
        } catch (error) {
            logger.error('Error creating record:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async read(req, res) {
        try {
            const { tableName, filters, sort, page = 1, limit = 10 } = req.query;
            let query = `SELECT * FROM ${tableName}`;
            const params = [];

            // Apply filters
            if (filters) {
                const filterConditions = [];
                Object.entries(JSON.parse(filters)).forEach(([key, value]) => {
                    filterConditions.push(`${key} = ?`);
                    params.push(value);
                });
                if (filterConditions.length) {
                    query += ` WHERE ${filterConditions.join(' AND ')}`;
                }
            }

            // Apply sorting
            if (sort) {
                const { field, order } = JSON.parse(sort);
                query += ` ORDER BY ${field} ${order}`;
            }

            // Apply pagination
            const offset = (page - 1) * limit;
            query += ` LIMIT ? OFFSET ?`;
            params.push(parseInt(limit), offset);

            const results = await db.executeQuery(req.dbName, query, params);
            res.json({ success: true, data: results });
        } catch (error) {
            logger.error('Error reading records:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const { tableName, data, where } = req.body;
            const updates = Object.entries(data).map(([key]) => `${key} = ?`).join(', ');
            const conditions = Object.entries(where).map(([key]) => `${key} = ?`).join(' AND ');
            const values = [...Object.values(data), ...Object.values(where)];

            const query = `UPDATE ${tableName} SET ${updates} WHERE ${conditions}`;
            const result = await db.executeQuery(req.dbName, query, values);

            logger.info(`Updated record in ${tableName}`, { tableName, data, where });
            res.json({ success: true, affectedRows: result.affectedRows });
        } catch (error) {
            logger.error('Error updating record:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const { tableName, where } = req.body;
            const conditions = Object.entries(where).map(([key]) => `${key} = ?`).join(' AND ');
            const values = Object.values(where);

            const query = `DELETE FROM ${tableName} WHERE ${conditions}`;
            const result = await db.executeQuery(req.dbName, query, values);

            logger.info(`Deleted record from ${tableName}`, { tableName, where });
            res.json({ success: true, affectedRows: result.affectedRows });
        } catch (error) {
            logger.error('Error deleting record:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async bulkCreate(req, res) {
        try {
            const { tableName, records } = req.body;
            if (!records.length) {
                return res.status(400).json({ error: 'No records provided' });
            }

            const columns = Object.keys(records[0]);
            const values = records.map(record => Object.values(record));
            const placeholders = `(${columns.map(() => '?').join(', ')})`;
            const valuesList = values.map(() => placeholders).join(', ');

            const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ${valuesList}`;
            const flatValues = values.flat();

            const result = await db.executeQuery(req.dbName, query, flatValues);
            logger.info(`Bulk created records in ${tableName}`, { tableName, count: records.length });
            res.json({ success: true, insertedCount: result.affectedRows });
        } catch (error) {
            logger.error('Error bulk creating records:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getSchema(req, res) {
        try {
            const { tableName } = req.params;
            const schema = await db.getTableSchema(req.dbName, tableName);
            res.json({ success: true, schema });
        } catch (error) {
            logger.error('Error getting schema:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getTables(req, res) {
        try {
            const tables = await db.getAllTables(req.dbName);
            res.json({ success: true, tables });
        } catch (error) {
            logger.error('Error getting tables:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new ModelController();
