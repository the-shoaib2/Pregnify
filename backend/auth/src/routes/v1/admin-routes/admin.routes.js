import express from 'express';
import { isAuthenticated, authorize } from '../../../middlewares/auth/auth.middleware.js';
import { 
    validateAdminAccess, 
    requirePermission, 
    validateAdminIP 
} from '../../../middlewares/admin.middleware.js';
import { adminLimiter } from '../../../middlewares/rate-limit/rate.limiter.js';
import { 
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getSystemStats,
    getSystemLogs,
    clearSystemLogs,
    getSecurityAudit,
    enableLockdown,
    disableLockdown,
    getAdminSettings,
    updateAdminSettings,
    getRoles,
    createRole,
    updateRole,
    deleteRole
} from '../../../controllers/admin/admin.controller.js';

const router = express.Router();

// Apply base middleware to all admin routes
router.use(isAuthenticated);
router.use(authorize(['ADMIN', 'SUPER_ADMIN']));
router.use(adminLimiter);
router.use(validateAdminAccess);
router.use(validateAdminIP);  // Optional: IP whitelist check

// User Management (requires user management permission)
router.get('/users', requirePermission('USER_MANAGEMENT'), getAllUsers);
router.get('/users/:userId', requirePermission('USER_MANAGEMENT'), getUserById);
router.put('/users/:userId', requirePermission('USER_MANAGEMENT'), updateUser);
router.delete('/users/:userId', requirePermission('USER_MANAGEMENT'), deleteUser);

// Role Management
router.get('/roles', getRoles);
router.post('/roles', createRole);
router.put('/roles/:roleId', updateRole);
router.delete('/roles/:roleId', deleteRole);

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
