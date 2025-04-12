import prisma from '../../utils/database/prisma.js';
import ApiError from '../../utils/error/api.error.js';
import asyncHandler from '../../utils/middleware/async.handler.js';
import { HTTP_STATUS } from '../../constants/index.js';

/**
 * @desc    Get user settings
 * @route   GET /api/v1/account/settings
 */
export const getSettings = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const settings = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            darkModeEnabled: true,
            languagePreference: true,
            notificationPreferences: true,
            isEmailVerified: true,
            isSmsVerified: true,
            multiFactorAuth: true,
            accountStatus: true,
            lastActive: true,
            updatedAt: true
        }
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        data: settings
    });
});

/**
 * @desc    Update general settings
 * @route   PATCH /api/v1/account/settings/update
 */
export const updateSettings = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { darkModeEnabled, languagePreference } = req.body;

    const updatedSettings = await prisma.user.update({
        where: { id: userId },
        data: {
            darkModeEnabled,
            languagePreference
        },
        select: {
            darkModeEnabled: true,
            languagePreference: true,
            updatedAt: true
        }
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Settings updated successfully',
        data: updatedSettings
    });
});

/**
 * @desc    Update appearance settings
 * @route   PATCH /api/v1/account/settings/appearance
 */
export const updateAppearance = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { darkModeEnabled } = req.body;

    const updatedSettings = await prisma.user.update({
        where: { id: userId },
        data: { darkModeEnabled },
        select: {
            darkModeEnabled: true,
            updatedAt: true
        }
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Appearance settings updated successfully',
        data: updatedSettings
    });
});

/**
 * @desc    Update language settings
 * @route   PATCH /api/v1/account/settings/language
 */
export const updateLanguage = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { languagePreference } = req.body;

    const updatedSettings = await prisma.user.update({
        where: { id: userId },
        data: { languagePreference },
        select: {
            languagePreference: true,
            updatedAt: true
        }
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Language settings updated successfully',
        data: updatedSettings
    });
});

/**
 * @desc    Update notification settings
 * @route   PATCH /api/v1/account/settings/notifications
 */
export const updateNotifications = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const notificationSettings = req.body;

    const updatedSettings = await prisma.user.update({
        where: { id: userId },
        data: {
            notificationPreferences: notificationSettings
        },
        select: {
            notificationPreferences: true,
            updatedAt: true
        }
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Notification settings updated successfully',
        data: updatedSettings
    });
});

/**
 * @desc    Update privacy settings
 * @route   PATCH /api/v1/account/settings/privacy
 */
export const updatePrivacy = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const {
        isEmailVerified,
        isSmsVerified,
        multiFactorAuth
    } = req.body;

    const updatedSettings = await prisma.user.update({
        where: { id: userId },
        data: {
            isEmailVerified,
            isSmsVerified,
            multiFactorAuth
        },
        select: {
            isEmailVerified: true,
            isSmsVerified: true,
            multiFactorAuth: true,
            updatedAt: true
        }
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Privacy settings updated successfully',
        data: updatedSettings
    });
});

/**
 * @desc    Reset settings to default
 * @route   POST /api/v1/account/settings/reset
 */
export const resetSettings = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const defaultSettings = {
        darkModeEnabled: false,
        languagePreference: 'EN',
        notificationPreferences: {
            email: true,
            push: true,
            sms: false
        }
    };

    const updatedSettings = await prisma.user.update({
        where: { id: userId },
        data: defaultSettings,
        select: {
            darkModeEnabled: true,
            languagePreference: true,
            notificationPreferences: true,
            updatedAt: true
        }
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Settings reset to default',
        data: updatedSettings
    });
});
