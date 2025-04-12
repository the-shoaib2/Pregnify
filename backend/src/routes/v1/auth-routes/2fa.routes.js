import express from 'express';
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

import { isAuthenticated } from '../../../middlewares/auth/auth.middleware.js';
import { 
    twoFactorLimiter, 
    backupCodeLimiter, 
    smsCodeLimiter 
} from '../../../middlewares/rate-limit/2fa.limiter.js';

const router = express.Router();

// All 2FA routes require authentication
router.use(isAuthenticated);

// TOTP Routes
router.post(
    '/totp/setup',
    twoFactorLimiter,
    validateTOTPSetup,
    setupTOTP
);

router.post(
    '/totp/verify',
    twoFactorLimiter,
    validateTOTPVerification,
    verifyTOTPSetup
);

// SMS Routes
router.post(
    '/sms/setup',
    twoFactorLimiter,
    validateSMSSetup,
    setupSMS2FA
);

router.post(
    '/sms/verify',
    smsCodeLimiter,
    validateSMSVerification,
    verifySMSSetup
);

// General 2FA Routes
router.post(
    '/verify',
    twoFactorLimiter,
    validate2FALogin,
    verify2FALogin
);

router.delete(
    '/disable',
    twoFactorLimiter,
    validateDisable2FA,
    disable2FA
);

router.get(
    '/status',
    twoFactorLimiter,
    get2FAStatus
);

// Backup and Trust Routes
router.post(
    '/backup/verify',
    backupCodeLimiter,
    validateBackupCodeVerification,
    verifyBackupCode
);

router.post(
    '/trusted-device',
    twoFactorLimiter,
    validateTrustedDevice,
    addTrustedDevice
);

export default router; 