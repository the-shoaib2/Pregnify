import prisma from '../../../utils/database/prisma.js';
import asyncHandler from '../../../utils/middleware/async.handler.js';
import ApiError from '../../../utils/error/api.error.js';
import TwoFactorHandler from '../../../handlers/twofactor.handler.js';
import { generateTokens } from '../../token/token.controller.js';
import { emailService } from '../../../helpers/email/email_service.js';
import { TwoFactorError, TwoFactorErrorTypes } from '../../../utils/error/2fa.error.js';
import { HTTP_STATUS } from '../../../constants/index.js';

// Setup 2FA with TOTP (Time-based One-Time Password)
export const setupTOTP = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Check if 2FA is already enabled
    const existing2FA = await prisma.twoFactorAuth.findFirst({
        where: { userId, method: 'TOTP', isVerified: true }
    });

    if (existing2FA) {
        throw new ApiError(400, "TOTP is already set up for this account");
    }

    // Generate TOTP secret and QR code
    const { secret, qrCodeDataUrl } = await TwoFactorHandler.setupTOTP(userId);

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "TOTP setup initiated",
        data: {
            secret,
            qrCodeUrl: qrCodeDataUrl,
            setupSteps: [
                "1. Scan the QR code with your authenticator app",
                "2. Enter the code shown in your app to verify setup"
            ]
        }
    });
});

// Verify TOTP setup
export const verifyTOTPSetup = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { token } = req.body;

    const isValid = await TwoFactorHandler.verifyTOTP(userId, token);
    if (!isValid) {
        throw TwoFactorErrorTypes.INVALID_CODE;
    }

    // Update user's 2FA status
    await prisma.user.update({
        where: { id: userId },
        data: { twoFactorEnabled: true }
    });

    // Generate backup codes
    const backupCodes = await TwoFactorHandler.generateBackupCodes(userId);

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "TOTP setup completed successfully",
        data: {
            backupCodes,
            warning: "Save these backup codes securely. They won't be shown again!"
        }
    });
});

// Setup SMS-based 2FA
export const setupSMS2FA = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { phoneNumber } = req.body;

    const success = await TwoFactorHandler.setupSMS(userId, phoneNumber);
    if (!success) {
        throw new ApiError(500, "Failed to setup SMS verification");
    }

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "SMS verification code sent"
    });
});

// Verify SMS setup
export const verifySMSSetup = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { code } = req.body;

    const isValid = await TwoFactorHandler.verifySMS(userId, code);
    if (!isValid) {
        throw TwoFactorErrorTypes.INVALID_CODE;
    }

    await prisma.user.update({
        where: { id: userId },
        data: { twoFactorEnabled: true }
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "SMS 2FA setup completed successfully"
    });
});

// Verify 2FA during login
export const verify2FALogin = asyncHandler(async (req, res) => {
    const { userId, code, method } = req.body;

    let isValid = false;
    switch (method) {
        case 'TOTP':
            isValid = await TwoFactorHandler.verifyTOTP(userId, code);
            break;
        case 'SMS':
            isValid = await TwoFactorHandler.verifySMS(userId, code);
            break;
        case 'BACKUP':
            isValid = await TwoFactorHandler.verifyBackupCode(userId, code);
            break;
        default:
            throw TwoFactorErrorTypes.METHOD_NOT_SUPPORTED;
    }

    if (!isValid) {
        throw TwoFactorErrorTypes.INVALID_CODE;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const tokens = await generateTokens(user);

    // Add the device to trusted devices if requested
    if (req.body.trustDevice) {
        await TwoFactorHandler.addTrustedDevice(userId, {
            deviceId: req.headers['user-agent'],
            deviceName: req.headers['user-agent']
        });
    }

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "2FA verification successful",
        data: {
            user: {
                id: user.id,
                email: user.email,
                name: `${user.firstName} ${user.lastName}`
            },
            tokens
        }
    });
});

// Disable 2FA
export const disable2FA = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { password } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user.twoFactorEnabled) {
        throw TwoFactorErrorTypes.NOT_ENABLED;
    }

    // Verify password before disabling 2FA
    const isPasswordValid = await TwoFactorHandler.verifyPassword(userId, password);
    if (!isPasswordValid) {
        throw new TwoFactorError(HTTP_STATUS.UNAUTHORIZED, "Invalid password");
    }

    await prisma.user.update({
        where: { id: userId },
        data: { twoFactorEnabled: false }
    });

    // Notify user via email
    await emailService.send2FADisabledEmail(user.email, user.firstName);

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Two-factor authentication has been disabled"
    });
});

// Get 2FA Status
export const get2FAStatus = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            twoFactorEnabled: true,
            twoFactorAuth: {
                select: {
                    method: true,
                    isVerified: true,
                    createdAt: true,
                    lastUsedAt: true
                }
            }
        }
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
            enabled: user.twoFactorEnabled,
            methods: user.twoFactorAuth
        }
    });
});

// Verify Backup Code
export const verifyBackupCode = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { code } = req.body;

    const isValid = await TwoFactorHandler.verifyBackupCode(userId, code);
    if (!isValid) {
        throw TwoFactorErrorTypes.INVALID_CODE;
    }

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Backup code verified successfully"
    });
});

// Add Trusted Device
export const addTrustedDevice = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { deviceId, deviceName } = req.body;

    // Check device limit
    const deviceCount = await prisma.trustedDevice.count({
        where: { userId, isRevoked: false }
    });

    if (deviceCount >= 5) {
        throw TwoFactorErrorTypes.DEVICE_LIMIT_REACHED;
    }

    const device = await prisma.trustedDevice.create({
        data: {
            userId,
            deviceId,
            deviceName,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        }
    });

    // Notify user via email
    const user = await prisma.user.findUnique({ where: { id: userId } });
    await emailService.sendNewTrustedDeviceEmail(user.email, user.firstName, {
        deviceName,
        timestamp: new Date().toISOString(),
        location: req.headers['x-forwarded-for'] || req.ip
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Device added to trusted devices",
        data: {
            deviceId: device.deviceId,
            expiresAt: device.expiresAt
        }
    });
}); 