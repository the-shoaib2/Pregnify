import fs from 'fs/promises';
import path from 'path';
import prisma from '../database/prisma.js';
import ApiError from '../error/api.error.js';
import logger from '../../logger/index.js';

// Constants
const DEFAULT_STORAGE_QUOTA = 1024 * 1024 * 1024; // 1GB default quota
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Calculate storage statistics for a user
 * @param {string} userId - User ID
 * @returns {Promise<{usedSpace: number, totalSpace: number, fileCount: number}>}
 */
const calculateStorageStats = async (userId) => {
    try {
        // Get user's files count and storage info
        const [filesStats, storageInfo] = await Promise.all([
            // Get files statistics
            prisma.file.aggregate({
                where: { 
                    userId,
                    deletedAt: null
                },
                _count: true,
                _sum: {
                    size: true
                }
            }),
            // Get or create storage settings
            prisma.storage.findFirst({
                where: { userId }
            })
        ]);

        // If no storage record exists, create one with default quota
        const storage = storageInfo || await prisma.storage.create({
            data: {
                userId,
                maxSpace: BigInt(DEFAULT_STORAGE_QUOTA),
                usedSpace: BigInt(0)
            }
        });

        // Handle null values properly
        const usedSpace = filesStats._sum?.size ? Number(filesStats._sum.size) : 0;
        const totalSpace = Number(storage.maxSpace);
        const fileCount = filesStats._count || 0;

        return {
            usedSpace,
            totalSpace,
            fileCount
        };
    } catch (error) {
        logger.error('Failed to calculate storage stats', {
            error: error.message,
            stack: error.stack,
            userId
        });
        
        // Provide more specific error message
        if (error.code === 'P2021') {
            throw new ApiError(500, 'Storage table not found. Please run migrations.');
        }
        if (error.code === 'P2003') {
            throw new ApiError(500, 'Invalid user ID reference.');
        }
        throw new ApiError(500, 'Failed to calculate storage statistics: ' + error.message);
    }
};

/**
 * Get or create user storage settings
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Storage settings
 */
export const getOrCreateUserStorage = async (userId) => {
    try {
        // Find existing storage settings
        let storage = await prisma.storage.findFirst({
            where: { userId }
        });

        // Create new storage settings if none exist
        if (!storage) {
            storage = await prisma.storage.create({
                data: {
                    userId,
                    maxSpace: BigInt(DEFAULT_STORAGE_QUOTA),
                    usedSpace: BigInt(0)
                }
            });
        }

        return storage;
    } catch (error) {
        logger.error('Failed to get/create storage settings', {
            error: error.message,
            userId,
            stack: error.stack
        });
        throw new ApiError(500, 'Failed to access storage settings');
    }
};

/**
 * Validate if user has enough storage quota
 * @param {string} userId - User ID
 * @param {bigint} fileSize - Size of file to be uploaded in bytes
 * @returns {Promise<boolean>}
 */
export const validateStorageQuota = async (userId, fileSize) => {
    try {
        const stats = await calculateStorageStats(userId);
        const newTotalSize = BigInt(stats.usedSpace) + fileSize;

        if (newTotalSize > BigInt(stats.totalSpace)) {
            throw new ApiError(400, `Storage quota exceeded. Available space: ${formatBytes(stats.totalSpace - stats.usedSpace)}`);
        }

        return true;
    } catch (error) {
        logger.error('Storage quota validation failed', {
            error: error.message,
            userId,
            fileSize: fileSize.toString(),
            stack: error.stack
        });

        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, 'Failed to validate storage quota');
    }
};

/**
 * Format bytes to human readable format
 * @param {number} bytes - Bytes to format
 * @returns {string} Formatted string
 */
const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get storage usage statistics
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Storage statistics
 */
export const getStorageStats = async (userId) => {
    try {
        const stats = await calculateStorageStats(userId);
        return {
            used: formatBytes(stats.usedSpace),
            total: formatBytes(stats.totalSpace),
            available: formatBytes(stats.totalSpace - stats.usedSpace),
            fileCount: stats.fileCount,
            usagePercentage: ((stats.usedSpace / stats.totalSpace) * 100).toFixed(2)
        };
    } catch (error) {
        logger.error('Failed to get storage stats', {
            error: error.message,
            stack: error.stack,
            userId
        });
        throw new ApiError(500, 'Failed to get storage statistics');
    }
};

export default {
    calculateStorageStats,
    getOrCreateUserStorage,
    validateStorageQuota,
    getStorageStats
};