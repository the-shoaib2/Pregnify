import express from 'express';
import { isAuthenticated } from '../../../middlewares/auth/auth.middleware.js';
import { ambulanceBookingValidation } from '../../validators/ambulance/ambulance-booking.validation.js';
import { ambulanceBookingController } from '../../controllers/ambulance/ambulance-booking.controller.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Create ambulance booking
router.post('/', ambulanceBookingController.createBooking);

// Get ambulance booking by ID
router.get('/:bookingId', ambulanceBookingController.getBookingById);

// Update ambulance booking status
router.patch('/:bookingId/status', ambulanceBookingController.updateBookingStatus);

// Update ambulance booking payment status
router.patch('/:bookingId/payment', ambulanceBookingController.updatePaymentStatus);

// Update ambulance booking location
router.patch('/:bookingId/location', ambulanceBookingController.updateLocation);

// Update ambulance booking estimated arrival time
router.patch('/:bookingId/estimated-arrival', ambulanceBookingController.updateEstimatedArrivalTime);

// Cancel ambulance booking
router.delete('/:bookingId', ambulanceBookingController.cancelBooking);

// Add review to ambulance booking
router.post('/:bookingId/review', ambulanceBookingController.addReview);

// Get all ambulance bookings
router.get('/', ambulanceBookingController.getAllBookings);

// Get available ambulances
router.get('/available', ambulanceBookingController.getAvailableAmbulances);

// Get all bookings for a user
router.get(
  '/user',
  ambulanceBookingController.getUserBookings
);

// Get booking history
router.get(
  '/history',
  ambulanceBookingController.getBookingHistory
);

// Get booking statistics
router.get(
  '/stats',
  ambulanceBookingController.getBookingStats
);

// Rate a booking
router.post(
  '/:bookingId/rate',
  ambulanceBookingController.rateBooking
);

// Track booking status
router.get(
  '/:bookingId/track',
  ambulanceBookingController.trackBooking
);

// Get estimated arrival time
router.get(
  '/:bookingId/eta',
  ambulanceBookingController.getEstimatedArrivalTime
);

// Update booking details
router.put(
  '/:bookingId',
  ambulanceBookingController.updateBooking
);

// Get booking receipt
router.get(
  '/:bookingId/receipt',
  ambulanceBookingController.getBookingReceipt
);

export default router; 