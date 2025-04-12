import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import { promisify } from 'util';
import prisma from '../database/prisma.js';
import ApiError from '../error/api.error.js';
import logger from '../../logger/index.js';

// Constants
const SALT_ROUNDS = 12;
const BACKUP_CODE_LENGTH = 10;
const BACKUP_CODE_COUNT = 10;

// Generate backup codes for 2FA
export const generateBackupCodes = async (count = BACKUP_CODE_COUNT) => {
    try {
        const randomBytes = promisify(crypto.randomBytes);
        const codes = [];

        for (let i = 0; i < count; i++) {
            const buffer = await randomBytes(Math.ceil(BACKUP_CODE_LENGTH / 2));
            codes.push(buffer.toString('hex').slice(0, BACKUP_CODE_LENGTH));
        }

        return codes;
    } catch (error) {
        logger.error('Backup code generation failed', { error });
        throw new ApiError(500, 'Failed to generate backup codes');
    }
};

// Generate TOTP secret
export const generateTOTPSecret = async () => {
    try {
        const buffer = await promisify(crypto.randomBytes)(20);
        const secret = buffer.toString('base32');
        return {
            secret,
            uri: `otpauth://totp/${process.env.APP_NAME}?secret=${secret}&issuer=${process.env.APP_NAME}`
        };
    } catch (error) {
        logger.error('TOTP secret generation failed', { error });
        throw new ApiError(500, 'Failed to generate 2FA secret');
    }
};

// Verify TOTP token
export const verifyTOTP = async (secret, token) => {
    try {
        return authenticator.verify({ token, secret });
    } catch (error) {
        return false;
    }
};

// Hash security question answers
export const hashSecurityAnswer = async (answer) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(answer.toLowerCase().trim(), salt);
};

// Verify security question answer
export const verifySecurityAnswer = async (answer, hash) => {
    return bcrypt.compare(answer.toLowerCase().trim(), hash);
};

// Generate device fingerprint
export const generateDeviceFingerprint = (userAgent, ip) => {
    const data = `${userAgent}|${ip}|${process.env.DEVICE_FINGERPRINT_SECRET}`;
    return crypto.createHash('sha256').update(data).digest('hex');
};

// Parse user agent for device info
export const parseDeviceInfo = (userAgent) => {
    // Basic parsing - you might want to use a proper UA parser library
    const info = {
        browser: 'Unknown',
        os: 'Unknown',
        device: 'Unknown'
    };

    // Simple browser detection
    if (userAgent.includes('Firefox/')) {
        info.browser = 'Firefox';
    } else if (userAgent.includes('Chrome/')) {
        info.browser = 'Chrome';
    } else if (userAgent.includes('Safari/')) {
        info.browser = 'Safari';
    }

    // Simple OS detection
    if (userAgent.includes('Windows')) {
        info.os = 'Windows';
    } else if (userAgent.includes('Mac OS X')) {
        info.os = 'macOS';
    } else if (userAgent.includes('Linux')) {
        info.os = 'Linux';
    } else if (userAgent.includes('iPhone')) {
        info.os = 'iOS';
        info.device = 'iPhone';
    } else if (userAgent.includes('Android')) {
        info.os = 'Android';
        info.device = 'Android Device';
    }

    return info;
};

// Validate password strength
export const validatePasswordStrength = (password) => {
    const requirements = {
        minLength: 8,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumbers: /\d/.test(password),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const valid = password.length >= requirements.minLength &&
                 requirements.hasUpperCase &&
                 requirements.hasLowerCase &&
                 requirements.hasNumbers &&
                 requirements.hasSpecialChar;

    return {
        valid,
        requirements
    };
};

// Rate limiting helper
export const checkRateLimit = async (key, limit, windowMs, redis) => {
    const current = await redis.incr(key);
    if (current === 1) {
        await redis.pexpire(key, windowMs);
    }
    return current <= limit;
};

/**
 * Hash a password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export const hashPassword = async (password) => {
    try {
        return await bcrypt.hash(password, SALT_ROUNDS);
    } catch (error) {
        logger.error('Password hashing failed', { error });
        throw new ApiError(500, 'Password processing failed');
    }
};

/**
 * Verify a password
 * @param {string} password - Plain text password to verify
 * @param {string} hash - Hashed password to compare against
 * @returns {Promise<boolean>} Whether the password matches
 */
export const verifyPassword = async (password, hash) => {
    try {
        return await bcrypt.compare(password, hash);
    } catch (error) {
        logger.error('Password verification failed', { error });
        throw new ApiError(500, 'Password verification failed');
    }
};

/**
 * Validate security question answers
 * @param {string} userId - User ID
 * @param {Array<string>} answers - Array of answers to validate
 * @returns {Promise<boolean>} Whether the answers are correct
 */
export const validateSecurityAnswers = async (userId, answers) => {
    try {
        const questions = await prisma.securityQuestion.findMany({
            where: { userId },
            select: { answer: true }
        });

        if (questions.length !== answers.length) {
            return false;
        }

        // Compare each answer
        for (let i = 0; i < answers.length; i++) {
            const isMatch = await bcrypt.compare(
                answers[i].toLowerCase().trim(),
                questions[i].answer
            );
            if (!isMatch) return false;
        }

        return true;
    } catch (error) {
        logger.error('Security answer validation failed', { error });
        throw new ApiError(500, 'Failed to validate security answers');
    }
};

/**
 * Generate session token
 * @param {Object} data - Data to encode in token
 * @returns {Promise<string>} Session token
 */
export const generateSessionToken = async (data) => {
    try {
        const buffer = await promisify(crypto.randomBytes)(32);
        const token = buffer.toString('hex');

        // Store token in database
        await prisma.sessionToken.create({
            data: {
                token,
                userId: data.userId,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                metadata: data
            }
        });

        return token;
    } catch (error) {
        logger.error('Session token generation failed', { error });
        throw new ApiError(500, 'Failed to generate session token');
    }
};

export default {
    hashPassword,
    verifyPassword,
    generateBackupCodes,
    generateTOTPSecret,
    validateSecurityAnswers,
    generateSessionToken
}; 