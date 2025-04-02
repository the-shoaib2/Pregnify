import { Router } from 'express';
import securityValidator from '../../../validators/security.validator.js';
import * as securityController from '../../../controllers/account/security.controller.js';

const router = Router();

// Password Management
router.patch('/password', securityValidator.validateSecurity('password'), securityController.updatePassword);
router.post('/password/reset-request', securityController.requestPasswordReset);
router.post('/password/reset', securityValidator.validateSecurity('resetPassword'), securityController.resetPassword);

// Two-Factor Authentication
router.post('/2fa/enable', securityController.enable2FA);
router.post('/2fa/verify', securityValidator.validateSecurity('2faVerify'), securityController.verify2FA);
router.post('/2fa/disable', securityController.disable2FA);
router.get('/2fa/backup-codes', securityController.getBackupCodes);

// Device Management
router.get('/devices', securityController.getDevices);
router.delete('/devices/:deviceId', securityController.removeDevice);
router.post('/devices/logout-all', securityController.logoutAllDevices);

// Security Questions
router.get('/questions', securityController.getSecurityQuestions);
router.post('/questions', securityValidator.validateSecurity('securityQuestions'), securityController.setSecurityQuestions);
router.patch('/questions', securityValidator.validateSecurity('securityQuestions'), securityController.updateSecurityQuestions);

// Activity Logs
router.get('/activity', securityController.getActivityLogs);
router.delete('/activity', securityController.clearActivityLogs);

export { router as securityRoutes };
