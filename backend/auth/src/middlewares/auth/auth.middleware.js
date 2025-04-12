import { ApiError } from '../../utils/error/error.utils.js';
import asyncHandler from '../../utils/middleware/async.handler.js';
import jwt from 'jsonwebtoken';
import prisma from '../../utils/database/prisma.js';
import { HTTP_STATUS } from '../../constants/index.js';

// Performance monitoring
const startTime = Symbol('startTime');

// Cache token configuration
const TOKEN_CONFIG = {
    accessSecret: process.env.ACCESS_TOKEN_SECRET,
    refreshSecret: process.env.REFRESH_TOKEN_SECRET,
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRES || '15m',
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRES || '30d'
};

// Simple in-memory token blacklist with TTL
const tokenBlacklist = new Map();
const BLACKLIST_CLEANUP_INTERVAL = 1000 * 60 * 60; // 1 hour

// Clean up expired tokens from blacklist
setInterval(() => {
    const now = Date.now();
    for (const [token, timestamp] of tokenBlacklist) {
        if (now - timestamp > BLACKLIST_CLEANUP_INTERVAL) {
            tokenBlacklist.delete(token);
        }
    }
}, BLACKLIST_CLEANUP_INTERVAL);

// Simple in-memory user cache
const userCache = new Map();
const USER_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// List of public routes that don't require authentication
const publicRoutes = [
    '/api/v1/auth/login',
    '/api/v1/auth/register',
    '/api/v1/verification/forgot-password/find-user',
    '/api/v1/verification/forgot-password/send-code',
    '/api/v1/verification/forgot-password/verify-code',
    '/api/v1/verification/forgot-password/reset-password'
    
];

export const isAuthenticated = async (req, res, next) => {
    try {
        // Check if route is public
        if (publicRoutes.includes(req.path)) {
            return next();
        }

        const token = req.headers.authorization;

        if (!token || !token.startsWith('Bearer ')) {
            throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'No token provided');
        }

        const tokenWithoutBearer = token.split(' ')[1];

        // Check token blacklist
        if (tokenBlacklist.has(tokenWithoutBearer)) {
            throw new ApiError(401, 'Token has been revoked');
        }

        // Verify token
        const decoded = jwt.verify(tokenWithoutBearer, TOKEN_CONFIG.accessSecret);
        const userId = decoded.id || decoded.userId || decoded.sub;
        
        if (!userId) {
            throw new ApiError(401, 'Invalid token: No user ID found');
        }

        // Check cache first
        const cachedUser = userCache.get(userId);
        if (cachedUser && cachedUser.timestamp > Date.now() - USER_CACHE_TTL) {
            req.user = cachedUser.data;
            
            // Add performance metrics header
            res.set('X-Response-Time', `${Date.now() - req[startTime]}ms`);
            return next();
        }

        // Get user from database with minimal fields
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                isVerified: true,
                twoFactorEnabled: true,
                isAccountLocked: true
            }
        });

        if (!user) {
            throw new ApiError(401, 'User not found');
        }

        if (user.isAccountLocked) {
            throw new ApiError(401, 'Account is locked');
        }

        // Cache the user data
        userCache.set(userId, {
            data: user,
            timestamp: Date.now()
        });

        req.user = user;

        // Add performance metrics header
        res.set('X-Response-Time', `${Date.now() - req[startTime]}ms`);
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            throw new ApiError(401, `Invalid token: ${error.message}`);
        }
        if (error.name === 'TokenExpiredError') {
            throw new ApiError(401, 'Token expired');
        }
        next(error);
    }
};

export const authorize = (roles) => {
    return asyncHandler(async (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, 'Not authenticated');
        }

        const userRole = req.user.role;
        
        // Check if user has any of the required roles
        if (!roles.includes(userRole)) {
            throw new ApiError(403, 'Not authorized to access this resource');
        }

        // If the route requires admin access, validate admin role
        if (roles.includes('ADMIN') || roles.includes('SUPER_ADMIN')) {
            if (!['SUPER_ADMIN', 'ADMIN'].includes(userRole)) {
                throw new ApiError(403, 'Admin access required');
            }
        }

        next();
    });
};

export const revokeToken = (token) => {
    tokenBlacklist.set(token, Date.now());
};

export const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            return next();
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decodedToken?.id }
        });

        if (user) {
            req.user = user;
        }
        
        next();
    } catch (error) {
        // If token verification fails, continue without user
        next();
    }
};

export default {
    isAuthenticated,
    authorize,
    revokeToken,
    optionalAuth
};
