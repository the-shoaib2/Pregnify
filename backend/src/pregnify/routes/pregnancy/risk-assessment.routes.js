import express from 'express';
import { riskAssessmentController } from '../../controllers/pregnancy/risk-assessment.controller.js';
import { isAuthenticated } from '../../../middlewares/auth/auth.middleware.js';

const router = express.Router();

router.use(isAuthenticated);

// Create a new risk assessment
router.post(
  '/pregnancies/:pregnancyId/risk-assessments',
  riskAssessmentController.createRiskAssessment
);

// Get risk assessment history
router.get(
  '/pregnancies/:pregnancyId/risk-assessments',
  riskAssessmentController.getRiskAssessmentHistory
);

// Get latest risk assessment
router.get(
  '/pregnancies/:pregnancyId/risk-assessments/latest',
  riskAssessmentController.getLatestRiskAssessment
);

// Update a risk assessment
router.patch(
  '/pregnancies/:pregnancyId/risk-assessments/:assessmentId',
  riskAssessmentController.updateRiskAssessment
);

export default router; 