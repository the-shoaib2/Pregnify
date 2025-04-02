import prisma from '../../utils/database/prisma.js';
import ApiError from '../../utils/error/api.error.js';
import asyncHandler from '../../utils/middleware/async.handler.js';

/**
 * @desc    Get appearance settings
 * @route   GET /api/v1/account/preferences/appearance
 */
export const getAppearanceSettings = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const settings = await prisma.userPreferences.findUnique({
        where: { userId },
        select: {
            theme: true,
            fontSize: true,
            colorScheme: true,
            reducedMotion: true,
            compactMode: true,
            customStyles: true
        }
    });

    if (!settings) {
        throw new ApiError(404, 'Appearance settings not found');
    }

    res.json({
        success: true,
        data: settings
    });
});

/**
 * @desc    Update appearance settings
 * @route   PUT /api/v1/account/preferences/appearance
 */
export const updateAppearanceSettings = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const updates = req.body;

    const settings = await prisma.$transaction(async (tx) => {
        const updated = await tx.userPreferences.upsert({
            where: { userId },
            create: {
                userId,
                ...updates
            },
            update: updates
        });

        await tx.userActivityLog.create({
            data: {
                userId,
                activityType: 'APPEARANCE_SETTINGS_UPDATED',
                description: 'Updated appearance settings',
                metadata: { updates }
            }
        });

        return updated;
    });

    res.json({
        success: true,
        message: 'Appearance settings updated successfully',
        data: settings
    });
});

/**
 * @desc    Get notification settings
 * @route   GET /api/v1/account/preferences/notifications
 */
export const getNotificationSettings = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const settings = await prisma.notificationPreferences.findUnique({
        where: { userId },
        select: {
            emailNotifications: true,
            pushNotifications: true,
            smsNotifications: true,
            marketingEmails: true,
            securityAlerts: true,
            accountUpdates: true
        }
    });

    if (!settings) {
        throw new ApiError(404, 'Notification settings not found');
    }

    res.json({
        success: true,
        data: settings
    });
});

/**
 * @desc    Update notification settings
 * @route   PUT /api/v1/account/preferences/notifications
 */
export const updateNotificationSettings = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const updates = req.body;

    const settings = await prisma.$transaction(async (tx) => {
        const updated = await tx.notificationPreferences.upsert({
            where: { userId },
            create: {
                userId,
                ...updates
            },
            update: updates
        });

        await tx.userActivityLog.create({
            data: {
                userId,
                activityType: 'NOTIFICATION_SETTINGS_UPDATED',
                description: 'Updated notification settings',
                metadata: { updates }
            }
        });

        return updated;
    });

    res.json({
        success: true,
        message: 'Notification settings updated successfully',
        data: settings
    });
});

/**
 * @desc    Get language settings
 * @route   GET /api/v1/account/preferences/language
 */
export const getLanguageSettings = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const settings = await prisma.userPreferences.findUnique({
        where: { userId },
        select: {
            language: true,
            dateFormat: true,
            timeFormat: true
        }
    });

    if (!settings) {
        throw new ApiError(404, 'Language settings not found');
    }

    res.json({
        success: true,
        data: settings
    });
});

/**
 * @desc    Update language settings
 * @route   PUT /api/v1/account/preferences/language
 */
export const updateLanguageSettings = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const updates = req.body;

    const settings = await prisma.$transaction(async (tx) => {
        const updated = await tx.userPreferences.upsert({
            where: { userId },
            create: {
                userId,
                ...updates
            },
            update: updates
        });

        await tx.userActivityLog.create({
            data: {
                userId,
                activityType: 'LANGUAGE_SETTINGS_UPDATED',
                description: 'Updated language settings',
                metadata: { updates }
            }
        });

        return updated;
    });

    res.json({
        success: true,
        message: 'Language settings updated successfully',
        data: settings
    });
});

/**
 * @desc    Get accessibility settings
 * @route   GET /api/v1/account/preferences/accessibility
 */
export const getAccessibilitySettings = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const settings = await prisma.userPreferences.findUnique({
        where: { userId },
        select: {
            screenReader: true,
            highContrast: true,
            reducedMotion: true,
            largeText: true,
            keyboardNavigation: true
        }
    });

    if (!settings) {
        throw new ApiError(404, 'Accessibility settings not found');
    }

    res.json({
        success: true,
        data: settings
    });
});

/**
 * @desc    Update accessibility settings
 * @route   PUT /api/v1/account/preferences/accessibility
 */
export const updateAccessibilitySettings = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const updates = req.body;

    const settings = await prisma.$transaction(async (tx) => {
        const updated = await tx.userPreferences.upsert({
            where: { userId },
            create: {
                userId,
                ...updates
            },
            update: updates
        });

        await tx.userActivityLog.create({
            data: {
                userId,
                activityType: 'ACCESSIBILITY_SETTINGS_UPDATED',
                description: 'Updated accessibility settings',
                metadata: { updates }
            }
        });

        return updated;
    });

    res.json({
        success: true,
        message: 'Accessibility settings updated successfully',
        data: settings
    });
});

/**
 * @desc    Get theme settings
 * @route   GET /api/v1/account/preferences/theme
 */
export const getThemeSettings = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const settings = await prisma.userPreferences.findUnique({
        where: { userId },
        select: {
            theme: true,
            mode: true,
            primaryColor: true,
            fontSize: true
        }
    });

    if (!settings) {
        throw new ApiError(404, 'Theme settings not found');
    }

    res.json({
        success: true,
        data: settings
    });
});

/**
 * @desc    Update theme settings
 * @route   PUT /api/v1/account/preferences/theme
 */
export const updateThemeSettings = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const updates = req.body;

    const settings = await prisma.$transaction(async (tx) => {
        const updated = await tx.userPreferences.upsert({
            where: { userId },
            create: {
                userId,
                ...updates
            },
            update: updates
        });

        await tx.userActivityLog.create({
            data: {
                userId,
                activityType: 'THEME_SETTINGS_UPDATED',
                description: 'Updated theme settings',
                metadata: { updates }
            }
        });

        return updated;
    });

    res.json({
        success: true,
        message: 'Theme settings updated successfully',
        data: settings
    });
});

/**
 * @desc    Get privacy settings
 * @route   GET /api/v1/account/preferences/privacy
 */
export const getPrivacySettings = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const settings = await prisma.userPreferences.findUnique({
        where: { userId },
        select: {
            profileVisibility: true,
            activityStatus: true,
            searchable: true
        }
    });

    if (!settings) {
        throw new ApiError(404, 'Privacy settings not found');
    }

    res.json({
        success: true,
        data: settings
    });
});

/**
 * @desc    Update privacy settings
 * @route   PUT /api/v1/account/preferences/privacy
 */
export const updatePrivacySettings = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const updates = req.body;

    const settings = await prisma.$transaction(async (tx) => {
        const updated = await tx.userPreferences.upsert({
            where: { userId },
            create: {
                userId,
                ...updates
            },
            update: updates
        });

        await tx.userActivityLog.create({
            data: {
                userId,
                activityType: 'PRIVACY_SETTINGS_UPDATED',
                description: 'Updated privacy settings',
                metadata: { updates }
            }
        });

        return updated;
    });

    res.json({
        success: true,
        message: 'Privacy settings updated successfully',
        data: settings
    });
}); 