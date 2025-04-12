import { Router } from 'express';
import {
    getActivityLogs,
    getActivityStats,
    getActiveSessions,
    exportActivityData,
    trackActivity
} from '../../../controllers/account/activity.controller.js';

const router = Router();

// Activity logs routes
router.get('/logs', getActivityLogs);
router.get('/stats', getActivityStats);
router.get('/sessions', getActiveSessions);
router.post('/export', exportActivityData);
router.post('/track', trackActivity);

export { router as activityRoutes };
