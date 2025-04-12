import { HTTP_STATUS } from '../../constants/index.js';

export class TwoFactorError extends Error {
    constructor(message = 'Two-factor authentication required') {
        super(message);
        this.name = 'TwoFactorError';
        this.status = HTTP_STATUS.UNAUTHORIZED;
        this.code = 'TWO_FACTOR_REQUIRED';
    }
}

export class TwoFactorSetupError extends Error {
    constructor(message = 'Two-factor setup incomplete') {
        super(message);
        this.name = 'TwoFactorSetupError';
        this.status = HTTP_STATUS.BAD_REQUEST;
        this.code = 'TWO_FACTOR_SETUP_INCOMPLETE';
    }
}

export class TwoFactorVerificationError extends Error {
    constructor(message = 'Invalid two-factor code') {
        super(message);
        this.name = 'TwoFactorVerificationError';
        this.status = HTTP_STATUS.UNAUTHORIZED;
        this.code = 'TWO_FACTOR_INVALID';
    }
}

export default {
    TwoFactorError,
    TwoFactorSetupError,
    TwoFactorVerificationError
};