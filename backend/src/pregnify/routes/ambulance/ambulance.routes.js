import express from 'express';
import { isAuthenticated } from '../../../middlewares/auth/auth.middleware.js';
import { ambulanceController } from '../../controllers/ambulance/ambulance.controller.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Get all ambulances
router.get('/', ambulanceController.getAllAmbulances);

// Get ambulance by ID
router.get('/:ambulanceId', ambulanceController.getAmbulanceById);

// Get ambulance status
router.get('/:ambulanceId/status', ambulanceController.getAmbulanceStatus);

// Get ambulance location
router.get('/:ambulanceId/location', ambulanceController.getAmbulanceLocation);

// Get ambulance type
router.get('/:ambulanceId/type', ambulanceController.getAmbulanceType);

// Get ambulance equipment
router.get('/:ambulanceId/equipment', ambulanceController.getAmbulanceEquipment);

// Get ambulance maintenance history
router.get('/:ambulanceId/maintenance', ambulanceController.getMaintenanceHistory);

// Get ambulance service area
router.get('/:ambulanceId/service-area', ambulanceController.getServiceArea);

export default router; 