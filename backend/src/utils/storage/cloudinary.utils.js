import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_FOLDERS } from '../../constants/media.constants.js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Generate a unique folder path for uploads
 */
const generateFolderPath = (userId, type) => {
    const baseFolder = CLOUDINARY_FOLDERS.BASE;
    const typeFolder = CLOUDINARY_FOLDERS[type.toUpperCase()] || 'misc';
    return `${baseFolder}/${userId}/${typeFolder}`;
};

/**
 * Upload file to Cloudinary
 */
export const uploadToCloudinary = async (filePath, userId, type = 'POST', options = {}) => {
    try {
        const folder = generateFolderPath(userId, type);
        const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;

        const uploadOptions = {
            folder,
            public_id: uniqueFilename,
            resource_type: 'auto',
            ...options
        };

        // Upload the file
        const result = await cloudinary.uploader.upload(filePath, uploadOptions);

        // Delete the local file after upload
        fs.unlinkSync(filePath);

        return {
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            resourceType: result.resource_type,
            width: result.width,
            height: result.height,
            size: result.bytes,
            createdAt: result.created_at,
            metadata: result
        };
    } catch (error) {
        // Delete the local file in case of error
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload file to Cloudinary');
    }
};

/**
 * Delete file from Cloudinary
 */
export const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result.result === 'ok';
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error('Failed to delete file from Cloudinary');
    }
};

/**
 * Create transformation URL
 */
export const createTransformationUrl = (url, options = {}) => {
    return cloudinary.url(url, options);
};

/**
 * Get Cloudinary resource info
 * @param {string} publicId - Public ID of the resource
 * @returns {Promise} Resource information
 */
export const getResourceInfo = async (publicId) => {
    try {
        const result = await cloudinary.api.resource(publicId);
        return result;
    } catch (error) {
        console.error('Error getting resource info:', error);
        throw error;
    }
};

/**
 * Generate Cloudinary URL with transformations
 * @param {string} publicId - Public ID of the image
 * @param {Object} options - Transformation options
 * @returns {string} Transformed URL
 */
export const generateUrl = (publicId, options = {}) => {
    return cloudinary.url(publicId, {
        secure: true,
        ...options
    });
};

/**
 * Create Cloudinary upload signature
 * @param {Object} params - Parameters to sign
 * @returns {string} Upload signature
 */
export const createUploadSignature = (params = {}) => {
    const timestamp = Math.round(new Date().getTime() / 1000);
    return cloudinary.utils.api_sign_request(
        { timestamp, ...params },
        process.env.CLOUDINARY_API_SECRET
    );
};

export default {
    uploadToCloudinary,
    deleteFromCloudinary,
    getResourceInfo,
    generateUrl,
    createUploadSignature,
    createTransformationUrl
}; 