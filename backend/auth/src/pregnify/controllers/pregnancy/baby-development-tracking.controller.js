import babyDevelopmentTrackingService from '../../services/pregnancy/baby-development-tracking.service.js';
import ApiResponse from '../../../utils/error/api.response.js';

const babyDevelopmentTrackingController = {
  async recordBabyMeasurement(req, res, next) {
    try {
      const { userId } = req.user;
      const { pregnancyId } = req.params;
      const measurementData = req.body;

      const measurement = await babyDevelopmentTrackingService.recordBabyMeasurement(
        userId,
        pregnancyId,
        measurementData
      );

      return res.status(201).json(
        new ApiResponse(201, measurement, 'Baby measurement recorded successfully')
      );
    } catch (error) {
      next(error);
    }
  },

  async getBabyMeasurements(req, res, next) {
    try {
      const { userId } = req.user;
      const { pregnancyId } = req.params;
      const { startDate, endDate } = req.query;

      const measurements = await babyDevelopmentTrackingService.getBabyMeasurements(
        userId,
        pregnancyId,
        startDate,
        endDate
      );

      return res.status(200).json(
        new ApiResponse(200, measurements, 'Baby measurements retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  },

  async getDevelopmentSummary(req, res, next) {
    try {
      const { userId } = req.user;
      const { pregnancyId } = req.params;
      const { startDate, endDate } = req.query;

      const summary = await babyDevelopmentTrackingService.getDevelopmentSummary(
        userId,
        pregnancyId,
        startDate,
        endDate
      );

      return res.status(200).json(
        new ApiResponse(200, summary, 'Development summary retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  },

  async getDevelopmentMilestones(req, res, next) {
    try {
      const { userId } = req.user;
      const { pregnancyId } = req.params;

      const pregnancyProfile = await prisma.pregnancyProfile.findUnique({
        where: {
          id: pregnancyId,
          userId
        }
      });

      if (!pregnancyProfile) {
        throw new ApiError(404, 'Pregnancy profile not found');
      }

      const pregnancyWeek = await babyDevelopmentTrackingService.calculatePregnancyWeek(
        pregnancyProfile.startDate
      );

      const milestones = await babyDevelopmentTrackingService.getDevelopmentMilestones(
        pregnancyWeek
      );

      return res.status(200).json(
        new ApiResponse(200, milestones, 'Development milestones retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  },

  async getDevelopmentRecommendations(req, res, next) {
    try {
      const { userId } = req.user;
      const { pregnancyId } = req.params;

      const recommendations = await babyDevelopmentTrackingService.getDevelopmentRecommendations(
        userId,
        pregnancyId
      );

      return res.status(200).json(
        new ApiResponse(200, recommendations, 'Development recommendations retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  },

  async markRecommendationAsRead(req, res, next) {
    try {
      const { userId } = req.user;
      const { recommendationId } = req.params;

      const recommendation = await babyDevelopmentTrackingService.markRecommendationAsRead(
        userId,
        recommendationId
      );

      return res.status(200).json(
        new ApiResponse(200, recommendation, 'Recommendation marked as read successfully')
      );
    } catch (error) {
      next(error);
    }
  }
};

export default babyDevelopmentTrackingController;