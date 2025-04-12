import prisma from '../../utils/database/prisma.js';
import ApiError from '../../utils/error/api.error.js';
import asyncHandler from '../../utils/middleware/async.handler.js';
import { deleteFromCloudinary } from '../../config/cloudinary.js';
import { serializeBigInt } from '../../utils/serializers/data.serializer.js';
import { generateTransformedUrls } from '../../utils/transformations/media.transformations.js';

// ============================================================
// File Management Controllers
// ============================================================


/**
 * @description Get all files with visibility handling
 */
export const getFiles = asyncHandler(async (req, res) => {
    const {
        category,
        type,
        visibility,
        page = 1,
        limit = 1000,
        sortBy = 'createdAt',
        order = 'desc',
        search
    } = req.query;

    // Base where clause
    const where = {
        deletedAt: null,
        status: 'PERMANENT'
    };

    // Handle visibility based on authentication
    if (req.user?.id) {
        // Authenticated user can see:
        // 1. All public files
        // 2. Their own private files
        where.OR = [
            { visibility: 'PUBLIC' },
            {
                AND: [
                    { userId: req.user.id },
                    { visibility: 'PRIVATE' }
                ]
            }
        ];
    } else {
        // Unauthenticated user can only see public files
        where.visibility = 'PUBLIC';
    }

    // Add other filters
    if (category) where.fileCategory = category;
    if (type) where.fileType = type;
    if (search) {
        where.AND = where.AND || [];
        where.AND.push({
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ]
        });
    }

    try {
        const [files, total] = await prisma.$transaction([
            prisma.file.findMany({
                where,
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                orderBy: { [sortBy]: order },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true
                        }
                    }
                }
            }),
            prisma.file.count({ where })
        ]);

        // Transform files to include URLs for different sizes
        const transformedFiles = files.map(file => ({
            ...file,
            urls: file.fileType === 'IMAGE' ?
                generateTransformedUrls(file.url, file.fileType) :
                { original: file.url }
        }));

        res.status(200).json({
            success: true,
            data: {
                files: serializeBigInt(transformedFiles),
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
            }
        });
    } catch (error) {
        throw new ApiError(500, 'Error retrieving files: ' + error.message);
    }
});

/**
 * @description Get a single file with visibility handling
 */
export const getFileById = asyncHandler(async (req, res) => {
    const { fileId } = req.params;
    const userId = req.user?.id;

    try {
        const file = await prisma.file.findFirst({
            where: {
                id: fileId,
                deletedAt: null,
                status: 'PERMANENT',
                OR: [
                    { visibility: 'PUBLIC' },
                    {
                        AND: [
                            { userId: userId },
                            { visibility: 'PRIVATE' }
                        ]
                    }
                ]
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                        avatarThumb: true
                    }
                },
    
                    reactions: {
                        where: { userId },
                        select: {
                            type: true,
                            createdAt: true
                        }
                    },
                    comments: {
                        take: 10,
                        orderBy: { createdAt: 'desc' },
                        select: {
                            id: true,
                            content: true,
                            createdAt: true,
                            user: {
                                select: {
                                    id: true,
                                    username: true,
                                    firstName: true,
                                    lastName: true,
                                    avatar: true,
                                    avatarThumb: true
                                }
                            }
                        }
                    
                }
            }
        });

        if (!file) {
            throw new ApiError(404, 'File not found or access denied');
        }

        // If file is private and user is not authenticated
        if (file.visibility === 'PRIVATE' && !userId) {
            throw new ApiError(401, 'Authentication required to access this file');
        }

        // If file is private and user is not the owner
        if (file.visibility === 'PRIVATE' && file.userId !== userId) {
            throw new ApiError(403, 'Access denied');
        }

        const fileWithUrls = {
            ...file,
            urls: file.fileType === 'IMAGE' ?
                generateTransformedUrls(file.url, file.fileType) :
                { original: file.url }
        };

        // Increment view count if viewer is not the owner
        if (!userId || file.userId !== userId) {
            prisma.file.update({
                where: { id: fileId },
                data: { viewCount: { increment: 1 } }
            }).catch(error => {
                console.error('Failed to increment view count:', error);
            });
        }

        res.status(200).json({
            success: true,
            data: serializeBigInt(fileWithUrls)
        });
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, 'Error retrieving file: ' + error.message);
    }
});

/**
 * @description Delete a file by ID
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @route DELETE /api/v1/files/:fileId
 * @access Private
 */
export const deleteFile = asyncHandler(async (req, res) => {
    const { fileId } = req.params;

    // Check if file exists and belongs to user
    const file = await prisma.file.findFirst({
        where: {
            id: fileId,
            userId: req.user.id,
            deletedAt: null
        }
    });

    if (!file) {
        throw new ApiError(404, 'File not found');
    }

    // Soft delete the file
    await prisma.$transaction(async (tx) => {
        // Check if storage record exists for the user
        const storageRecord = await tx.storage.findUnique({
            where: { userId: req.user.id }
        });

        if (storageRecord) {
            // Update storage usage if record exists
            await tx.storage.update({
                where: { userId: req.user.id },
                data: {
                    usedSpace: {
                        decrement: file.size
                    }
                }
            });
        } else {
            // Create storage record if it doesn't exist
            await tx.storage.create({
                data: {
                    userId: req.user.id,
                    usedSpace: 0, // Start with 0 since we're deleting a file
                    maxSpace: 1073741824 // Default 1GB in bytes
                }
            });
        }

        // Soft delete the file
        await tx.file.update({
            where: { id: fileId },
            data: { deletedAt: new Date() }
        });

        // Delete from Cloudinary
        if (file.cloudinaryId) {
            await deleteFromCloudinary(file.cloudinaryId);
        }
    });

    res.status(200).json({
        success: true,
        message: 'File deleted successfully'
    });
});

/**
 * @description Update a file's privacy settings
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @route PUT /api/v1/files/:fileId
 * @access Private      
 */
export const updateFilePrivacy = asyncHandler(async (req, res) => {
    const { fileId } = req.params;
    const userId = req.user.id;
    const {
        visibility,
        allowComments,
        allowSharing,
        allowDownload,
        customAudience
    } = req.body;

    const file = await prisma.file.findFirst({
        where: { id: fileId, userId }
    });

    if (!file) {
        throw new ApiError(404, 'File not found');
    }

    const updatedFile = await prisma.file.update({
        where: { id: fileId },
        data: {
            visibility,
            allowComments,
            allowSharing,
            allowDownload,
            customAudience,
            privacySettings: {
                allowComments,
                allowSharing,
                allowDownload,
                customAudience
            }
        }
    });

    // Log privacy change
    await prisma.fileHistory.create({
        data: {
            fileId,
            userId,
            action: 'VISIBILITY_CHANGED',
            oldValue: file.visibility,
            newValue: visibility
        }
    });

    res.json({
        success: true,
        message: 'File privacy updated successfully',
        data: updatedFile
    });
});

/**
 * @description Update a file
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @route PUT /api/v1/files/:fileId
 * @access Private
 */
export const updateFile = asyncHandler(async (req, res) => {
    const { fileId } = req.params;
    const {
        title,
        description,
        visibility,
        allowComments,
        allowSharing,
        allowDownload,
        customAudience,
        fileCategory
    } = req.body;

    // Check if file exists and belongs to user
    const existingFile = await prisma.file.findFirst({
        where: {
            id: fileId,
            userId: req.user.id,
            deletedAt: null
        }
    });

    if (!existingFile) {
        throw new ApiError(404, 'File not found');
    }

    // Validate fileCategory
    const validateFileCategory = (category) => {
        return Object.values(FileCategory).includes(category)
            ? category
            : existingFile.fileCategory;
    };

    // Update file
    const updatedFile = await prisma.file.update({
        where: { id: fileId },
        data: {
            title: title || existingFile.title,
            description: description || existingFile.description,
            visibility: visibility || existingFile.visibility,
            allowComments: allowComments !== undefined ? allowComments : existingFile.allowComments,
            allowSharing: allowSharing !== undefined ? allowSharing : existingFile.allowSharing,
            allowDownload: allowDownload !== undefined ? allowDownload : existingFile.allowDownload,
            customAudience: customAudience || existingFile.customAudience,
            fileCategory: validateFileCategory(fileCategory), // Validate the enum
            editedAt: new Date(),
            privacySettings: {
                allowComments: allowComments !== undefined ? allowComments : existingFile.allowComments,
                allowSharing: allowSharing !== undefined ? allowSharing : existingFile.allowSharing,
                allowDownload: allowDownload !== undefined ? allowDownload : existingFile.allowDownload,
                customAudience: customAudience || existingFile.customAudience
            }
        }
    });

    const serializedFile = serializeBigInt(updatedFile);

    res.status(200).json({
        success: true,
        message: 'File updated successfully',
        data: serializedFile
    });
});

// ============================================================
// File Optimization Controllers
// ============================================================

/**
 * @description Optimize an image file
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @route POST /api/v1/files/optimize
 * @access Private
 */
export const optimizeFile = asyncHandler(async (req, res) => {
    const file = req.file;
    const { quality = IMAGE_OPTIMIZATION.QUALITY.MEDIUM } = req.body;

    if (!file) {
        throw new ApiError(400, 'No image file provided');
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.itype)) {
        throw new ApiError(400, 'Invalid image format');
    }

    const optimizedImage = await sharp(file.path)
        .jpeg({ quality })
        .toBuffer();

    res.json({
        success: true,
        message: 'File optimized successfully',
        data: {
            optimizedImage: optimizedImage.toString('base64'),
            originalSize: file.size,
            optimizedSize: optimizedImage.length
        }
    });
});

/**
 * @description Resize an image file
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @route POST /api/v1/files/resize
 * @access Private
 */
export const resizeImage = asyncHandler(async (req, res) => {
    const file = req.file;
    const { width, height, fit = 'cover' } = req.body;

    if (!file) {
        throw new ApiError(400, 'No image file provided');
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.itype)) {
        throw new ApiError(400, 'Invalid image format');
    }

    const resizedImage = await sharp(file.path)
        .resize(width, height, { fit })
        .toBuffer();

    res.json({
        success: true,
        message: 'Image resized successfully',
        data: {
            resizedImage: resizedImage.toString('base64'),
            dimensions: { width, height }
        }
    });
});

// ============================================================
// File Streaming and Download Controllers
// ============================================================

/**
 * @description Stream a media file
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @route GET /api/v1/files/stream/:fileId
 * @access Private
 */
export const streamMedia = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { fileId } = req.params;

    const file = await prisma.file.findFirst({
        where: {
            id: fileId,
            userId,
            deletedAt: null
        }
    });

    if (!file) {
        throw new ApiError(404, 'File not found');
    }

    // Implement streaming logic here
    // This is a placeholder - you'll need to implement actual streaming
    res.redirect(file.url);
});

/**
 * @description Download a file
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @route GET /api/v1/files/download/:fileId
 * @access Private
 */
export const downloadFile = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { fileId } = req.params;

    const file = await prisma.file.findFirst({
        where: {
            id: fileId,
            userId,
            deletedAt: null
        }
    });

    if (!file) {
        throw new ApiError(404, 'File not found');
    }

    // Log download activity
    await prisma.userActivityLog.create({
        data: {
            userId,
            activityType: 'FILE_DOWNLOAD',
            description: `Downloaded file: ${file.name}`,
            metadata: { fileId, fileType: file.type }
        }
    });

    // Redirect to download URL
    res.redirect(file.url);
});

// ============================================================
// File Interaction Controllers
// ============================================================

/**
 * @description React to a file
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @route POST /api/v1/media/files/react/:fileId
 * @access Private
 */
export const reactFile = asyncHandler(async (req, res) => {
    const { fileId } = req.params;
    const userId = req.user.id;
    const { type = 'LIKE' } = req.body;

    // Validate reaction type
    if (!Object.values(ReactionType).includes(type)) {
        throw new ApiError(400, `Invalid reaction type. Must be one of: ${Object.values(ReactionType).join(', ')}`);
    }

    // Check if file exists and is accessible
    const file = await prisma.file.findFirst({
        where: {
            id: fileId,
            deletedAt: null,
            OR: [
                { userId: req.user.id },
                { visibility: 'PUBLIC' },
                { visibility: 'PRIVATE', userId: req.user.id }
            ]
        },
        select: {
            id: true,
            userId: true,
            visibility: true,
            allowComments: true,
            allowSharing: true,
            reactionCount: true,
            _count: {
                select: {
                    reactions: true
                }
            }
        }
    });

    if (!file) {
        throw new ApiError(404, 'File not found or not accessible');
    }

    try {
        // Check for existing reaction
        const existingReaction = await prisma.reaction.findUnique({
            where: {
                userId_fileId: {
                    userId: userId,
                    fileId: fileId
                }
            }
        });

        let reaction;

        if (existingReaction) {
            if (existingReaction.type === type) {
                // Remove reaction if same type
                await prisma.reaction.delete({
                    where: {
                        userId_fileId: {
                            userId: userId,
                            fileId: fileId
                        }
                    }
                });

                // Update reaction count
                await prisma.file.update({
                    where: { id: fileId },
                    data: {
                        reactionCount: {
                            decrement: 1
                        }
                    }
                });

                return res.status(200).json({
                    success: true,
                    message: 'Reaction removed successfully',
                    data: {
                        reactionRemoved: true,
                        type: type
                    }
                });
            } else {
                // Update reaction type if different
                reaction = await prisma.reaction.update({
                    where: {
                        userId_fileId: {
                            userId: userId,
                            fileId: fileId
                        }
                    },
                    data: {
                        type: type
                    }
                });
            }
        } else {
            // Create new reaction
            reaction = await prisma.reaction.create({
                data: {
                    userId: userId,
                    fileId: fileId,
                    type: type
                }
            });

            // Update reaction count
            await prisma.file.update({
                where: { id: fileId },
                data: {
                    reactionCount: {
                        increment: 1
                    }
                }
            });
        }

        // Get updated reaction count
        const updatedFile = await prisma.file.findUnique({
            where: { id: fileId },
            select: {
                reactionCount: true,
                _count: {
                    select: {
                        reactions: true
                    }
                }
            }
        });

        const serializedReaction = serializeBigInt(reaction);
        const serializedCounts = serializeBigInt(updatedFile);

        res.status(200).json({
            success: true,
            message: existingReaction ? 'Reaction updated successfully' : 'Reaction added successfully',
            data: {
                reaction: serializedReaction,
                counts: serializedCounts
            }
        });
    } catch (error) {
        console.error('Reaction error:', error);
        throw new ApiError(500, 'Failed to process reaction');
    }
});

/**
 * @description Comment on a file
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @route POST /api/v1/media/files/comment/:fileId
 * @access Private
 */
export const commentOnFile = asyncHandler(async (req, res) => {
    const { fileId } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, 'Comment content is required');
    }

    // Check if file exists and is accessible
    const file = await prisma.file.findFirst({
        where: {
            id: fileId,
            deletedAt: null,
            OR: [
                { userId: req.user.id },
                { visibility: 'PUBLIC' },
                { visibility: 'PRIVATE', userId: req.user.id }
            ]
        }
    });

    if (!file) {
        throw new ApiError(404, 'File not found or not accessible');
    }

    if (!file.allowComments) {
        throw new ApiError(403, 'Comments are not allowed on this file');
    }

    try {
        // Create comment using a transaction
        const [comment, _] = await prisma.$transaction([
            // Create the comment
            prisma.comment.create({
                data: {
                    fileId,
                    imageId: fileId, // Required by schema
                    userId,
                    content
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                            avatarThumb: true
                        }
                    }
                }
            }),
            // Update comment count
            prisma.file.update({
                where: { id: fileId },
                data: {
                    commentCount: { increment: 1 }
                }
            })
        ]);

        const serializedComment = serializeBigInt(comment);

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: serializedComment
        });
    } catch (error) {
        console.error('Comment error:', error);
        throw new ApiError(500, 'Failed to add comment');
    }
});

/**
 * @description Share a file
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @route POST /api/v1/media/files/share/:fileId
 * @access Private
 */
export const shareFile = asyncHandler(async (req, res) => {
    const { fileId } = req.params;
    const userId = req.user.id;
    const {
        sharedWith,
        shareType = 'DIRECT',
        message,
        visibility = 'PRIVATE',
        permissions = {},
        expiresAt
    } = req.body;

    if (!sharedWith) {
        throw new ApiError(400, 'SharedWith user ID is required');
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
        where: { id: sharedWith }
    });

    if (!targetUser) {
        throw new ApiError(404, 'User to share with not found');
    }

    // Check if file exists and is accessible
    const file = await prisma.file.findFirst({
        where: {
            id: fileId,
            deletedAt: null,
            OR: [
                { userId: req.user.id },
                { visibility: 'PUBLIC' },
                { visibility: 'PRIVATE', userId: req.user.id }
            ]
        }
    });

    if (!file) {
        throw new ApiError(404, 'File not found or not accessible');
    }

    if (!file.allowSharing) {
        throw new ApiError(403, 'Sharing is not allowed for this file');
    }

    try {
        // Create share using a transaction
        const [share, updatedFile] = await prisma.$transaction([
            // Create the share
            prisma.share.create({
                data: {
                    fileId,
                    sharedBy: userId,
                    sharedWith,
                    shareType,
                    message: message || null,
                    visibility,
                    permissions,
                    expiresAt: expiresAt ? new Date(expiresAt) : null,
                    sharedAt: new Date()
                },
                include: {
                    sharedByUser: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                            avatarThumb: true
                        }
                    },
                    sharedWithUser: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                            avatarThumb: true
                        }
                    }
                }
            }),
            // Update share count
            prisma.file.update({
                where: { id: fileId },
                data: {
                    shareCount: { increment: 1 }
                },
                select: {
                    shareCount: true
                }
            })
        ]);

        const serializedShare = serializeBigInt(share);
        const serializedFile = serializeBigInt(updatedFile);

        res.status(201).json({
            success: true,
            message: 'File shared successfully',
            data: {
                share: serializedShare,
                shareCount: serializedFile.shareCount
            }
        });
    } catch (error) {
        console.error('Share error:', error);
        if (error.code === 'P2002') {
            throw new ApiError(400, 'File already shared with this user');
        }
        throw new ApiError(500, 'Failed to share file');
    }
});

// ============================================================
// Legacy Image Controllers (Consider Deprecating)
// ============================================================

/**
 * @description Get all images for a user
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @route GET /api/v1/images
 * @access Private
 */
export const getImages = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { type, visibility, page = 1, limit = 10 } = req.query;

    const where = { userId };
    if (type) where.fileType = type;
    if (visibility) where.visibility = visibility;

    const images = await prisma.file.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.file.count({ where });

    // Serialize the response data
    const serializedImages = serializeBigInt(images);

    res.json({
        status: 'success',
        data: {
            images: serializedImages,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        }
    });
});

/**
 * @description Get an image by ID
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @route GET /api/v1/images/:imageId
 * @access Private
 */
export const getImageById = asyncHandler(async (req, res) => {
    const { imageId } = req.params;
    const userId = req.user.id;

    const image = await prisma.file.findFirst({
        where: {
            id: imageId,
            OR: [
                { userId },
                { visibility: 'PUBLIC' },
                {
                    visibility: 'FRIENDS',
                    user: {
                        friends: {
                            some: { friendId: userId }
                        }
                    }
                }
            ]
        },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    avatarThumb: true
                }
            },
            likes: {
                select: {
                    userId: true
                }
            },
            comments: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            profileImage: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 10
            }
        }
    });

    if (!image) {
        throw new ApiError(404, 'Image not found');
    }

    // Increment view count
    await prisma.file.update({
        where: { id: imageId },
        data: { viewCount: { increment: 1 } }
    });

    res.json({
        status: 'success',
        message: 'Image fetched successfully',
        data: image
    });
});

// Get files by category
export const getFilesByCategory = asyncHandler(async (req, res) => {
    const { category } = req.params;
    const { 
        page = 1,
        limit = 1000
     } = req.query;

    const where = {
        fileCategory: category,
        deletedAt: null,
        OR: [
            { visibility: 'PUBLIC' },
            { userId: req.user?.id }
        ]
    };

    const files = await prisma.file.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    avatar: true
                }
            }
        }
    });

    const total = await prisma.file.count({ where });

    res.status(200).json({
        success: true,
        data: {
            files: serializeBigInt(files),
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        }
    });
});

// Get files by type
export const getFilesByType = asyncHandler(async (req, res) => {
    const { fileType } = req.params;
    const {
        page = 1,
        limit = 1000
    } = req.query;

    const where = {
        fileType,
        deletedAt: null,
        OR: [
            { visibility: 'PUBLIC' },
            { userId: req.user?.id }
        ]
    };

    const files = await prisma.file.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    avatar: true
                }
            }
        }
    });

    const total = await prisma.file.count({ where });

    res.status(200).json({
        success: true,
        data: {
            files: serializeBigInt(files),
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        }
    });
});
