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

      // Get user's medical and personal information
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          medicalInformation: {
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          personalInformation: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
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
          bloodPressure: bloodPressure || user?.medicalInformation[0]?.bloodPressure || null,
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
          age: user?.personalInformation[0]?.age || 0,
          bmi: calculateBMI(weight, height),
          nutritionStatus: 'unknown',
          exerciseHabits: 'unknown',
          psychologicalHealth: 'unknown',
          sleepPatterns: 'unknown',
          // Chronic Conditions
          chronicConditions: user?.medicalInformation[0]?.chronicDiseases || {},
          // Lifestyle Factors
          isSmoker: smokingStatus === 'CURRENT',
          alcoholConsumption: alcoholConsumption !== 'NONE',
          substanceUse: false,
          dietQuality: 'unknown',
          // Medical History
          familyPlanningHistory: false,
          previousPregnancies: previousPregnancies ?? 0,
          hasAllergies: user?.medicalInformation[0]?.allergies?.length > 0,
          infectionHistory: false,
          medicationUsage: user?.medicalInformation[0]?.medications?.length > 0,
          // Vital Signs
          bloodPressureStatus: bloodPressure || user?.medicalInformation[0]?.bloodPressure || 'unknown',
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
          currentMedications: user?.medicalInformation[0]?.medications || {},
          surgicalHistory: {},
          mentalHealthStatus: 'unknown',
          sleepQuality: 'unknown',
          weight: weight,
          height: height,
          allergies: user?.medicalInformation[0]?.allergies || {},
          // Family History
          geneticDisorders: user?.medicalInformation[0]?.geneticDisorders || {},
          pregnancyComplications: previousComplications ? JSON.parse(previousComplications) : {},
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
          medicalInformation: {
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          personalInformation: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

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
        medicalInformation: {
          bloodGroup: pregnancy.bloodGroup,
          height: pregnancy.height,
          prePregnancyWeight: pregnancy.prePregnancyWeight,
          currentWeight: pregnancy.currentWeight,
          bmi: calculateBMI(pregnancy.currentWeight, pregnancy.height),
          bloodPressure: pregnancy.bloodPressure,
          medicalHistory: user?.medicalInformation[0]?.medicalHistory || {},
          chronicDiseases: user?.medicalInformation[0]?.chronicDiseases || {},
          allergies: user?.medicalInformation[0]?.allergies || [],
          medications: user?.medicalInformation[0]?.medications || [],
          geneticDisorders: user?.medicalInformation[0]?.geneticDisorders || {}
        },
        personalInformation: {
          age: user?.personalInformation[0]?.age || null,
          genderIdentity: user?.personalInformation[0]?.genderIdentity || 'UNKNOWN',
          occupation: user?.personalInformation[0]?.occupation || {}
        },
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

// Helper function to calculate BMI
function calculateBMI(weight, height) {
  if (!weight || !height) return null;
  const heightInMeters = height / 100; // Convert cm to meters
  return (weight / (heightInMeters * heightInMeters)).toFixed(2);
} 