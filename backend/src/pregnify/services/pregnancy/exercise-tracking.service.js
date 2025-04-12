import prisma from '../../../utils/database/prisma.js';
import ApiError from '../../../utils/error/api.error.js';

class ExerciseTrackingService {
  async recordExercise(userId, pregnancyId, exerciseData) {
    try {
      const exercise = await prisma.exercise.create({
        data: {
          userId,
          pregnancyId,
          ...exerciseData
        }
      });

      // Check for exercise recommendations
      await this.checkExerciseRecommendations(userId, pregnancyId, exercise);

      return exercise;
    } catch (error) {
      throw new ApiError(500, 'Failed to record exercise');
    }
  }

  async checkExerciseRecommendations(userId, pregnancyId, exercise) {
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

      // Check exercise intensity
      if (exercise.intensity === 'high' && pregnancyWeek > 28) {
        recommendations.push({
          type: 'intensity',
          message: 'Consider reducing exercise intensity as you approach the third trimester',
          severity: 'Medium'
        });
      }

      // Check exercise duration
      if (exercise.duration > 60) {
        recommendations.push({
          type: 'duration',
          message: 'Consider keeping exercise sessions under 60 minutes',
          severity: 'Low'
        });
      }

      // Check for risky exercises
      if (this.isRiskyExercise(exercise.type, pregnancyWeek)) {
        recommendations.push({
          type: 'safety',
          message: `Exercise type "${exercise.type}" may not be suitable for your current stage of pregnancy`,
          severity: 'High'
        });
      }

      // Create recommendations if any were generated
      if (recommendations.length > 0) {
        await prisma.exerciseRecommendation.createMany({
          data: recommendations.map(rec => ({
            userId,
            pregnancyId,
            ...rec,
            createdAt: new Date()
          }))
        });
      }
    } catch (error) {
      console.error('Failed to check exercise recommendations:', error);
    }
  }

  calculatePregnancyWeek(startDate) {
    const today = new Date();
    const start = new Date(startDate);
    const diffTime = Math.abs(today - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7);
  }

  isRiskyExercise(exerciseType, pregnancyWeek) {
    const riskyExercises = {
      firstTrimester: [
        'contact sports',
        'scuba diving',
        'hot yoga',
        'high-impact aerobics'
      ],
      secondTrimester: [
        'contact sports',
        'scuba diving',
        'hot yoga',
        'high-impact aerobics',
        'exercises requiring balance'
      ],
      thirdTrimester: [
        'contact sports',
        'scuba diving',
        'hot yoga',
        'high-impact aerobics',
        'exercises requiring balance',
        'exercises lying on back'
      ]
    };

    const trimester = this.getCurrentTrimester(pregnancyWeek);
    return riskyExercises[`${trimester}Trimester`].includes(exerciseType.toLowerCase());
  }

  getCurrentTrimester(pregnancyWeek) {
    if (pregnancyWeek <= 12) return 'first';
    if (pregnancyWeek <= 27) return 'second';
    return 'third';
  }

  async getExerciseHistory(userId, pregnancyId, startDate, endDate) {
    try {
      return await prisma.exercise.findMany({
        where: {
          userId,
          pregnancyId,
          performedAt: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: {
          performedAt: 'desc'
        }
      });
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch exercise history');
    }
  }

  async getExerciseSummary(userId, pregnancyId, startDate, endDate) {
    try {
      const exercises = await this.getExerciseHistory(userId, pregnancyId, startDate, endDate);
      
      const summary = {
        totalDuration: 0,
        totalCalories: 0,
        exerciseTypes: {},
        averageIntensity: 'moderate'
      };

      let totalIntensity = 0;
      let intensityCount = 0;

      exercises.forEach(exercise => {
        summary.totalDuration += exercise.duration || 0;
        summary.totalCalories += exercise.caloriesBurned || 0;
        
        if (exercise.type) {
          summary.exerciseTypes[exercise.type] = (summary.exerciseTypes[exercise.type] || 0) + 1;
        }

        if (exercise.intensity) {
          const intensityValue = this.getIntensityValue(exercise.intensity);
          totalIntensity += intensityValue;
          intensityCount++;
        }
      });

      if (intensityCount > 0) {
        const averageIntensityValue = totalIntensity / intensityCount;
        summary.averageIntensity = this.getIntensityLabel(averageIntensityValue);
      }

      return summary;
    } catch (error) {
      throw new ApiError(500, 'Failed to generate exercise summary');
    }
  }

  getIntensityValue(intensity) {
    switch (intensity.toLowerCase()) {
      case 'low': return 1;
      case 'moderate': return 2;
      case 'high': return 3;
      default: return 2;
    }
  }

  getIntensityLabel(value) {
    if (value < 1.5) return 'low';
    if (value < 2.5) return 'moderate';
    return 'high';
  }

  async getExerciseRecommendations(userId, pregnancyId) {
    try {
      return await prisma.exerciseRecommendation.findMany({
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
      throw new ApiError(500, 'Failed to fetch exercise recommendations');
    }
  }

  async markRecommendationAsRead(userId, recommendationId) {
    try {
      return await prisma.exerciseRecommendation.update({
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

export default new ExerciseTrackingService(); 