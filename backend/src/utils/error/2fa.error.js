import ApiError from './api.error.js';
import { HTTP_STATUS } from '../../constants/index.js';

export class TwoFactorError extends ApiError {
    constructor(statusCode, message, errors = []) {
        super(statusCode, message, errors);
        this.name = 'TwoFactorError';
    }

    static invalidCode() {
        return new TwoFactorError(
            HTTP_STATUS.UNAUTHORIZED,
            'Invalid verification code'
        );
    }

    static setupRequired() {
        return new TwoFactorError(
            HTTP_STATUS.FORBIDDEN,
            '2FA setup is required for this account'
        );
    }

    static methodNotSupported() {
        return new TwoFactorError(
            HTTP_STATUS.BAD_REQUEST,
            'This 2FA method is not supported'
        );
    }

    static alreadyEnabled() {
        return new TwoFactorError(
            HTTP_STATUS.CONFLICT,
            '2FA is already enabled for this account'
        );
    }

    static notEnabled() {
        return new TwoFactorError(
            HTTP_STATUS.BAD_REQUEST,
            '2FA is not enabled for this account'
        );
    }

    static sessionExpired() {
        return new TwoFactorError(
            HTTP_STATUS.UNAUTHORIZED,
            '2FA session has expired'
        );
    }

    static deviceLimitReached() {
        return new TwoFactorError(
            HTTP_STATUS.TOO_MANY_REQUESTS,
            'Maximum number of trusted devices reached'
        );
    }

    static backupCodeUsed() {
        return new TwoFactorError(
            HTTP_STATUS.UNAUTHORIZED,
            'This backup code has already been used'
        );
    }

    static invalidPhoneNumber() {
        return new TwoFactorError(
            HTTP_STATUS.BAD_REQUEST,
            'Invalid phone number format'
        );
    }

    static smsFailed() {
        return new TwoFactorError(
            HTTP_STATUS.SERVICE_UNAVAILABLE,
            'Failed to send SMS verification code'
        );
    }
}

// Common 2FA error types for easy access
export const TwoFactorErrorTypes = {
    INVALID_CODE: TwoFactorError.invalidCode(),
    SETUP_REQUIRED: TwoFactorError.setupRequired(),
    METHOD_NOT_SUPPORTED: TwoFactorError.methodNotSupported(),
    ALREADY_ENABLED: TwoFactorError.alreadyEnabled(),
    NOT_ENABLED: TwoFactorError.notEnabled(),
    SESSION_EXPIRED: TwoFactorError.sessionExpired(),
    DEVICE_LIMIT_REACHED: TwoFactorError.deviceLimitReached(),
    BACKUP_CODE_USED: TwoFactorError.backupCodeUsed(),
    INVALID_PHONE: TwoFactorError.invalidPhoneNumber(),
    SMS_FAILED: TwoFactorError.smsFailed()
};

export default {
    TwoFactorError,
    TwoFactorErrorTypes
};