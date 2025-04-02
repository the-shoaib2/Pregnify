import { body, query } from 'express-validator';
import { validateRequest } from '../middlewares/validation/validate.middleware.js';

export const validateSystem = (type) => {
    switch (type) {
        case 'preferences':
            return [
                body('theme')
                    .optional()
                    .isIn(['LIGHT', 'DARK', 'SYSTEM'])
                    .withMessage('Invalid theme'),
                body('language')
                    .optional()
                    .isIn(['EN', 'BN', 'AR', 'ES', 'FR'])
                    .withMessage('Invalid language'),
                body('timezone')
                    .optional()
                    .isString()
                    .withMessage('Invalid timezone'),
                body('dateFormat')
                    .optional()
                    .isIn(['DD-MM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD'])
                    .withMessage('Invalid date format'),
                validateRequest
            ];

        case 'backup':
            return [
                body('type')
                    .isIn(['FULL', 'PARTIAL'])
                    .withMessage('Invalid backup type'),
                body('includeMedia')
                    .optional()
                    .isBoolean()
                    .withMessage('Invalid media inclusion flag'),
                body('includeSettings')
                    .optional()
                    .isBoolean()
                    .withMessage('Invalid settings inclusion flag'),
                validateRequest
            ];

        default:
            return [validateRequest];
    }
};

export const validateSystemSettings = [
    body('theme')
        .optional()
        .isIn(['LIGHT', 'DARK', 'SYSTEM'])
        .withMessage('Invalid theme option'),

    body('language')
        .optional()
        .isLocale()
        .withMessage('Invalid language code'),

    body('notifications')
        .optional()
        .isObject()
        .withMessage('Notifications must be an object'),

    body('notifications.email')
        .optional()
        .isBoolean()
        .withMessage('Email notifications must be boolean'),

    body('notifications.push')
        .optional()
        .isBoolean()
        .withMessage('Push notifications must be boolean'),

    body('autoBackup')
        .optional()
        .isBoolean()
        .withMessage('Auto backup must be boolean'),

    body('deviceLimit')
        .optional()
        .isInt({ min: 1, max: 10 })
        .withMessage('Device limit must be between 1 and 10'),

    validateRequest
];

export const validateStorageCleanup = [
    body('types')
        .optional()
        .isArray()
        .withMessage('Types must be an array')
        .custom((value) => {
            const validTypes = ['TEMP', 'CACHE', 'LOGS', 'BACKUPS'];
            return value.every(type => validTypes.includes(type));
        })
        .withMessage('Invalid storage type'),

    body('olderThan')
        .optional()
        .isInt({ min: 1 })
        .withMessage('olderThan must be a positive integer')
        .custom((value) => {
            const maxDays = 365; // 1 year
            return value <= maxDays * 24 * 60 * 60 * 1000;
        })
        .withMessage('olderThan cannot exceed 1 year'),

    validateRequest
];

export const validateBackupCreate = [
    body('type')
        .isIn(['FULL', 'PARTIAL'])
        .withMessage('Invalid backup type'),

    body('includeData')
        .optional()
        .isArray()
        .withMessage('includeData must be an array')
        .custom((value) => {
            const validTypes = ['SETTINGS', 'CONTENT', 'USERS', 'LOGS'];
            return value.every(type => validTypes.includes(type));
        })
        .withMessage('Invalid data type for backup'),

    body('description')
        .optional()
        .isString()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Description cannot exceed 200 characters'),

    validateRequest
];

export const validateSystemLogs = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),

    query('type')
        .optional()
        .isIn(['ERROR', 'WARNING', 'INFO', 'DEBUG'])
        .withMessage('Invalid log type'),

    query('startDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid start date format'),

    query('endDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid end date format'),

    query('source')
        .optional()
        .isIn(['SYSTEM', 'USER', 'SECURITY', 'API'])
        .withMessage('Invalid log source'),

    validateRequest
];

export const validateLogCleanup = [
    body('before')
        .optional()
        .isISO8601()
        .withMessage('Invalid date format'),

    body('type')
        .optional()
        .isIn(['ERROR', 'WARNING', 'INFO', 'DEBUG'])
        .withMessage('Invalid log type'),

    validateRequest
];

export const validateAppAccess = [
    body('appId')
        .isUUID()
        .withMessage('Invalid app ID format'),

    validateRequest
];

export default {
    validateSystem,
    validateSystemSettings,
    validateStorageCleanup,
    validateBackupCreate,
    validateSystemLogs,
    validateLogCleanup,
    validateAppAccess
}; 