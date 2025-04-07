import prisma from '../../../utils/database/prisma.js';
import ApiError from '../../../utils/error/api.error.js';

class RiskAssessmentService {
  async calculateRiskScore(userId, pregnancyId, assessmentData) {
    try {
      // Calculate risk score based on provided data
      const riskScore = this.calculateManualRiskScore(assessmentData);
      
      // Determine risk level
      const riskLevel = this.determineRiskLevel(riskScore);
      
      // Generate recommendations based on risk factors
      const recommendations = this.generateManualRecommendations(assessmentData, riskLevel);
      
      // Create risk assessment record
      const riskAssessment = await prisma.riskAssessment.create({
        data: {
          userId,
          pregnancyId,
          // Personal Information
          age: assessmentData.personal_information.age,
          bmi: assessmentData.personal_information.bmi,
          nutritionStatus: assessmentData.lifestyle_factors.diet_quality,
          exerciseHabits: assessmentData.lifestyle_factors.exercise_frequency,
          psychologicalHealth: assessmentData.lifestyle_factors.stress_level,
          sleepPatterns: 'NORMAL', // Default value
          
          // Chronic Conditions
          chronicConditions: JSON.stringify(assessmentData.chronic_conditions),
          
          // Lifestyle Factors
          isSmoker: assessmentData.lifestyle_factors.is_smoker,
          alcoholConsumption: assessmentData.lifestyle_factors.excessive_alcohol_consumption,
          substanceUse: assessmentData.lifestyle_factors.substance_use,
          dietQuality: assessmentData.lifestyle_factors.diet_quality,
          
          // Medical History
          familyPlanningHistory: false, // Default value
          previousPregnancies: assessmentData.medical_history.previous_pregnancies_count,
          hasAllergies: assessmentData.medical_history.has_allergies,
          infectionHistory: false, // Default value
          medicationUsage: assessmentData.chronic_conditions.medications.length > 0,
          
          // Vital Signs
          bloodPressureStatus: assessmentData.vital_signs.blood_pressure_status,
          bloodSugarStatus: assessmentData.vital_signs.blood_sugar_status,
          medicalCheckups: 'REGULAR', // Default value
          
          // Environmental and Social Factors
          occupationalHazards: assessmentData.environmental_and_social_factors.occupational_hazards_exposure,
          environmentalExposure: assessmentData.environmental_and_social_factors.environmental_exposures,
          partnerHealthStatus: 'HEALTHY', // Default value
          socialSupportLevel: 'GOOD', // Default value
          financialStability: assessmentData.environmental_and_social_factors.socioeconomic_status,
          educationLevel: 'SECONDARY', // Default value
          
          // Additional Health Factors
          currentMedications: JSON.stringify(assessmentData.chronic_conditions.medications),
          surgicalHistory: JSON.stringify([]), // Default value
          mentalHealthStatus: 'GOOD', // Default value
          sleepQuality: 'GOOD', // Default value
          weight: assessmentData.personal_information.weight,
          height: assessmentData.personal_information.height,
          allergies: JSON.stringify(assessmentData.medical_history.has_allergies ? ['Unknown'] : []),
          
          // Family History
          geneticDisorders: JSON.stringify([]), // Default value
          pregnancyComplications: JSON.stringify(assessmentData.medical_history.previous_complications),
          
          // Assessment Results
          riskScore,
          recommendations: JSON.stringify(recommendations)
        }
      });
      
      return {
        ...riskAssessment,
        recommendations
      };
    } catch (error) {
      console.error('Risk assessment error:', error);
      throw new ApiError(500, 'Failed to calculate risk assessment');
    }
  }

  calculateManualRiskScore(assessmentData) {
    let score = 0;
    
    // Age scoring
    if (assessmentData.personal_information.age < 18 || assessmentData.personal_information.age > 35) {
      score += 2;
    }

    // BMI scoring
    if (assessmentData.personal_information.bmi < 18.5 || assessmentData.personal_information.bmi > 25) {
      score += 2;
    }

    // Chronic conditions scoring
    if (assessmentData.chronic_conditions.conditions.length > 0) {
      score += assessmentData.chronic_conditions.conditions.length;
    }

    // Lifestyle factors scoring
    if (assessmentData.lifestyle_factors.is_smoker) {
      score += 3;
    }
    if (assessmentData.lifestyle_factors.excessive_alcohol_consumption) {
      score += 3;
    }
    if (assessmentData.lifestyle_factors.exercise_frequency === 'NONE') {
      score += 1;
    }

    // Medical history scoring
    if (assessmentData.medical_history.previous_pregnancies_count > 0) {
      score += 1;
    }
    if (assessmentData.medical_history.previous_complications.length > 0) {
      score += assessmentData.medical_history.previous_complications.length;
    }

    // Vital signs scoring
    if (assessmentData.vital_signs.blood_pressure_status !== 'Normal') {
      score += 3;
    }
    if (assessmentData.vital_signs.blood_sugar_status !== 'Normal') {
      score += 3;
    }

    return score;
  }

  determineRiskLevel(score) {
    if (score >= 10) return 'HIGH';
    if (score >= 5) return 'MODERATE';
    return 'LOW';
  }

  generateManualRecommendations(assessmentData, riskLevel) {
    const recommendations = [
      'Attend all scheduled prenatal appointments',
      'Maintain a healthy diet',
      'Stay hydrated',
      'Get adequate rest'
    ];

    // Add recommendations based on risk factors
    if (assessmentData.personal_information.bmi < 18.5) {
      recommendations.push('Consult with a nutritionist for weight gain');
    }
    if (assessmentData.personal_information.bmi > 25) {
      recommendations.push('Consult with a nutritionist for healthy weight management');
    }
    if (assessmentData.lifestyle_factors.is_smoker) {
      recommendations.push('Quit smoking immediately');
    }
    if (assessmentData.lifestyle_factors.excessive_alcohol_consumption) {
      recommendations.push('Stop alcohol consumption');
    }
    if (assessmentData.vital_signs.blood_pressure_status !== 'Normal') {
      recommendations.push('Monitor blood pressure regularly');
    }
    if (assessmentData.vital_signs.blood_sugar_status !== 'Normal') {
      recommendations.push('Monitor blood sugar levels regularly');
    }

    // Add risk level specific recommendations
    if (riskLevel === 'HIGH') {
      recommendations.push('Consider more frequent prenatal visits');
      recommendations.push('Consult with a high-risk pregnancy specialist');
    } else if (riskLevel === 'MODERATE') {
      recommendations.push('Schedule additional monitoring appointments');
    }

    return recommendations;
  }

  async getRiskAssessmentHistory(userId, pregnancyId) {
    try {
      return await prisma.riskAssessment.findMany({
        where: {
          userId,
          pregnancyId
        },
        orderBy: {
          assessmentDate: 'desc'
        }
      });
    } catch (error) {
      throw new ApiError(500, 'Failed to retrieve risk assessment history');
    }
  }

  async getLatestRiskAssessment(userId, pregnancyId) {
    try {
      return await prisma.riskAssessment.findFirst({
        where: {
          userId,
          pregnancyId
        },
        orderBy: {
          assessmentDate: 'desc'
        }
      });
    } catch (error) {
      throw new ApiError(500, 'Failed to retrieve latest risk assessment');
    }
  }
}

export default new RiskAssessmentService(); 