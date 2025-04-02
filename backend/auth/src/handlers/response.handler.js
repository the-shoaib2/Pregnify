import logger from '../logger/index.js';

/**
 * Standard API response format
 */
export class ApiResponse {
    constructor(statusCode, data = null, message = null) {
        this.status = statusCode >= 200 && statusCode < 300 ? 'success' : 'error';
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.timestamp = new Date().toISOString();
    }

    send(res) {
        logger.info(`API Response: ${this.status} - ${this.message}`);
        return res.status(this.statusCode).json(this);
    }
}

/**
 * Success response handler
 */
export const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
    return new ApiResponse(statusCode, data, message).send(res);
};

/**
 * Error response handler
 */
export const errorResponse = (res, message = 'Internal Server Error', statusCode = 500, data = null) => {
    return new ApiResponse(statusCode, data, message).send(res);
};

/**
 * Not found response handler
 */
export const notFoundResponse = (res, message = 'Resource not found') => {
    return new ApiResponse(404, null, message).send(res);
};

/**
 * Validation error response handler
 */
export const validationErrorResponse = (res, errors) => {
    return new ApiResponse(400, { errors }, 'Validation failed').send(res);
};

/**
 * Unauthorized response handler
 */
export const unauthorizedResponse = (res, message = 'Unauthorized access') => {
    return new ApiResponse(401, null, message).send(res);
};

/**
 * Forbidden response handler
 */
export const forbiddenResponse = (res, message = 'Access forbidden') => {
    return new ApiResponse(403, null, message).send(res);
};
