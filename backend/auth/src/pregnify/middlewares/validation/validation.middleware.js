import { validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../../utils/ApiError.js';

/**
 * Middleware to validate request data
 * @param {Array} validations - Array of validation rules
 * @returns {Function} - Express middleware function
 */
export const validateRequest = (validations) => {
  return async (req, res, next) => {
    try {
      // Run all validations
      await Promise.all(validations.map(validation => validation.run(req)));

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
          field: error.path,
          message: error.msg
        }));

        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Validation failed',
          errorMessages
        );
      }

      // If no errors, proceed to next middleware
      next();
    } catch (error) {
      next(error);
    }
  };
}; 