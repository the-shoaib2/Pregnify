import jwt from 'jsonwebtoken';
import ApiError from '../../utils/error/api.error.js';
import asyncHandler from '../../utils/middleware/async.handler.js';
import ApiResponse from '../../utils/error/api.response.js';
import prisma from '../../utils/database/prisma.js';
import { 
    COOKIE_EXPIRY,
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY,
    ACCESS_TOKEN_EXPIRES,
    REFRESH_TOKEN_EXPIRES,
    HTTP_STATUS
} from '../../constants/index.js';


/**
 * @description Constants for token-related settings.
 * @constant {string} ACCESS_TOKEN_SECRET - Secret key for access tokens.
 * @constant {string} REFRESH_TOKEN_SECRET - Secret key for refresh tokens.
 * @constant {string} ACCESS_TOKEN_EXPIRY - Duration of access token validity.
 * @constant {string} REFRESH_TOKEN_EXPIRY - Duration of refresh token validity.
 * @constant {string} ACCESS_TOKEN_EXPIRES - Expiry time for access token.
 * @constant {string} REFRESH_TOKEN_EXPIRES - Expiry time for refresh token.
 */

// Token Configuration
const TOKEN_CONFIG = {
    accessSecret: ACCESS_TOKEN_SECRET,
    refreshSecret: REFRESH_TOKEN_SECRET,
    accessTokenExpiry: ACCESS_TOKEN_EXPIRY || '15m', // 15 minutes
    refreshTokenExpiry: REFRESH_TOKEN_EXPIRY || '30d', // 30 days
    accessTokenExpiryMs: ACCESS_TOKEN_EXPIRES, // Use pre-calculated milliseconds
    refreshTokenExpiryMs: REFRESH_TOKEN_EXPIRES // Use pre-calculated milliseconds
};

// Pre-calculate token expiry times in milliseconds
const ACCESS_EXPIRY_MS = TOKEN_CONFIG.accessTokenExpiryMs;
const REFRESH_EXPIRY_MS = TOKEN_CONFIG.refreshTokenExpiryMs;
const COOKIE_EXPIRY_MS = COOKIE_EXPIRY; // Already in milliseconds from constants


/**
 * @description Extracts only necessary user details for token generation
 * @param {Object} user - The user object containing user details.
 * @returns {Object} - The prepared user object with only necessary details.
 * @throws {ApiError} - Throws an error if user data is invalid.
 */
const prepareUserForToken = (user) => {
    if (!user?.id || !user?.email || !user?.role) {
        throw new ApiError(400, "Invalid user data for token preparation");
    }
    return {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified || false,
        is2FAEnabled: user.is2FAEnabled || false,
        accountExpiryDate: user.accountExpiryDate || null,
        isActive: user.isActive || false
    };
};

/**
 * @description Generates access and refresh tokens and saves session in the database.
 * @param {Object} user - The user object containing user details.
 * @returns {Object} - An object containing access and refresh tokens.
 * @throws {ApiError} - Throws an error if user data is invalid.
 */
export const generateTokens = async (user) => {
    try {
        const userData = prepareUserForToken(user);
        
        // Generate access and refresh tokens
        const accessToken = jwt.sign(
            { id: userData.id, email: userData.email, role: userData.role },
            ACCESS_TOKEN_SECRET,
            { expiresIn: ACCESS_TOKEN_EXPIRY }
        );

        const refreshToken = jwt.sign(
            { id: userData.id },
            REFRESH_TOKEN_SECRET,
            { expiresIn: REFRESH_TOKEN_EXPIRY }
        );
        
        // Try to save session and update last login timestamp using a database transaction
        try {
            await prisma.$transaction([
                prisma.session.create({
                    data: { 
                        userId: userData.id, 
                        refreshToken,
                        refreshTokenExpiresAt: new Date(Date.now() + REFRESH_EXPIRY_MS),
                        accessToken,
                        accessTokenExpiresAt: new Date(Date.now() + ACCESS_EXPIRY_MS)
                    }
                }),
                prisma.user.update({ where: { id: userData.id }, data: { lastLoginAt: new Date() } })
            ]);
        } catch (error) {
            console.error('Failed to create session:', error);
            // Continue even if session creation fails
        }

        return { accessToken, refreshToken, expiresIn: ACCESS_EXPIRY_MS / 1000, refreshExpiresIn: REFRESH_EXPIRY_MS / 1000 };
    } catch (error) {
        console.error('Token generation error:', error);
        throw new ApiError(500, 'Failed to generate tokens');
    }
};

/**
 * Sets authentication cookies for both access and refresh tokens
 * @description Sets secure HTTP-only cookies for authentication tokens with configurable expiry times.
 *              The cookies are secure in development and use strict same-site policy.
 * 
 * @param {Express.Response} res - Express response object
 * @param {string} accessToken - JWT access token
 * @param {string} refreshToken - JWT refresh token
 */
export const setAuthCookies = (res, accessToken, refreshToken) => {
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'development',
        sameSite: 'strict',
        maxAge: COOKIE_EXPIRY_MS
    });
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'development',
        sameSite: 'strict',
        maxAge: COOKIE_EXPIRY_MS
    });
};

// Verifies access token and returns the decoded user data
export const accessToken = async (token) => {
    if (!token) throw new ApiError(401, "No token provided");
    try {
        return jwt.verify(token, TOKEN_CONFIG.accessSecret);
    } catch (error) {
        throw new ApiError(401, error instanceof jwt.TokenExpiredError ? "Token has expired" : "Invalid token");
    }
};

/**
 * Refreshes the access token using the refresh token stored in cookies
 * @description Verifies the refresh token, finds the corresponding session, and generates a new access token.
 *              The new access token is set as an HTTP-only cookie with a configurable expiry time.
 * 
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 * @returns {Promise<void>}
 */
export const refreshAccessToken = asyncHandler(async (req, res) => {
    // Get refresh token from cookies or body
    const incomingRefreshToken = req?.cookies?.refreshToken || req?.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(
            HTTP_STATUS.UNAUTHORIZED,
            'Please login again.'
        );
    }

    try {
        // Verify refresh token
        const decoded = jwt.verify(incomingRefreshToken, REFRESH_TOKEN_SECRET);

        // Find valid session with more specific conditions
        const session = await prisma.session.findFirst({
            where: {
                userId: decoded.id,
                refreshToken: incomingRefreshToken,
                isRevoked: false,
                isExpired: false,
                isActive: true,
                refreshTokenExpiresAt: {
                    gt: new Date()
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true
                    }
                }
            }
        });

        if (!session) {
            // Cleanup any invalid sessions
            await prisma.session.updateMany({
                where: { 
                    refreshToken: incomingRefreshToken,
                    isActive: true
                },
                data: { 
                    isActive: false,
                    isExpired: true,
                    deletedAt: new Date()
                }
            });
            
            throw new ApiError(
                HTTP_STATUS.UNAUTHORIZED,
                'Invalid or expired session. Please login again.'
            );
        }

        // Generate new access token
        const newAccessToken = jwt.sign(
            {
                id: session.user.id,
                email: session.user.email,
                role: session.user.role
            },
            ACCESS_TOKEN_SECRET,
            { expiresIn: ACCESS_TOKEN_EXPIRY }
        );

        // Update session with new access token
        await prisma.session.update({
            where: { id: session.id },
            data: {
                accessToken: newAccessToken,
                accessTokenExpiresAt: new Date(Date.now() + ACCESS_EXPIRY_MS),
                accessTokenUpdatedAt: new Date()
            }
        });

        // Set cookies
        setAuthCookies(res, newAccessToken, incomingRefreshToken);

        return res.status(HTTP_STATUS.OK).json(
            new ApiResponse(
                HTTP_STATUS.OK,
                {
                    accessToken: newAccessToken,
                    expiresIn: ACCESS_EXPIRY_MS / 1000
                },
                'Access token refreshed successfully'
            )
        );
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            // Mark session as expired
            await prisma.session.updateMany({
                where: {
                    refreshToken: incomingRefreshToken,
                    isActive: true
                },
                data: {
                    isActive: false,
                    isExpired: true,
                    deletedAt: new Date()
                }
            });

            throw new ApiError(
                HTTP_STATUS.UNAUTHORIZED,
                'Refresh token has expired. Please login again.'
            );
        }

        // For any other JWT errors
        if (error instanceof jwt.JsonWebTokenError) {
            throw new ApiError(
                HTTP_STATUS.UNAUTHORIZED,
                'Invalid refresh token. Please login again.'
            );
        }

        // For unexpected errors
        throw new ApiError(
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            'Something went wrong while refreshing token.'
        );
    }
});

/**
 * Revoke refresh token and invalidate session
 */
export const revokeRefreshToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            'Refresh token not found'
        );
    }

    // Invalidate session
    await prisma.session.updateMany({
        where: {
            refreshToken,
            isValid: true
        },
        data: {
            isValid: false
        }
    });

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Token revoked successfully'
    });
});

/**
 * @description Invalidates a user session by removing the refresh token from the database.
 * @param {number} userId - The ID of the user whose session is to be invalidated
 * @param {string} refreshToken - The refresh token of the session to be invalidated
 * @returns {Promise<void>}
 * @throws {ApiError} - Throws an error if the session is not found or if there is an error deleting the session
 * 
 * @example
 *  invalidateSession(1, 'refreshToken123');
 * 
 */


// Invalidates a user session by removing the refresh token from the database
export const invalidateSession = async (userId, refreshToken) => {
    await prisma.session.deleteMany({ where: { userId, refreshToken } });
};

export default { generateTokens, setAuthCookies, accessToken, refreshAccessToken, revokeRefreshToken, invalidateSession };
