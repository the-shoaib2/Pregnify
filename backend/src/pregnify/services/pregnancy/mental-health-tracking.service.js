import prisma from '../../../utils/database/prisma.js';
import ApiError from '../../../utils/error/api.error.js';

class MentalHealthTrackingService {
  async recordMood(userId, pregnancyId, moodData) {
    try {
      const mood = await prisma.mood.create({
        data: {
          userId,
          pregnancyId,
          ...moodData
        }
      });

      // Check for mental health recommendations
      await this.checkMentalHealthRecommendations(userId, pregnancyId, mood);

      return mood;
    } catch (error) {
      throw new ApiError(500, 'Failed to record mood');
    }
  }

  async checkMentalHealthRecommendations(userId, pregnancyId, mood) {
    try {
      const recommendations = [];
      const pregnancyProfile = await prisma.pregnancyProfile.findUnique({
        where: {
          id: pregnancyId,
          userId
        }
      });

      if (!pregnancyProfile) return;

      // Check for persistent negative mood
      const recentMoods = await this.getRecentMoods(userId, pregnancyId, 7);
      const negativeMoodCount = recentMoods.filter(m => m.moodLevel <= 3).length;

      if (negativeMoodCount >= 5) {
        recommendations.push({
          type: 'mood',
          message: 'You\'ve been experiencing persistent low mood. Consider speaking with a healthcare provider.',
          severity: 'High'
        });
      }

      // Check for anxiety levels
      if (mood.anxietyLevel >= 8) {
        recommendations.push({
          type: 'anxiety',
          message: 'High anxiety levels detected. Consider practicing relaxation techniques or speaking with a counselor.',
          severity: 'Medium'
        });
      }

      // Create recommendations if any were generated
      if (recommendations.length > 0) {
        await prisma.mentalHealthRecommendation.createMany({
          data: recommendations.map(rec => ({
            userId,
            pregnancyId,
            ...rec,
            createdAt: new Date()
          }))
        });
      }
    } catch (error) {
      console.error('Failed to check mental health recommendations:', error);
    }
  }

  async getRecentMoods(userId, pregnancyId, days) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      return await prisma.mood.findMany({
        where: {
          userId,
          pregnancyId,
          recordedAt: {
            gte: startDate
          }
        },
        orderBy: {
          recordedAt: 'desc'
        }
      });
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch recent moods');
    }
  }

  async getMoodHistory(userId, pregnancyId, startDate, endDate) {
    try {
      return await prisma.mood.findMany({
        where: {
          userId,
          pregnancyId,
          recordedAt: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: {
          recordedAt: 'desc'
        }
      });
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch mood history');
    }
  }

  async getMoodSummary(userId, pregnancyId, startDate, endDate) {
    try {
      const moods = await this.getMoodHistory(userId, pregnancyId, startDate, endDate);
      
      const summary = {
        averageMood: 0,
        moodDistribution: {
          veryLow: 0,
          low: 0,
          neutral: 0,
          high: 0,
          veryHigh: 0
        },
        anxietyLevels: {
          low: 0,
          medium: 0,
          high: 0
        },
        stressLevels: {
          low: 0,
          medium: 0,
          high: 0
        }
      };

      let totalMood = 0;
      let moodCount = 0;

      moods.forEach(mood => {
        // Calculate average mood
        if (mood.moodLevel) {
          totalMood += mood.moodLevel;
          moodCount++;

          // Update mood distribution
          if (mood.moodLevel <= 2) summary.moodDistribution.veryLow++;
          else if (mood.moodLevel <= 4) summary.moodDistribution.low++;
          else if (mood.moodLevel <= 6) summary.moodDistribution.neutral++;
          else if (mood.moodLevel <= 8) summary.moodDistribution.high++;
          else summary.moodDistribution.veryHigh++;
        }

        // Update anxiety levels
        if (mood.anxietyLevel) {
          if (mood.anxietyLevel <= 3) summary.anxietyLevels.low++;
          else if (mood.anxietyLevel <= 7) summary.anxietyLevels.medium++;
          else summary.anxietyLevels.high++;
        }

        // Update stress levels
        if (mood.stressLevel) {
          if (mood.stressLevel <= 3) summary.stressLevels.low++;
          else if (mood.stressLevel <= 7) summary.stressLevels.medium++;
          else summary.stressLevels.high++;
        }
      });

      if (moodCount > 0) {
        summary.averageMood = totalMood / moodCount;
      }

      return summary;
    } catch (error) {
      throw new ApiError(500, 'Failed to generate mood summary');
    }
  }

  async getMentalHealthRecommendations(userId, pregnancyId) {
    try {
      return await prisma.mentalHealthRecommendation.findMany({
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
      throw new ApiError(500, 'Failed to fetch mental health recommendations');
    }
  }

  async markRecommendationAsRead(userId, recommendationId) {
    try {
      return await prisma.mentalHealthRecommendation.update({
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

export default new MentalHealthTrackingService(); 