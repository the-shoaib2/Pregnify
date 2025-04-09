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
import aiPredictionRoutes from './pregnancy/ai-prediction.routes.js';

// Import doctor consultation routes
import doctorProfileRoutes from './doctor/doctor-profile.routes.js';
import doctorAppointmentRoutes from './doctor/doctor-appointment.routes.js';
import doctorChatRoutes from './doctor/doctor-chat.routes.js';
import doctorCallRoutes from './doctor/doctor-call.routes.js';
import doctorReviewRoutes from './doctor/doctor-review.routes.js';

// Import ambulance booking routes
import ambulanceRoutes from './ambulance/ambulance.routes.js';
import ambulanceBookingRoutes from './ambulance/ambulance-booking.routes.js';
import ambulanceDriverRoutes from './ambulance/ambulance-driver.routes.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// ============================================
// 1. Pregnancy Routes
// ============================================
router.use('/pregnancy', pregnancyRoutes);

// ============================================
// 2. Pregnancy Tracking Routes
// ============================================
router.use('/pregnancy/tracking', pregnancyTrackingRoutes);

// ============================================
// 3. Health Monitoring Routes
// ============================================
router.use('/pregnancy/health', healthMonitoringRoutes);

// ============================================
// 4. Baby Development Routes
// ============================================
router.use('/pregnancy/baby', babyDevelopmentTrackingRoutes);

// ============================================
// 5. Wellness & Lifestyle Routes
// ============================================
router.use('/pregnancy/nutrition', nutritionTrackingRoutes);
router.use('/pregnancy/exercise', exerciseTrackingRoutes);
router.use('/pregnancy/mental-health', mentalHealthTrackingRoutes);

// ============================================
// 6. Risk Assessment & Prediction Routes
// ============================================
router.use('/pregnancy/risk', riskAssessmentRoutes);
router.use('/pregnancy/ai', aiPredictionRoutes);

// ============================================
// 7. Doctor Consultation Routes
// ============================================
router.use('/doctor/profile', doctorProfileRoutes);
router.use('/doctor/appointment', doctorAppointmentRoutes);
router.use('/doctor/chat', doctorChatRoutes);
router.use('/doctor/call', doctorCallRoutes);
router.use('/doctor/review', doctorReviewRoutes);

// ============================================
// 8. Ambulance Booking Routes
// ============================================
router.use('/ambulance', ambulanceRoutes);
router.use('/ambulance/booking', ambulanceBookingRoutes);
router.use('/ambulance/driver', ambulanceDriverRoutes);

// ============================================
// 9. Emergency Services Routes
// ============================================
// TODO: Implement emergency routes

// ============================================
// 10. Telemedicine Routes
// ============================================
// TODO: Implement telemedicine routes

// ============================================
// 11. Pregnancy Care Plan Routes
// ============================================
// TODO: Implement pregnancy care plan routes

export default router;


