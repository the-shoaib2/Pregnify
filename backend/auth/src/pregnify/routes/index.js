import express from 'express';
import { pregnancyController } from '../controllers/pregnancy.controller.js';
import { riskPredictionController } from '../controllers/risk-prediction.controller.js';
import { emergencyController } from '../controllers/emergency.controller.js';
import { telemedicineController } from '../controllers/telemedicine.controller.js';
import { isAuthenticated } from '../../middlewares/auth/auth.middleware.js';
import { pregnancyCareController } from '../controllers/pregnancy-care.controller.js';
import testRoutes from './test.routes.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Pregnancy Profile Routes
router.post('/pregnancy', pregnancyController.createPregnancyProfile);
router.get('/pregnancy/active', pregnancyController.getActivePregnancy);
router.get('/pregnancy', pregnancyController.getUserPregnancy);
router.patch('/pregnancy/:id', pregnancyController.updatePregnancyProfile);
router.put('/pregnancy/:id', pregnancyController.updatePregnancyProfile);
router.get('/pregnancy/history', pregnancyController.getPregnancyHistory);

// Risk Prediction Routes
router.post('/risk-prediction/calculate', riskPredictionController.calculateRiskScore);
router.get('/risk-prediction/recommendations', riskPredictionController.getRecommendations);

// Emergency Services Routes
router.post('/emergency/request', emergencyController.requestEmergencyService);
router.get('/emergency/:id/status', emergencyController.getEmergencyStatus);
router.patch('/emergency/:id/status', emergencyController.updateEmergencyStatus);
router.get('/emergency/history', emergencyController.getEmergencyHistory);

// Telemedicine Routes
router.post('/telemedicine/schedule', telemedicineController.scheduleConsultation);
router.get('/telemedicine/:id', telemedicineController.getConsultationDetails);
router.patch('/telemedicine/:id/status', telemedicineController.updateConsultationStatus);
router.get('/telemedicine/history', telemedicineController.getConsultationHistory);
router.get('/telemedicine/doctors', telemedicineController.getAvailableDoctors);

// Pregnancy Care Plan Routes
router.post('/pregnancy-care/generate', pregnancyCareController.generateCarePlan);
router.get('/pregnancy-care/plan', pregnancyCareController.getCarePlan);

// Test Routes
router.use('/test', testRoutes);

export default router;


