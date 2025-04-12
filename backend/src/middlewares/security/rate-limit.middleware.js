import rateLimit from 'express-rate-limit';
import logger from '../logger/index.js';

/**
 * Create rate limiter middleware
 * @param {Object} options - Rate limiter options
 */
export const createRateLimiter = ({
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // limit each IP to 100 requests per windowMs
    message = 'Too many requests from this IP, please try again later'
} = {}) => {
    return rateLimit({
        windowMs,
        max,
        message: {
            status: 'error',
            statusCode: 429,
            message
        },
        handler: (req, res, next, options) => {
            logger.warn('Rate limit exceeded', {
                ip: req.ip,
                path: req.path,
                windowMs,
                max
            });
            res.status(options.statusCode).json(options.message);
        },
        standardHeaders: true,
        legacyHeaders: false
    });
};
