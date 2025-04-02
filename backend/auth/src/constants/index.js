import path from 'path';

// Import all constants
import {
    MAX_FILE_SIZE,
    ALLOWED_FILE_TYPES,
    IMAGE_DEFAULTS,
    UPLOAD_LIMITS,
    ALLOWED_IMAGE_TYPES,
    ALLOWED_VIDEO_TYPES,
    ALLOWED_AUDIO_TYPES,
    ALLOWED_DOCUMENT_TYPES,
    ALLOWED_OTHER_TYPES,
    FILE_SIZE_LIMITS,
    IMAGE_QUALITY,
    IMAGE_SIZES,
    CLOUDINARY_FOLDERS,
    THUMBNAIL_SIZES,
    CLOUDINARY_TRANSFORMATIONS,
    UPLOAD_STATES,
    TEMP_FILE_EXPIRY,
    IMAGE_OPTIMIZATION
} from './media.constants.js';

export const APP_NAME = process.env.APP_NAME;

/**
 * @description Constants for allowed origins.
 */

export const ORIGIN = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:8080',
    'https://tqzqmb4p-5173.inc1.devtunnels.ms/',
    '*'
];

/**
 * @description Parses a duration string (e.g., "7d", "2h", "30m") and converts it to milliseconds.
 * @param {string} duration - The duration string to parse (e.g., "7d" for 7 days).
 * @returns {number} The equivalent duration in milliseconds.
 * @throws {Error} Throws an error if the duration format is invalid.
 */
export const parseDuration = (duration) => {
    if (!duration) {
        throw new Error('Duration is required');
    }

    console.log(`Parsing duration: ${duration}`); // Debugging line to check the value of duration

    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) {
        throw new Error(`Invalid duration format: ${duration}`); // Improved error message with the duration value
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    // Convert the duration based on the unit
    switch (unit) {
        case 's': return value * 1000; // seconds to milliseconds
        case 'm': return value * 60 * 1000; // minutes to milliseconds
        case 'h': return value * 60 * 60 * 1000; // hours to milliseconds
        case 'd': return value * 24 * 60 * 60 * 1000; // days to milliseconds
        default: throw new Error('Invalid duration unit');
    }
};

/**
 * @description Constants for token-related settings.
 * @constant {number} COOKIE_EXPIRY - Default cookie expiry duration in milliseconds.
 * @constant {number} ACCESS_TOKEN_EXPIRY - Default access token expiry duration in milliseconds.
 * @constant {number} REFRESH_TOKEN_EXPIRY - Default refresh token expiry duration in milliseconds.
 * @constant {number} ACCESS_TOKEN_EXPIRES - Default access token expires duration in milliseconds.
 * @constant {number} REFRESH_TOKEN_EXPIRES - Default refresh token expires duration in milliseconds.
 */
// Ensure default fallback values for the environment variables
//Secrets
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET ;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET ;
//Cookies expiry time
export const REFRESH_TOKEN_COOKIE_NAME = process.env.REFRESH_TOKEN_COOKIE_NAME;
export const COOKIE_EXPIRY = parseDuration(process.env.COOKIE_EXPIRY || '30d'); // Default to 30 days
export const ACCESS_TOKEN_EXPIRY = parseDuration(process.env.ACCESS_TOKEN_EXPIRY || '15m'); // Default to 15 minutes
export const REFRESH_TOKEN_EXPIRY = parseDuration(process.env.REFRESH_TOKEN_EXPIRY || '30d'); // Default to 30 days
export const ACCESS_TOKEN_EXPIRES = parseDuration(process.env.ACCESS_TOKEN_EXPIRES || '15m'); // Default to 15 minutes
export const REFRESH_TOKEN_EXPIRES = parseDuration(process.env.REFRESH_TOKEN_EXPIRES || '30d'); // Default to 30 days

/**
 * @description Constants for authentication-related settings.
 */
export const AUTH_CONSTANTS = {
    MAX_LOGIN_ATTEMPTS: 5, // Max number of login attempts before account lockout
    LOCKOUT_DURATION: 30 * 60 * 1000, // Account lockout duration in milliseconds (30 minutes)
    PASSWORD_RESET_EXPIRY: 24 * 60 * 60 * 1000, // Expiry duration for password reset link (24 hours)
    VERIFICATION_CODE_EXPIRY: 15 * 60 * 1000, // Expiry duration for email verification code (15 minutes)
    ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || '15m', // Access token expiry (default to 15 minutes)
    REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || '30d', // Refresh token expiry (default to 30 days)
    COOKIE_OPTIONS: {
        httpOnly: true, // Ensure cookies are only accessible via HTTP(S) requests
        secure: process.env.NODE_ENV === 'production', // Secure cookies in production (over HTTPS)
        sameSite: 'strict', // Prevent cross-site request forgery (CSRF)
        maxAge: parseDuration(process.env.COOKIE_EXPIRY || '30d') // Set cookie expiry (default to 30 days)
    }
};

/**
 * @description Constants for user statuses.
 */
export const USER_STATUSES = {
    ACTIVE: 'ACTIVE',           // User account is active and can log in
    INACTIVE: 'INACTIVE',       // User account is inactive and cannot log in
    PENDING: 'PENDING',         // User account is pending verification or activation
    SUSPENDED: 'SUSPENDED',     // User account is suspended due to violations
    DELETED: 'DELETED'          // User account is deleted and no longer accessible
};

/**
 * @description HTTP status codes for API responses.
 */
export const HTTP_STATUS = {
    CONTINUE: 100,
    SWITCHING_PROTOCOLS: 101,
    PROCESSING: 102,
    EARLY_HINTS: 103,
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
    NOT_IMPLEMENTED: 501,
    GATEWAY_TIMEOUT: 504,
    BAD_GATEWAY: 502,
    REQUEST_TIMEOUT: 408,
    PAYMENT_REQUIRED: 402,
    METHOD_NOT_ALLOWED: 405,
    NOT_ACCEPTABLE: 406,
    PROXY_AUTHENTICATION_REQUIRED: 407,
    REQUEST_URI_TOO_LARGE: 414
};

// Example values for expiry and salt rounds
export const ACCOUNT_EXPIRY_DAYS = process.env.ACCOUNT_EXPIRY_DAYS || 30; // Account expiry duration in days
export const BCRYPT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS || 12; // Number of rounds for bcrypt password hashing

//Verification
export const VERIFICATION_CODE_LENGTH = 8; // Length of verification code
export const VERIFICATION_CODE_EXPIRY = '1m'; // Verification code expiry duration in minutes
export const MAX_VERIFICATION_ATTEMPTS = 3; // Maximum number of verification attempts
export const VERIFICATION_COOLDOWN_PERIOD ='5m'; // Cooldown period after failed attempts in minutes
export const ACCOUNT_LOCK_DURATION = '30'; // Account lock duration after max attempts in days

//Validation 

/**
 * Minimum and Maximum Length for User's Name
 */
export const MIN_NAME_LENGTH = 3; // Minimum length for the user's name
export const MAX_NAME_LENGTH = 50; // Maximum length for the user's name

/**
 * Account Expiry Time
 */
export const ACCOUNT_EXPIRY_TIME = '30d'; // Account expiry duration in days

/**
 * Minimum and Maximum Length for User's Password
 */
export const MIN_PASSWORD_LENGTH = 8; // Minimum length for password
export const MAX_PASSWORD_LENGTH = 60; // Maximum length for password

/**
 * Minimum Year for User's Date of Birth
 */
export const MIN_DOB_YEAR = 1900; // The minimum year for user's date of birth (validity constraint)

//Media 
export const FILE_SIZE_LIMIT = 1024 * 1024 * 10; // 10MB
export const UPLOAD_FOLDER = 'uploads';
export const BASE_FOLDER = 'Users-Account';
export const PUBLIC_DIR = path.join(process.cwd(), 'public');
export const TEMP_FILE_NAME_FORMAT = 'temp-file-name';

export const MAX_IMAGE_SIZE = 1024 * 1024 * 10; // 10MB
export const MIN_PROCESS_IMAGE_SIZE = 150; // 150KB
export const SKIP_PROCESS_IMAGE_SIZE = 150; // 150KB
export const IMAGE_MAX_DIMENSION = 10000; // 10000px
export const JPEG_QUALITY = 80; // 80%

// Export all constants
export {
    MAX_FILE_SIZE,
    ALLOWED_FILE_TYPES,
    IMAGE_DEFAULTS,
    UPLOAD_LIMITS,
    ALLOWED_IMAGE_TYPES,
    ALLOWED_VIDEO_TYPES,
    ALLOWED_AUDIO_TYPES,
    ALLOWED_DOCUMENT_TYPES,
    ALLOWED_OTHER_TYPES,
    FILE_SIZE_LIMITS,
    IMAGE_QUALITY,
    IMAGE_SIZES,
    CLOUDINARY_FOLDERS,
    THUMBNAIL_SIZES,
    CLOUDINARY_TRANSFORMATIONS,
    UPLOAD_STATES,
    TEMP_FILE_EXPIRY,
    IMAGE_OPTIMIZATION
};

// Default export
export default {
    MAX_FILE_SIZE,
    ALLOWED_FILE_TYPES,
    IMAGE_DEFAULTS,
    UPLOAD_LIMITS,
    ALLOWED_IMAGE_TYPES,
    ALLOWED_VIDEO_TYPES,
    ALLOWED_AUDIO_TYPES,
    ALLOWED_DOCUMENT_TYPES,
    ALLOWED_OTHER_TYPES,
    FILE_SIZE_LIMITS,
    IMAGE_QUALITY,
    IMAGE_SIZES,
    CLOUDINARY_FOLDERS,
    THUMBNAIL_SIZES,
    CLOUDINARY_TRANSFORMATIONS,
    UPLOAD_STATES,
    TEMP_FILE_EXPIRY,
    IMAGE_OPTIMIZATION
};




