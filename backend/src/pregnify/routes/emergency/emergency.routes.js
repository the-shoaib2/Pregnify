import express from 'express';
import { isAuthenticated } from '../../../middlewares/auth/auth.middleware.js';
import { emergencyController } from '../../controllers/emergency/emergency.controller.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Create emergency
router.post('/', emergencyController.createEmergency);

// Get emergency by ID
router.get('/:emergencyId', emergencyController.getEmergencyById);

// Update emergency status
router.patch('/:emergencyId/status', emergencyController.updateEmergencyStatus);

// Get all emergencies
router.get('/', emergencyController.getAllEmergencies);

export default router; 