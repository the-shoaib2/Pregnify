import express from 'express';
import { isAuthenticated } from '../../../middlewares/auth/auth.middleware.js';
import { hasRole } from '../../../middlewares/auth/role.middleware.js';
import { dashboardController } from '../../controllers/dashboard/dashboard.controller.js';
import { USER_DEFINITIONS } from '../../../constants/roles.constants.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Get dashboard data based on user role
router.get('/', 
    hasRole([USER_DEFINITIONS.GAMMA, USER_DEFINITIONS.DELTA, USER_DEFINITIONS.EPSILON]),
    dashboardController.getDashboardData
);

export default router; 