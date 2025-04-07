import prisma from '../../../utils/database/prisma.js';
import ApiError from '../../../utils/error/api.error.js';

class PregnancyTrackingService {
  async createPregnancyProfile(userId, pregnancyData) {
    try {
      const pregnancyProfile = await prisma.pregnancyProfile.create({
        data: {
          userId,
          ...pregnancyData
        }
      });

      return pregnancyProfile;
    } catch (error) {
      throw new ApiError(500, 'Failed to create pregnancy profile');
    }
  }

  async updatePregnancyProfile(userId, pregnancyId, updateData) {
    try {
      const pregnancyProfile = await prisma.pregnancyProfile.update({
        where: {
          id: pregnancyId,
          userId
        },
        data: updateData
      });

      return pregnancyProfile;
    } catch (error) {
      throw new ApiError(500, 'Failed to update pregnancy profile');
    }
  }

  async getPregnancyProfile(userId, pregnancyId) {
    try {
      const pregnancyProfile = await prisma.pregnancyProfile.findUnique({
        where: {
          id: pregnancyId,
          userId
        }
      });

      if (!pregnancyProfile) {
        throw new ApiError(404, 'Pregnancy profile not found');
      }

      return pregnancyProfile;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to fetch pregnancy profile');
    }
  }

  async getPregnancyHistory(userId) {
    try {
      return await prisma.pregnancyProfile.findMany({
        where: {
          userId
        },
        orderBy: {
          startDate: 'desc'
        }
      });
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch pregnancy history');
    }
  }

  async calculatePregnancyWeek(startDate) {
    const today = new Date();
    const start = new Date(startDate);
    const diffTime = Math.abs(today - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7);
  }

  async getPregnancyMilestones(pregnancyWeek) {
    const milestones = {
      firstTrimester: {
        start: 1,
        end: 12,
        milestones: [
          { week: 4, description: 'Heartbeat begins' },
          { week: 8, description: 'All major organs begin to form' },
          { week: 12, description: 'Risk of miscarriage decreases significantly' }
        ]
      },
      secondTrimester: {
        start: 13,
        end: 27,
        milestones: [
          { week: 16, description: 'Gender can be determined' },
          { week: 20, description: 'Halfway point of pregnancy' },
          { week: 24, description: 'Viability milestone' }
        ]
      },
      thirdTrimester: {
        start: 28,
        end: 40,
        milestones: [
          { week: 28, description: 'Third trimester begins' },
          { week: 32, description: 'Baby\'s position becomes important' },
          { week: 37, description: 'Full term milestone' }
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

  async recordPrenatalVisit(userId, pregnancyId, visitData) {
    try {
      const prenatalVisit = await prisma.prenatalVisit.create({
        data: {
          userId,
          pregnancyId,
          ...visitData
        }
      });

      return prenatalVisit;
    } catch (error) {
      throw new ApiError(500, 'Failed to record prenatal visit');
    }
  }

  async getPrenatalVisits(userId, pregnancyId) {
    try {
      return await prisma.prenatalVisit.findMany({
        where: {
          userId,
          pregnancyId
        },
        orderBy: {
          visitDate: 'desc'
        }
      });
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch prenatal visits');
    }
  }

  async calculateDueDate(startDate) {
    const dueDate = new Date(startDate);
    dueDate.setDate(dueDate.getDate() + 280); // 40 weeks = 280 days
    return dueDate;
  }
}

export default new PregnancyTrackingService(); 