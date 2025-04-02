import { Router } from 'express';
import { validateSettings } from '../../../validators/settings.validator.js';
import * as settingsController from '../../../controllers/account/settings.controller.js';
import { profileRoutes } from './profile.routes.js';
import { securityRoutes } from './security.routes.js';
import { systemRoutes } from './system.routes.js';
import { validateSettingsAccess } from '../../../middlewares/account/settings.middleware.js';
// import billingRoutes from './settings/billing.routes.js'; // Temporarily commented out

const router = Router();

// Apply settings access validation
router.use(validateSettingsAccess);

// Mount settings sub-routes
router.use('/profile', profileRoutes);
router.use('/security', securityRoutes);
router.use('/system', systemRoutes);
// router.use('/billing', billingRoutes); // Temporarily commented out

// General Settings Routes
router.get('/', settingsController.getSettings);
router.patch('/update', validateSettings('general'), settingsController.updateSettings);

// Theme & Appearance
router.patch('/appearance', validateSettings('appearance'), settingsController.updateAppearance);

// Language & Region
router.patch('/language', validateSettings('language'), settingsController.updateLanguage);

// Notification Settings
router.patch('/notifications', validateSettings('notifications'), settingsController.updateNotifications);

// Privacy Settings
router.patch('/privacy', validateSettings('privacy'), settingsController.updatePrivacy);

// Reset Settings
router.post('/reset', settingsController.resetSettings);

export { router as settingsRoutes };