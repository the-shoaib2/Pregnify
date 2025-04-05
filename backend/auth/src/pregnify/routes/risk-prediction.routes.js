import express from 'express';
import { riskPredictionController } from '../controllers/risk-prediction.controller.js';

const router = express.Router();

// Risk Prediction Routes
router.post('/calculate', riskPredictionController.calculateRiskScore);
router.get('/recommendations', riskPredictionController.getRecommendations);

export default router; 