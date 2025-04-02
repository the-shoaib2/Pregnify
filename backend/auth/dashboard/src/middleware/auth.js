const jwt = require('jsonwebtoken');
const { createLogger } = require('../utils/logger');

const logger = createLogger('AuthMiddleware');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const roles = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    USER: 'user'
};

const authMiddleware = {
    isisAuthenticate: (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            logger.error('Authentication error:', error);
            res.status(401).json({ error: 'Invalid token' });
        }
    },

    authorize: (allowedRoles) => {
        return (req, res, next) => {
            try {
                if (!req.user) {
                    return res.status(401).json({ error: 'Authentication required' });
                }

                if (!allowedRoles.includes(req.user.role)) {
                    return res.status(403).json({ error: 'Insufficient permissions' });
                }

                next();
            } catch (error) {
                logger.error('Authorization error:', error);
                res.status(403).json({ error: 'Authorization failed' });
            }
        };
    },

    isSuperAdmin: (req, res, next) => {
        if (req.user.role !== roles.SUPER_ADMIN) {
            return res.status(403).json({ error: 'Super Admin access required' });
        }
        next();
    }
};

module.exports = { authMiddleware, roles };
