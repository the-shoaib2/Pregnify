import prisma from '../../../utils/database/prisma.js';
import ApiError from '../../../utils/error/api.error.js';
import ApiResponse from '../../../utils/error/api.response.js';

export const pregnancyController = {
  async createPregnancyProfile(req, res) {
    try {
      const userId = req.user.id;
      const { 
        dueDate, 
        pregnancyWeek, 
        height, 
        weight, 
        bloodGroup, 
        lastMenstrualDate,
        // Medical data
        bloodPressure,
        isFirstPregnancy,
        previousPregnancies,
        previousComplications,
        pregnancyType,
        conceptionMethod,
        hasGestationalDiabetes,
        hasPreeclampsia,
        hasAnemia,
        otherConditions,
        // Lifestyle data
        smokingStatus,
        alcoholConsumption,
        exerciseFrequency,
        dietaryRestrictions
      } = req.body;

      if (!dueDate || !pregnancyWeek || !height || !weight || !bloodGroup || !lastMenstrualDate) {
        throw new ApiError(400, 'All required fields are missing');
      }

      // Map blood group string to enum value
      const bloodGroupEnum = bloodGroup.toUpperCase().replace('+', '_POSITIVE').replace('-', '_NEGATIVE');

      // Check if user already has an active pregnancy
      const existingPregnancy = await prisma.pregnancyProfile.findFirst({
        where: {
          userId,
          status: 'ACTIVE'
        }
      });

      if (existingPregnancy) {
        throw new ApiError(400, 'You already have an active pregnancy profile');
      }

      // Get user's medical information
      const medicalInfo = await prisma.medicalInformation.findUnique({
        where: { userId }
      });

      // Create pregnancy profile with medical data
      const pregnancy = await prisma.pregnancyProfile.create({
        data: {
          userId,
          dueDate: new Date(dueDate),
          pregnancyWeek,
          height,
          prePregnancyWeight: weight,
          currentWeight: weight,
          bloodGroup: bloodGroupEnum,
          lastMenstrualDate: new Date(lastMenstrualDate),
          status: 'ACTIVE',
          // Medical data
          bloodPressure: bloodPressure || medicalInfo?.bloodPressure,
          isFirstPregnancy: isFirstPregnancy ?? false,
          previousPregnancies: previousPregnancies ?? 0,
          previousComplications: previousComplications ? JSON.parse(previousComplications) : null,
          pregnancyType: pregnancyType || 'SINGLE',
          conceptionMethod: conceptionMethod || 'NATURAL',
          hasGestationalDiabetes: hasGestationalDiabetes ?? false,
          hasPreeclampsia: hasPreeclampsia ?? false,
          hasAnemia: hasAnemia ?? false,
          otherConditions: otherConditions ? JSON.parse(otherConditions) : null,
          // Lifestyle data
          smokingStatus: smokingStatus || 'NEVER',
          alcoholConsumption: alcoholConsumption || 'NONE',
          exerciseFrequency: exerciseFrequency || 'NONE',
          dietaryRestrictions: dietaryRestrictions ? JSON.parse(dietaryRestrictions) : null
        }
      });

      // Create initial risk assessment
      await prisma.riskAssessment.create({
        data: {
          userId,
          pregnancyId: pregnancy.id,
          // Personal Information
          age: 0,
          bmi: 0,
          nutritionStatus: 'unknown',
          exerciseHabits: 'unknown',
          psychologicalHealth: 'unknown',
          sleepPatterns: 'unknown',
          // Chronic Conditions
          chronicConditions: {},
          // Lifestyle Factors
          isSmoker: false,
          alcoholConsumption: false,
          substanceUse: false,
          dietQuality: 'unknown',
          // Medical History
          familyPlanningHistory: false,
          previousPregnancies: 0,
          hasAllergies: false,
          infectionHistory: false,
          medicationUsage: false,
          // Vital Signs
          bloodPressureStatus: 'unknown',
          bloodSugarStatus: 'unknown',
          medicalCheckups: 'unknown',
          // Environmental and Social Factors
          occupationalHazards: false,
          environmentalExposure: false,
          partnerHealthStatus: 'unknown',
          socialSupportLevel: 'unknown',
          financialStability: 'unknown',
          educationLevel: 'unknown',
          // Additional Health Factors
          currentMedications: {},
          surgicalHistory: {},
          mentalHealthStatus: 'unknown',
          sleepQuality: 'unknown',
          weight: weight,
          height: height,
          allergies: {},
          // Family History
          geneticDisorders: {},
          pregnancyComplications: {},
          // Assessment Results
          riskScore: 0,
          recommendations: 'Initial assessment pending',
          assessmentDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      return res.status(201).json(
        new ApiResponse(201, pregnancy, 'Pregnancy profile created successfully')
      );
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        new ApiResponse(error.statusCode || 500, null, error.message)
      );
    }
  },

  async getActivePregnancy(req, res) {
    try {
      const userId = req.user.id;

      const pregnancy = await prisma.pregnancyProfile.findFirst({
        where: {
          userId,
          status: 'ACTIVE'
        },
        include: {
          riskAssessments: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          },
          medicalAppointments: {
            orderBy: {
              date: 'asc'
            },
            take: 5
          },
          healthAlerts: {
            where: {
              isRead: false
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });

      if (!pregnancy) {
        throw new ApiError(404, 'No active pregnancy found');
      }

      return res.status(200).json(
        new ApiResponse(200, pregnancy, 'Active pregnancy retrieved successfully')
      );
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        new ApiResponse(error.statusCode || 500, null, error.message)
      );
    }
  },

  async updatePregnancyProfile(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const updateData = req.body;

      // Check if pregnancy exists and belongs to user
      const existingPregnancy = await prisma.pregnancyProfile.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!existingPregnancy) {
        throw new ApiError(404, 'Pregnancy profile not found');
      }

      // Convert dates if present
      if (updateData.dueDate) updateData.dueDate = new Date(updateData.dueDate);
      if (updateData.lastMenstrualDate) updateData.lastMenstrualDate = new Date(updateData.lastMenstrualDate);
      
      // Convert blood group if present
      if (updateData.bloodGroup) {
        updateData.bloodGroup = updateData.bloodGroup.toUpperCase().replace('+', '_POSITIVE').replace('-', '_NEGATIVE');
      }

      // Handle weight fields
      if (updateData.weight) {
        updateData.prePregnancyWeight = updateData.weight;
        updateData.currentWeight = updateData.weight;
        delete updateData.weight;
      }

      // Convert JSON fields if present
      if (updateData.previousComplications) {
        updateData.previousComplications = JSON.parse(updateData.previousComplications);
      }
      if (updateData.otherConditions) {
        updateData.otherConditions = JSON.parse(updateData.otherConditions);
      }
      if (updateData.dietaryRestrictions) {
        updateData.dietaryRestrictions = JSON.parse(updateData.dietaryRestrictions);
      }

      const updatedPregnancy = await prisma.pregnancyProfile.update({
        where: { id },
        data: updateData
      });

      return res.status(200).json(
        new ApiResponse(200, updatedPregnancy, 'Pregnancy profile updated successfully')
      );
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        new ApiResponse(error.statusCode || 500, null, error.message)
      );
    }
  },

  async getPregnancyHistory(req, res) {
    try {
      const userId = req.user.id;

      const pregnancies = await prisma.pregnancyProfile.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          riskAssessments: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          },
          medicalAppointments: {
            orderBy: {
              date: 'desc'
            },
            take: 1
          }
        }
      });

      return res.status(200).json(
        new ApiResponse(200, pregnancies, 'Pregnancy history retrieved successfully')
      );
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        new ApiResponse(error.statusCode || 500, null, error.message)
      );
    }
  },

  async getUserPregnancy(req, res) {
    try {
      const userId = req.user.id;

      // Get all pregnancy profiles for the authenticated user
      const pregnancies = await prisma.pregnancyProfile.findMany({
        where: {
          userId: userId
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          riskAssessments: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        }
      });

      if (!pregnancies || pregnancies.length === 0) {
        return res.status(200).json(
          new ApiResponse(200, [], 'No pregnancy profiles found for this user')
        );
      }

      // Get user's medical and personal information
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          medicalInformation: true,
          personalInformation: true
        }
      });

      // Get the most recent medical and personal information
      const recentMedicalInfo = user?.medicalInformation?.length > 0 
        ? user.medicalInformation[user.medicalInformation.length - 1] 
        : null;
      const recentPersonalInfo = user?.personalInformation?.length > 0 
        ? user.personalInformation[user.personalInformation.length - 1] 
        : null;

      // Format the response data
      const formattedPregnancies = pregnancies.map(pregnancy => ({
        id: pregnancy.id,
        pregnancyWeek: pregnancy.pregnancyWeek,
        dueDate: pregnancy.dueDate,
        isFirstPregnancy: pregnancy.isFirstPregnancy,
        previousPregnancies: pregnancy.previousPregnancies,
        previousComplications: pregnancy.previousComplications,
        pregnancyType: pregnancy.pregnancyType,
        conceptionMethod: pregnancy.conceptionMethod,
        smokingStatus: pregnancy.smokingStatus,
        alcoholConsumption: pregnancy.alcoholConsumption,
        exerciseFrequency: pregnancy.exerciseFrequency,
        dietaryRestrictions: pregnancy.dietaryRestrictions,
        hasGestationalDiabetes: pregnancy.hasGestationalDiabetes,
        hasPreeclampsia: pregnancy.hasPreeclampsia,
        hasAnemia: pregnancy.hasAnemia,
        otherConditions: pregnancy.otherConditions,
        medicalInformation: recentMedicalInfo ? {
          bloodGroup: recentMedicalInfo.bloodGroup,
          height: recentMedicalInfo.height,
          prePregnancyWeight: recentMedicalInfo.prePregnancyWeight,
          currentWeight: recentMedicalInfo.currentWeight,
          bmi: recentMedicalInfo.bmi,
          bloodPressure: recentMedicalInfo.bloodPressure,
          medicalHistory: recentMedicalInfo.medicalHistory,
          chronicDiseases: recentMedicalInfo.chronicDiseases,
          allergies: recentMedicalInfo.allergies,
          medications: recentMedicalInfo.medications,
          geneticDisorders: recentMedicalInfo.geneticDisorders
        } : null,
        personalInformation: recentPersonalInfo ? {
          age: recentPersonalInfo.age,
          genderIdentity: recentPersonalInfo.genderIdentity,
          occupation: recentPersonalInfo.occupation
        } : null,
        latestRiskAssessment: pregnancy.riskAssessments[0] ? {
          riskScore: pregnancy.riskAssessments[0].riskScore,
          assessmentDate: pregnancy.riskAssessments[0].assessmentDate
        } : null,
        createdAt: pregnancy.createdAt,
        updatedAt: pregnancy.updatedAt
      }));

      return res.status(200).json(
        new ApiResponse(200, formattedPregnancies, 'Pregnancy profiles retrieved successfully')
      );
    } catch (error) {
      console.error('Error fetching pregnancy profiles:', error);
      return res.status(error.statusCode || 500).json(
        new ApiResponse(error.statusCode || 500, null, error.message)
      );
    }
  }
}; 