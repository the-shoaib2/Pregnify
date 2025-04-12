const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { createLogger } = require('../utils/logger');

const logger = createLogger('AuthController');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

class AuthController {
    async login(req, res) {
        try {
            const { username, password } = req.body;

            const query = 'SELECT * FROM users WHERE username = ?';
            const [user] = await db.executeQuery(req.dbName, query, [username]);

            if (!user || !await bcrypt.compare(password, user.password)) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { 
                    id: user.id, 
                    role: user.role,
                    username: user.username 
                }, 
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            logger.info(`User logged in: ${username}`);
            res.json({ 
                success: true, 
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role
                }
            });
        } catch (error) {
            logger.error('Login error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async register(req, res) {
        try {
            const { username, password, role } = req.body;

            // Check if user exists
            const checkQuery = 'SELECT id FROM users WHERE username = ?';
            const [existingUser] = await db.executeQuery(req.dbName, checkQuery, [username]);

            if (existingUser) {
                return res.status(400).json({ error: 'Username already exists' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const insertQuery = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
            const result = await db.executeQuery(req.dbName, insertQuery, [username, hashedPassword, role]);

            logger.info(`New user registered: ${username}`);
            res.json({ 
                success: true, 
                userId: result.insertId 
            });
        } catch (error) {
            logger.error('Registration error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.id;

            // Get current user
            const query = 'SELECT * FROM users WHERE id = ?';
            const [user] = await db.executeQuery(req.dbName, query, [userId]);

            if (!user || !await bcrypt.compare(currentPassword, user.password)) {
                return res.status(401).json({ error: 'Invalid current password' });
            }

            // Update password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const updateQuery = 'UPDATE users SET password = ? WHERE id = ?';
            await db.executeQuery(req.dbName, updateQuery, [hashedPassword, userId]);

            logger.info(`Password changed for user: ${user.username}`);
            res.json({ success: true });
        } catch (error) {
            logger.error('Password change error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async validateToken(req, res) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ error: 'No token provided' });
            }

            const decoded = jwt.verify(token, JWT_SECRET);
            res.json({ success: true, user: decoded });
        } catch (error) {
            logger.error('Token validation error:', error);
            res.status(401).json({ error: 'Invalid token' });
        }
    }
}

module.exports = new AuthController();
