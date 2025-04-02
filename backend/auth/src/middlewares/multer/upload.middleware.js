import multer from "multer";
import { ALLOWED_IMAGE_TYPES, ALLOWED_OTHER_TYPES } from "../../constants/index.js";
import { IMAGE_OPTIMIZATION } from "../../constants/media.constants.js";
import ApiError from "../../utils/error/api.error.js";
import { upload } from '../../config/cloudinary.js';
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from 'uuid';
import logger from "../../utils/logger/logger.js";

//importing constants
import { 
    FILE_SIZE_LIMIT,
    UPLOAD_FOLDER,
} from "../../constants/index.js";

// Use memory storage for all uploads
const storage = multer.memoryStorage();

// File size formatter
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Enhanced file filter with detailed error messages
const fileFilter = (req, file, cb) => {
    try {
        // Check if any file was provided
        if (!file) {
            return cb(new ApiError(400, 'No file provided'));
        }

        // Check file type
        if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
            return cb(
                new ApiError(400, 
                    `Invalid file type. Allowed types are: ${ALLOWED_IMAGE_TYPES.join(', ')}`
                )
            );
        }

        // Check file size
        if (file.size > FILE_SIZE_LIMIT) {
            return cb(
                new ApiError(400,
                    `File too large. Maximum size is ${formatFileSize(FILE_SIZE_LIMIT)}`
                )
            );
        }

        cb(null, true);
    } catch (error) {
        cb(error);
    }
};

// Multer error handler
const multerErrorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: `File too large. Maximum size is ${formatFileSize(FILE_SIZE_LIMIT)}`
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next(err);
};

// Configure multer with error handling
const uploadImages = multer({
    storage: storage,
    limits: {
        fileSize: IMAGE_OPTIMIZATION.MAX_SIZE,
        files: 1 // Limit to 1 file per request
    },
    fileFilter
}).single('image');

// Profile image upload middleware
export const uploadProfileImage = (req, res, next) => {
    uploadImages(req, res, (err) => {
        if (err) {
            return multerErrorHandler(err, req, res, next);
        }
        
        // Validate if file exists after successful upload
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an image file'
            });
        }

        next();
    });
};

// Create multer instance for other files
export const uploadFiles = multer({
    storage: storage,
    limits: { fileSize: FILE_SIZE_LIMIT }, 
    fileFilter
});

// Optimization settings for uploads
const OPTIMIZATION_OPTIONS = {
    fetch_format: 'auto',
    quality: 'auto',
    transformation: [
        { width: 'auto', crop: 'scale' }
    ]
};

// Wrapper function for handling multer upload
const handleUpload = (req, res, next) => {
    uploadImages(req, res, (err) => {
        if (err) {
            return multerErrorHandler(err, req, res, next);
        }
        
        // Validate if file exists after successful upload
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an image file'
            });
        }

        next();
    });
};

// Optimized file upload middleware
export const handleFileUpload = (req, res, next) => {
    const upload = multer({
        storage: multer.memoryStorage(),
        limits: {
            fileSize: FILE_SIZE_LIMIT,
            // files: 1 // Limit to single file for better performance
        },
        fileFilter: (req, file, cb) => {
            // Quick validation
            if (!file || !ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
                cb(new ApiError(400, 'Invalid file type'));
                return;
            }
            cb(null, true);
        }
    }).single('file');

    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file'
            });
        }
        next();
    });
};

// Add this function for handling multiple file uploads
export const handleMultipleFileUpload = (req, res, next) => {
    const upload = multer({
        storage: multer.memoryStorage(),
        limits: {
            fileSize: FILE_SIZE_LIMIT,
            files: 10 // Allow up to 10 files
        },
        fileFilter: (req, file, cb) => {
            if (!file || !ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
                cb(new ApiError(400, 'Invalid file type'));
                return;
            }
            cb(null, true);
        }
    }).array('files', 10);

    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please upload files'
            });
        }
        next();
    });
};

export { handleUpload };

export default { 
    uploadImages, 
    uploadFiles,
    uploadProfileImage,
    handleFileUpload,
    handleMultipleFileUpload
};
