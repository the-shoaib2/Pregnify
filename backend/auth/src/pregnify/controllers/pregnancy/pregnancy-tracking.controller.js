import pregnancyTrackingService from '../../services/pregnancy/pregnancy-tracking.service.js';
import ApiResponse from '../../../utils/error/api.response.js';

const pregnancyTrackingController = {
  async createPregnancyProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const pregnancyData = req.body;

      const pregnancyProfile = await pregnancyTrackingService.createPregnancyProfile(
        userId,
        pregnancyData
      );

      return res.status(201).json(
        new ApiResponse(201, 'Pregnancy profile created successfully', pregnancyProfile)
      );
    } catch (error) {
      next(error);
    }
  },

  async updatePregnancyProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const { pregnancyId } = req.params;
      const updateData = req.body;

      const pregnancyProfile = await pregnancyTrackingService.updatePregnancyProfile(
        userId,
        pregnancyId,
        updateData
      );

      return res.status(200).json(
        new ApiResponse(200, 'Pregnancy profile updated successfully', pregnancyProfile)
      );
    } catch (error) {
      next(error);
    }
  },

  async getPregnancyProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const { pregnancyId } = req.params;

      const pregnancyProfile = await pregnancyTrackingService.getPregnancyProfile(
        userId,
        pregnancyId
      );

      return res.status(200).json(
        new ApiResponse(200, 'Pregnancy profile retrieved successfully', pregnancyProfile)
      );
    } catch (error) {
      next(error);
    }
  },

  async getPregnancyHistory(req, res, next) {
    try {
      const userId = req.user.id;

      const pregnancyHistory = await pregnancyTrackingService.getPregnancyHistory(userId);

      return res.status(200).json(
        new ApiResponse(200, 'Pregnancy history retrieved successfully', pregnancyHistory)
      );
    } catch (error) {
      next(error);
    }
  },

  async getPregnancyMilestones(req, res, next) {
    try {
      const userId = req.user.id;
      const { pregnancyId } = req.params;

      const pregnancyProfile = await pregnancyTrackingService.getPregnancyProfile(
        userId,
        pregnancyId
      );

      const pregnancyWeek = await pregnancyTrackingService.calculatePregnancyWeek(
        pregnancyProfile.startDate
      );

      const milestones = await pregnancyTrackingService.getPregnancyMilestones(pregnancyWeek);

      return res.status(200).json(
        new ApiResponse(200, 'Pregnancy milestones retrieved successfully', {
          ...milestones,
          currentWeek: pregnancyWeek
        })
      );
    } catch (error) {
      next(error);
    }
  },

  async recordPrenatalVisit(req, res, next) {
    try {
      const userId = req.user.id;
      const { pregnancyId } = req.params;
      const visitData = req.body;

      const prenatalVisit = await pregnancyTrackingService.recordPrenatalVisit(
        userId,
        pregnancyId,
        visitData
      );

      return res.status(201).json(
        new ApiResponse(201, 'Prenatal visit recorded successfully', prenatalVisit)
      );
    } catch (error) {
      next(error);
    }
  },

  async getPrenatalVisits(req, res, next) {
    try {
      const userId = req.user.id;
      const { pregnancyId } = req.params;

      const prenatalVisits = await pregnancyTrackingService.getPrenatalVisits(
        userId,
        pregnancyId
      );

      return res.status(200).json(
        new ApiResponse(200, 'Prenatal visits retrieved successfully', prenatalVisits)
      );
    } catch (error) {
      next(error);
    }
  }
};

export default pregnancyTrackingController; 