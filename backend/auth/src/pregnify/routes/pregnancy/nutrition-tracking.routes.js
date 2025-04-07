import express from 'express';
import nutritionTrackingController from '../../controllers/pregnancy/nutrition-tracking.controller.js';
import { isAuthenticated } from '../../../middlewares/auth/auth.middleware.js';

const router = express.Router();

router.use(isAuthenticated);

// Record meal
router.post(
  '/pregnancies/:pregnancyId/meals',
  nutritionTrackingController.recordMeal
);

// Get meal history
router.get(
  '/pregnancies/:pregnancyId/meals',
  nutritionTrackingController.getMealHistory
);

// Get nutritional summary
router.get(
  '/pregnancies/:pregnancyId/nutrition/summary',
  nutritionTrackingController.getNutritionalSummary
);

// Get nutrition recommendations
router.get(
  '/pregnancies/:pregnancyId/nutrition/recommendations',
  nutritionTrackingController.getNutritionRecommendations
);

// Mark recommendation as read
router.patch(
  '/nutrition/recommendations/:recommendationId/read',
  nutritionTrackingController.markRecommendationAsRead
);

export default router; 