import { body, param, check } from 'express-validator';
import { validateRequest } from '../middlewares/validation/validate.middleware.js';
import { 
    ALLOWED_FILE_TYPES, 
    MAX_FILE_SIZE, 
    ALLOWED_IMAGE_TYPES, 
    ALLOWED_VIDEO_TYPES, 
    ALLOWED_DOCUMENT_TYPES,
    FILE_SIZE_LIMITS 
} from '../constants/media.constants.js';
import { FileType, FileCategory, VisibilityType } from '@prisma/client';

// Validate file upload
export const validateUpload = [
    body('type')
        .optional()
        .isIn(['image', 'document', 'video', 'audio'])
        .withMessage('Invalid file type'),
    
    // Custom validation for the file itself
    (req, res, next) => {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const file = req.file;
        
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            return res.status(400).json({
                success: false,
                message: `File size exceeds limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`
            });
        }

        // Check file type
        if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
            return res.status(400).json({
                success: false,
                message: 'File type not allowed'
            });
        }

        next();
    },
    validateRequest
];

// Validate image processing parameters
export const validateImageProcessing = [
    body('width')
        .optional()
        .isInt({ min: 1, max: 4096 })
        .withMessage('Width must be between 1 and 4096 pixels'),
    
    body('height')
        .optional()
        .isInt({ min: 1, max: 4096 })
        .withMessage('Height must be between 1 and 4096 pixels'),
    
    body('quality')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Quality must be between 1 and 100'),
    
    body('format')
        .optional()
        .isIn(['jpeg', 'png', 'webp', 'avif'])
        .withMessage('Invalid image format'),
    
    validateRequest
];

// Validate file ID parameter
export const validateFileId = [
    param('fileId')
        .isUUID()
        .withMessage('Invalid file ID'),
    validateRequest
];

// Validate file deletion
export const validateFileDeletion = [
    param('fileId')
        .isUUID()
        .withMessage('Invalid file ID'),
    
    // Custom validation to check file ownership
    async (req, res, next) => {
        const fileId = req.params.fileId;
        const userId = req.user.id;

        const file = await prisma.file.findUnique({
            where: { id: fileId },
            select: { userId: true }
        });

        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        if (file.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this file'
            });
        }

        next();
    },
    validateRequest
];

// Validate image upload
export const validateImageUpload = [
    body('fileType')
        .isIn(Object.values(FileType))
        .withMessage(`File type must be one of: ${Object.values(FileType).join(', ')}`),
    
    body('fileCategory')
        .isIn(Object.values(FileCategory))
        .withMessage(`File category must be one of: ${Object.values(FileCategory).join(', ')}`),
    
    body('visibility')
        .optional()
        .isIn(Object.values(VisibilityType))
        .withMessage(`Visibility must be one of: ${Object.values(VisibilityType).join(', ')}`),
    
    body('title')
        .optional()
        .isString()
        .trim()
        .isLength({ max: 255 })
        .withMessage('Title must be less than 255 characters'),
    
    body('description')
        .optional()
        .isString()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description must be less than 1000 characters'),
    
    body('allowComments')
        .optional()
        .isBoolean()
        .withMessage('allowComments must be a boolean'),
    
    body('allowSharing')
        .optional()
        .isBoolean()
        .withMessage('allowSharing must be a boolean'),
    
    body('allowDownload')
        .optional()
        .isBoolean()
        .withMessage('allowDownload must be a boolean'),
    
    body('customAudience')
        .optional()
        .isString()
        .trim()
        .isLength({ max: 500 })
        .withMessage('customAudience must be less than 500 characters')
];

// Validate file type
export const validateFileType = (file, allowedTypes) => {
    return allowedTypes.includes(file.mimetype);
};

// Validate file size
export const validateFileSize = (file, type) => {
    const limit = FILE_SIZE_LIMITS[type];
    return file.size <= limit;
};

// Get file type
export const getFileType = (mimetype) => {
    if (ALLOWED_IMAGE_TYPES.includes(mimetype)) return 'IMAGE';
    if (ALLOWED_VIDEO_TYPES.includes(mimetype)) return 'VIDEO';
    if (ALLOWED_DOCUMENT_TYPES.includes(mimetype)) return 'DOCUMENT';
    return null;
};

export const uploadImageValidation = [
    body('imageType')
        .optional()
        .trim()
        .isIn(['GALLERY', 'PROFILE', 'COVER'])
        .withMessage('Invalid image type'),
    
    body('visibility')
        .optional()
        .trim()
        .isIn(['PUBLIC', 'PRIVATE', 'FRIENDS'])
        .withMessage('Invalid visibility option'),
    
    body('title')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Title must be less than 100 characters'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must be less than 500 characters'),
    
    body('allowComments')
        .optional()
        .isBoolean()
        .withMessage('allowComments must be a boolean'),
    
    body('allowSharing')
        .optional()
        .isBoolean()
        .withMessage('allowSharing must be a boolean'),
    
    body('allowDownload')
        .optional()
        .isBoolean()
        .withMessage('allowDownload must be a boolean')
];

export default {
    validateUpload,
    validateImageProcessing,
    validateFileId,
    validateFileDeletion,
    validateImageUpload,
    validateFileType,
    validateFileSize,
    getFileType,
    uploadImageValidation
}; 