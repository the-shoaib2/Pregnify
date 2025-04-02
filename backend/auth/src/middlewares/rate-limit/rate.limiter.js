import rateLimit from 'express-rate-limit';
import { ApiError } from '../../utils/error/error.utils.js';
import { HTTP_STATUS } from '../../constants/index.js';

// Helper function to get client IP
const getClientIp = (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return forwarded.split(',')[0];
    }
    return req.socket.remoteAddress || req.ip;
};

// Base rate limiter configuration
const baseRateLimiter = (options = {}) => {
    return rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes by default
        max: 100, // 100 requests per window by default
        standardHeaders: true,
        legacyHeaders: false,
        trustProxy: false, // Disable trust proxy
        keyGenerator: (req) => {
            const clientIp = getClientIp(req);
            const identifier = options.includeEmail && req.body?.email 
                ? `-${req.body.email}` 
                : '';
            return `${clientIp}${identifier}`;
        },
        handler: (req, res) => {
            // Instead of throwing error, send response
            return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
                success: false,
                message: options.message || 'Too many requests, please try again later',
                error: {
                    code: HTTP_STATUS.TOO_MANY_REQUESTS,
                    retryAfter: Math.ceil(options.windowMs / 1000) // Convert ms to seconds
                }
            });
        },
        ...options
    });
};

// API rate limiter
export const apiLimiter = baseRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000
});

// Admin routes rate limiter
export const adminLimiter = baseRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5000
});

// Upload rate limiter
export const uploadLimiter = baseRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000,
    message: 'Upload limit exceeded'
});

// Authentication rate limiter
export const authLimiter = baseRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5000,
    includeEmail: true
});

// Registration rate limiter
export const registrationLimiter = baseRateLimiter({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 3000,
    includeEmail: true
});

// Login rate limiter
export const loginLimiter = baseRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5000,
    includeEmail: true
});

export default {
    apiLimiter,
    adminLimiter,
    uploadLimiter,
    authLimiter,
    registrationLimiter,
    loginLimiter
};
