const Joi = require('joi');

const riskPredictionSchema = Joi.object({
  age: Joi.number().integer().min(18).max(50).required(),
  medicalHistory: Joi.object({
    chronicConditions: Joi.array().items(Joi.string()),
    previousPregnancies: Joi.number().integer().min(0),
    allergies: Joi.array().items(Joi.string())
  }).required(),
  currentSymptoms: Joi.object({
    symptoms: Joi.array().items(Joi.string()),
    severity: Joi.string().valid('mild', 'moderate', 'severe')
  }).required(),
  vitalSigns: Joi.object({
    bloodPressure: Joi.string().required(),
    heartRate: Joi.number().integer().required(),
    temperature: Joi.number().required()
  }).required(),
  pregnancyWeek: Joi.number().integer().min(0).max(40).required()
});

const validateRiskPrediction = (data) => {
  return riskPredictionSchema.validate(data);
};

module.exports = {
  validateRiskPrediction
};
