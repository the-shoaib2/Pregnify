import express from 'express';
import { aiPredictionController } from '../../controllers/pregnancy/ai-prediction.controller.js';
import { isAuthenticated } from '../../../middlewares/auth/auth.middleware.js';

const router = express.Router();

router.use(isAuthenticated);

// Get AI prediction
router.get(
  '/pregnancies/:pregnancyId/ai-prediction',
  aiPredictionController.getPrediction.bind(aiPredictionController)
);

export default router; 