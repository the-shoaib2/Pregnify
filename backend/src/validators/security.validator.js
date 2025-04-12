import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validation/validate.middleware.js';

export const validateSecurity = (type) => {
    switch (type) {
        case 'password':
            return [
                body('currentPassword')
                    .notEmpty()
                    .withMessage('Current password is required'),
                body('newPassword')
                    .isLength({ min: 8 })
                    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
                    .withMessage('Password must be at least 8 characters long and contain uppercase, lowercase, number and special character'),
                validateRequest
            ];

        case 'resetPassword':
            return [
                body('token')
                    .notEmpty()
                    .withMessage('Reset token is required'),
                body('newPassword')
                    .isLength({ min: 8 })
                    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
                    .withMessage('Password must be at least 8 characters long and contain uppercase, lowercase, number and special character'),
                validateRequest
            ];

        case '2faVerify':
            return [
                body('code')
                    .isLength({ min: 6, max: 6 })
                    .isNumeric()
                    .withMessage('Invalid 2FA code'),
                validateRequest
            ];

        case 'securityQuestions':
            return [
                body('questions')
                    .isArray({ min: 3 })
                    .withMessage('At least 3 security questions are required'),
                body('questions.*.question')
                    .notEmpty()
                    .withMessage('Question is required'),
                body('questions.*.answer')
                    .notEmpty()
                    .withMessage('Answer is required'),
                validateRequest
            ];

        case 'device':
            return [
                body('deviceName')
                    .notEmpty()
                    .withMessage('Device name is required'),
                body('deviceType')
                    .isIn(['MOBILE', 'TABLET', 'DESKTOP', 'OTHER'])
                    .withMessage('Invalid device type'),
                validateRequest
            ];

        case 'backupCodes':
            return [
                body('code')
                    .isLength({ min: 8, max: 8 })
                    .matches(/^[A-Z0-9]+$/)
                    .withMessage('Invalid backup code format'),
                validateRequest
            ];

        default:
            return [validateRequest];
    }
};

// Validate activity log filters
export const validateActivityFilters = [
    body('startDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid start date format'),
    body('endDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid end date format'),
    body('activityType')
        .optional()
        .isIn([
            'LOGIN',
            'LOGOUT',
            'PASSWORD_CHANGE',
            'PROFILE_UPDATE',
            'SECURITY_UPDATE',
            '2FA_ENABLE',
            '2FA_DISABLE',
            'DEVICE_ADD',
            'DEVICE_REMOVE'
        ])
        .withMessage('Invalid activity type'),
    validateRequest
];

export default {
    validateSecurity,
    validateActivityFilters
}; 