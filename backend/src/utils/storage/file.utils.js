import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import mime from 'mime-types';
import sharp from 'sharp';
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import prisma from './prisma.js';
import logger from '../../logger/index.js';
import { validateStorageQuota } from '../storage.utils.js';

// File constants
const ALLOWED_MIME_TYPES = {
    IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    MEDIA: ['video/mp4', 'audio/mpeg', 'audio/wav']
};

const MAX_UPLOAD_SIZE = 1024 * 1024 * 50; // 50MB

export const processFileUpload = async (file, userId, options = {}) => {
    const {
        type = 'GENERAL',
        compress = true,
        generateThumbnail = true,
        allowedTypes = ALLOWED_MIME_TYPES[type] || [],
        maxSize = MAX_UPLOAD_SIZE
    } = options;

    try {
        // Validate file
        if (!file.mimetype || !allowedTypes.includes(file.mimetype)) {
            throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
        }

        if (file.size > maxSize) {
            throw new Error(`File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`);
        }

        // Check storage quota
        await validateStorageQuota(userId, file.size);

        // Generate unique filename
        const fileHash = crypto.createHash('sha256')
            .update(`${file.originalname}-${Date.now()}`)
            .digest('hex');
        const ext = mime.extension(file.mimetype);
        const filename = `${fileHash}.${ext}`;

        // Create upload directory
        const uploadDir = path.join(process.env.UPLOAD_PATH, userId, type.toLowerCase());
        await fs.mkdir(uploadDir, { recursive: true });

        const filepath = path.join(uploadDir, filename);

        // Process image files if needed
        if (compress && file.mimetype.startsWith('image/')) {
            await compressImage(file.path, filepath);
        } else {
            // Move file to destination
            await fs.copyFile(file.path, filepath);
        }

        // Generate thumbnail for images
        let thumbnailPath = null;
        if (generateThumbnail && file.mimetype.startsWith('image/')) {
            thumbnailPath = await generateImageThumbnail(filepath, uploadDir);
        }

        // Save file record
        const fileRecord = await prisma.fileStorage.create({
            data: {
                userId,
                type,
                originalName: file.originalname,
                filename,
                path: filepath,
                thumbnailPath,
                mimetype: file.mimetype,
                size: file.size,
                hash: fileHash
            }
        });

        // Log upload
        await prisma.userActivityLog.create({
            data: {
                userId,
                activityType: 'FILE_UPLOADED',
                description: `File uploaded: ${file.originalname}`,
                metadata: {
                    fileId: fileRecord.id,
                    type,
                    size: file.size
                }
            }
        });

        return fileRecord;
    } catch (error) {
        logger.error('File upload processing failed', { error, userId, filename: file.originalname });
        throw new Error('File upload failed');
    }
};

const compressImage = async (sourcePath, destPath, options = {}) => {
    const {
        quality = 80,
        maxWidth = 2000,
        maxHeight = 2000,
        format = 'jpeg'
    } = options;

    try {
        await sharp(sourcePath)
            .resize(maxWidth, maxHeight, {
                fit: 'inside',
                withoutEnlargement: true
            })
            [format]({ quality })
            .toFile(destPath);
    } catch (error) {
        logger.error('Image compression failed', { error, sourcePath });
        throw new Error('Image compression failed');
    }
};

const generateImageThumbnail = async (sourcePath, destDir, options = {}) => {
    const {
        width = 200,
        height = 200,
        quality = 70,
        format = 'jpeg'
    } = options;

    try {
        const thumbnailFilename = `thumb_${path.basename(sourcePath)}`;
        const thumbnailPath = path.join(destDir, thumbnailFilename);

        await sharp(sourcePath)
            .resize(width, height, {
                fit: 'cover',
                position: 'center'
            })
            [format]({ quality })
            .toFile(thumbnailPath);

        return thumbnailPath;
    } catch (error) {
        logger.error('Thumbnail generation failed', { error, sourcePath });
        return null;
    }
};

export const deleteFile = async (fileId, userId) => {
    try {
        const file = await prisma.fileStorage.findFirst({
            where: {
                id: fileId,
                userId
            }
        });

        if (!file) {
            throw new Error('File not found');
        }

        await prisma.$transaction(async (tx) => {
            // Delete file record
            await tx.fileStorage.delete({
                where: { id: fileId }
            });

            // Delete physical files
            await fs.unlink(file.path);
            if (file.thumbnailPath) {
                await fs.unlink(file.thumbnailPath);
            }

            // Log deletion
            await tx.userActivityLog.create({
                data: {
                    userId,
                    activityType: 'FILE_DELETED',
                    description: `File deleted: ${file.originalName}`,
                    metadata: {
                        fileId,
                        type: file.type
                    }
                }
            });
        });

        return true;
    } catch (error) {
        logger.error('File deletion failed', { error, fileId, userId });
        throw new Error('File deletion failed');
    }
}; 