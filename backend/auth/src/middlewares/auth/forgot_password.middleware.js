import { body } from 'express-validator';
import { validateRequest } from '../validation/validate.request.js';
import prisma from '../../utils/database/prisma.js';
import { HTTP_STATUS } from '../../constants/index.js';
import ApiError from '../../utils/error/api.error.js';
import asyncHandler from '../../utils/middleware/async.handler.js';
import { searchUser as searchUserHandler } from '../../handlers/search/user.search.handler.js';

export const verifyOTPValidation = [
    body('userId')
        .notEmpty()
        .withMessage('User ID is required')
        .isString()
        .withMessage('User ID must be a string'),
    
    body('code')
        .notEmpty()
        .withMessage('Verification code is required')
        .isString()
        .withMessage('Code must be a string')
        .isLength({ min: 6, max: 6 })
        .withMessage('Code must be 6 digits'),
    
    body('method')
        .notEmpty()
        .withMessage('Verification method is required')
        .isIn(['email', 'sms'])
        .withMessage('Invalid verification method'),
        
    validateRequest
];

export const validateVerificationSession = async (req, res, next) => {
    try {
        const { userId, code, method } = req.body;
        const now = new Date();

        // First find the most recent active forgot password request
        const forgotPassword = await prisma.forgotPassword.findFirst({
            where: {
                userId,
                isRevoked: false,
                expiresAt: { gt: now }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (!forgotPassword) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                'No active password reset request found. Please start over.'
            );
        }

        // Then find the active verification for this forgot password request
        const verification = await prisma.passwordResetVerification.findFirst({
            where: {
                forgotPasswordId: forgotPassword.id,
                method,
                code,
                verified: false,
                isUsed: false,
                expiresAt: { gt: now }
            },
            include: {
                forgotPassword: {
                    select: {
                        token: true,
                        expiresAt: true
                    }
                }
            }
        });

        if (!verification) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                'Invalid or expired verification code. Please request a new code.'
            );
        }

        // Add both to request for later use
        req.verificationSession = verification;
        req.forgotPassword = forgotPassword;
        
        next();
    } catch (error) {
        next(error);
    }
};

export const trackPasswordResetActivity = async (req, res, next) => {
    try {
        const { userId } = req.body;
        
        // Skip tracking if no userId (initial search)
        if (!userId) {
            return next();
        }

        const ipAddress = req.ip;
        const userAgent = req.get('user-agent');
        
        // Determine action based on route
        let action = 'UNKNOWN';
        if (req.path.includes('find-user')) action = 'FIND_USER';
        if (req.path.includes('send-code')) action = 'SEND_CODE';
        if (req.path.includes('verify-code')) action = 'VERIFY_CODE';
        if (req.path.includes('reset-password')) action = 'RESET_PASSWORD';

        // Create activity log with proper enum value
        const activity = await prisma.passwordResetActivity.create({
            data: {
                userId,
                status: 'INITIATED',
                ipAddress,
                userAgent,
                action: action,
                details: {
                    method: req.body.method,
                    verificationId: req.verificationSession?.id
                }
            }
        });

        // Add to request for later use
        req.activityId = activity.id;
        next();
    } catch (error) {
        next(error);
    }
};

export const updatePasswordResetActivity = async (req, res, next) => {
    try {
        if (!req.activityId) return next();

        await prisma.passwordResetActivity.update({
            where: { id: req.activityId },
            data: {
                status: 'COMPLETED',
                completedAt: new Date(),
                details: {
                    ...req.activityDetails,
                    success: true
                },
                otpVerifiedAt: req.path.includes('verify-code') ? new Date() : undefined,
                otpSentAt: req.path.includes('send-code') ? new Date() : undefined
            }
        });

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Validates the identify parameter
 */
export const searchUserValidation = [
    body('identify')
        .trim()
        .notEmpty()
        .withMessage('Identifier is required')
        .isString()
        .withMessage('Identifier must be a string')
        .isLength({ min: 2, max: 100 })
        .withMessage('Identifier must be between 2 and 100 characters'),
    validateRequest
];

/**
 * Middleware to search for users with rate limiting and security measures
 */
export const searchUser = asyncHandler(async (req, res, next) => {
    const { identify } = req.body;

    try {
        const result = await searchUserHandler({ identify });
        
        // Add response headers for rate limiting info
        res.set('X-RateLimit-Remaining', req.rateLimit.remaining);
        res.set('X-RateLimit-Reset', req.rateLimit.resetTime);
        
        return res.status(200).json(result);
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw ApiError.internalError('Search operation failed');
    }
});

export const sendOTPValidation = [
    body('userId')
        .notEmpty()
        .withMessage('User ID is required')
        .isString()
        .withMessage('User ID must be a string'),
        
    body('method')
        .notEmpty()
        .withMessage('Verification method is required')
        .isIn(['email', 'sms'])
        .withMessage('Invalid verification method'),
        
    body('type')
        .optional()
        .isIn(['code', 'link'])
        .withMessage('Invalid verification type')
        .custom((value, { req }) => {
            // Only email supports links
            if (value === 'link' && req.body.method !== 'email') {
                throw new Error('Only email method supports link verification');
            }
            return true;
        }),
        
    validateRequest
];

export const resetPasswordValidation = [
    body('token')
        .notEmpty()
        .withMessage('Reset token is required')
        .isString()
        .withMessage('Invalid reset token'),
        
    body('newPassword')
        .notEmpty()
        .withMessage('New password is required')
        .isString()
        .withMessage('Password must be a string')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
        
    body('confirmPassword')
        .notEmpty()
        .withMessage('Password confirmation is required')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
        
    validateRequest
]; 