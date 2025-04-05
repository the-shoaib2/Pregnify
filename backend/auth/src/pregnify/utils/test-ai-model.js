export const testAIModel = {
  async predictRisk(data) {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simple risk calculation based on symptoms and vital signs
    let riskScore = 0;
    const riskFactors = [];

    // Calculate risk based on symptoms
    if (data.symptoms) {
      const severeSymptoms = Object.values(data.symptoms).filter(s => s === 'severe' || s === 'present').length;
      riskScore += severeSymptoms * 10;
      if (severeSymptoms > 0) {
        riskFactors.push(`${severeSymptoms} severe symptoms present`);
      }
    }

    // Calculate risk based on vital signs
    if (data.vitalSigns) {
      if (data.vitalSigns.bloodPressure) {
        const [systolic, diastolic] = data.vitalSigns.bloodPressure.split('/').map(Number);
        if (systolic > 140 || diastolic > 90) {
          riskScore += 20;
          riskFactors.push('High blood pressure');
        }
      }

      if (data.vitalSigns.bmi < 18.5) {
        riskScore += 15;
        riskFactors.push('Underweight');
      }
    }

    // Calculate risk based on location and access
    if (data.location === 'rural' || data.accessToHealthcare === 'difficult') {
      riskScore += 10;
      riskFactors.push('Limited healthcare access');
    }

    // Determine risk level
    let riskLevel;
    if (riskScore >= 60) {
      riskLevel = 'Critical';
    } else if (riskScore >= 40) {
      riskLevel = 'High';
    } else if (riskScore >= 20) {
      riskLevel = 'Medium';
    } else {
      riskLevel = 'Low';
    }

    return {
      riskScore: Math.min(riskScore, 100),
      riskLevel,
      riskFactors: riskFactors.join(', '),
      recommendations: {
        medicalCare: [
          'Regular prenatal checkups',
          'Monitor vital signs daily',
          riskLevel === 'Critical' ? 'Seek immediate medical attention' : 'Follow up with healthcare provider'
        ],
        lifestyle: [
          'Maintain healthy diet',
          'Get adequate rest',
          'Stay hydrated'
        ]
      },
      nextSteps: [
        'Schedule next appointment',
        'Complete recommended tests',
        'Monitor symptoms'
      ],
      warningSigns: [
        'Severe headaches',
        'Blurred vision',
        'Severe swelling'
      ],
      emergencyContact: {
        primary: 'Local healthcare provider',
        hospital: 'Nearest hospital',
        emergency: '999'
      }
    };
  }
}; 