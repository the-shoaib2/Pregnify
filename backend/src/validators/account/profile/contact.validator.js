import { body, validationResult } from 'express-validator';

/**
 * Validate contact number
 */
export const validateContactNumber = [
    body('number').isString().withMessage('Phone number must be a string'),
    body('isPrimary').optional().isBoolean().withMessage('isPrimary must be a boolean'),
    body('isVerified').optional().isBoolean().withMessage('isVerified must be a boolean'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

/**
 * Validate address
 */
export const validateAddress = [
    body('type').isIn(['CURRENT', 'PRESENT', 'PERMANENT', 'WORK', 'HOME', 'OFFICE', 'OTHER']).withMessage('Invalid address type'),
    body('street').isString().withMessage('Street must be a string'),
    body('city').isString().withMessage('City must be a string'),
    body('state').isString().withMessage('State must be a string'),
    body('country').isString().withMessage('Country must be a string'),
    body('postalCode').isString().withMessage('Postal code must be a string'),
    body('isPrimary').optional().isBoolean().withMessage('isPrimary must be a boolean'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

/**
 * Validate website
 */
export const validateWebsite = [
    body('category').isIn(['SOCIAL', 'WORK', 'LEARNING', 'FINANCE', 'SPORTS', 'HEALTH', 'ENTERTAINMENT', 'ECOMMERCE', 'GOVERNMENT', 'PERSONAL', 'OTHER']).withMessage('Invalid website category'),
    body('name').optional().isString().withMessage('Name must be a string'),
    body('url').isURL().withMessage('URL must be a valid URL'),
    body('username').optional().isString().withMessage('Username must be a string'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];