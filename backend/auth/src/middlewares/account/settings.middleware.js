import ApiError from '../../utils/error/api.error.js';
import { USER_DEFINITIONS } from '../../constants/roles.constants.js';
import prisma from '../../utils/database/prisma.js';
import asyncHandler from '../../utils/middleware/async.handler.js';

export const canAccessSystemSettings = (req, res, next) => {
    const userRole = req.user.role;
    if (![USER_DEFINITIONS.ALPHA, USER_DEFINITIONS.BETA].includes(userRole)) {
        throw new ApiError(403, 'Access denied: Insufficient permissions');
    }
    next();
};

export const validateSystemAccess = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Only admins and super admins can access system settings
    if (![USER_DEFINITIONS.ALPHA, USER_DEFINITIONS.BETA].includes(userRole)) {
        throw new ApiError(403, 'Access denied: Insufficient permissions');
    }

    // Check if user has required system permissions
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            systemPermissions: true,
            accountStatus: true,
            isVerified: true
        }
    });

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Check account status
    if (user.accountStatus !== 'ACTIVE') {
        throw new ApiError(403, 'Account is not active');
    }

    // Check if email verification is required
    if (process.env.REQUIRE_VERIFICATION_FOR_SYSTEM === 'true' && !user.isVerified) {
        throw new ApiError(403, 'Email verification required to access system settings');
    }

    // Log system settings access
    await prisma.userActivityLog.create({
        data: {
            userId,
            activityType: 'SYSTEM_SETTINGS_ACCESS',
            description: `Accessed system settings: ${req.path}`,
            metadata: {
                method: req.method,
                path: req.path
            }
        }
    });

    next();
});

export const canManageBilling = (req, res, next) => {
    const userRole = req.user.role;
    if (![USER_DEFINITIONS.ALPHA, USER_DEFINITIONS.BETA, USER_DEFINITIONS.GAMMA].includes(userRole)) {
        throw new ApiError(403, 'Access denied: Insufficient permissions');
    }
    next();
};

export const validateSettingsAccess = (settingsType) => {
    return asyncHandler(async (req, res, next) => {
        const userId = req.user.id;

        // Check if user has required permissions
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                role: true,
                accountStatus: true,
                isVerified: true,
                preferences: true
            }
        });

        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        // Check account status
        if (user.accountStatus !== 'ACTIVE') {
            throw new ApiError(403, 'Account is not active');
        }

        // Check if email verification is required for settings access
        if (process.env.REQUIRE_VERIFICATION_FOR_SETTINGS === 'true' && !user.isVerified) {
            throw new ApiError(403, 'Email verification required to access settings');
        }

        // Allow users to always access their own profile settings
        if (settingsType === 'profile') {
            // Skip permission check for profile settings
            next();
            return;
        }

        // For other settings types, check permissions
        if (user.role !== 'ADMIN') {
            const hasPermission = user.preferences?.includes(settingsType);
            if (!hasPermission) {
                throw new ApiError(403, `Insufficient permissions to access ${settingsType} settings`);
            }
        }

        // Log settings access attempt
        await prisma.userActivityLog.create({
            data: {
                userId,
                activityType: 'SETTINGS_ACCESS',
                description: `Accessed ${settingsType} settings`,
                metadata: {
                    settingsType,
                    method: req.method
                }
            }
        });

        next();
    });
};

export const validateSettingsMutation = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const settingsType = req.baseUrl.split('/').pop();

    // Additional validation for settings mutations (PUT, POST, DELETE)
    if (['PUT', 'POST', 'DELETE'].includes(req.method)) {
        // Check for concurrent settings updates
        const lastUpdate = await prisma.userActivityLog.findFirst({
            where: {
                userId,
                activityType: 'SETTINGS_UPDATE',
                timestamp: {
                    gte: new Date(Date.now() - 5000) // Last 5 seconds
                }
            }
        });

        if (lastUpdate) {
            throw new ApiError(429, 'Please wait before making another settings change');
        }

        // Check if settings are locked
        const settings = await prisma.accountSettings.findUnique({
            where: { userId },
            select: { settingsLocked: true }
        });

        if (settings?.settingsLocked) {
            throw new ApiError(403, 'Settings are currently locked');
        }
    }

    next();
});

export default {
    canAccessSystemSettings,
    validateSystemAccess,
    canManageBilling,
    validateSettingsAccess,
    validateSettingsMutation
}; 