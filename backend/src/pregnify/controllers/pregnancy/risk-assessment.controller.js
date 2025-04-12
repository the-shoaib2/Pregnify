import riskAssessmentService from '../../services/pregnancy/risk-assessment.service.js';
import ApiResponse from '../../../utils/error/api.response.js';
import ApiError from '../../../utils/error/api.error.js';

export const riskAssessmentController = {
  async createRiskAssessment(req, res) {
    try {
      const userId = req.user.id;
      const { pregnancyId } = req.params;
      const assessmentData = req.body;

      const riskAssessment = await riskAssessmentService.calculateRiskScore(
        userId,
        pregnancyId,
        assessmentData
      );

      return res.status(201).json(
        new ApiResponse(201, riskAssessment, 'Risk assessment created successfully')
      );
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        new ApiResponse(error.statusCode || 500, null, error.message)
      );
    }
  },

  async getRiskAssessmentHistory(req, res) {
    try {
      const userId = req.user.id;
      const { pregnancyId } = req.params;

      const assessments = await riskAssessmentService.getRiskAssessmentHistory(
        userId,
        pregnancyId
      );

      return res.status(200).json(
        new ApiResponse(200, assessments, 'Risk assessment history retrieved successfully')
      );
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        new ApiResponse(error.statusCode || 500, null, error.message)
      );
    }
  },

  async getLatestRiskAssessment(req, res) {
    try {
      const userId = req.user.id;
      const { pregnancyId } = req.params;

      const assessment = await riskAssessmentService.getLatestRiskAssessment(
        userId,
        pregnancyId
      );

      if (!assessment) {
        throw new ApiError(404, 'No risk assessment found');
      }

      return res.status(200).json(
        new ApiResponse(200, assessment, 'Latest risk assessment retrieved successfully')
      );
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        new ApiResponse(error.statusCode || 500, null, error.message)
      );
    }
  },

  async updateRiskAssessment(req, res) {
    try {
      const userId = req.user.id;
      const { pregnancyId, assessmentId } = req.params;
      const updateData = req.body;

      // Validate that the assessment belongs to the user and pregnancy
      const existingAssessment = await riskAssessmentService.getRiskAssessmentById(
        assessmentId,
        userId,
        pregnancyId
      );

      if (!existingAssessment) {
        throw new ApiError(404, 'Risk assessment not found');
      }

      // Update the risk assessment
      const updatedAssessment = await riskAssessmentService.updateRiskAssessment(
        assessmentId,
        userId,
        pregnancyId,
        updateData
      );

      return res.status(200).json(
        new ApiResponse(200, updatedAssessment, 'Risk assessment updated successfully')
      );
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        new ApiResponse(error.statusCode || 500, null, error.message)
      );
    }
  }
}; 