import express from 'express';
import { isAuthenticated, authorize } from '../../../middlewares/auth/auth.middleware.js';
import {
    validateAdminAccess,
    requirePermission,
    validateAdminIP
} from '../../../middlewares/admin.middleware.js';
import { adminLimiter } from '../../../middlewares/rate-limit/rate.limiter.js';
import {
    getSystemStats,
    getSystemLogs,
    clearSystemLogs,
    getSecurityAudit,
    enableLockdown,
    disableLockdown,
    getAdminSettings,
    updateAdminSettings
} from '../../../controllers/admin/admin.controller.js';
import {
    getDashboardOverview,
} from '../../../controllers/admin/dashboard.controller.js';
import {
    findUser,
    createUser,
    getAllUsers,
    updateUser,
    deleteUser,
    getUserById,
    updateUserStatus,
    getUsersWithFilters,
    getUserStatistics,
    getAllActivities,
    getUserActivityById,
    getActivityByUserId
} from '../../../controllers/admin/user-management.controller.js';
import {
    getRoles,
    assignRole,
    removeRole,
    getUserRoleAssignments
} from '../../../controllers/admin/role-management.controller.js';

import {
    searchUserValidation,
    searchUser
} from '../../../middlewares/auth/forgot_password.middleware.js';

const router = express.Router();

// Apply base middleware to all admin routes
router.use(isAuthenticated);
router.use(authorize(['ADMIN', 'SUPER_ADMIN']));
router.use(adminLimiter);
router.use(validateAdminAccess);
router.use(validateAdminIP);  // Optional: IP whitelist check

// Dashboard Routes
/**
 * @route   GET /api/v1/admin/dashboard
 * @desc    Get dashboard overview data
 * @access  Admin
 */
router.get('/dashboard', getDashboardOverview);

// User Management (requires user management permission)
router.post(
    '/user/find',
    requirePermission('USER_MANAGEMENT'),
    searchUserValidation,
    searchUser,
    findUser,
);
router.get('/users/statistics', requirePermission('USER_MANAGEMENT'), getUserStatistics);
router.get('/users/search', requirePermission('USER_MANAGEMENT'), getUsersWithFilters);
router.get('/users', requirePermission('USER_MANAGEMENT'), getAllUsers);
router.post('/users', requirePermission('USER_MANAGEMENT'), createUser);
router.get('/users/:userId', requirePermission('USER_MANAGEMENT'), getUserById);
router.put('/users/:userId', requirePermission('USER_MANAGEMENT'), updateUser);
router.delete('/users/:userId', requirePermission('USER_MANAGEMENT'), deleteUser);
router.patch('/users/:userId/status', requirePermission('USER_MANAGEMENT'), updateUserStatus);

// User Activity Routes
router.get('/activities',  requirePermission('USER_MANAGEMENT'),getAllActivities);
router.get('/users/:userId/activities',  requirePermission('USER_MANAGEMENT'),getActivityByUserId);
router.get('/users/:userId/activities/:activityId',  requirePermission('USER_MANAGEMENT'),getUserActivityById);

// Role Management
router.get('/roles', getRoles);
router.post('/users/:userId/roles', assignRole);
router.delete('/users/:userId/roles/:roleId', removeRole);
router.get('/users/:userId/roles', getUserRoleAssignments);

// System Management
router.get('/system/stats', getSystemStats);
router.get('/system/logs', getSystemLogs);
router.delete('/system/logs', clearSystemLogs);

// Security Management
router.get('/security/audit', getSecurityAudit);
router.post('/security/lockdown', enableLockdown);
router.delete('/security/lockdown', disableLockdown);

// Settings Management
router.get('/settings', getAdminSettings);
router.put('/settings', updateAdminSettings);

export default router;
