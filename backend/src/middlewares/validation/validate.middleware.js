import { validationResult } from 'express-validator';
import ApiError from '../../utils/error/api.error.js';
import { HTTP_STATUS } from '../../constants/index.js';

/**
 * Middleware to validate request using express-validator
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next Express next function
 */
export const validateRequest = (req, res, next) => {
    try {
        // Debug logs
        // console.log('Request body:', req.body);
        // console.log('Request file:', req.file);
        
        const errors = validationResult(req);
        console.log('Validation errors:', errors.array());

        if (!errors.isEmpty()) {
            const validationErrors = errors.array().map(error => ({
                field: error.path || 'file',
                message: error.msg,
                value: error.value
            }));

            // console.log('Request body:', req.body);
            // console.log('Request files:', req.file || req.files);
            // console.log('Validation errors:', JSON.stringify(validationErrors, null, 2));

            next(new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                'Validation failed',
                validationErrors
            ));
            return;
        }
        next();
    } catch (error) {
        console.error('Validation error:', error); // Debug log
        next(new ApiError(
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            'Validation error',
            error.message
        ));
    }
};

/**
 * Validate request body exists
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next Express next function
 */
export const validateBody = (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            'Request body is required'
        );
    }
    next();
};

/**
 * Validate request parameters exist
 * @param {Array} params Array of required parameter names
 */
export const validateParams = (params) => {
    return (req, res, next) => {
        const missingParams = params.filter(param => !req.params[param]);
        if (missingParams.length > 0) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                `Missing required parameters: ${missingParams.join(', ')}`
            );
        }
        next();
    };
};

/**
 * Validate request query parameters exist
 * @param {Array} params Array of required query parameter names
 */
export const validateQuery = (params) => {
    return (req, res, next) => {
        const missingParams = params.filter(param => !req.query[param]);
        if (missingParams.length > 0) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                `Missing required query parameters: ${missingParams.join(', ')}`
            );
        }
        next();
    };
};

/**
 * Validate file upload
 * @param {string} fieldName Name of the file field
 * @param {Array} allowedTypes Array of allowed MIME types
 * @param {number} maxSize Maximum file size in bytes
 */
export const validateFileUpload = (fieldName, allowedTypes, maxSize) => {
    return (req, res, next) => {
        if (!req.files || !req.files[fieldName]) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                `No file uploaded for field: ${fieldName}`
            );
        }

        const file = req.files[fieldName];

        if (!allowedTypes.includes(file.mimetype)) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
            );
        }

        if (file.size > maxSize) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                `File size exceeds limit of ${maxSize} bytes`
            );
        }

        next();
    };
};

export default {
    validateRequest,
    validateBody,
    validateParams,
    validateQuery,
    validateFileUpload
}; 