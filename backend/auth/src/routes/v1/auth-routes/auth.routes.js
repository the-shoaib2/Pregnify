import express from 'express';
import { body } from 'express-validator';
import compression from 'compression';
import responseTime from 'response-time';
import { validateRequest } from '../../../middlewares/validation/validate.middleware.js';

// Controllers
import {
    defaultRegister,
    defaultLogin,
    getCurrentUser,
    defaultLogout
} from '../../../controllers/auth/default.controller.js';
import { refreshAccessToken, revokeRefreshToken } from '../../../controllers/token/token.controller.js';
import {
    generatePasskeyRegistration,
    verifyPasskeyRegistration,
    generatePasskeyAuthentication,
    verifyPasskeyAuthentication,
    getUserPasskeys,
    deletePasskey
} from '../../../controllers/auth/passkey/passkey-controller.js';
import {
    setupTOTP,
    verifyTOTPSetup,
    setupSMS2FA,
    verifySMSSetup,
    verify2FALogin,
    disable2FA,
    get2FAStatus,
    verifyBackupCode,
    addTrustedDevice
} from '../../../controllers/auth/2fa/2fa.controller.js';

// Middlewares
import { isAuthenticated } from '../../../middlewares/auth/auth.middleware.js';

import { validateRegister, validateLogin } from '../../../validators/auth.validation.js';
import { validatePasskeyRegistration, validatePasskeyAuthentication } from '../../../validators/passkey.validation.js';
import { 
    authLimiter, 
    loginLimiter, 
    registrationLimiter 
} from '../../../middlewares/rate-limit/rate.limiter.js';
import {
    validateTOTPSetup,
    validateTOTPVerification,
    validateSMSSetup,
    validateSMSVerification,
    validate2FALogin,
    validateDisable2FA,
    validateBackupCodeVerification,
    validateTrustedDevice
} from '../../../validators/2fa.validation.js';
import { 
    require2FA, 
    checkTrustedDevice, 
    enforce2FASetup 
} from '../../../middlewares/auth/2fa.middleware.js';
import { 
    twoFactorLimiter, 
    backupCodeLimiter, 
    smsCodeLimiter 
} from '../../../middlewares/rate-limit/2fa.limiter.js';

const router = express.Router();

// Global Middleware
router.use(responseTime());
router.use(compression());

/**
 * Public Authentication Routes
 */
router.post(
    '/register',
    registrationLimiter,
    validateRegister,
    defaultRegister
);

router.post(
    '/login',
    loginLimiter,
    validateLogin,
    checkTrustedDevice, // Check if device is trusted before login
    defaultLogin
);

router.post(
    '/refresh-token',
    authLimiter,
    refreshAccessToken
);

router.post(
    '/revoke-token',
    isAuthenticated,
    authLimiter,
    revokeRefreshToken
);

/**
 * Public Passkey Routes
 */
router.post(
    '/passkey/authenticate/options',
    authLimiter,
    [body('email').isEmail().normalizeEmail()],
    generatePasskeyAuthentication
);

router.post(
    '/passkey/authenticate/verify',
    authLimiter,
    validatePasskeyAuthentication,
    verifyPasskeyAuthentication
);

/**
 * Protected Routes - Authentication Required
 */
router.use(isAuthenticated);

/**
 * User Profile Routes
 */
router.get(
    '/user',
    getCurrentUser
);

router.post(
    '/logout',
    defaultLogout
);

/**
 * Protected Passkey Management Routes
 */
router.post(
    '/passkey/register/options',
    authLimiter,
    generatePasskeyRegistration
);

router.post(
    '/passkey/register/verify',
    authLimiter,
    validatePasskeyRegistration,
    verifyPasskeyRegistration
);

router.get('/passkey/list', getUserPasskeys);

router.delete(
    '/passkey/:id',
    authLimiter,
    deletePasskey
);

/**
 * Two-Factor Authentication Routes
 */
// TOTP Routes
router.post(
    '/2fa/totp/setup',
    twoFactorLimiter,
    validateTOTPSetup,
    setupTOTP
);

router.post(
    '/2fa/totp/verify',
    twoFactorLimiter,
    validateTOTPVerification,
    verifyTOTPSetup
);

// SMS Routes
router.post(
    '/2fa/sms/setup',
    twoFactorLimiter,
    validateSMSSetup,
    setupSMS2FA
);

router.post(
    '/2fa/sms/verify',
    smsCodeLimiter,
    validateSMSVerification,
    verifySMSSetup
);

// General 2FA Routes
router.post(
    '/2fa/verify',
    twoFactorLimiter,
    validate2FALogin,
    verify2FALogin
);

router.delete(
    '/2fa/disable',
    twoFactorLimiter,
    validateDisable2FA,
    disable2FA
);

router.get(
    '/2fa/status',
    twoFactorLimiter,
    get2FAStatus
);

// Backup and Trust Routes
router.post(
    '/2fa/backup/verify',
    backupCodeLimiter,
    validateBackupCodeVerification,
    verifyBackupCode
);

router.post(
    '/2fa/trusted-device',
    twoFactorLimiter,
    validateTrustedDevice,
    addTrustedDevice
);

/**
 * Admin Routes - Requires 2FA
 */
router.use(
    '/admin',
    twoFactorLimiter,
    enforce2FASetup,
    require2FA
);

export default router;
