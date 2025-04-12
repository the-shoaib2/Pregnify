import { Router } from 'express';
import { validateSystem } from '../../../validators/system.validator.js';
import * as systemController from '../../../controllers/account/system.controller.js';

const router = Router();

// System Preferences
router.get('/preferences', systemController.getSystemPreferences);
router.patch('/preferences', validateSystem('preferences'), systemController.updateSystemPreferences);

// System Information
router.get('/info', systemController.getSystemInfo);
router.get('/status', systemController.getSystemStatus);

// System Maintenance
router.post('/cache/clear', systemController.clearCache);
router.post('/storage/cleanup', systemController.cleanupStorage);

// System Logs
router.get('/logs', systemController.getSystemLogs);
router.delete('/logs', systemController.clearSystemLogs);

// System Backup
router.post('/backup', validateSystem('backup'), systemController.createBackup);
router.get('/backup/list', systemController.getBackupList);
router.get('/backup/:id', systemController.downloadBackup);

export { router as systemRoutes };
