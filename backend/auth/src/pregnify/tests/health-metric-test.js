const { generateHealthMetric } = require('../utils/test-data-generator');

// Generate test data for different health metrics
const testMetrics = {
  mother: [
    'bloodPressure',
    'heartRate',
    'temperature',
    'weight',
    'bloodSugar',
    'oxygenSaturation',
    'fundalHeight',
    'amnioticFluidIndex',
    'cervicalLength',
    'proteinInUrine'
  ],
  baby: [
    'fetalHeartRate',
    'fetalWeight',
    'fetalLength',
    'fetalBPD',
    'fetalHC',
    'fetalAC',
    'fetalFL'
  ]
};

console.log('Generated Health Metrics:');
console.log('------------------------');

console.log('\nMother\'s Health Metrics:');
console.log('------------------------');
testMetrics.mother.forEach(type => {
  const metric = generateHealthMetric(type);
  console.log(`\n${type}:`);
  console.log(JSON.stringify(metric, null, 2));
});

console.log('\nBaby\'s Health Metrics:');
console.log('------------------------');
testMetrics.baby.forEach(type => {
  const metric = generateHealthMetric(type);
  console.log(`\n${type}:`);
  console.log(JSON.stringify(metric, null, 2));
});

// Example of how to use in a test request:
console.log('\nExample POST request body for mother\'s blood pressure:');
const motherMetric = generateHealthMetric('bloodPressure');
console.log(JSON.stringify(motherMetric, null, 2));

console.log('\nExample POST request body for baby\'s heart rate:');
const babyMetric = generateHealthMetric('fetalHeartRate');
console.log(JSON.stringify(babyMetric, null, 2)); 