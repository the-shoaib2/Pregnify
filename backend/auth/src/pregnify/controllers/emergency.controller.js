import prisma from '../../utils/database/prisma.js';
import ApiError from '../../utils/error/api.error.js';
import ApiResponse from '../../utils/error/api.response.js';

export const emergencyController = {
  async requestEmergencyService(req, res) {
    try {
      const userId = req.user.id;
      const { type, location, notes } = req.body;

      if (!type || !location) {
        throw new ApiError(400, 'Type and location are required');
      }

      // Get user's active pregnancy
      const pregnancy = await prisma.pregnancyProfile.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      if (!pregnancy) {
        throw new ApiError(400, 'No active pregnancy found');
      }

      // Create emergency service request
      const emergencyService = await prisma.emergencyService.create({
        data: {
          userId,
          pregnancyId: pregnancy.id,
          type,
          location,
          notes,
          status: 'requested'
        }
      });

      return res.status(201).json(
        new ApiResponse(201, emergencyService, 'Emergency service requested successfully')
      );
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        new ApiResponse(error.statusCode || 500, null, error.message)
      );
    }
  },

  async getEmergencyStatus(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const emergencyService = await prisma.emergencyService.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!emergencyService) {
        throw new ApiError(404, 'Emergency service not found');
      }

      return res.status(200).json(
        new ApiResponse(200, emergencyService, 'Emergency service status retrieved successfully')
      );
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        new ApiResponse(error.statusCode || 500, null, error.message)
      );
    }
  },

  async updateEmergencyStatus(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        throw new ApiError(400, 'Status is required');
      }

      const emergencyService = await prisma.emergencyService.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!emergencyService) {
        throw new ApiError(404, 'Emergency service not found');
      }

      const updatedService = await prisma.emergencyService.update({
        where: { id },
        data: { status }
      });

      return res.status(200).json(
        new ApiResponse(200, updatedService, 'Emergency service status updated successfully')
      );
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        new ApiResponse(error.statusCode || 500, null, error.message)
      );
    }
  },

  async getEmergencyHistory(req, res) {
    try {
      const userId = req.user.id;

      const emergencyHistory = await prisma.emergencyService.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      return res.status(200).json(
        new ApiResponse(200, emergencyHistory, 'Emergency history retrieved successfully')
      );
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        new ApiResponse(error.statusCode || 500, null, error.message)
      );
    }
  }
}; 