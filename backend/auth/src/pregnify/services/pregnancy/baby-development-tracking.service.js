import prisma from '../../../utils/database/prisma.js';
import ApiError from '../../../utils/error/api.error.js';

class BabyDevelopmentTrackingService {
  async recordBabyMeasurement(userId, pregnancyId, measurementData) {
    try {
      const measurement = await prisma.babyMeasurement.create({
        data: {
          userId,
          pregnancyId,
          ...measurementData
        }
      });

      // Check for development recommendations
      await this.checkDevelopmentRecommendations(userId, pregnancyId, measurement);

      return measurement;
    } catch (error) {
      throw new ApiError(500, 'Failed to record baby measurement');
    }
  }

  async checkDevelopmentRecommendations(userId, pregnancyId, measurement) {
    try {
      const recommendations = [];
      const pregnancyProfile = await prisma.pregnancyProfile.findUnique({
        where: {
          id: pregnancyId,
          userId
        }
      });

      if (!pregnancyProfile) return;

      const pregnancyWeek = await this.calculatePregnancyWeek(pregnancyProfile.startDate);
      const expectedMeasurements = this.getExpectedMeasurements(pregnancyWeek);

      // Check for significant deviations from expected measurements
      if (measurement.biparietalDiameter) {
        const deviation = Math.abs(measurement.biparietalDiameter - expectedMeasurements.biparietalDiameter);
        if (deviation > 2) {
          recommendations.push({
            type: 'measurement',
            message: 'Significant deviation in biparietal diameter detected. Please consult your healthcare provider.',
            severity: 'High'
          });
        }
      }

      if (measurement.femurLength) {
        const deviation = Math.abs(measurement.femurLength - expectedMeasurements.femurLength);
        if (deviation > 2) {
          recommendations.push({
            type: 'measurement',
            message: 'Significant deviation in femur length detected. Please consult your healthcare provider.',
            severity: 'High'
          });
        }
      }

      if (measurement.abdominalCircumference) {
        const deviation = Math.abs(measurement.abdominalCircumference - expectedMeasurements.abdominalCircumference);
        if (deviation > 2) {
          recommendations.push({
            type: 'measurement',
            message: 'Significant deviation in abdominal circumference detected. Please consult your healthcare provider.',
            severity: 'High'
          });
        }
      }

      // Create recommendations if any were generated
      if (recommendations.length > 0) {
        await prisma.developmentRecommendation.createMany({
          data: recommendations.map(rec => ({
            userId,
            pregnancyId,
            ...rec,
            createdAt: new Date()
          }))
        });
      }
    } catch (error) {
      console.error('Failed to check development recommendations:', error);
    }
  }

  calculatePregnancyWeek(startDate) {
    const today = new Date();
    const start = new Date(startDate);
    const diffTime = Math.abs(today - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7);
  }

  getExpectedMeasurements(pregnancyWeek) {
    // Based on standard fetal growth charts
    return {
      biparietalDiameter: this.calculateBPD(pregnancyWeek),
      femurLength: this.calculateFL(pregnancyWeek),
      abdominalCircumference: this.calculateAC(pregnancyWeek),
      estimatedWeight: this.calculateWeight(pregnancyWeek)
    };
  }

  calculateBPD(pregnancyWeek) {
    // Biparietal diameter in millimeters
    return 10 + (pregnancyWeek * 1.5);
  }

  calculateFL(pregnancyWeek) {
    // Femur length in millimeters
    return 5 + (pregnancyWeek * 1.2);
  }

  calculateAC(pregnancyWeek) {
    // Abdominal circumference in millimeters
    return 50 + (pregnancyWeek * 3);
  }

  calculateWeight(pregnancyWeek) {
    // Estimated weight in grams
    return 100 + (pregnancyWeek * 100);
  }

  async getBabyMeasurements(userId, pregnancyId, startDate, endDate) {
    try {
      return await prisma.babyMeasurement.findMany({
        where: {
          userId,
          pregnancyId,
          measuredAt: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: {
          measuredAt: 'desc'
        }
      });
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch baby measurements');
    }
  }

  async getDevelopmentSummary(userId, pregnancyId, startDate, endDate) {
    try {
      const measurements = await this.getBabyMeasurements(userId, pregnancyId, startDate, endDate);
      const pregnancyProfile = await prisma.pregnancyProfile.findUnique({
        where: {
          id: pregnancyId,
          userId
        }
      });

      if (!pregnancyProfile) {
        throw new ApiError(404, 'Pregnancy profile not found');
      }

      const pregnancyWeek = await this.calculatePregnancyWeek(pregnancyProfile.startDate);
      const expectedMeasurements = this.getExpectedMeasurements(pregnancyWeek);
      
      const summary = {
        currentWeek: pregnancyWeek,
        expectedMeasurements,
        latestMeasurements: measurements[0] || null,
        growthTrend: this.calculateGrowthTrend(measurements)
      };

      return summary;
    } catch (error) {
      throw new ApiError(500, 'Failed to generate development summary');
    }
  }

  calculateGrowthTrend(measurements) {
    if (measurements.length < 2) return 'insufficient data';

    const latest = measurements[0];
    const previous = measurements[1];

    const bpdGrowth = latest.biparietalDiameter - previous.biparietalDiameter;
    const flGrowth = latest.femurLength - previous.femurLength;
    const acGrowth = latest.abdominalCircumference - previous.abdominalCircumference;

    if (bpdGrowth > 0 && flGrowth > 0 && acGrowth > 0) {
      return 'normal';
    } else if (bpdGrowth < 0 || flGrowth < 0 || acGrowth < 0) {
      return 'concerning';
    } else {
      return 'stable';
    }
  }

  async getDevelopmentMilestones(pregnancyWeek) {
    const milestones = {
      firstTrimester: {
        start: 1,
        end: 12,
        milestones: [
          { week: 4, description: 'Heart begins to beat' },
          { week: 8, description: 'All major organs begin to form' },
          { week: 12, description: 'Fingers and toes are fully formed' }
        ]
      },
      secondTrimester: {
        start: 13,
        end: 27,
        milestones: [
          { week: 16, description: 'Baby can make facial expressions' },
          { week: 20, description: 'Baby can hear sounds' },
          { week: 24, description: 'Lungs begin to develop' }
        ]
      },
      thirdTrimester: {
        start: 28,
        end: 40,
        milestones: [
          { week: 28, description: 'Eyes can open and close' },
          { week: 32, description: 'Baby practices breathing' },
          { week: 37, description: 'Baby is considered full term' }
        ]
      }
    };

    let currentMilestones = [];
    let upcomingMilestones = [];

    for (const trimester in milestones) {
      const { start, end, milestones: trimesterMilestones } = milestones[trimester];
      
      if (pregnancyWeek >= start && pregnancyWeek <= end) {
        currentMilestones = trimesterMilestones.filter(m => m.week <= pregnancyWeek);
        upcomingMilestones = trimesterMilestones.filter(m => m.week > pregnancyWeek);
        break;
      }
    }

    return {
      currentMilestones,
      upcomingMilestones,
      currentTrimester: this.getCurrentTrimester(pregnancyWeek)
    };
  }

  getCurrentTrimester(pregnancyWeek) {
    if (pregnancyWeek <= 12) return 'first';
    if (pregnancyWeek <= 27) return 'second';
    return 'third';
  }

  async getDevelopmentRecommendations(userId, pregnancyId) {
    try {
      return await prisma.developmentRecommendation.findMany({
        where: {
          userId,
          pregnancyId,
          isRead: false
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch development recommendations');
    }
  }

  async markRecommendationAsRead(userId, recommendationId) {
    try {
      return await prisma.developmentRecommendation.update({
        where: {
          id: recommendationId,
          userId
        },
        data: {
          isRead: true
        }
      });
    } catch (error) {
      throw new ApiError(500, 'Failed to mark recommendation as read');
    }
  }
}

export default new BabyDevelopmentTrackingService(); 