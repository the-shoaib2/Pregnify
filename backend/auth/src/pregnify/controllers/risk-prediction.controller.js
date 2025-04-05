import dotenv from 'dotenv';
import prisma from '../../utils/database/prisma.js';
import ApiError from '../../utils/error/api.error.js';
import ApiResponse from '../../utils/error/api.response.js';
import axios from 'axios';
import { riskPredictionPrompt } from '../templates/risk-prediction.prompt.js';
import { parseAIResponse } from '../utils/ai-response-parser.js';
import { testAIModel } from '../utils/test-ai-model.js';

// Load environment variables
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AI_MODEL = process.env.OPENAI_MODEL;
const OPENAI_API_URL = process.env.OPENAI_API_URL;

// Add validation for environment variables
if (!OPENAI_API_KEY || !AI_MODEL || !OPENAI_API_URL) {
  console.error('Missing required environment variables:', {
    hasApiKey: !!OPENAI_API_KEY,
    hasModel: !!AI_MODEL,
    hasApiUrl: !!OPENAI_API_URL
  });
  throw new Error('Missing required environment variables for AI service');
}

// Helper function for exponential backoff
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to make API call with retries
const makeApiCallWithRetry = async (data, maxRetries = 3, initialDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log('Making API request:', {
        url: OPENAI_API_URL,
        model: data.model,
        attempt: attempt + 1,
        maxRetries
      });

      const response = await axios.post(
        OPENAI_API_URL,
        data,
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('API Response Status:', response.status);
      console.log('API Response Headers:', response.headers);
      console.log('API Response Data:', JSON.stringify(response.data, null, 2));

      return response;
    } catch (error) {
      lastError = error;
      console.error('API Request Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // If it's not a rate limit error, throw immediately
      if (error.response?.status !== 429) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(2, attempt);
      console.log(`Rate limited. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`);
      await sleep(delay);
    }
  }
  
  throw lastError;
};

// Add Bangladesh-specific risk factors
const BANGLADESH_RISK_FACTORS = {
  // Medical Risk Factors
  MEDICAL: {
    ANEMIA: { weight: 0.15, threshold: 11 }, // Hemoglobin level threshold
    GESTATIONAL_DIABETES: { weight: 0.2 },
    HYPERTENSION: { weight: 0.2 },
    MALNUTRITION: { weight: 0.15 },
    INFECTIONS: { weight: 0.1 }
  },
  // Socioeconomic Risk Factors
  SOCIOECONOMIC: {
    LOW_INCOME: { weight: 0.1 },
    RURAL_AREA: { weight: 0.1 },
    LOW_EDUCATION: { weight: 0.05 },
    POOR_SANITATION: { weight: 0.1 }
  },
  // Healthcare Access Factors
  HEALTHCARE: {
    DISTANCE_TO_HOSPITAL: { weight: 0.1 },
    QUALITY_OF_CARE: { weight: 0.1 },
    EMERGENCY_ACCESS: { weight: 0.15 }
  }
};

// Add Bangladesh-specific validation
const validateBangladeshData = (data) => {
  const errors = [];
  
  // Validate medical data
  if (data.medical?.bmi < 18.5) {
    errors.push('Underweight (BMI < 18.5) - Common risk factor in Bangladesh');
  }
  if (data.medical?.bloodPressure?.systolic > 140 || data.medical?.bloodPressure?.diastolic > 90) {
    errors.push('Hypertension - Common pregnancy complication in Bangladesh');
  }
  
  // Validate socioeconomic factors
  if (data.personal?.occupation?.includes('agriculture') || 
      data.personal?.occupation?.includes('manual labor')) {
    errors.push('Physically demanding occupation - Increased risk');
  }
  
  // Validate healthcare access
  if (data.personal?.location?.includes('rural')) {
    errors.push('Rural location - Limited healthcare access');
  }
  
  return errors;
};

export const riskPredictionController = {
  async calculateRiskScore(req, res) {
    try {
      const { patientData } = req.body;
      const userId = req.user.id;

      if (!patientData) {
        throw new ApiError(400, 'Patient data is required');
      }

      // Get active pregnancy
      const pregnancy = await prisma.pregnancyProfile.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      if (!pregnancy) {
        throw new ApiError(400, 'No active pregnancy found');
      }

      // Use test AI model for prediction
      const prediction = await testAIModel.predictRisk(patientData);

      // Save the risk assessment
      const riskAssessment = await prisma.riskAssessment.upsert({
        where: {
          pregnancyId: pregnancy.id
        },
        update: {
          riskScore: prediction.riskScore,
          recommendations: JSON.stringify({
            riskLevel: prediction.riskLevel,
            riskFactors: prediction.riskFactors,
            recommendations: prediction.recommendations,
            nextSteps: prediction.nextSteps,
            warningSigns: prediction.warningSigns,
            emergencyContact: prediction.emergencyContact
          }),
          vitalSigns: patientData.vitalSigns || {},
          symptoms: patientData.symptoms || {},
          bangladeshFactors: JSON.stringify({
            medical: patientData.medical || {},
            socioeconomic: {
              location: patientData.location,
              education: patientData.education,
              incomeLevel: patientData.incomeLevel,
              livingConditions: patientData.livingConditions
            },
            healthcare: {
              access: patientData.accessToHealthcare,
              distance: patientData.location === 'rural' ? 'Far' : 'Near'
            }
          })
        },
        create: {
          userId,
          pregnancyId: pregnancy.id,
          riskScore: prediction.riskScore,
          recommendations: JSON.stringify({
            riskLevel: prediction.riskLevel,
            riskFactors: prediction.riskFactors,
            recommendations: prediction.recommendations,
            nextSteps: prediction.nextSteps,
            warningSigns: prediction.warningSigns,
            emergencyContact: prediction.emergencyContact
          }),
          vitalSigns: patientData.vitalSigns || {},
          symptoms: patientData.symptoms || {},
          bangladeshFactors: JSON.stringify({
            medical: patientData.medical || {},
            socioeconomic: {
              location: patientData.location,
              education: patientData.education,
              incomeLevel: patientData.incomeLevel,
              livingConditions: patientData.livingConditions
            },
            healthcare: {
              access: patientData.accessToHealthcare,
              distance: patientData.location === 'rural' ? 'Far' : 'Near'
            }
          })
        }
      });

      return res.status(200).json(
        new ApiResponse(200, {
          riskScore: prediction.riskScore,
          riskLevel: prediction.riskLevel,
          riskFactors: prediction.riskFactors,
          recommendations: prediction.recommendations,
          nextSteps: prediction.nextSteps,
          warningSigns: prediction.warningSigns,
          emergencyContact: prediction.emergencyContact,
          assessmentId: riskAssessment.id,
          timestamp: new Date().toISOString()
        }, 'Risk assessment completed successfully')
      );
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        new ApiResponse(error.statusCode || 500, null, error.message)
      );
    }
  },

  async getRecommendations(req, res) {
    try {
      const { riskScore } = req.body;
      const userId = req.user.id;

      if (!riskScore) {
        throw new ApiError(400, 'Risk score is required');
      }

      // Get the latest risk assessment with all stored data
      const riskAssessment = await prisma.riskAssessment.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      if (!riskAssessment) {
        throw new ApiError(404, 'No risk assessment found');
      }

      // Parse the stored JSON data
      const assessmentData = JSON.parse(riskAssessment.recommendations);

      // Return comprehensive data
      return res.status(200).json(
        new ApiResponse(200, {
          riskScore: assessmentData.riskScore,
          riskLevel: assessmentData.riskLevel,
          riskFactors: assessmentData.riskFactors,
          recommendations: assessmentData.recommendations,
          nextSteps: assessmentData.nextSteps,
          warningSigns: assessmentData.warningSigns,
          emergencyContact: assessmentData.emergencyContact,
          followUpSchedule: assessmentData.followUpSchedule,
          additionalTests: assessmentData.additionalTests,
          pregnancyDetails: assessmentData.pregnancyDetails,
          medicalHistory: assessmentData.medicalHistory,
          currentStatus: assessmentData.currentStatus,
          lifestyle: assessmentData.lifestyle,
          healthConditions: assessmentData.healthConditions,
          assessmentId: riskAssessment.id,
          timestamp: riskAssessment.assessmentDate
        }, 'Recommendations retrieved successfully')
      );
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        new ApiResponse(error.statusCode || 500, null, error.message)
      );
    }
  }
};
