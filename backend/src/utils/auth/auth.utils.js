import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../database/prisma.js';
import ApiError from '../error/api.error.js';

// Convert BCRYPT_SALT_ROUNDS to a number since environment variables are strings
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

/**
 * @description Hashes a password using bcrypt
 * @param {string} password - The plain text password to hash
 * @returns {Promise<string|null>} The hashed password or null if error
 */
export const hashPassword = async (password) => {
    try {
        if (!password) {
            throw new Error('Password is required');
        }

        // Generate salt and hash in one step
        const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
        
        if (!hashedPassword) {
            throw new Error('Failed to generate hash');
        }

        return hashedPassword;
    } catch (error) {
        console.error('Password hashing error:', error);
        throw new Error('Failed to hash password');
    }
};

export const decryptPassword = async (hashedPassword) => {
    try {
        if (!hashedPassword) {
            throw new Error('Hashed password is required');
        }
        
        // Since bcrypt is a one-way hash, we can't actually decrypt it
        // Instead, we'll return the hash itself as it's already secure
        return hashedPassword;
    } catch (error) {
        console.error('Password decryption error:', error);
        throw new Error('Failed to decrypt password');
    }
};


/**
 * @description Compares a password with a hashed password
 * @param {string} password - The plain text password
 * @param {string} hashedPassword - The hashed password to compare against
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 */
export const comparePassword = async (password, hashedPassword) => {
    try {
        if (!password || !hashedPassword) {
            return false;
        }
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        console.error('Password comparison error:', error);
        return false;
    }
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Promise<Object|null>} Decoded token payload or null if invalid
 */
export const verifyToken = async (token) => {
    try {
        if (!token) {
            return null;
        }

        // Remove 'Bearer ' if present
        const tokenString = token.startsWith('Bearer ') 
            ? token.slice(7) 
            : token;

        // Verify token
        const decoded = jwt.verify(
            tokenString, 
            process.env.ACCESS_TOKEN_SECRET
        );

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                role: true,
                isVerified: true,
                isActive: true
            }
        });

        if (!user || !user.isActive) {
            return null;
        }

        return user;
    } catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
};

/**
 * Generate access and refresh tokens
 * @param {Object} user - User object
 * @returns {Object} Object containing access and refresh tokens
 */
export const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '15m' }
    );

    const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || '7d' }
    );

    return { accessToken, refreshToken };
};

export default {
    verifyToken,
    decryptPassword,
    hashPassword,
    comparePassword,
    generateTokens
};
