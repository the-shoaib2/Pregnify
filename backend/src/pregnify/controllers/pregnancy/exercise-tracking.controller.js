import exerciseTrackingService from '../../services/pregnancy/exercise-tracking.service.js';
import ApiResponse from '../../../utils/error/api.response.js';

const exerciseTrackingController = {
  async recordExercise(req, res, next) {
    try {
      const userId = req.user.id;
      const { pregnancyId } = req.params;
      const exerciseData = req.body;

      const exercise = await exerciseTrackingService.recordExercise(
        userId,
        pregnancyId,
        exerciseData
      );

      return res.status(201).json(
        new ApiResponse(201, 'Exercise recorded successfully', exercise)
      );
    } catch (error) {
      next(error);
    }
  },

  async getExerciseHistory(req, res, next) {
    try {
      const userId = req.user.id;
      const { pregnancyId } = req.params;
      const { startDate, endDate } = req.query;

      const exerciseHistory = await exerciseTrackingService.getExerciseHistory(
        userId,
        pregnancyId,
        startDate,
        endDate
      );

      return res.status(200).json(
        new ApiResponse(200, 'Exercise history retrieved successfully', exerciseHistory)
      );
    } catch (error) {
      next(error);
    }
  },

  async getExerciseSummary(req, res, next) {
    try {
      const userId = req.user.id;
      const { pregnancyId } = req.params;
      const { startDate, endDate } = req.query;

      const exerciseSummary = await exerciseTrackingService.getExerciseSummary(
        userId,
        pregnancyId,
        startDate,
        endDate
      );

      return res.status(200).json(
        new ApiResponse(200, 'Exercise summary retrieved successfully', exerciseSummary)
      );
    } catch (error) {
      next(error);
    }
  },

  async getExerciseRecommendations(req, res, next) {
    try {
      const userId = req.user.id;
      const { pregnancyId } = req.params;

      const recommendations = await exerciseTrackingService.getExerciseRecommendations(
        userId,
        pregnancyId
      );

      return res.status(200).json(
        new ApiResponse(200, 'Exercise recommendations retrieved successfully', recommendations)
      );
    } catch (error) {
      next(error);
    }
  },

  async markRecommendationAsRead(req, res, next) {
    try {
      const userId = req.user.id;
      const { recommendationId } = req.params;

      const updatedRecommendation = await exerciseTrackingService.markRecommendationAsRead(
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

export default exerciseTrackingController; 