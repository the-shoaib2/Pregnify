import express from 'express';
import pregnancyTrackingController from '../../controllers/pregnancy/pregnancy-tracking.controller.js';
import { isAuthenticated } from '../../../middlewares/auth/auth.middleware.js';

const router = express.Router();

router.use(isAuthenticated);

// Create pregnancy profile
router.post(
  '/pregnancies',
  pregnancyTrackingController.createPregnancyProfile
);

// Update pregnancy profile
router.patch(
  '/pregnancies/:pregnancyId',
  pregnancyTrackingController.updatePregnancyProfile
);

// Get pregnancy profile    
router.get(
  '/pregnancies/:pregnancyId',
  pregnancyTrackingController.getPregnancyProfile
);

// Get pregnancy history
router.get(
  '/pregnancies',
  pregnancyTrackingController.getPregnancyHistory
);

// Get pregnancy milestones
router.get(
  '/pregnancies/:pregnancyId/milestones',
  pregnancyTrackingController.getPregnancyMilestones
);

// Record prenatal visit
router.post(
  '/pregnancies/:pregnancyId/visits',
  pregnancyTrackingController.recordPrenatalVisit
);

// Get prenatal visits
router.get(
  '/pregnancies/:pregnancyId/visits',
  pregnancyTrackingController.getPrenatalVisits
);

export default router; 