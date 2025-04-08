import prisma from '../../../utils/database/prisma.js';
import ApiError from '../../../utils/error/api.error.js';
import { isValueInAppropriateRange, getRangeForDemographic } from '../../data/body-condition-ranges.js';

class RiskAssessmentService {
  async calculateRiskScore(userId, pregnancyId, assessmentData) {
    try {
      // Calculate risk score based on provided data
      const riskScore = this.calculateManualRiskScore(assessmentData);
      
      // Determine risk level
      const riskLevel = this.determineRiskLevel(riskScore);
      
      // Generate recommendations based on risk factors
      const recommendations = this.generateManualRecommendations(assessmentData, riskLevel);
      
      // Get reference ranges for the patient
      const referenceRanges = this.getReferenceRanges(assessmentData);
      
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
          recommendations: JSON.stringify(recommendations),
          
          // Reference Ranges
          referenceRanges: JSON.stringify(referenceRanges)
        }
      });
      
      return {
        ...riskAssessment,
        recommendations,
        referenceRanges
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

    // BMI scoring - using reference ranges for women
    const bmiRange = getRangeForDemographic('Women', 'BMI');
    const bmiInRange = isValueInAppropriateRange(assessmentData.personal_information.bmi, 'Women', 'BMI');
    if (!bmiInRange) {
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

    // Vital signs scoring - using reference ranges for women
    const bloodPressureInRange = isValueInAppropriateRange(
      parseFloat(assessmentData.vital_signs.blood_pressure_systolic), 
      'Women', 
      'BloodPressure'
    );
    if (!bloodPressureInRange) {
      score += 3;
    }
    
    const bloodSugarInRange = isValueInAppropriateRange(
      parseFloat(assessmentData.vital_signs.blood_sugar), 
      'Women', 
      'FastingBloodSugar'
    );
    if (!bloodSugarInRange) {
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
    const bmiInRange = isValueInAppropriateRange(assessmentData.personal_information.bmi, 'Women', 'BMI');
    if (!bmiInRange) {
      if (assessmentData.personal_information.bmi < 18.5) {
        recommendations.push('Consult with a nutritionist for weight gain');
      } else {
        recommendations.push('Consult with a nutritionist for healthy weight management');
      }
    }
    
    if (assessmentData.lifestyle_factors.is_smoker) {
      recommendations.push('Quit smoking immediately');
    }
    if (assessmentData.lifestyle_factors.excessive_alcohol_consumption) {
      recommendations.push('Stop alcohol consumption');
    }
    
    const bloodPressureInRange = isValueInAppropriateRange(
      parseFloat(assessmentData.vital_signs.blood_pressure_systolic), 
      'Women', 
      'BloodPressure'
    );
    if (!bloodPressureInRange) {
      recommendations.push('Monitor blood pressure regularly');
    }
    
    const bloodSugarInRange = isValueInAppropriateRange(
      parseFloat(assessmentData.vital_signs.blood_sugar), 
      'Women', 
      'FastingBloodSugar'
    );
    if (!bloodSugarInRange) {
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

  getReferenceRanges(assessmentData) {
    // Get reference ranges for women (pregnant)
    const womenRanges = {
      BMI: getRangeForDemographic('Women', 'BMI'),
      BloodPressure: getRangeForDemographic('Women', 'BloodPressure'),
      FastingBloodSugar: getRangeForDemographic('Women', 'FastingBloodSugar'),
      Hemoglobin: getRangeForDemographic('Women', 'Hemoglobin'),
      TSH: getRangeForDemographic('Women', 'TSH'),
      Nutrition: getRangeForDemographic('Women', 'Nutrition')
    };
    
    return {
      women: womenRanges,
      // Add other demographics if needed
    };
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