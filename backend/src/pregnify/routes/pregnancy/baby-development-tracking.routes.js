import express from 'express';
import babyDevelopmentTrackingController from '../../controllers/pregnancy/baby-development-tracking.controller.js';
import { isAuthenticated } from '../../../middlewares/auth/auth.middleware.js';

const router = express.Router();

router.use(isAuthenticated);

// Record a new baby measurement
router.post(
  '/pregnancies/:pregnancyId/measurements',
  babyDevelopmentTrackingController.recordBabyMeasurement
);

// Get baby measurements within a date range
router.get(
  '/pregnancies/:pregnancyId/measurements',
  babyDevelopmentTrackingController.getBabyMeasurements
);

// Get development summary
router.get(
  '/pregnancies/:pregnancyId/development/summary',
  babyDevelopmentTrackingController.getDevelopmentSummary
);

// Get development milestones
router.get(
  '/pregnancies/:pregnancyId/development/milestones',
  babyDevelopmentTrackingController.getDevelopmentMilestones
);

// Get development recommendations
router.get(
  '/pregnancies/:pregnancyId/development/recommendations',
  babyDevelopmentTrackingController.getDevelopmentRecommendations
);

// Mark a recommendation as read
router.patch(
  '/development/recommendations/:recommendationId/read',
  babyDevelopmentTrackingController.markRecommendationAsRead
);

export default router; 