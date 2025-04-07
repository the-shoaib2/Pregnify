import mentalHealthTrackingService from '../../services/pregnancy/mental-health-tracking.service.js';
import ApiResponse from '../../../utils/error/api.response.js';

const mentalHealthTrackingController = {
  async recordMood(req, res, next) {
    try {
      const userId = req.user.id;
      const { pregnancyId } = req.params;
      const moodData = req.body;

      const mood = await mentalHealthTrackingService.recordMood(
        userId,
        pregnancyId,
        moodData
      );

      return res.status(201).json(
        new ApiResponse(201, 'Mood recorded successfully', mood)
      );
    } catch (error) {
      next(error);
    }
  },

  async getMoodHistory(req, res, next) {
    try {
      const userId = req.user.id;
      const { pregnancyId } = req.params;
      const { startDate, endDate } = req.query;

      const moodHistory = await mentalHealthTrackingService.getMoodHistory(
        userId,
        pregnancyId,
        startDate,
        endDate
      );

      return res.status(200).json(
        new ApiResponse(200, 'Mood history retrieved successfully', moodHistory)
      );
    } catch (error) {
      next(error);
    }
  },

  async getMoodSummary(req, res, next) {
    try {
      const userId = req.user.id;
      const { pregnancyId } = req.params;
      const { startDate, endDate } = req.query;

      const moodSummary = await mentalHealthTrackingService.getMoodSummary(
        userId,
        pregnancyId,
        startDate,
        endDate
      );

      return res.status(200).json(
        new ApiResponse(200, 'Mood summary retrieved successfully', moodSummary)
      );
    } catch (error) {
      next(error);
    }
  },

  async getMentalHealthRecommendations(req, res, next) {
    try {
      const userId = req.user.id;
      const { pregnancyId } = req.params;

      const recommendations = await mentalHealthTrackingService.getMentalHealthRecommendations(
        userId,
        pregnancyId
      );

      return res.status(200).json(
        new ApiResponse(200, 'Mental health recommendations retrieved successfully', recommendations)
      );
    } catch (error) {
      next(error);
    }
  },

  async markRecommendationAsRead(req, res, next) {
    try {
      const userId = req.user.id;
      const { recommendationId } = req.params;

      const updatedRecommendation = await mentalHealthTrackingService.markRecommendationAsRead(
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

export default mentalHealthTrackingController; 