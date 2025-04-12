import prisma from '../../utils/database/prisma.js';
import { ROLE_DEFINITIONS } from '../../constants/roles.constants.js';
import asyncHandler from '../../utils/middleware/async.handler.js';
import ApiError from '../../utils/error/api.error.js';
import ApiResponse from '../../utils/error/api.response.js';
import { HTTP_STATUS } from '../../constants/index.js';

/**
 * @desc    Get all roles
 * @route   GET /api/v1/admin/roles
 * @access  Private/Admin
 */
export const getRoles = asyncHandler(async (req, res) => {
    const roles = await prisma.userRole.findMany({
        include: {
            UserRoleAssignment: {
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            }
        },
        orderBy: {
            name: 'asc'
        }
    });

    return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(HTTP_STATUS.OK, { roles }, 'Roles retrieved successfully')
    );
});

/**
 * @desc    Create new role
 * @route   POST /api/v1/admin/roles
 */
export const createRole = asyncHandler(async (req, res) => {
    const { name, description, permissions } = req.body;

    // Check if role already exists
    if (Object.values(ROLE_DEFINITIONS).some(role => role.name === name)) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Role already exists');
    }

    // Create new role (in a real implementation, this would be stored in the database)
    const newRole = {
        id: name.toUpperCase().replace(/\s+/g, '_'),
        name,
        description,
        level: 10, // Default level
        permissions: permissions || [],
        metadata: {}
    };

    res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Role created successfully',
        data: newRole
    });
});

/**
 * @desc    Update role
 * @route   PUT /api/v1/admin/roles/:roleId
 */
export const updateRole = asyncHandler(async (req, res) => {
    const { roleId } = req.params;
    const { name, description, permissions } = req.body;

    // Check if role exists
    const role = ROLE_DEFINITIONS[roleId];
    if (!role) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Role not found');
    }

    // Update role (in a real implementation, this would update the database)
    const updatedRole = {
        ...role,
        name: name || role.name,
        description: description || role.description,
        permissions: permissions || role.permissions
    };

    res.json({
        success: true,
        message: 'Role updated successfully',
        data: updatedRole
    });
});

/**
 * @desc    Delete role
 * @route   DELETE /api/v1/admin/roles/:roleId
 */
export const deleteRole = asyncHandler(async (req, res) => {
    const { roleId } = req.params;

    // Check if role exists
    if (!ROLE_DEFINITIONS[roleId]) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Role not found');
    }

    // In a real implementation, you would:
    // 1. Check if any users have this role
    // 2. Delete the role from the database
    // 3. Handle role reassignment if needed

    res.json({
        success: true,
        message: 'Role deleted successfully'
    });
});

/**
 * @desc    Assign role to user
 * @route   POST /api/v1/admin/users/:userId/roles
 * @access  Private/Admin
 */
export const assignRole = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { roleId, reason } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    // Check if role exists
    const role = await prisma.userRole.findUnique({
        where: { id: roleId }
    });

    if (!role) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Role not found');
    }

    // Check if role is already assigned
    const existingAssignment = await prisma.userRoleAssignment.findFirst({
        where: {
            userId,
            roleId
        }
    });

    if (existingAssignment) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Role already assigned to user');
    }

    // Create role assignment
    const assignment = await prisma.userRoleAssignment.create({
        data: {
            userId,
            roleId,
            assignedBy: req.user.id,
            reason: reason || null
        },
        include: {
            role: true,
            user: {
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true
                }
            }
        }
    });

    return res.status(HTTP_STATUS.CREATED).json(
        new ApiResponse(HTTP_STATUS.CREATED, { assignment }, 'Role assigned successfully')
    );
});

/**
 * @desc    Remove role from user
 * @route   DELETE /api/v1/admin/users/:userId/roles/:roleId
 * @access  Private/Admin
 */
export const removeRole = asyncHandler(async (req, res) => {
    const { userId, roleId } = req.params;

    // Check if assignment exists
    const assignment = await prisma.userRoleAssignment.findFirst({
        where: {
            userId,
            roleId
        },
        include: {
            role: true,
            user: {
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true
                }
            }
        }
    });

    if (!assignment) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Role assignment not found');
    }

    // Delete the assignment
    await prisma.userRoleAssignment.delete({
        where: {
            id: assignment.id
        }
    });

    return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(HTTP_STATUS.OK, { assignment }, 'Role removed successfully')
    );
});

/**
 * @desc    Get user's role assignments
 * @route   GET /api/v1/admin/users/:userId/roles
 * @access  Private/Admin
 */
export const getUserRoleAssignments = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
        }
    });

    if (!user) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    // Get user's role assignments
    const assignments = await prisma.userRoleAssignment.findMany({
        where: { userId },
        include: {
            role: true,
            assignedByUser: {
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true
                }
            }
        },
        orderBy: {
            assignedAt: 'desc'
        }
    });

    return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(HTTP_STATUS.OK, { user, assignments }, 'User role assignments retrieved successfully')
    );
});

export default {
    getRoles,
    createRole,
    updateRole,
    deleteRole,
    assignRole,
    removeRole,
    getUserRoleAssignments
}; 