import prisma from '../../utils/database/prisma.js';
import { TwoFactorError, TwoFactorErrorTypes } from '../../utils/error/2fa.error.js';
import { HTTP_STATUS } from '../../constants/index.js';

export const require2FA = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                twoFactorEnabled: true,
                twoFactorAuth: {
                    select: {
                        method: true,
                        isVerified: true
                    }
                }
            }
        });

        if (!user.twoFactorEnabled) {
            throw TwoFactorErrorTypes.NOT_ENABLED;
        }

        // Check if there's a valid 2FA session
        const session = await prisma.twoFactorSession.findFirst({
            where: {
                userId: req.user.id,
                isValid: true,
                expiresAt: { gt: new Date() }
            }
        });

        if (!session) {
            throw TwoFactorErrorTypes.SESSION_EXPIRED;
        }

        next();
    } catch (error) {
        next(error);
    }
};

export const checkTrustedDevice = async (req, res, next) => {
    try {
        const deviceId = req.headers['device-id'];
        if (!deviceId) {
            return next();
        }

        const trustedDevice = await prisma.trustedDevice.findFirst({
            where: {
                userId: req.user.id,
                deviceId,
                expiresAt: { gt: new Date() }
            }
        });

        if (trustedDevice) {
            // Skip 2FA for trusted devices
            req.skipTwoFactor = true;
        }

        next();
    } catch (error) {
        next(error);
    }
};

export const enforce2FASetup = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { role: true, twoFactorEnabled: true }
        });

        // Check if user role requires 2FA
        const requiresSetup = ['ADMIN', 'SUPER_ADMIN'].includes(user.role) && !user.twoFactorEnabled;

        if (requiresSetup) {
            throw new TwoFactorError(
                HTTP_STATUS.FORBIDDEN,
                'You must setup 2FA to access this resource'
            );
        }

        next();
    } catch (error) {
        next(error);
    }
}; 