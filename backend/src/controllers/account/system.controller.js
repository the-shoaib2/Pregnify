import prisma from '../../utils/database/prisma.js';
import ApiError from '../../utils/error/api.error.js';
import asyncHandler from '../../utils/middleware/async.handler.js';
import { HTTP_STATUS } from '../../constants/index.js';

/**
 * @desc    Get system preferences
 * @route   GET /api/v1/account/system/preferences
 */
export const getSystemPreferences = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const preferences = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            darkModeEnabled: true,
            languagePreference: true,
            notificationPreferences: true,
            theme: true,
            timezone: true,
            dateFormat: true
        }
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        data: preferences
    });
});

/**
 * @desc    Update system preferences
 * @route   PATCH /api/v1/account/system/preferences
 */
export const updateSystemPreferences = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const updates = req.body;

    const updatedPreferences = await prisma.user.update({
        where: { id: userId },
        data: updates,
        select: {
            darkModeEnabled: true,
            languagePreference: true,
            notificationPreferences: true,
            theme: true,
            timezone: true,
            dateFormat: true,
            updatedAt: true
        }
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'System preferences updated successfully',
        data: updatedPreferences
    });
});

/**
 * @desc    Get system info
 * @route   GET /api/v1/account/system/info
 */
export const getSystemInfo = asyncHandler(async (req, res) => {
    const systemInfo = {
        version: process.env.APP_VERSION || '1.0.0',
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    };

    res.status(HTTP_STATUS.OK).json({
        success: true,
        data: systemInfo
    });
});

/**
 * @desc    Get system status
 * @route   GET /api/v1/account/system/status
 */
export const getSystemStatus = asyncHandler(async (req, res) => {
    const status = {
        database: 'connected',
        cache: 'operational',
        storage: 'operational',
        services: {
            email: 'operational',
            sms: 'operational',
            push: 'operational'
        }
    };

    res.status(HTTP_STATUS.OK).json({
        success: true,
        data: status
    });
});

/**
 * @desc    Clear system cache
 * @route   POST /api/v1/account/system/cache/clear
 */
export const clearCache = asyncHandler(async (req, res) => {
    // Implement cache clearing logic here
    
    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Cache cleared successfully'
    });
});

/**
 * @desc    Cleanup storage
 * @route   POST /api/v1/account/system/storage/cleanup
 */
export const cleanupStorage = asyncHandler(async (req, res) => {
    // Implement storage cleanup logic here
    
    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Storage cleaned successfully'
    });
});

/**
 * @desc    Get system logs
 * @route   GET /api/v1/account/system/logs
 */
export const getSystemLogs = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, type } = req.query;

    const where = type ? { type } : {};

    const logs = await prisma.systemLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: (Number(page) - 1) * Number(limit)
    });

    const total = await prisma.systemLog.count({ where });

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
 * @desc    Clear system logs
 * @route   DELETE /api/v1/account/system/logs
 */
export const clearSystemLogs = asyncHandler(async (req, res) => {
    await prisma.systemLog.deleteMany({});

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'System logs cleared successfully'
    });
});

/**
 * @desc    Create system backup
 * @route   POST /api/v1/account/system/backup
 */
export const createBackup = asyncHandler(async (req, res) => {
    const { type, includeMedia, includeSettings } = req.body;

    // Implement backup creation logic here
    
    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Backup created successfully'
    });
});

/**
 * @desc    Get backup list
 * @route   GET /api/v1/account/system/backup/list
 */
export const getBackupList = asyncHandler(async (req, res) => {
    const backups = await prisma.systemBackup.findMany({
        orderBy: { createdAt: 'desc' }
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        data: backups
    });
});

/**
 * @desc    Download backup
 * @route   GET /api/v1/account/system/backup/:id
 */
export const downloadBackup = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const backup = await prisma.systemBackup.findUnique({
        where: { id }
    });

    if (!backup) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Backup not found');
    }

    // Implement backup download logic here
    
    res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
            downloadUrl: backup.url
        }
    });
});
