import crypto from 'crypto';
import bcrypt from 'bcrypt';

/**
 * Generate a random string of specified length
 * @param {number} length Length of the string to generate
 * @returns {string} Random string
 */
export const generateRandomString = (length = 32) => {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
};

/**
 * Hash data using SHA-256
 * @param {string} data Data to hash
 * @returns {string} Hashed data
 */
export const hashData = async (data) => {
    return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Generate a secure random token
 * @param {number} length Length of the token
 * @returns {string} Random token
 */
export const generateSecureToken = (length = 32) => {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
};

/**
 * Hash password using bcrypt
 * @param {string} password Password to hash
 * @returns {Promise<string>} Hashed password
 */
export const hashPassword = async (password) => {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
};

/**
 * Compare password with hash
 * @param {string} password Password to compare
 * @param {string} hash Hash to compare against
 * @returns {Promise<boolean>} Whether password matches hash
 */
export const comparePassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};

/**
 * Generate a time-based token
 * @param {number} expiryMinutes Minutes until token expires
 * @returns {Object} Token and expiry date
 */
export const generateTimeBasedToken = (expiryMinutes = 30) => {
    const token = generateRandomString(32);
    const expiryDate = new Date(Date.now() + expiryMinutes * 60 * 1000);
    
    return {
        token,
        expiryDate
    };
};

/**
 * Generate a cryptographically secure verification code
 * @param {number} length Length of the code
 * @returns {string} Verification code
 */
export const generateVerificationCode = (length = 6) => {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    
    // Generate a random number between min and max
    const randomBuffer = crypto.randomBytes(4);
    const randomNumber = randomBuffer.readUInt32BE(0);
    return String(Math.floor(randomNumber % (max - min + 1)) + min).padStart(length, '0');
};

/**
 * Encrypt sensitive data
 * @param {string} data Data to encrypt
 * @param {string} key Encryption key
 * @returns {string} Encrypted data
 */
export const encryptData = (data, key) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
        encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex')
    };
};

/**
 * Decrypt sensitive data
 * @param {Object} encryptedData Object containing encrypted data, IV, and auth tag
 * @param {string} key Decryption key
 * @returns {string} Decrypted data
 */
export const decryptData = ({ encrypted, iv, authTag }, key) => {
    const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        Buffer.from(key, 'hex'),
        Buffer.from(iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
};

export default {
    generateRandomString,
    hashData,
    generateSecureToken,
    hashPassword,
    comparePassword,
    generateTimeBasedToken,
    generateVerificationCode,
    encryptData,
    decryptData
}; 