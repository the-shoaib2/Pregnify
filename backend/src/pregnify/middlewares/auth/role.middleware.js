import { ApiError } from '../../utils/error/error.utils.js';
import { HTTP_STATUS } from '../../constants/index.js';
import { ROLE_DEFINITIONS, PermissionChecker, RoleUtils } from '../../constants/roles.constants.js';

/**
 * @description Middleware to check if user has required role level
 * @param {number} requiredLevel - Minimum role level required
 */
export const hasRoleLevel = (requiredLevel) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Not authenticated');
        }

        const userRole = req.user.role;
        const roleDef = ROLE_DEFINITIONS[userRole];

        if (!roleDef) {
            throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Invalid user role');
        }

        if (roleDef.level > requiredLevel) {
            throw new ApiError(
                HTTP_STATUS.FORBIDDEN,
                `Role level ${roleDef.level} is insufficient. Required level: ${requiredLevel}`
            );
        }

        next();
    };
};

/**
 * @description Middleware to check if user has specific permission
 * @param {string|string[]} permissions - Single permission or array of permissions
 */
export const hasPermission = (permissions) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Not authenticated');
        }

        const userRole = req.user.role;
        const checker = new PermissionChecker(userRole);

        const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
        const missingPermissions = requiredPermissions.filter(perm => !checker.can(perm));

        if (missingPermissions.length > 0) {
            throw new ApiError(
                HTTP_STATUS.FORBIDDEN,
                `Missing required permissions: ${missingPermissions.join(', ')}`
            );
        }

        next();
    };
};

/**
 * @description Middleware to check if user has role in specific category
 * @param {string} category - Required role category
 */
export const hasRoleCategory = (category) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Not authenticated');
        }

        const userRole = req.user.role;
        const checker = new PermissionChecker(userRole);

        if (!checker.isInCategory(category)) {
            throw new ApiError(
                HTTP_STATUS.FORBIDDEN,
                `Role must be in category: ${category}`
            );
        }

        next();
    };
};

/**
 * @description Middleware to check if user has any of the specified roles
 * @param {string[]} roles - Array of allowed roles
 */
export const hasAnyRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Not authenticated');
        }

        const userRole = req.user.role;
        if (!roles.includes(userRole)) {
            throw new ApiError(
                HTTP_STATUS.FORBIDDEN,
                `Role ${userRole} is not authorized for this action`
            );
        }

        next();
    };
};

/**
 * @description Middleware to check if user has all specified roles
 * @param {string[]} roles - Array of required roles
 */
export const hasAllRoles = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Not authenticated');
        }

        const userRole = req.user.role;
        const missingRoles = roles.filter(role => !RoleUtils.isRoleHigherOrEqual(userRole, role));

        if (missingRoles.length > 0) {
            throw new ApiError(
                HTTP_STATUS.FORBIDDEN,
                `Missing required roles: ${missingRoles.join(', ')}`
            );
        }

        next();
    };
};

/**
 * @description Middleware to check if user has role with specific metadata
 * @param {Object} metadata - Required role metadata
 */
export const hasRoleMetadata = (metadata) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Not authenticated');
        }

        const userRole = req.user.role;
        const roleMetadata = RoleUtils.getRoleMetadata(userRole);

        const missingMetadata = Object.entries(metadata)
            .filter(([key, value]) => roleMetadata[key] !== value)
            .map(([key]) => key);

        if (missingMetadata.length > 0) {
            throw new ApiError(
                HTTP_STATUS.FORBIDDEN,
                `Role missing required metadata: ${missingMetadata.join(', ')}`
            );
        }

        next();
    };
};

/**
 * @description Middleware to check if user has inherited role
 * @param {string} parentRole - Parent role to check inheritance from
 */
export const hasInheritedRole = (parentRole) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Not authenticated');
        }

        const userRole = req.user.role;
        const roleDef = ROLE_DEFINITIONS[userRole];

        if (!roleDef.inherits.includes(parentRole)) {
            throw new ApiError(
                HTTP_STATUS.FORBIDDEN,
                `Role ${userRole} does not inherit from ${parentRole}`
            );
        }

        next();
    };
};

export default {
    hasRoleLevel,
    hasPermission,
    hasRoleCategory,
    hasAnyRole,
    hasAllRoles,
    hasRoleMetadata,
    hasInheritedRole
}; 