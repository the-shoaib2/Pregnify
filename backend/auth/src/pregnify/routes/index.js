import express from 'express';
import { isAuthenticated } from '../../middlewares/auth/auth.middleware.js';
import pregnancyRoutes from './pregnancy/pregnancy.routes.js';

// Import all pregnancy-related routes
import pregnancyTrackingRoutes from './pregnancy/pregnancy-tracking.routes.js';
import healthMonitoringRoutes from './pregnancy/health-monitoring.routes.js';
import riskAssessmentRoutes from './pregnancy/risk-assessment.routes.js';
import nutritionTrackingRoutes from './pregnancy/nutrition-tracking.routes.js';
import exerciseTrackingRoutes from './pregnancy/exercise-tracking.routes.js';
import mentalHealthTrackingRoutes from './pregnancy/mental-health-tracking.routes.js';
import babyDevelopmentTrackingRoutes from './pregnancy/baby-development-tracking.routes.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// ============================================
// 1. Pregnancy Routes
// ============================================
router.use('/pregnancy', pregnancyRoutes);

// ============================================
// 3. Pregnancy Tracking Routes
// ============================================
router.use('/pregnancy/tracking', pregnancyTrackingRoutes);

// ============================================
// 4. Health Monitoring Routes
// ============================================
router.use('/pregnancy/health', healthMonitoringRoutes);

// ============================================
// 5. Baby Development Routes
// ============================================
router.use('/pregnancy/baby', babyDevelopmentTrackingRoutes);

// ============================================
// 6. Wellness & Lifestyle Routes
// ============================================
router.use('/pregnancy/nutrition', nutritionTrackingRoutes);
router.use('/pregnancy/exercise', exerciseTrackingRoutes);
router.use('/pregnancy/mental-health', mentalHealthTrackingRoutes);

// ============================================
// 7. Risk Assessment & Prediction Routes
// ============================================
router.use('/pregnancy/risk', riskAssessmentRoutes);

// ============================================
// 8. Emergency Services Routes
// ============================================
// TODO: Implement emergency routes

// ============================================
// 9. Telemedicine Routes
// ============================================
// TODO: Implement telemedicine routes

// ============================================
// 10. Pregnancy Care Plan Routes
// ============================================
// TODO: Implement pregnancy care plan routes

export default router;


