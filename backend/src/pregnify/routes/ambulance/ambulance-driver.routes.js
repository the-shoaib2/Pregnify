import express from 'express';
import { isAuthenticated } from '../../../middlewares/auth/auth.middleware.js';
import { ambulanceDriverController } from '../../controllers/ambulance/ambulance-driver.controller.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Get driver profile
router.get('/profile', ambulanceDriverController.getDriverProfile);

// Update driver profile
router.patch('/profile', ambulanceDriverController.updateDriverProfile);

// Get assigned ambulance
router.get('/ambulance', ambulanceDriverController.getAssignedAmbulance);

// Update availability status
router.patch('/availability', ambulanceDriverController.updateAvailability);

// Get current booking
router.get('/current-booking', ambulanceDriverController.getCurrentBooking);

// Get booking history
router.get('/bookings', ambulanceDriverController.getBookingHistory);

// Update location
router.patch('/location', ambulanceDriverController.updateLocation);

export default router; 