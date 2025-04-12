import { ApiError } from '../utils/error/error.utils.js';
import asyncHandler from '../utils/middleware/async.handler.js';
import prisma from '../utils/database/prisma.js';
import { HTTP_STATUS } from '../constants/index.js';
import { USER_DEFINITIONS, PermissionChecker } from '../constants/roles.constants.js';

/**
 * Validate admin access and permissions
 */
export const validateAdminAccess = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if user has admin role from decoded token
    if (![USER_DEFINITIONS.ALPHA, USER_DEFINITIONS.BETA].includes(userRole)) {
        throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Access denied: Admin role required');
    }

    // Get admin user details
    const adminUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            accountStatus: true,
            lastActive: true
        }
    });

    if (!adminUser) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Admin user not found');
    }

    if (adminUser.accountStatus !== 'ACTIVE') {
        throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Admin account is inactive');
    }

    // Update last active time
    await prisma.user.update({
        where: { id: userId },
        data: { lastActive: new Date() }
    });

    // Add admin role to request for use in controllers
    req.adminRole = userRole;

    // Log admin access
    await prisma.userActivityLog.create({
        data: {
            userId,
            activityType: 'API_ACCESS',
            description: `Admin access to ${req.originalUrl}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        }
    });

    next();
});

/**
 * Validate specific admin permission
 */
export const requirePermission = (permission) => {
    return asyncHandler(async (req, res, next) => {
        const adminRole = req.adminRole;
        
        // SUPER_ADMIN has all permissions
        if (adminRole === USER_DEFINITIONS.ALPHA) {
            return next();
        }

        // For ADMIN role, check specific permissions
        if (adminRole === USER_DEFINITIONS.BETA) {
            const checker = new PermissionChecker(adminRole);
            if (!checker.can(permission)) {
                throw new ApiError(
                    HTTP_STATUS.FORBIDDEN,
                    `Required admin permission: ${permission}`
                );
            }
        }

        next();
    });
};

/**
 * Validate super admin access
 */
export const requireSuperAdmin = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
    });

    if (user.role !== USER_DEFINITIONS.ALPHA) {
        throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            'Super admin access required'
        );
    }

    next();
});

/**
 * Validate admin IP whitelist
 */
export const validateAdminIP = asyncHandler(async (req, res, next) => {
    const clientIP = req.ip;
    const userId = req.user.id;

    // Skip IP validation for SUPER_ADMIN
    if (req.adminRole === USER_DEFINITIONS.ALPHA) {
        return next();
    }

    const whitelistedIP = await prisma.ipWhitelist.findFirst({
        where: { 
            userId,
            ipAddress: clientIP 
        }
    });

    if (!whitelistedIP) {
        // Log unauthorized access attempt
        await prisma.userActivityLog.create({
            data: {
                userId,
                activityType: 'SECURITY_ALERT',
                description: `Unauthorized admin access attempt from IP: ${clientIP}`,
                ipAddress: clientIP,
                userAgent: req.get('user-agent'),
                metadata: {
                    endpoint: req.originalUrl,
                    severity: 'HIGH'
                }
            }
        });

        throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            'Access denied: IP not whitelisted for admin access'
        );
    }

    next();
});

export default {
    validateAdminAccess,
    requirePermission,
    requireSuperAdmin,
    validateAdminIP
}; 