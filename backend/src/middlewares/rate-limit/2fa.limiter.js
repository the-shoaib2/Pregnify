import rateLimit from 'express-rate-limit';
import { HTTP_STATUS } from '../../constants/index.js';

export const twoFactorLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: {
        status: 'error',
        code: HTTP_STATUS.TOO_MANY_REQUESTS,
        message: 'Too many 2FA attempts. Please try again in 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

export const backupCodeLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts
    message: {
        status: 'error',
        code: HTTP_STATUS.TOO_MANY_REQUESTS,
        message: 'Too many backup code attempts. Please try again in 1 hour.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

export const smsCodeLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 3, // 3 attempts
    message: {
        status: 'error',
        code: HTTP_STATUS.TOO_MANY_REQUESTS,
        message: 'Too many SMS code attempts. Please try again in 10 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false
}); 