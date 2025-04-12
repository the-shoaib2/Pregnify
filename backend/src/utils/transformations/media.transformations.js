import { CLOUDINARY_TRANSFORMATIONS } from '../../constants/media.constants.js';

// Default transformation settings for different sizes
const defaultTransformations = {
    thumbnail: 'c_thumb,w_200,h_200',  // Square thumbnail 200x200px
    small: 'c_scale,w_400',            // Width 400px
    medium: 'c_scale,w_800',           // Width 800px
    large: 'c_scale,w_1200'            // Width 1200px
};

/**
 * Generates transformed URLs for different image sizes using Cloudinary
 * @param {string} baseUrl - The original Cloudinary URL
 * @param {string} type - The file type (e.g., 'IMAGE', 'VIDEO')
 * @returns {Object} Object containing URLs for different sizes
 */
export const generateTransformedUrls = (baseUrl, type) => {
    try {
        // Use type-specific transformations if available, otherwise use defaults
        const transformations = CLOUDINARY_TRANSFORMATIONS[type] || defaultTransformations;
        const urls = {
            original: baseUrl  // Always include the original URL
        };

        // Generate URLs for each size by inserting transformation parameters
        Object.keys(transformations).forEach(size => {
            urls[size.toLowerCase()] = baseUrl.replace(
                '/upload/',
                `/upload/${transformations[size]}/`
            );
        });

        return urls;
    } catch (error) {
        console.error('Error generating transformed URLs:', error);
        return { original: baseUrl };
    }
}; 