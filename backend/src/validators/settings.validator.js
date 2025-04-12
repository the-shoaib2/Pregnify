import { body, query } from 'express-validator';
import { validateRequest } from '../middlewares/validation/validate.middleware.js';

export const validateSettings = (type) => {
    switch (type) {
        case 'general':
            return [
                body('darkModeEnabled').optional().isBoolean(),
                body('languagePreference').optional().isIn(['EN', 'BN', 'AR', 'ES', 'FR']),
                validateRequest
            ];

        case 'appearance':
            return [
                body('theme').optional().isIn(['LIGHT', 'DARK', 'SYSTEM']),
                body('fontSize').optional().isIn(['SMALL', 'MEDIUM', 'LARGE']),
                body('highContrastMode').optional().isBoolean(),
                validateRequest
            ];

        case 'language':
            return [
                body('language').isIn(['EN', 'BN', 'AR', 'ES', 'FR']),
                body('region').optional().isString(),
                body('timezone').optional().isString(),
                validateRequest
            ];

        case 'notifications':
            return [
                body('emailNotifications').optional().isBoolean(),
                body('pushNotifications').optional().isBoolean(),
                body('smsNotifications').optional().isBoolean(),
                validateRequest
            ];

        case 'privacy':
            return [
                body('isEmailVerified').optional().isBoolean(),
                body('isSmsVerified').optional().isBoolean(),
                body('multiFactorAuth').optional().isBoolean(),
                body('isAccountLocked').optional().isBoolean(),
                validateRequest
            ];

        case 'profile':
            return [
                body('firstName').optional().trim().isLength({ min: 2 }),
                body('lastName').optional().trim().isLength({ min: 2 }),
                body('bio').optional().trim().isLength({ max: 500 }),
                body('location').optional().trim(),
                body('phoneNumber').optional().isMobilePhone(),
                validateRequest
            ];

        case 'security':
            return [
                body('twoFactorEnabled').optional().isBoolean(),
                body('isPasskeyEnabled').optional().isBoolean(),
                body('isMfaEnabled').optional().isBoolean(),
                body('currentPassword').if(body('newPassword').exists()).notEmpty(),
                body('newPassword').optional().isStrongPassword(),
                validateRequest
            ];

        case 'payment':
            return [
                body('cardDetails.cardNumber').isCreditCard(),
                body('cardDetails.cardHolderName').trim().notEmpty(),
                body('cardDetails.expiryMonth').isInt({ min: 1, max: 12 }),
                body('cardDetails.expiryYear').isInt({ min: new Date().getFullYear() }),
                body('cardDetails.cvv').isLength({ min: 3, max: 4 }).isNumeric(),
                body('makeDefault').optional().isBoolean(),
                validateRequest
            ];

        case 'subscription':
            return [
                body('planId').notEmpty().isString(),
                body('paymentMethodId').notEmpty().isString(),
                body('autoRenew').optional().isBoolean(),
                validateRequest
            ];

        case 'backup':
            return [
                body('type').isIn(['FULL', 'PARTIAL', 'SETTINGS']),
                body('includeMedia').optional().isBoolean(),
                body('includeDocuments').optional().isBoolean(),
                validateRequest
            ];

        default:
            return [validateRequest];
    }
};

// Query parameter validation
export const validatePagination = [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validateRequest
];

export const validateActivityLogs = [
    query('type').optional().isIn([
        'LOGIN',
        'LOGOUT',
        'PROFILE_UPDATE',
        'SETTINGS_UPDATE',
        'SECURITY_UPDATE',
        'PAYMENT_METHOD_ADDED',
        'SUBSCRIPTION_UPDATE'
    ]),
    ...validatePagination
]; 