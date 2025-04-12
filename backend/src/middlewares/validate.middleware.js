import { validationResult } from 'express-validator';
import ApiError from '../utils/error/api.error.js';

/**
 * Middleware to validate request using express-validator
 * Throws ApiError if validation fails
 */
export const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Get the first error message
        const firstError = errors.array()[0];
        
        throw new ApiError(400, 'Validation Error', {
            errors: errors.array(),
            message: firstError.msg
        });
    }
    next();
};

/**
 * Helper function to validate pagination parameters
 */
export const validatePagination = (page, limit) => {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    if (pageNum < 1) {
        throw new ApiError(400, 'Page number must be greater than 0');
    }

    if (limitNum < 1 || limitNum > 100) {
        throw new ApiError(400, 'Limit must be between 1 and 100');
    }

    return {
        page: pageNum,
        limit: limitNum,
        skip: (pageNum - 1) * limitNum
    };
};

/**
 * Helper function to validate date range
 */
export const validateDateRange = (startDate, endDate) => {
    if (startDate && !isValidDate(startDate)) {
        throw new ApiError(400, 'Invalid start date format');
    }

    if (endDate && !isValidDate(endDate)) {
        throw new ApiError(400, 'Invalid end date format');
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        throw new ApiError(400, 'Start date cannot be after end date');
    }

    return {
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
    };
};

/**
 * Helper function to validate UUID
 */
export const validateUUID = (id) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
        throw new ApiError(400, 'Invalid ID format');
    }
    return true;
};

/**
 * Helper function to check if a date string is valid
 */
const isValidDate = (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
};

export default {
    validateRequest,
    validatePagination,
    validateDateRange,
    validateUUID
}; 