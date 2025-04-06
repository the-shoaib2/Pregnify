import express from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../../../middlewares/validation/validate.request.js';
import { 
    findUser, 
    sendVerificationCode, 
    verifyOTP, 
    resetPassword,
    initiatePasswordReset,
    verifyResetToken,
    recoverAccountWithSecurityQuestions,
    recoverAccountWithTrustedDevice
} from '../../../controllers/auth/forgot-password/forgot-password.controller.js';
import {
    searchUserValidation,
    sendOTPValidation,
    verifyOTPValidation,
    resetPasswordValidation,
    validateVerificationSession,
    trackPasswordResetActivity,
    updatePasswordResetActivity,
    searchUser
} from '../../../middlewares/auth/forgot_password.middleware.js';
import { authLimiter } from '../../../middlewares/rate-limit/rate.limiter.js';

const router = express.Router();

// Public route for finding user - only basic rate limiting
router.post(
    '/forgot-password/find-user',
    authLimiter,  // Rate limiting
    searchUserValidation, // Input validation
    searchUser, // Search middleware
    findUser, // Find user controller
    trackPasswordResetActivity // Activity tracking
);

router.post(
    '/forgot-password/send-verification',
    authLimiter,
    sendOTPValidation,
    trackPasswordResetActivity,
    sendVerificationCode,
    updatePasswordResetActivity
);

router.post(
    '/forgot-password/verify-code',
    authLimiter,
    verifyOTPValidation,
    validateVerificationSession,
    trackPasswordResetActivity,
    verifyOTP,
    updatePasswordResetActivity
);

router.post(
    '/forgot-password/reset-password',
    authLimiter,
    resetPasswordValidation,
    validateVerificationSession,
    trackPasswordResetActivity,
    resetPassword,
    updatePasswordResetActivity
);

// Account recovery routes
router.post(
    '/recover/security-questions',
    authLimiter,
    recoverAccountWithSecurityQuestions
);

router.post(
    '/recover/trusted-device',
    authLimiter,
    recoverAccountWithTrustedDevice
);

// Legacy routes for backward compatibility
router.post(
    '/forgot-password',
    authLimiter,
    initiatePasswordReset
);

router.get(
    '/reset-password/:token',
    authLimiter,
    verifyResetToken
);

export default router;
