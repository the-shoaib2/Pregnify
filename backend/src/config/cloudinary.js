import { v2 as cloudinary } from "cloudinary";
import { FILE_SIZE_LIMIT, ALLOWED_IMAGE_TYPES } from '../constants/index.js';
import multer from 'multer';

// Configure Cloudinary with better performance settings
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
    keepAlive: true // Enable connection pooling
});

// Use memory storage instead of disk storage
const storage = multer.memoryStorage();

// Optimized upload function with performance improvements
export const uploadOnCloudinary = async (file, folderPath, resourceType = 'auto', options = {}) => {
    try {
        if (!file) throw new Error('No file provided');

        // Get buffer efficiently
        const buffer = file.buffer || (file instanceof Buffer ? file : null);
        if (!buffer) throw new Error('Invalid file format');

        // Optimize upload options
        const uploadOptions = {
            resource_type: resourceType,
            folder: folderPath,
            unique_filename: true,
            overwrite: true, // Faster than checking existence
            invalidate: true,
            fetch_format: 'auto',
            quality: 'auto:good', // Balance between quality and speed
            transformation: [
                { width: 'auto', crop: 'limit' } // Faster than scale
            ],
            ...options
        };

        // Use Promise.race to implement timeout
        const uploadPromise = new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                uploadOptions,
                (error, result) => error ? reject(error) : resolve(result)
            );
            uploadStream.end(buffer);
        });

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Upload timeout')), 30000)
        );

        return Promise.race([uploadPromise, timeoutPromise]);
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
};

// Create multer upload middleware with memory storage
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: FILE_SIZE_LIMIT
    },
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
            return cb(new Error(`Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`), false);
        }
        cb(null, true);
    }
});

export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    if (!publicId) return null;
    
    try {
        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
            invalidate: true
        });
        return response;
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error(`Failed to delete from Cloudinary: ${error.message}`);
    }
};

export const getOptimizedUrl = (publicId, options = {}) => {
    if (!publicId) return null;

    const defaultOptions = {
        quality: "auto",
        fetch_format: "auto",
        secure: true
    };

    return cloudinary.url(publicId, {
        ...defaultOptions,
        ...options
    });
};

export default {
    uploadOnCloudinary,
    deleteFromCloudinary,
    getOptimizedUrl,
    upload
};
