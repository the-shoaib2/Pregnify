import prisma from '../../../utils/database/prisma.js';
import ApiError from '../../../utils/error/api.error.js';

class HealthMonitoringService {
  async recordHealthMetric(userId, pregnancyId, metricData) {
    try {
      const healthMetric = await prisma.healthMetric.create({
        data: {
          userId,
          pregnancyId,
          ...metricData
        }
      });

      // Check for any health alerts based on the new metric
      await this.checkHealthAlerts(userId, pregnancyId, healthMetric);

      return healthMetric;
    } catch (error) {
      throw new ApiError(500, 'Failed to record health metric');
    }
  }

  async checkHealthAlerts(userId, pregnancyId, healthMetric) {
    try {
      const alerts = [];
      
      // Check blood pressure
      if (healthMetric.type === 'bloodPressure') {
        const [systolic, diastolic] = healthMetric.value.split('/').map(Number);
        if (systolic > 140 || diastolic > 90) {
          alerts.push({
            type: 'vitalSigns',
            message: 'High blood pressure detected. Please consult your healthcare provider.',
            severity: 'High'
          });
        }
      }

      // Check blood sugar
      if (healthMetric.type === 'bloodSugar') {
        if (healthMetric.value > 140) {
          alerts.push({
            type: 'vitalSigns',
            message: 'High blood sugar level detected. Please consult your healthcare provider.',
            severity: 'High'
          });
        }
      }

      // Check weight
      if (healthMetric.type === 'weight') {
        const pregnancy = await prisma.pregnancyProfile.findUnique({
          where: { id: pregnancyId }
        });

        if (pregnancy) {
          const weightGain = healthMetric.value - pregnancy.prePregnancyWeight;
          const expectedGain = this.calculateExpectedWeightGain(pregnancy.pregnancyWeek);

          if (Math.abs(weightGain - expectedGain) > 5) {
            alerts.push({
              type: 'weight',
              message: `Significant deviation from expected weight gain detected. Expected: ${expectedGain}kg, Current: ${weightGain}kg`,
              severity: 'Medium'
            });
          }
        }
      }

      // Create alerts if any were generated
      if (alerts.length > 0) {
        await prisma.healthAlert.createMany({
          data: alerts.map(alert => ({
            userId,
            pregnancyId,
            ...alert,
            triggeredAt: new Date()
          }))
        });
      }
    } catch (error) {
      console.error('Failed to check health alerts:', error);
    }
  }

  calculateExpectedWeightGain(pregnancyWeek) {
    // Based on standard weight gain recommendations
    if (pregnancyWeek <= 12) return 1.5;
    if (pregnancyWeek <= 20) return 4;
    if (pregnancyWeek <= 28) return 8;
    if (pregnancyWeek <= 36) return 11.5;
    return 12.5;
  }

  async recordSymptom(userId, pregnancyId, symptomData) {
    try {
      const symptomLog = await prisma.symptomLog.create({
        data: {
          userId,
          pregnancyId,
          ...symptomData
        }
      });

      // Check if symptom requires immediate attention
      if (this.isEmergencySymptom(symptomData.symptom, symptomData.severity)) {
        await prisma.healthAlert.create({
          data: {
            userId,
            pregnancyId,
            type: 'symptoms',
            message: `Emergency symptom detected: ${symptomData.symptom}. Please seek immediate medical attention.`,
            severity: 'Critical',
            triggeredAt: new Date()
          }
        });
      }

      return symptomLog;
    } catch (error) {
      throw new ApiError(500, 'Failed to record symptom');
    }
  }

  isEmergencySymptom(symptom, severity) {
    const emergencySymptoms = [
      'severe abdominal pain',
      'vaginal bleeding',
      'severe headache',
      'vision changes',
      'severe swelling',
      'decreased fetal movement'
    ];

    return emergencySymptoms.includes(symptom.toLowerCase()) && severity === 'severe';
  }

  async getHealthMetrics(userId, pregnancyId, type, startDate, endDate) {
    try {
      return await prisma.healthMetric.findMany({
        where: {
          userId,
          pregnancyId,
          type,
          measuredAt: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: {
          measuredAt: 'asc'
        }
      });
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch health metrics');
    }
  }

  async getSymptomLogs(userId, pregnancyId, startDate, endDate) {
    try {
      return await prisma.symptomLog.findMany({
        where: {
          userId,
          pregnancyId,
          onsetDate: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: {
          onsetDate: 'desc'
        }
      });
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch symptom logs');
    }
  }

  async getHealthAlerts(userId, pregnancyId, isRead = false) {
    try {
      return await prisma.healthAlert.findMany({
        where: {
          userId,
          pregnancyId,
          isRead
        },
        orderBy: {
          triggeredAt: 'desc'
        }
      });
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch health alerts');
    }
  }

  async markAlertAsRead(userId, alertId) {
    try {
      return await prisma.healthAlert.update({
        where: {
          id: alertId,
          userId
        },
        data: {
          isRead: true
        }
      });
    } catch (error) {
      throw new ApiError(500, 'Failed to mark alert as read');
    }
  }
}

export default new HealthMonitoringService(); 
