import { body, param, query } from 'express-validator';

/**
 * Validation rules for creating a booking
 */
export const createBookingValidation = [
  body('ambulanceId')
    .notEmpty()
    .withMessage('Ambulance ID is required')
    .isString()
    .withMessage('Ambulance ID must be a string'),
  body('pickupLocation')
    .notEmpty()
    .withMessage('Pickup location is required')
    .isObject()
    .withMessage('Pickup location must be an object')
    .custom((value) => {
      if (!value.latitude || !value.longitude) {
        throw new Error('Pickup location must contain latitude and longitude');
      }
      return true;
    }),
  body('dropLocation')
    .notEmpty()
    .withMessage('Drop location is required')
    .isObject()
    .withMessage('Drop location must be an object')
    .custom((value) => {
      if (!value.latitude || !value.longitude) {
        throw new Error('Drop location must contain latitude and longitude');
      }
      return true;
    }),
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string')
];

/**
 * Validation rules for updating booking status
 */
export const updateBookingStatusValidation = [
  param('bookingId')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isString()
    .withMessage('Booking ID must be a string'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['REQUESTED', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'])
    .withMessage('Invalid status'),
  body('reason')
    .optional()
    .isString()
    .withMessage('Reason must be a string')
];

/**
 * Validation rules for updating payment status
 */
export const updatePaymentStatusValidation = [
  param('bookingId')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isString()
    .withMessage('Booking ID must be a string'),
  body('paymentStatus')
    .notEmpty()
    .withMessage('Payment status is required')
    .isIn(['PENDING', 'PAID', 'FAILED', 'REFUNDED'])
    .withMessage('Invalid payment status'),
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isString()
    .withMessage('Payment method must be a string'),
  body('transactionId')
    .optional()
    .isString()
    .withMessage('Transaction ID must be a string'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isNumeric()
    .withMessage('Amount must be a number')
];

/**
 * Validation rules for updating location
 */
export const updateLocationValidation = [
  param('bookingId')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isString()
    .withMessage('Booking ID must be a string'),
  body('latitude')
    .notEmpty()
    .withMessage('Latitude is required')
    .isNumeric()
    .withMessage('Latitude must be a number'),
  body('longitude')
    .notEmpty()
    .withMessage('Longitude is required')
    .isNumeric()
    .withMessage('Longitude must be a number'),
  body('address')
    .notEmpty()
    .withMessage('Address is required')
    .isString()
    .withMessage('Address must be a string')
];

/**
 * Validation rules for updating estimated arrival time
 */
export const updateEstimatedArrivalValidation = [
  param('bookingId')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isString()
    .withMessage('Booking ID must be a string'),
  body('estimatedArrivalTime')
    .notEmpty()
    .withMessage('Estimated arrival time is required')
    .isISO8601()
    .withMessage('Estimated arrival time must be a valid date')
];

/**
 * Validation rules for cancelling a booking
 */
export const cancelBookingValidation = [
  param('bookingId')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isString()
    .withMessage('Booking ID must be a string'),
  body('reason')
    .notEmpty()
    .withMessage('Cancellation reason is required')
    .isString()
    .withMessage('Cancellation reason must be a string')
];

/**
 * Validation rules for adding a review
 */
export const addReviewValidation = [
  param('bookingId')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isString()
    .withMessage('Booking ID must be a string'),
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isString()
    .withMessage('Comment must be a string')
];

/**
 * Validation rules for getting bookings
 */
export const getBookingsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['REQUESTED', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'])
    .withMessage('Invalid status'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  query('sortBy')
    .optional()
    .isString()
    .withMessage('Sort by must be a string'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either asc or desc')
];

/**
 * Validation rules for getting available ambulances
 */
export const getAvailableAmbulancesValidation = [
  query('latitude')
    .notEmpty()
    .withMessage('Latitude is required')
    .isNumeric()
    .withMessage('Latitude must be a number'),
  query('longitude')
    .notEmpty()
    .withMessage('Longitude is required')
    .isNumeric()
    .withMessage('Longitude must be a number'),
  query('type')
    .optional()
    .isIn(['BASIC', 'ADVANCED', 'NEONATAL', 'CARDIAC'])
    .withMessage('Invalid ambulance type')
];

/**
 * Export all validations as a single object
 */
export const ambulanceBookingValidation = {
  createBookingValidation,
  updateBookingStatusValidation,
  updatePaymentStatusValidation,
  updateLocationValidation,
  updateEstimatedArrivalValidation,
  cancelBookingValidation,
  addReviewValidation,
  getBookingsValidation,
  getAvailableAmbulancesValidation
}; 