import prisma from '../../utils/database/prisma.js';
import ApiError from '../../utils/error/api.error.js';
import ApiResponse from '../../utils/error/api.response.js';

export const telemedicineController = {
  async scheduleConsultation(req, res) {
    try {
      const userId = req.user.id;
      const { doctorId, type, scheduledTime, notes } = req.body;

      if (!doctorId || !type || !scheduledTime) {
        throw new ApiError(400, 'Doctor ID, type, and scheduled time are required');
      }

      // Get user's active pregnancy
      const pregnancy = await prisma.pregnancyProfile.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      if (!pregnancy) {
        throw new ApiError(400, 'No active pregnancy found');
      }

      // Create consultation
      const consultation = await prisma.telemedicineConsultation.create({
        data: {
          userId,
          pregnancyId: pregnancy.id,
          doctorId,
          type,
          scheduledTime: new Date(scheduledTime),
          notes,
          status: 'scheduled'
        }
      });

      return res.status(201).json(
        new ApiResponse(201, consultation, 'Consultation scheduled successfully')
      );
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        new ApiResponse(error.statusCode || 500, null, error.message)
      );
    }
  },

  async getConsultationDetails(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const consultation = await prisma.telemedicineConsultation.findFirst({
        where: {
          id,
          userId
        },
        include: {
          doctor: true
        }
      });

      if (!consultation) {
        throw new ApiError(404, 'Consultation not found');
      }

      return res.status(200).json(
        new ApiResponse(200, consultation, 'Consultation details retrieved successfully')
      );
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        new ApiResponse(error.statusCode || 500, null, error.message)
      );
    }
  },

  async updateConsultationStatus(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        throw new ApiError(400, 'Status is required');
      }

      const consultation = await prisma.telemedicineConsultation.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!consultation) {
        throw new ApiError(404, 'Consultation not found');
      }

      const updatedConsultation = await prisma.telemedicineConsultation.update({
        where: { id },
        data: { status }
      });

      return res.status(200).json(
        new ApiResponse(200, updatedConsultation, 'Consultation status updated successfully')
      );
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        new ApiResponse(error.statusCode || 500, null, error.message)
      );
    }
  },

  async getConsultationHistory(req, res) {
    try {
      const userId = req.user.id;

      const consultations = await prisma.telemedicineConsultation.findMany({
        where: { userId },
        include: {
          doctor: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.status(200).json(
        new ApiResponse(200, consultations, 'Consultation history retrieved successfully')
      );
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        new ApiResponse(error.statusCode || 500, null, error.message)
      );
    }
  },

  async getAvailableDoctors(req, res) {
    try {
      const doctors = await prisma.doctor.findMany({
        where: {
          isAvailable: true
        },
        select: {
          id: true,
          name: true,
          specialty: true,
          experience: true,
          rating: true
        }
      });

      return res.status(200).json(
        new ApiResponse(200, doctors, 'Available doctors retrieved successfully')
      );
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        new ApiResponse(error.statusCode || 500, null, error.message)
      );
    }
  }
}; 