import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validation/validation.middleware.js';

export const validate2FASetup = [
    body('method')
        .isIn(['TOTP', 'SMS', 'EMAIL'])
        .withMessage('Invalid 2FA method'),
    validateRequest
];

export const validateTOTPSetup = [
    body('secret')
        .isString()
        .notEmpty()
        .withMessage('TOTP secret is required'),
        
    body('token')
        .isString()
        .isLength({ min: 6, max: 6 })
        .matches(/^[0-9]+$/)
        .withMessage('Invalid TOTP token format'),
        
    validateRequest
];

export const validateTOTPVerification = [
    body('token')
        .isString()
        .isLength({ min: 6, max: 6 })
        .matches(/^[0-9]+$/)
        .withMessage('Invalid TOTP token format'),
    
    body('secret')
        .optional()
        .isString()
        .notEmpty()
        .withMessage('TOTP secret is required when provided'),
        
    validateRequest
];

export const validateSMSSetup = [
    body('phoneNumber')
        .isString()
        .matches(/^\+[1-9]\d{1,14}$/)
        .withMessage('Invalid phone number format. Must start with + and contain 1-15 digits'),
    
    body('countryCode')
        .optional()
        .isString()
        .matches(/^\+[1-9]\d{0,3}$/)
        .withMessage('Invalid country code format'),
        
    validateRequest
];

export const validateSMSVerification = [
    body('code')
        .isString()
        .isLength({ min: 6, max: 6 })
        .matches(/^[0-9]+$/)
        .withMessage('Invalid SMS verification code'),
    
    body('phoneNumber')
        .optional()
        .isString()
        .matches(/^\+[1-9]\d{1,14}$/)
        .withMessage('Invalid phone number format'),
        
    validateRequest
];

export const validate2FAVerify = [
    body('code')
        .isString()
        .isLength({ min: 6, max: 6 })
        .matches(/^[0-9]+$/)
        .withMessage('Invalid verification code'),
    validateRequest
];

export const validate2FALogin = [
    body('code')
        .isString()
        .isLength({ min: 6, max: 6 })
        .matches(/^[0-9]+$/)
        .withMessage('Invalid 2FA code'),
    
    body('method')
        .optional()
        .isIn(['TOTP', 'SMS', 'EMAIL'])
        .withMessage('Invalid 2FA method'),
        
    validateRequest
];

export const validateDisable2FA = [
    body('code')
        .isString()
        .isLength({ min: 6, max: 6 })
        .matches(/^[0-9]+$/)
        .withMessage('Invalid verification code'),
    
    body('method')
        .optional()
        .isIn(['TOTP', 'SMS', 'EMAIL'])
        .withMessage('Invalid 2FA method'),
        
    validateRequest
];

export const validateBackupCode = [
    body('code')
        .isString()
        .isLength({ min: 8, max: 8 })
        .matches(/^[A-Z0-9]+$/)
        .withMessage('Invalid backup code'),
    validateRequest
];

export const validateBackupCodeVerification = [
    body('code')
        .isString()
        .isLength({ min: 8, max: 8 })
        .matches(/^[A-Z0-9]+$/)
        .withMessage('Invalid backup code format'),
    
    body('userId')
        .optional()
        .isUUID()
        .withMessage('Invalid user ID'),
        
    validateRequest
];

export const validateTrustedDevice = [
    body('deviceId')
        .isString()
        .notEmpty()
        .withMessage('Device ID is required'),
        
    body('deviceName')
        .isString()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Device name must be between 1 and 100 characters'),
        
    body('deviceType')
        .optional()
        .isIn(['WEB', 'DESKTOP', 'MOBILE', 'TABLET', 'OTHER'])
        .withMessage('Invalid device type'),
        
    body('expiresAt')
        .optional()
        .isISO8601()
        .withMessage('Invalid expiration date format'),
        
    validateRequest
];

export default {
    validate2FASetup,
    validateTOTPSetup,
    validateTOTPVerification,
    validateSMSSetup,
    validateSMSVerification,
    validate2FAVerify,
    validate2FALogin,
    validateDisable2FA,
    validateBackupCode,
    validateBackupCodeVerification,
    validateTrustedDevice
};
