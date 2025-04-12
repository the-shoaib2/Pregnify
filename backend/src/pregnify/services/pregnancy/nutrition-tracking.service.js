import prisma from '../../../utils/database/prisma.js';
import ApiError from '../../../utils/error/api.error.js';

class NutritionTrackingService {
  async recordMeal(userId, pregnancyId, mealData) {
    try {
      const meal = await prisma.meal.create({
        data: {
          userId,
          pregnancyId,
          ...mealData
        }
      });

      // Check for nutritional recommendations
      await this.checkNutritionalRecommendations(userId, pregnancyId, meal);

      return meal;
    } catch (error) {
      throw new ApiError(500, 'Failed to record meal');
    }
  }

  async checkNutritionalRecommendations(userId, pregnancyId, meal) {
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
      const nutritionalNeeds = this.getNutritionalNeeds(pregnancyWeek);

      // Check for key nutrients
      if (meal.nutrients) {
        if (meal.nutrients.folicAcid < nutritionalNeeds.folicAcid) {
          recommendations.push({
            type: 'nutrient',
            message: 'Consider adding more folate-rich foods to your diet',
            severity: 'Medium'
          });
        }

        if (meal.nutrients.iron < nutritionalNeeds.iron) {
          recommendations.push({
            type: 'nutrient',
            message: 'Consider adding more iron-rich foods to your diet',
            severity: 'Medium'
          });
        }

        if (meal.nutrients.calcium < nutritionalNeeds.calcium) {
          recommendations.push({
            type: 'nutrient',
            message: 'Consider adding more calcium-rich foods to your diet',
            severity: 'Medium'
          });
        }
      }

      // Create recommendations if any were generated
      if (recommendations.length > 0) {
        await prisma.nutritionRecommendation.createMany({
          data: recommendations.map(rec => ({
            userId,
            pregnancyId,
            ...rec,
            createdAt: new Date()
          }))
        });
      }
    } catch (error) {
      console.error('Failed to check nutritional recommendations:', error);
    }
  }

  calculatePregnancyWeek(startDate) {
    const today = new Date();
    const start = new Date(startDate);
    const diffTime = Math.abs(today - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7);
  }

  getNutritionalNeeds(pregnancyWeek) {
    // Based on standard nutritional requirements during pregnancy
    return {
      calories: pregnancyWeek <= 12 ? 1800 : pregnancyWeek <= 27 ? 2200 : 2400,
      protein: 71, // grams
      folicAcid: 600, // micrograms
      iron: 27, // milligrams
      calcium: 1000, // milligrams
      vitaminD: 600, // IU
      omega3: 200 // milligrams
    };
  }

  async getMealHistory(userId, pregnancyId, startDate, endDate) {
    try {
      return await prisma.meal.findMany({
        where: {
          userId,
          pregnancyId,
          consumedAt: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: {
          consumedAt: 'desc'
        }
      });
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch meal history');
    }
  }

  async getNutritionalSummary(userId, pregnancyId, startDate, endDate) {
    try {
      const meals = await this.getMealHistory(userId, pregnancyId, startDate, endDate);
      
      const summary = {
        totalCalories: 0,
        totalProtein: 0,
        totalFolicAcid: 0,
        totalIron: 0,
        totalCalcium: 0,
        totalVitaminD: 0,
        totalOmega3: 0
      };

      meals.forEach(meal => {
        if (meal.nutrients) {
          summary.totalCalories += meal.nutrients.calories || 0;
          summary.totalProtein += meal.nutrients.protein || 0;
          summary.totalFolicAcid += meal.nutrients.folicAcid || 0;
          summary.totalIron += meal.nutrients.iron || 0;
          summary.totalCalcium += meal.nutrients.calcium || 0;
          summary.totalVitaminD += meal.nutrients.vitaminD || 0;
          summary.totalOmega3 += meal.nutrients.omega3 || 0;
        }
      });

      return summary;
    } catch (error) {
      throw new ApiError(500, 'Failed to generate nutritional summary');
    }
  }

  async getNutritionRecommendations(userId, pregnancyId) {
    try {
      return await prisma.nutritionRecommendation.findMany({
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
      throw new ApiError(500, 'Failed to fetch nutrition recommendations');
    }
  }

  async markRecommendationAsRead(userId, recommendationId) {
    try {
      return await prisma.nutritionRecommendation.update({
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

export default new NutritionTrackingService(); 