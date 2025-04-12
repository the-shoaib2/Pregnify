import nutritionTrackingService from '../../services/pregnancy/nutrition-tracking.service.js';
import ApiResponse from '../../../utils/error/api.response.js';

const nutritionTrackingController = {
  async recordMeal(req, res, next) {
    try {
      const userId = req.user.id;
      const { pregnancyId } = req.params;
      const mealData = req.body;

      const meal = await nutritionTrackingService.recordMeal(
        userId,
        pregnancyId,
        mealData
      );

      return res.status(201).json(
        new ApiResponse(201, 'Meal recorded successfully', meal)
      );
    } catch (error) {
      next(error);
    }
  },

  async getMealHistory(req, res, next) {
    try {
      const userId = req.user.id;
      const { pregnancyId } = req.params;
      const { startDate, endDate } = req.query;

      const mealHistory = await nutritionTrackingService.getMealHistory(
        userId,
        pregnancyId,
        startDate,
        endDate
      );

      return res.status(200).json(
        new ApiResponse(200, 'Meal history retrieved successfully', mealHistory)
      );
    } catch (error) {
      next(error);
    }
  },

  async getNutritionalSummary(req, res, next) {
    try {
      const userId = req.user.id;
      const { pregnancyId } = req.params;
      const { startDate, endDate } = req.query;

      const nutritionalSummary = await nutritionTrackingService.getNutritionalSummary(
        userId,
        pregnancyId,
        startDate,
        endDate
      );

      return res.status(200).json(
        new ApiResponse(200, 'Nutritional summary retrieved successfully', nutritionalSummary)
      );
    } catch (error) {
      next(error);
    }
  },

  async getNutritionRecommendations(req, res, next) {
    try {
      const userId = req.user.id;
      const { pregnancyId } = req.params;

      const recommendations = await nutritionTrackingService.getNutritionRecommendations(
        userId,
        pregnancyId
      );

      return res.status(200).json(
        new ApiResponse(200, 'Nutrition recommendations retrieved successfully', recommendations)
      );
    } catch (error) {
      next(error);
    }
  },

  async markRecommendationAsRead(req, res, next) {
    try {
      const userId = req.user.id;
      const { recommendationId } = req.params;

      const updatedRecommendation = await nutritionTrackingService.markRecommendationAsRead(
        userId,
        recommendationId
      );

      return res.status(200).json(
        new ApiResponse(200, 'Recommendation marked as read successfully', updatedRecommendation)
      );
    } catch (error) {
      next(error);
    }
  }
};

export default nutritionTrackingController; 