import pkg from '@prisma/client';
const { FileCategory, FileType, VisibilityType } = pkg;

import prisma from '../../utils/database/prisma.js';
import ApiError from '../../utils/error/api.error.js';
import asyncHandler from '../../utils/middleware/async.handler.js';
import { uploadOnCloudinary, deleteFromCloudinary } from '../../config/cloudinary.js';
import { 
    UPLOAD_STATES, 
    TEMP_FILE_EXPIRY,
    CLOUDINARY_FOLDERS
} from '../../constants/media.constants.js';
import { serializeBigInt } from '../../utils/serializers/data.serializer.js';
import { generateTransformedUrls } from '../../utils/transformations/media.transformations.js';

// Add this helper function before the uploadFile controller
const updateUserProfileMedia = async (userId, fileCategory, fileType, cloudinaryResult) => {
    if (fileType !== 'IMAGE' || !['PROFILE', 'COVER'].includes(fileCategory)) {
        return;
    }

    const transformedUrls = generateTransformedUrls(cloudinaryResult.secure_url, 'IMAGE');
    const updateData = fileCategory === 'PROFILE' 
        ? {
            avatar: transformedUrls.medium,
            avatarThumb: transformedUrls.thumbnail
        }
        : {
            cover: transformedUrls.medium,
            coverThumb: transformedUrls.thumbnail
        };

    await prisma.user.update({
        where: { id: userId },
        data: updateData
    });
};

// Helper function for temporary file cleanup
const scheduleTemporaryFileCleanup = async (fileId, cloudinaryId) => {
    setTimeout(async () => {
        try {
            const file = await prisma.file.findUnique({
                where: { id: fileId }
            });

            if (file && file.status === UPLOAD_STATES.TEMPORARY) {
                await deleteFromCloudinary(cloudinaryId);
                await prisma.file.delete({
                    where: { id: fileId }
                });
                console.log(`Cleaned up temporary file: ${fileId}`);
            }
        } catch (error) {
            console.error('Failed to cleanup temporary file:', {
                fileId,
                cloudinaryId,
                error: error.message
            });
        }
    }, TEMP_FILE_EXPIRY);
};

// Add this helper function before the uploadFile controller
const createFileRecord = async (userId, fileData, cloudinaryResult, metadata) => {
    const {
        fileType,
        fileCategory,
        visibility,
        title = '',
        description = '',
        allowComments,
        allowSharing,
        allowDownload,
        customAudience = ''
    } = fileData;

    return await prisma.file.create({
        data: {
            userId,
            fileType,
            fileCategory,
            status: UPLOAD_STATES.TEMPORARY,
            visibility,
            url: cloudinaryResult.secure_url,
            cloudinaryId: cloudinaryResult.public_id,
            size: BigInt(metadata.size),
            format: metadata.mimetype,
            title: title?.trim() || '',
            description: description?.trim() || '',
            allowComments,
            allowSharing,
            allowDownload,
            customAudience: customAudience?.trim() || '',
            metadata: {
                originalName: metadata.originalname,
                uploadedAt: new Date().toISOString(),
                uploadedBy: userId,
                userAgent: metadata.userAgent
            }
        }
    });
};

/**
 * @description Optimized file upload controller
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @route POST /api/v1/media/upload
 * @access Private
 */
export const uploadFile = asyncHandler(async (req, res) => {
    const { 
        fileType, // required
        fileCategory, // required
        visibility = 'PUBLIC', // required but has default
        title = '',
        description = '',
        allowComments = true,
        allowSharing = true,
        allowDownload = true,
        customAudience = ''
    } = req.body;

    // Validate required fields
    if (!fileType || !fileCategory) {
        throw new ApiError(400, 'File type and category are required');
    }

    // Validate fileType and fileCategory are valid enums
    if (!Object.values(FileType).includes(fileType)) {
        throw new ApiError(400, `Invalid file type. Must be one of: ${Object.values(FileType).join(', ')}`);
    }

    if (!Object.values(FileCategory).includes(fileCategory)) {
        throw new ApiError(400, `Invalid file category. Must be one of: ${Object.values(FileCategory).join(', ')}`);
    }

    // Validate visibility
    if (!Object.values(VisibilityType).includes(visibility)) {
        throw new ApiError(400, `Invalid visibility type. Must be one of: ${Object.values(VisibilityType).join(', ')}`);
    }

    // Parse boolean values
    const parsedAllowComments = allowComments === 'true' || allowComments === true;
    const parsedAllowSharing = allowSharing === 'true' || allowSharing === true;
    const parsedAllowDownload = allowDownload === 'true' || allowDownload === true;

    // Generate folder path efficiently
    const folderPath = `${CLOUDINARY_FOLDERS.BASE}/users/${req.user.id}/${
        CLOUDINARY_FOLDERS.TYPE[fileCategory]
    }/${CLOUDINARY_FOLDERS.CATEGORY[fileType]}`;

    // Upload with optimized settings
    const cloudinaryResult = await uploadOnCloudinary(
        req.file,
        folderPath,
        fileType.toLowerCase(),
        {
            eager_async: true,
            eager_notification_url: process.env.CLOUDINARY_NOTIFICATION_URL,
            timestamp: Math.floor(Date.now() / 1000)
        }
    );

    const fileRecord = await createFileRecord(
        req.user.id,
        {
            fileType,
            fileCategory,
            visibility,
            title,
            description,
            allowComments: parsedAllowComments,
            allowSharing: parsedAllowSharing,
            allowDownload: parsedAllowDownload,
            customAudience
        },
        cloudinaryResult,
        {
            size: req.file.size,
            mimetype: req.file.mimetype,
            originalname: req.file.originalname,
            userAgent: req.headers['user-agent']
        }
    );

    // Update user profile media if applicable
    await updateUserProfileMedia(req.user.id, fileCategory, fileType, cloudinaryResult);

    // Schedule cleanup for temporary files
    scheduleTemporaryFileCleanup(fileRecord.id, cloudinaryResult.public_id);

    res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: {
            file: serializeBigInt(fileRecord),
            status: UPLOAD_STATES.TEMPORARY,
            expiresIn: TEMP_FILE_EXPIRY
        }
    });
});


/**
 * @description Handle batch file uploads
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @route POST /api/v1/media/upload/batch
 * @access Private
 */
export const uploadFiles = asyncHandler(async (req, res) => {
    const { 
        fileType, 
        fileCategory 
    } = req.body;
    
    if (!req.files || req.files.length === 0) {
        throw new ApiError(400, 'No files uploaded');
    }

    const uploadPromises = req.files.map(async (file) => {
        const folderPath = `${CLOUDINARY_FOLDERS.BASE}/users/${req.user.id}/${
            CLOUDINARY_FOLDERS.TYPE[fileCategory]
        }/${CLOUDINARY_FOLDERS.CATEGORY[fileType]}`;

        const cloudinaryResult = await uploadOnCloudinary(
            file,
            folderPath,
            fileType.toLowerCase(),
            {
                eager_async: true,
                eager_notification_url: process.env.CLOUDINARY_NOTIFICATION_URL,
                timestamp: Math.floor(Date.now() / 1000)
            }
        );

        const fileRecord = await prisma.file.create({
            data: {
                userId: req.user.id,
                fileType,
                fileCategory,
                status: UPLOAD_STATES.TEMPORARY,
                url: cloudinaryResult.secure_url,
                cloudinaryId: cloudinaryResult.public_id,
                size: BigInt(file.size),
                format: file.mimetype
            }
        });

        scheduleTemporaryFileCleanup(fileRecord.id, cloudinaryResult.public_id);
        return serializeBigInt(fileRecord);
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    res.status(201).json({
        success: true,
        message: 'Files uploaded successfully',
        data: {
            files: uploadedFiles,
            status: UPLOAD_STATES.TEMPORARY,
            expiresIn: TEMP_FILE_EXPIRY
        }
    });
});


export const confirmUpload = asyncHandler(async (req, res) => {
    const { fileId } = req.params;

    const file = await prisma.file.findFirst({
        where: {
            id: fileId,
            userId: req.user.id,
            status: UPLOAD_STATES.TEMPORARY
        }
    });

    if (!file) {
        throw new ApiError(404, 'Temporary file not found');
    }

    const updatedFile = await prisma.file.update({
        where: { id: fileId },
        data: {
            status: UPLOAD_STATES.PERMANENT,
            confirmedAt: new Date()
        }
    });

    res.status(200).json({
        success: true,
        message: 'File upload confirmed',
        data: serializeBigInt(updatedFile)
    });
});

export const cancelUpload = asyncHandler(async (req, res) => {
    const { fileId } = req.params;
    const userId = req.user.id;

    try {
        const [deleteResult] = await prisma.$transaction([
            prisma.file.deleteMany({
                where: {
                    AND: [
                        { id: fileId },
                        { userId: userId },
                        { status: UPLOAD_STATES.TEMPORARY },
                        { deletedAt: null }
                    ]
                }
            }),
            
            prisma.file.findFirst({
                where: { id: fileId },
                select: { cloudinaryId: true }
            })
        ]);

        if (deleteResult.count === 0) {
            throw new ApiError(404, 'Temporary file not found');
        }

        if (deleteResult.cloudinaryId) {
            deleteFromCloudinary(deleteResult.cloudinaryId).catch(error => {
                console.error('Cloudinary cleanup failed:', {
                    fileId,
                    cloudinaryId: deleteResult.cloudinaryId,
                    error: error.message
                });
            });
        }

        res.status(200).json({
            success: true,
            message: 'File upload cancelled and cleaned up'
        });

    } catch (error) {
        console.error('Cancel upload error:', {
            fileId,
            error: error.message
        });

        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(500, 'Failed to cancel upload');
    }
});
