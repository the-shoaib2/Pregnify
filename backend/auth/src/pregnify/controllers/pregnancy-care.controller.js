import prisma from '../../utils/database/prisma.js';
import ApiError from '../../utils/error/api.error.js';
import ApiResponse from '../../utils/error/api.response.js';
import axios from 'axios';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AI_MODEL = process.env.OPENAI_MODEL;
const OPENAI_API_URL = process.env.OPENAI_API_URL;

export const pregnancyCareController = {
  async generateCarePlan(req, res) {
    try {
      const userId = req.user.id;
      const { trimester, conditions, preferences } = req.body;

      // Get user's pregnancy and medical data
      const [pregnancy, medicalInfo, riskAssessment] = await Promise.all([
        prisma.pregnancyProfile.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.medicalInformation.findUnique({
          where: { userId }
        }),
        prisma.riskAssessment.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' }
        })
      ]);

      if (!pregnancy) {
        throw new ApiError(404, 'No active pregnancy found');
      }

      // Prepare data for AI analysis
      const analysisData = {
        pregnancy: {
          trimester,
          week: pregnancy.pregnancyWeek,
          dueDate: pregnancy.dueDate,
          isFirstPregnancy: pregnancy.isFirstPregnancy,
          previousPregnancies: pregnancy.previousPregnancies,
          previousComplications: pregnancy.previousComplications,
          pregnancyType: pregnancy.pregnancyType
        },
        medical: {
          bloodGroup: medicalInfo?.bloodGroup,
          height: medicalInfo?.height,
          prePregnancyWeight: medicalInfo?.prePregnancyWeight,
          currentWeight: medicalInfo?.currentWeight,
          bmi: medicalInfo?.bmi,
          bloodPressure: medicalInfo?.bloodPressure,
          medicalHistory: medicalInfo?.medicalHistory,
          chronicDiseases: medicalInfo?.chronicDiseases,
          allergies: medicalInfo?.allergies,
          medications: medicalInfo?.medications
        },
        conditions: conditions || [],
        preferences: preferences || {},
        riskAssessment: riskAssessment ? JSON.parse(riskAssessment.recommendations) : null
      };

      // Prepare prompt for AI
      const prompt = `Create a comprehensive pregnancy care plan based on the following data:

      PREGNANCY DETAILS:
      - Trimester: ${analysisData.pregnancy.trimester}
      - Week: ${analysisData.pregnancy.week}
      - Due Date: ${analysisData.pregnancy.dueDate}
      - First Pregnancy: ${analysisData.pregnancy.isFirstPregnancy ? 'Yes' : 'No'}
      - Previous Pregnancies: ${analysisData.pregnancy.previousPregnancies}
      - Previous Complications: ${JSON.stringify(analysisData.pregnancy.previousComplications)}
      - Pregnancy Type: ${analysisData.pregnancy.pregnancyType}

      MEDICAL INFORMATION:
      - Blood Group: ${analysisData.medical.bloodGroup}
      - Height: ${analysisData.medical.height} cm
      - Pre-pregnancy Weight: ${analysisData.medical.prePregnancyWeight} kg
      - Current Weight: ${analysisData.medical.currentWeight} kg
      - BMI: ${analysisData.medical.bmi}
      - Blood Pressure: ${analysisData.medical.bloodPressure}
      - Medical History: ${JSON.stringify(analysisData.medical.medicalHistory)}
      - Chronic Diseases: ${JSON.stringify(analysisData.medical.chronicDiseases)}
      - Allergies: ${analysisData.medical.allergies}
      - Current Medications: ${analysisData.medical.medications}

      CONDITIONS:
      ${JSON.stringify(analysisData.conditions)}

      PREFERENCES:
      ${JSON.stringify(analysisData.preferences)}

      RISK ASSESSMENT:
      ${JSON.stringify(analysisData.riskAssessment)}

      Please provide a detailed care plan in the following format:

      NUTRITION PLAN:
      - Daily Caloric Intake: [amount] calories
      - Key Nutrients: [list with amounts]
      - Recommended Foods: [list]
      - Foods to Avoid: [list]
      - Meal Timing: [schedule]
      - Hydration: [recommendations]

      EXERCISE PLAN:
      - Recommended Activities: [list]
      - Frequency: [schedule]
      - Duration: [time]
      - Intensity: [level]
      - Safety Guidelines: [list]

      MEDICAL CARE:
      - Required Tests: [list with timing]
      - Doctor Visits: [schedule]
      - Vaccinations: [list with timing]
      - Medication Schedule: [if applicable]
      - Warning Signs: [list]

      LIFESTYLE RECOMMENDATIONS:
      - Sleep: [recommendations]
      - Stress Management: [techniques]
      - Work: [guidelines]
      - Travel: [restrictions]
      - Daily Activities: [guidelines]

      SUPPLEMENTS:
      - Required: [list with dosage]
      - Optional: [list with dosage]
      - Timing: [schedule]

      EMERGENCY PLAN:
      - Warning Signs: [list]
      - Emergency Contacts: [list]
      - Hospital Information: [details]
      - Emergency Procedures: [steps]

      WEEKLY CHECKLIST:
      - Tasks: [list]
      - Goals: [list]
      - Reminders: [list]`;

      // Make API call to OpenAI
      const response = await axios.post(
        OPENAI_API_URL,
        {
          model: AI_MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are a medical AI assistant specializing in pregnancy care. Provide detailed, evidence-based recommendations for a comprehensive pregnancy care plan.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const aiResponse = response.data.choices[0].message.content;

      // Save the care plan
      const carePlan = await prisma.pregnancyCarePlan.create({
        data: {
          userId,
          pregnancyId: pregnancy.id,
          trimester,
          plan: JSON.stringify({
            nutrition: extractSection(aiResponse, 'NUTRITION PLAN'),
            exercise: extractSection(aiResponse, 'EXERCISE PLAN'),
            medicalCare: extractSection(aiResponse, 'MEDICAL CARE'),
            lifestyle: extractSection(aiResponse, 'LIFESTYLE RECOMMENDATIONS'),
            supplements: extractSection(aiResponse, 'SUPPLEMENTS'),
            emergency: extractSection(aiResponse, 'EMERGENCY PLAN'),
            weeklyChecklist: extractSection(aiResponse, 'WEEKLY CHECKLIST')
          }),
          conditions: conditions || [],
          preferences: preferences || {}
        }
      });

      return res.status(200).json(
        new ApiResponse(200, {
          carePlanId: carePlan.id,
          trimester,
          nutrition: JSON.parse(carePlan.plan).nutrition,
          exercise: JSON.parse(carePlan.plan).exercise,
          medicalCare: JSON.parse(carePlan.plan).medicalCare,
          lifestyle: JSON.parse(carePlan.plan).lifestyle,
          supplements: JSON.parse(carePlan.plan).supplements,
          emergency: JSON.parse(carePlan.plan).emergency,
          weeklyChecklist: JSON.parse(carePlan.plan).weeklyChecklist,
          timestamp: new Date().toISOString()
        }, 'Pregnancy care plan generated successfully')
      );
    } catch (error) {
      console.error('Error generating care plan:', error);
      return res.status(error.statusCode || 500).json(
        new ApiResponse(error.statusCode || 500, null, error.message)
      );
    }
  },

  async getCarePlan(req, res) {
    try {
      const userId = req.user.id;
      const { trimester } = req.query;

      const carePlan = await prisma.pregnancyCarePlan.findFirst({
        where: {
          userId,
          ...(trimester && { trimester })
        },
        orderBy: { createdAt: 'desc' }
      });

      if (!carePlan) {
        throw new ApiError(404, 'No care plan found');
      }

      return res.status(200).json(
        new ApiResponse(200, {
          carePlanId: carePlan.id,
          trimester: carePlan.trimester,
          nutrition: JSON.parse(carePlan.plan).nutrition,
          exercise: JSON.parse(carePlan.plan).exercise,
          medicalCare: JSON.parse(carePlan.plan).medicalCare,
          lifestyle: JSON.parse(carePlan.plan).lifestyle,
          supplements: JSON.parse(carePlan.plan).supplements,
          emergency: JSON.parse(carePlan.plan).emergency,
          weeklyChecklist: JSON.parse(carePlan.plan).weeklyChecklist,
          conditions: carePlan.conditions,
          preferences: carePlan.preferences,
          timestamp: carePlan.createdAt
        }, 'Care plan retrieved successfully')
      );
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        new ApiResponse(error.statusCode || 500, null, error.message)
      );
    }
  }
};

// Helper function to extract sections from AI response
function extractSection(text, sectionName) {
  const regex = new RegExp(`${sectionName}:\\s*([\\s\\S]*?)(?=\\n\\n[A-Z ]+:|$)`);
  const match = text.match(regex);
  return match ? match[1].trim() : '';
} 