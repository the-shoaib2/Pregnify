import prisma from '../../utils/database/prisma.js';
import ApiError from '../../utils/error/api.error.js';
import asyncHandler from '../../utils/middleware/async.handler.js';
import { ROLE_DEFINITIONS } from '../../constants/roles.constants.js';
import { HTTP_STATUS } from '../../constants/index.js';



/**
 * @desc    Get system stats
 * @route   GET /api/v1/admin/system/stats
 */
export const getSystemStats = asyncHandler(async (req, res) => {
    const stats = await prisma.$transaction([
        prisma.user.count(),
        prisma.user.count({ where: { isVerified: true } }),
        prisma.user.count({ where: { accountStatus: 'ACTIVE' } }),
        prisma.securityLog.count(),
        prisma.userActivityLog.count()
    ]);

    res.json({
        success: true,
        data: {
            totalUsers: stats[0],
            verifiedUsers: stats[1],
            activeUsers: stats[2],
            securityLogs: stats[3],
            activityLogs: stats[4]
        }
    });
});

/**
 * @desc    Get system logs
 * @route   GET /api/v1/admin/system/logs
 */
export const getSystemLogs = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, type } = req.query;

    const where = type ? { type } : {};

    const [logs, total] = await Promise.all([
        prisma.systemLog.findMany({
            where,
            orderBy: { timestamp: 'desc' },
            skip: (page - 1) * limit,
            take: limit
        }),
        prisma.systemLog.count({ where })
    ]);

    res.json({
        success: true,
        data: {
            logs,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        }
    });
});

/**
 * @desc    Clear system logs
 * @route   DELETE /api/v1/admin/system/logs
 */
export const clearSystemLogs = asyncHandler(async (req, res) => {
    await prisma.systemLog.deleteMany({});

    res.json({
        success: true,
        message: 'System logs cleared successfully'
    });
});

/**
 * @desc    Get security audit
 * @route   GET /api/v1/admin/security/audit
 */
export const getSecurityAudit = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const where = {
        ...(startDate && endDate && {
            timestamp: {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
        })
    };

    const audit = await prisma.securityLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        include: {
            user: {
                select: {
                    email: true,
                    role: true
                }
            }
        }
    });

    res.json({
        success: true,
        data: audit
    });
});

/**
 * @desc    Enable system lockdown
 * @route   POST /api/v1/admin/security/lockdown
 */
export const enableLockdown = asyncHandler(async (req, res) => {
    const { reason } = req.body;

    await prisma.$transaction(async (tx) => {
        // Update system settings
        await tx.systemSettings.update({
            where: { id: 1 },
            data: { 
                isLockdownEnabled: true,
                lockdownReason: reason,
                lockdownEnabledAt: new Date()
            }
        });

        // Log action
        await tx.adminActivityLog.create({
            data: {
                userId: req.user.id,
                action: 'ENABLE_LOCKDOWN',
                details: `System lockdown enabled: ${reason}`
            }
        });
    });

    res.json({
        success: true,
        message: 'System lockdown enabled'
    });
});

/**
 * @desc    Disable system lockdown
 * @route   DELETE /api/v1/admin/security/lockdown
 */
export const disableLockdown = asyncHandler(async (req, res) => {
    await prisma.$transaction(async (tx) => {
        // Update system settings
        await tx.systemSettings.update({
            where: { id: 1 },
            data: { 
                isLockdownEnabled: false,
                lockdownReason: null,
                lockdownEnabledAt: null
            }
        });

        // Log action
        await tx.adminActivityLog.create({
            data: {
                userId: req.user.id,
                action: 'DISABLE_LOCKDOWN',
                details: 'System lockdown disabled'
            }
        });
    });

    res.json({
        success: true,
        message: 'System lockdown disabled'
    });
});

/**
 * @desc    Get admin settings
 * @route   GET /api/v1/admin/settings
 */
export const getAdminSettings = asyncHandler(async (req, res) => {
    const settings = await prisma.systemSettings.findFirst();

    res.json({
        success: true,
        data: settings
    });
});

/**
 * @desc    Update admin settings
 * @route   PUT /api/v1/admin/settings
 */
export const updateAdminSettings = asyncHandler(async (req, res) => {
    const updates = req.body;

    const settings = await prisma.$transaction(async (tx) => {
        // Update settings
        const updated = await tx.systemSettings.update({
            where: { id: 1 },
            data: updates
        });

        // Log action
        await tx.adminActivityLog.create({
            data: {
                userId: req.user.id,
                action: 'UPDATE_SETTINGS',
                details: 'Updated system settings',
                changes: updates
            }
        });

        return updated;
    });

    res.json({
        success: true,
        message: 'Settings updated successfully',
        data: settings
    });
});

/**
 * @desc    Get all roles
 * @route   GET /api/v1/admin/roles
 */
export const getRoles = asyncHandler(async (req, res) => {
    const roles = Object.values(ROLE_DEFINITIONS).map(role => ({
        ...role,
        users: {
            _count: 0 // This would need to be calculated if needed
        }
    }));

    res.json({
        success: true,
        data: roles
    });
});

/**
 * @desc    Create new role
 * @route   POST /api/v1/admin/roles
 */
export const createRole = asyncHandler(async (req, res) => {
    const { name, description, permissions } = req.body;

    const role = await prisma.$transaction(async (tx) => {
        // Create role
        const newRole = await tx.role.create({
            data: {
                name,
                description,
                permissions: {
                    connect: permissions.map(id => ({ id }))
                }
            },
            include: {
                permissions: true
            }
        });

        // Log admin action
        await tx.adminActivityLog.create({
            data: {
                userId: req.user.id,
                action: 'ROLE_CREATE',
                details: `Created new role: ${name}`,
                metadata: { roleId: newRole.id }
            }
        });

        return newRole;
    });

    res.status(201).json({
        success: true,
        message: 'Role created successfully',
        data: role
    });
});

/**
 * @desc    Update role
 * @route   PUT /api/v1/admin/roles/:roleId
 */
export const updateRole = asyncHandler(async (req, res) => {
    const { roleId } = req.params;
    const { name, description, permissions } = req.body;

    const role = await prisma.$transaction(async (tx) => {
        // Update role
        const updatedRole = await tx.role.update({
            where: { id: roleId },
            data: {
                name,
                description,
                permissions: {
                    set: permissions.map(id => ({ id }))
                }
            },
            include: {
                permissions: true
            }
        });

        // Log admin action
        await tx.adminActivityLog.create({
            data: {
                userId: req.user.id,
                action: 'ROLE_UPDATE',
                details: `Updated role: ${name}`,
                metadata: { roleId }
            }
        });

        return updatedRole;
    });

    res.json({
        success: true,
        message: 'Role updated successfully',
        data: role
    });
});

/**
 * @desc    Delete role
 * @route   DELETE /api/v1/admin/roles/:roleId
 */
export const deleteRole = asyncHandler(async (req, res) => {
    const { roleId } = req.params;

    await prisma.$transaction(async (tx) => {
        const role = await tx.role.findUnique({
            where: { id: roleId }
        });

        if (!role) {
            throw new ApiError(404, 'Role not found');
        }

        // Check if role has users
        const usersCount = await tx.user.count({
            where: { roleId }
        });

        if (usersCount > 0) {
            throw new ApiError(400, 'Cannot delete role with assigned users');
        }

        // Delete role
        await tx.role.delete({
            where: { id: roleId }
        });

        // Log admin action
        await tx.adminActivityLog.create({
            data: {
                userId: req.user.id,
                action: 'ROLE_DELETE',
                details: `Deleted role: ${role.name}`,
                metadata: { roleId }
            }
        });
    });

    res.json({
        success: true,
        message: 'Role deleted successfully'
    });
});

export default {
    getSystemLogs,
    clearSystemLogs,
    getSecurityAudit,
    enableLockdown,
    disableLockdown,
    getAdminSettings,
    updateAdminSettings
};
