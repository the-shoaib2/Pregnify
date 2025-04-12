import healthMonitoringService from '../../services/pregnancy/health-monitoring.service.js';
import ApiResponse from '../../../utils/error/api.response.js';

const healthMonitoringController = {
  async recordHealthMetric(req, res, next) {
    try {
      const userId = req.user.id;
      const { pregnancyId } = req.params;
      const metricData = req.body;

      const healthMetric = await healthMonitoringService.recordHealthMetric(
        userId,
        pregnancyId,
        metricData
      );

      return res.status(201).json(
        new ApiResponse(201, 'Health metric recorded successfully', healthMetric)
      );
    } catch (error) {
      next(error);
    }
  },

  async recordSymptom(req, res, next) {
    try {
      const userId = req.user.id;
      const { pregnancyId } = req.params;
      const symptomData = req.body;

      const symptomLog = await healthMonitoringService.recordSymptom(
        userId,
        pregnancyId,
        symptomData
      );

      return res.status(201).json(
        new ApiResponse(201, 'Symptom recorded successfully', symptomLog)
      );
    } catch (error) {
      next(error);
    }
  },

  async getHealthMetrics(req, res, next) {
    try {
      const userId = req.user.id;
      const { pregnancyId } = req.params;
      const { type, startDate, endDate } = req.query;

      const healthMetrics = await healthMonitoringService.getHealthMetrics(
        userId,
        pregnancyId,
        type,
        startDate,
        endDate
      );

      return res.status(200).json(
        new ApiResponse(200, 'Health metrics retrieved successfully', healthMetrics)
      );
    } catch (error) {
      next(error);
    }
  },

  async getHealthSummary(req, res, next) {
    try {
      const userId = req.user.id;
      const { pregnancyId } = req.params;

      const healthSummary = await healthMonitoringService.getHealthSummary(
        userId,
        pregnancyId
      );

      return res.status(200).json(
        new ApiResponse(200, 'Health summary retrieved successfully', healthSummary)
      );
    } catch (error) {
      next(error);
    }
  },

  async getSymptomLogs(req, res, next) {
    try {
      const userId = req.user.id;
      const { pregnancyId } = req.params;
      const { startDate, endDate } = req.query;

      const symptomLogs = await healthMonitoringService.getSymptomLogs(
        userId,
        pregnancyId,
        startDate,
        endDate
      );

      return res.status(200).json(
        new ApiResponse(200, 'Symptom logs retrieved successfully', symptomLogs)
      );
    } catch (error) {
      next(error);
    }
  },

  async getHealthAlerts(req, res, next) {
    try {
      const userId = req.user.id;
      const { pregnancyId } = req.params;
      const { isRead } = req.query;

      const healthAlerts = await healthMonitoringService.getHealthAlerts(
        userId,
        pregnancyId,
        isRead === 'true'
      );

      return res.status(200).json(
        new ApiResponse(200, 'Health alerts retrieved successfully', healthAlerts)
      );
    } catch (error) {
      next(error);
    }
  },

  async markAlertAsRead(req, res, next) {
    try {
      const userId = req.user.id;
      const { alertId } = req.params;

      const updatedAlert = await healthMonitoringService.markAlertAsRead(
        userId,
        alertId
      );

      return res.status(200).json(
        new ApiResponse(200, 'Alert marked as read successfully', updatedAlert)
      );
    } catch (error) {
      next(error);
    }
  }
};

export default healthMonitoringController; 