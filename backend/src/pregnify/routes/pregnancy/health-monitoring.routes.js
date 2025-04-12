import express from 'express';
import healthMonitoringController from '../../controllers/pregnancy/health-monitoring.controller.js';
import { isAuthenticated } from '../../../middlewares/auth/auth.middleware.js';

const router = express.Router();

router.use(isAuthenticated);

// Record health metrics
router.post(
  '/pregnancies/:pregnancyId/health-metrics',
  healthMonitoringController.recordHealthMetric
);

// Get health metrics history
router.get(
  '/pregnancies/:pregnancyId/health-metrics',
  healthMonitoringController.getHealthMetrics
);

// Record symptoms
router.post(
  '/pregnancies/:pregnancyId/symptoms',
  healthMonitoringController.recordSymptom
);

// Get symptoms history
router.get(
  '/pregnancies/:pregnancyId/symptoms',
  healthMonitoringController.getSymptomLogs
);

// Get health summary
router.get(
  '/pregnancies/:pregnancyId/health/summary',
  healthMonitoringController.getHealthSummary
);

// Get health alerts
router.get(
  '/pregnancies/:pregnancyId/health/alerts',
  healthMonitoringController.getHealthAlerts
);

// Mark alert as read
router.patch(
  '/health/alerts/:alertId/read',
  healthMonitoringController.markAlertAsRead
);

export default router; 