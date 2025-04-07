import express from 'express';
import mentalHealthTrackingController from '../../controllers/pregnancy/mental-health-tracking.controller.js';
import { isAuthenticated } from '../../../middlewares/auth/auth.middleware.js';

const router = express.Router();

router.use(isAuthenticated);

// Record mood
router.post(
  '/pregnancies/:pregnancyId/moods',
  mentalHealthTrackingController.recordMood
);

// Get mood history
router.get(
  '/pregnancies/:pregnancyId/moods',
  mentalHealthTrackingController.getMoodHistory
);

// Get mood summary
router.get(
  '/pregnancies/:pregnancyId/moods/summary',
  mentalHealthTrackingController.getMoodSummary
);

// Get mental health recommendations
router.get(
  '/pregnancies/:pregnancyId/mental-health/recommendations',
  mentalHealthTrackingController.getMentalHealthRecommendations
);

// Mark recommendation as read
router.patch(
  '/mental-health/recommendations/:recommendationId/read',
  mentalHealthTrackingController.markRecommendationAsRead
);

export default router; 