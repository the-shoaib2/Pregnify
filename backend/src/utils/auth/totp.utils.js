import crypto from 'crypto';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import ApiError from '../error/api.error.js';
import { HTTP_STATUS } from '../../constants/index.js';

// Configure TOTP settings
authenticator.options = {
    window: 1,        // Allow 1 step before/after for time drift
    step: 30,         // 30 second step
    digits: 6         // 6 digit codes
};

/**
 * Generate TOTP secret
 * @returns {string} TOTP secret
 */
export const generateTOTP = () => {
    return authenticator.generateSecret();
};

/**
 * Verify TOTP token
 * @param {string} token - TOTP token to verify
 * @param {string} secret - TOTP secret
 * @returns {boolean} - Whether token is valid
 */
export const verifyTOTP = (token, secret) => {
    try {
        return authenticator.verify({
            token,
            secret
        });
    } catch (error) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            'Invalid 2FA token'
        );
    }
};

/**
 * Generate QR code for TOTP
 * @param {string} email - User email
 * @param {string} secret - TOTP secret
 * @returns {Promise<string>} QR code data URL
 */
export const generateQRCode = async (email, secret) => {
    try {
        const otpauth = authenticator.keyuri(
            email,
            'Your App Name',
            secret
        );
        return await qrcode.toDataURL(otpauth);
    } catch (error) {
        throw new ApiError(
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            'Failed to generate QR code'
        );
    }
};

/**
 * Generate backup codes
 * @param {number} count - Number of backup codes to generate
 * @returns {string[]} Array of backup codes
 */
export const generateBackupCodes = (count = 10) => {
    const codes = [];
    for (let i = 0; i < count; i++) {
        const code = crypto.randomBytes(4).toString('hex').toUpperCase();
        codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
    }
    return codes;
};

/**
 * Validate backup code format
 * @param {string} code - Backup code to validate
 * @returns {boolean} Whether code format is valid
 */
export const isValidBackupCode = (code) => {
    return /^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code);
};

// Generate QR code for TOTP setup
export const generateTOTPQRCode = async (email, secret, issuer = 'YourApp') => {
    const otpauth = authenticator.keyuri(
        encodeURIComponent(email),
        encodeURIComponent(issuer),
        secret
    );

    try {
        const qrCodeUrl = await qrcode.toDataURL(otpauth, {
            errorCorrectionLevel: 'H',
            margin: 4,
            width: 200
        });
        return qrCodeUrl;
    } catch (error) {
        throw new Error('Failed to generate QR code');
    }
};

// Validate TOTP format
export const validateTOTPFormat = (token) => {
    return /^\d{6}$/.test(token);
};

// Get remaining seconds until next TOTP
export const getRemainingSeconds = () => {
    const stepSeconds = authenticator.options.step;
    const currentSeconds = Math.floor(Date.now() / 1000);
    return stepSeconds - (currentSeconds % stepSeconds);
};

// Check if TOTP is about to expire
export const isTOTPExpiring = (thresholdSeconds = 5) => {
    const remaining = getRemainingSeconds();
    return remaining <= thresholdSeconds;
};

// Generate recovery codes
export const generateRecoveryCodes = (count = 10, length = 10) => {
    const codes = [];
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    for (let i = 0; i < count; i++) {
        let code = '';
        for (let j = 0; j < length; j++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
            if (j > 0 && j % 5 === 4 && j !== length - 1) {
                code += '-';
            }
        }
        codes.push(code);
    }

    return codes;
};

// Format TOTP for display
export const formatTOTP = (token) => {
    if (!token || token.length !== 6) return token;
    return `${token.slice(0, 3)} ${token.slice(3)}`;
};

// Get TOTP configuration
export const getTOTPConfig = () => {
    return {
        digits: authenticator.options.digits,
        period: authenticator.options.step,
        window: authenticator.options.window,
        algorithm: 'SHA1' // Default algorithm used by otplib
    };
};

export default {
    generateTOTP,
    verifyTOTP,
    generateQRCode,
    generateBackupCodes,
    isValidBackupCode
}; 