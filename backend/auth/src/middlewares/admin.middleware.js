import { ApiError } from '../utils/error/error.utils.js';
import asyncHandler from '../utils/middleware/async.handler.js';
import prisma from '../utils/database/prisma.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * Validate admin access and permissions
 */
export const validateAdminAccess = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    // Get admin permissions and status
    const adminUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            role: true,
            isActive: true,
            adminPermissions: true,
            lastAdminAccess: true
        }
    });

    if (!adminUser) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Admin user not found');
    }

    if (!adminUser.isActive) {
        throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Admin account is inactive');
    }

    // Check if user has required admin permissions
    if (!adminUser.adminPermissions || adminUser.adminPermissions.length === 0) {
        throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Insufficient admin permissions');
    }

    // Update last admin access time
    await prisma.user.update({
        where: { id: userId },
        data: { lastAdminAccess: new Date() }
    });

    // Add admin permissions to request for use in controllers
    req.adminPermissions = adminUser.adminPermissions;

    // Log admin access
    await prisma.adminActivityLog.create({
        data: {
            userId,
            action: req.method,
            resource: req.originalUrl,
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
        const adminPermissions = req.adminPermissions;

        if (!adminPermissions || !adminPermissions.includes(permission)) {
            throw new ApiError(
                HTTP_STATUS.FORBIDDEN,
                `Required admin permission: ${permission}`
            );
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

    if (user.role !== 'SUPER_ADMIN') {
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

    const whitelistedIP = await prisma.adminIPWhitelist.findFirst({
        where: { ipAddress: clientIP }
    });

    if (!whitelistedIP) {
        // Log unauthorized access attempt
        await prisma.securityLog.create({
            data: {
                userId: req.user.id,
                eventType: 'UNAUTHORIZED_ADMIN_ACCESS',
                severity: 'HIGH',
                description: `Unauthorized admin access attempt from IP: ${clientIP}`,
                metadata: {
                    ipAddress: clientIP,
                    userAgent: req.get('user-agent'),
                    endpoint: req.originalUrl
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