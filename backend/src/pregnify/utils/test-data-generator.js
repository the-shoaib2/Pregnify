// Health metric test data generator
const generateHealthMetric = (type) => {
  const metricTypes = {
    // Mother's health metrics
    bloodPressure: {
      value: Math.floor(Math.random() * (140 - 90) + 90), // Normal range: 90-140 mmHg
      unit: 'mmHg',
      notes: 'Blood pressure measurement'
    },
    heartRate: {
      value: Math.floor(Math.random() * (100 - 60) + 60), // Normal range: 60-100 bpm
      unit: 'bpm',
      notes: 'Heart rate measurement'
    },
    temperature: {
      value: (Math.random() * (37.5 - 36.5) + 36.5).toFixed(1), // Normal range: 36.5-37.5°C
      unit: '°C',
      notes: 'Body temperature measurement'
    },
    weight: {
      value: (Math.random() * (90 - 50) + 50).toFixed(1), // Example range: 50-90 kg
      unit: 'kg',
      notes: 'Weight measurement'
    },
    bloodSugar: {
      value: (Math.random() * (140 - 70) + 70).toFixed(1), // Normal range: 70-140 mg/dL
      unit: 'mg/dL',
      notes: 'Blood sugar measurement'
    },
    oxygenSaturation: {
      value: Math.floor(Math.random() * (100 - 95) + 95), // Normal range: 95-100%
      unit: '%',
      notes: 'Oxygen saturation measurement'
    },
    // Pregnancy-specific mother metrics
    fundalHeight: {
      value: Math.floor(Math.random() * (40 - 20) + 20), // Normal range: 20-40 cm
      unit: 'cm',
      notes: 'Fundal height measurement'
    },
    amnioticFluidIndex: {
      value: (Math.random() * (25 - 5) + 5).toFixed(1), // Normal range: 5-25 cm
      unit: 'cm',
      notes: 'Amniotic fluid index measurement'
    },
    cervicalLength: {
      value: (Math.random() * (4 - 2) + 2).toFixed(1), // Normal range: 2-4 cm
      unit: 'cm',
      notes: 'Cervical length measurement'
    },
    proteinInUrine: {
      value: (Math.random() * (300 - 0) + 0).toFixed(1), // Normal range: 0-300 mg/dL
      unit: 'mg/dL',
      notes: 'Protein in urine measurement'
    },
    // Baby's health metrics
    fetalHeartRate: {
      value: Math.floor(Math.random() * (160 - 120) + 120), // Normal range: 120-160 bpm
      unit: 'bpm',
      notes: 'Fetal heart rate measurement'
    },
    fetalWeight: {
      value: (Math.random() * (4000 - 500) + 500).toFixed(1), // Range: 500-4000 grams
      unit: 'g',
      notes: 'Estimated fetal weight'
    },
    fetalLength: {
      value: (Math.random() * (50 - 20) + 20).toFixed(1), // Range: 20-50 cm
      unit: 'cm',
      notes: 'Fetal length measurement'
    },
    fetalBPD: {
      value: (Math.random() * (10 - 2) + 2).toFixed(1), // Biparietal diameter range: 2-10 cm
      unit: 'cm',
      notes: 'Fetal biparietal diameter measurement'
    },
    fetalHC: {
      value: (Math.random() * (35 - 15) + 15).toFixed(1), // Head circumference range: 15-35 cm
      unit: 'cm',
      notes: 'Fetal head circumference measurement'
    },
    fetalAC: {
      value: (Math.random() * (35 - 15) + 15).toFixed(1), // Abdominal circumference range: 15-35 cm
      unit: 'cm',
      notes: 'Fetal abdominal circumference measurement'
    },
    fetalFL: {
      value: (Math.random() * (8 - 2) + 2).toFixed(1), // Femur length range: 2-8 cm
      unit: 'cm',
      notes: 'Fetal femur length measurement'
    }
  };

  if (!metricTypes[type]) {
    throw new Error(`Invalid health metric type: ${type}`);
  }

  const metric = metricTypes[type];
  return {
    type,
    value: parseFloat(metric.value),
    unit: metric.unit,
    measuredAt: new Date().toISOString(),
    notes: metric.notes
  };
};

// Example usage:
// const bloodPressureMetric = generateHealthMetric('bloodPressure');
// const fetalHeartRateMetric = generateHealthMetric('fetalHeartRate');

module.exports = {
  generateHealthMetric
}; 