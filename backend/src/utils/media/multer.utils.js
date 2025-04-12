import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import ApiError from '../error/api.error.js';
import {
    ALLOWED_FILE_TYPES,
    FILE_SIZE_LIMITS,
    ALLOWED_IMAGE_TYPES,
    ALLOWED_VIDEO_TYPES,
    ALLOWED_AUDIO_TYPES,
    ALLOWED_DOCUMENT_TYPES,
    FILE_TYPE_CATEGORIES
} from '../../constants/media.constants.js';
import { UPLOAD_FOLDER } from '../../constants/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_FOLDER);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// Get file type category and size limit
const getFileTypeInfo = (mimetype) => {
    if (ALLOWED_IMAGE_TYPES.includes(mimetype)) {
        return { category: FILE_TYPE_CATEGORIES.IMAGE, sizeLimit: FILE_SIZE_LIMITS.IMAGE };
    }
    if (ALLOWED_VIDEO_TYPES.includes(mimetype)) {
        return { category: FILE_TYPE_CATEGORIES.VIDEO, sizeLimit: FILE_SIZE_LIMITS.VIDEO };
    }
    if (ALLOWED_AUDIO_TYPES.includes(mimetype)) {
        return { category: FILE_TYPE_CATEGORIES.AUDIO, sizeLimit: FILE_SIZE_LIMITS.AUDIO };
    }
    if (ALLOWED_DOCUMENT_TYPES.includes(mimetype)) {
        return { category: FILE_TYPE_CATEGORIES.DOCUMENT, sizeLimit: FILE_SIZE_LIMITS.DOCUMENT };
    }
    return { category: null, sizeLimit: FILE_SIZE_LIMITS.DEFAULT };
};

// File filter function
const fileFilter = (req, file, cb) => {
    if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
        return cb(new Error(`Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.map(type => type.split('/')[1].toUpperCase()).join(', ')}`), false);
    }

    const { category, sizeLimit } = getFileTypeInfo(file.mimetype);

    // Attach file type info to the request for later use
    if (!req.fileTypeInfo) {
        req.fileTypeInfo = {};
    }
    req.fileTypeInfo[file.fieldname] = { category, sizeLimit };

    cb(null, true);
};

// Create multer upload middleware
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: FILE_SIZE_LIMITS.VIDEO // Set to largest possible file size
    }
});

// Export helper functions
export const getFileCategory = (mimetype) => getFileTypeInfo(mimetype).category;
export const getFileSizeLimit = (mimetype) => getFileTypeInfo(mimetype).sizeLimit;



// Error handler middleware for multer errors
export const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            next(new ApiError(400, `File too large. Maximum size is ${FILE_SIZE_LIMITS.IMAGE / (1024 * 1024)}MB`));
            return;
        }
        next(new ApiError(400, err.message));
        return;
    }
    if (err instanceof ApiError) {
        next(err);
        return;
    }
    next(new ApiError(400, 'File upload error'));
};

export default {
    upload,
    getFileCategory,
    getFileSizeLimit,
    handleMulterError
};