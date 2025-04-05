import express from 'express';
import { riskPredictionController } from '../../../pregnify/controllers/risk-prediction.controller.js';
import { isAuthenticated } from '../../../middlewares/auth/auth.middleware.js';

const router = express.Router();

// Apply authentication middleware to all AI routes
router.use(isAuthenticated);

// Risk Prediction API
router.post('/risk', riskPredictionController.calculateRiskScore);

// Recommendations API
router.post('/recommendations', riskPredictionController.getRecommendations);

export default router;