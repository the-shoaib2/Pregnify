import express from 'express';
import exerciseTrackingController from '../../controllers/pregnancy/exercise-tracking.controller.js';
import { isAuthenticated } from '../../../middlewares/auth/auth.middleware.js';

const router = express.Router();

router.use(isAuthenticated);
// Record exercise
router.post(
  '/pregnancies/:pregnancyId/exercises',
  exerciseTrackingController.recordExercise
);

// Get exercise history
router.get(
  '/pregnancies/:pregnancyId/exercises',
  exerciseTrackingController.getExerciseHistory
);

// Get exercise summary
router.get(
  '/pregnancies/:pregnancyId/exercises/summary',
  exerciseTrackingController.getExerciseSummary
);

// Get exercise recommendations
router.get(
  '/pregnancies/:pregnancyId/exercises/recommendations',
  exerciseTrackingController.getExerciseRecommendations
);

// Mark recommendation as read
router.patch(
  '/exercises/recommendations/:recommendationId/read',
  exerciseTrackingController.markRecommendationAsRead
);

export default router;