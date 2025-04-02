import { validationResult } from 'express-validator';
import { HTTP_STATUS } from '../../constants/index.js';

/**
 * Middleware to validate request using express-validator
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
export const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(error => ({
                field: error.path,
                message: error.msg
            }))
        });
    }
    next();
};

/**
 * Middleware to validate request parameters
 * @param {Object} schema - Joi schema object
 * @returns {Function} Express middleware function
 */
export const validateParams = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.params);
        if (error) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Invalid parameters',
                errors: error.details.map(detail => ({
                    field: detail.context.key,
                    message: detail.message
                }))
            });
        }
        next();
    };
};

/**
 * Middleware to validate request query
 * @param {Object} schema - Joi schema object
 * @returns {Function} Express middleware function
 */
export const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.query);
        if (error) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Invalid query parameters',
                errors: error.details.map(detail => ({
                    field: detail.context.key,
                    message: detail.message
                }))
            });
        }
        next();
    };
};

/**
 * Middleware to validate request body
 * @param {Object} schema - Joi schema object
 * @returns {Function} Express middleware function
 */
export const validateBody = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Invalid request body',
                errors: error.details.map(detail => ({
                    field: detail.context.key,
                    message: detail.message
                }))
            });
        }
        next();
    };
};

export default {
    validateRequest,
    validateParams,
    validateQuery,
    validateBody
};
