import { Router } from 'express';
import { profileRoutes } from './profile.routes.js';
import { settingsRoutes } from './settings.routes.js';
import { securityRoutes } from './security.routes.js';
import { activityRoutes } from './activity.routes.js';
import { isAuthenticated } from '../../../middlewares/auth/auth.middleware.js';

const router = Router();

// Apply authentication middleware to all account routes
router.use(isAuthenticated);

// Mount routes
router.use('/profile', profileRoutes);
router.use('/settings', settingsRoutes);
router.use('/security', securityRoutes);
router.use('/activitys', activityRoutes);

// Export as accountRoutes
export default router;

