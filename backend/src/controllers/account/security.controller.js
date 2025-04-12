import prisma from '../../utils/database/prisma.js';
import ApiError from '../../utils/error/api.error.js';
import asyncHandler from '../../utils/middleware/async.handler.js';
import { HTTP_STATUS } from '../../constants/index.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { generateTOTP, verifyTOTP, generateQRCode, generateBackupCodes } from '../../utils/auth/totp.utils.js';

/**
 * @desc    Update password
 * @route   PATCH /api/v1/account/security/password
 */
export const updatePassword = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password_hash: true }
    });

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isPasswordValid) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
        where: { id: userId },
        data: { 
            password_hash: hashedPassword,
            passwordChangedAt: new Date()
        }
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Password updated successfully'
    });
});

/**
 * @desc    Request password reset
 * @route   POST /api/v1/account/security/password/reset-request
 */
export const requestPasswordReset = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (user) {
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = await bcrypt.hash(resetToken, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordResetToken: hashedToken,
                passwordResetExpires: new Date(Date.now() + 3600000) // 1 hour
            }
        });

        // TODO: Send reset email
    }

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'If an account exists with that email, a password reset link has been sent'
    });
});

/**
 * @desc    Reset password
 * @route   POST /api/v1/account/security/password/reset
 */
export const resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;

    const user = await prisma.user.findFirst({
        where: {
            passwordResetToken: token,
            passwordResetExpires: {
                gt: new Date()
            }
        }
    });

    if (!user) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
        where: { id: user.id },
        data: {
            password_hash: hashedPassword,
            passwordResetToken: null,
            passwordResetExpires: null,
            passwordChangedAt: new Date()
        }
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Password reset successfully'
    });
});

/**
 * @desc    Enable 2FA
 * @route   POST /api/v1/account/security/2fa/enable
 */
export const enable2FA = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const secret = generateTOTP();

    await prisma.user.update({
        where: { id: userId },
        data: {
            twoFactorEnabled: true,
            twoFactorSecret: secret,
            twoFactorSetupAt: new Date()
        }
    });

    const qrCode = await generateQRCode(req.user.email, secret);

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: '2FA enabled successfully',
        data: {
            secret,
            qrCode
        }
    });
});

/**
 * @desc    Verify 2FA
 * @route   POST /api/v1/account/security/2fa/verify
 */
export const verify2FA = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { code } = req.body;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { twoFactorSecret: true }
    });

    const isValid = verifyTOTP(code, user.twoFactorSecret);
    if (!isValid) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid 2FA code');
    }

    await prisma.user.update({
        where: { id: userId },
        data: { 
            is2FAVerified: true,
            lastTwoFactorAt: new Date()
        }
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: '2FA verified successfully'
    });
});

/**
 * @desc    Disable 2FA
 * @route   POST /api/v1/account/security/2fa/disable
 */
export const disable2FA = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    await prisma.user.update({
        where: { id: userId },
        data: {
            twoFactorEnabled: false,
            twoFactorSecret: null,
            is2FAVerified: false
        }
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: '2FA disabled successfully'
    });
});

/**
 * @desc    Get backup codes
 * @route   GET /api/v1/account/security/2fa/backup-codes
 */
export const getBackupCodes = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const codes = generateBackupCodes();

    // Hash all codes first
    const hashedCodes = await Promise.all(
        codes.map(async (code) => ({
            userId,
            code: await bcrypt.hash(code, 10),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }))
    );

    // Create backup codes with pre-hashed values
    await prisma.backupCode.createMany({
        data: hashedCodes
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        data: codes
    });
});

/**
 * @desc    Get security questions
 * @route   GET /api/v1/account/security/questions
 */
export const getSecurityQuestions = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const questions = await prisma.securityQuestion.findMany({
        where: { userId },
        select: {
            id: true,
            question: true,
            createdAt: true
        }
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        data: questions
    });
});

/**
 * @desc    Set security questions
 * @route   POST /api/v1/account/security/questions
 */
export const setSecurityQuestions = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { questions } = req.body;

    // Hash all answers first
    const hashedQuestions = await Promise.all(
        questions.map(async (q) => ({
            userId,
            question: q.question,
            answer: await bcrypt.hash(q.answer, 10)
        }))
    );

    await prisma.$transaction(async (prisma) => {
        // Delete existing questions
        await prisma.securityQuestion.deleteMany({
            where: { userId }
        });

        // Create new questions with pre-hashed answers
        await prisma.securityQuestion.createMany({
            data: hashedQuestions
        });
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Security questions set successfully'
    });
});

/**
 * @desc    Update security questions
 * @route   PATCH /api/v1/account/security/questions
 */
export const updateSecurityQuestions = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { questions } = req.body;

    // Hash all answers first
    const hashedQuestions = await Promise.all(
        questions.map(async (q) => ({
            userId,
            question: q.question,
            answer: await bcrypt.hash(q.answer, 10)
        }))
    );

    await prisma.$transaction(async (prisma) => {
        // Delete existing questions
        await prisma.securityQuestion.deleteMany({
            where: { userId }
        });

        // Create new questions with pre-hashed answers
        await prisma.securityQuestion.createMany({
            data: hashedQuestions
        });
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Security questions updated successfully'
    });
});

/**
 * @desc    Get activity logs
 * @route   GET /api/v1/account/security/activity
 */
export const getActivityLogs = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const logs = await prisma.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: (Number(page) - 1) * Number(limit)
    });

    const total = await prisma.activityLog.count({
        where: { userId }
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
            logs,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        }
    });
});

/**
 * @desc    Clear activity logs
 * @route   DELETE /api/v1/account/security/activity
 */
export const clearActivityLogs = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    await prisma.activityLog.deleteMany({
        where: { userId }
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Activity logs cleared successfully'
    });
});

/**
 * @desc    Get devices
 * @route   GET /api/v1/account/security/devices
 */
export const getDevices = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const devices = await prisma.userDevice.findMany({
        where: { userId },
        orderBy: { lastUsedAt: 'desc' }
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        data: devices
    });
});

/**
 * @desc    Remove device
 * @route   DELETE /api/v1/account/security/devices/:deviceId
 */
export const removeDevice = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { deviceId } = req.params;

    await prisma.userDevice.delete({
        where: {
            id: deviceId,
            userId
        }
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Device removed successfully'
    });
});

/**
 * @desc    Logout from all devices
 * @route   POST /api/v1/account/security/devices/logout-all
 */
export const logoutAllDevices = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    await prisma.session.deleteMany({
        where: { userId }
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Logged out from all devices'
    });
});
