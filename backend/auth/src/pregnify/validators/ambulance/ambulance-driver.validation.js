import Joi from 'joi';
import { body, query } from 'express-validator';

// Schema for creating a new ambulance driver
export const createAmbulanceDriverSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  phoneNumber: Joi.string().required().pattern(/^[0-9+]+$/).min(10).max(15),
  licenseNumber: Joi.string().required().min(5).max(20),
  experience: Joi.number().integer().min(0).required(),
  rating: Joi.number().min(0).max(5).default(0),
  totalTrips: Joi.number().integer().min(0).default(0),
  isVerified: Joi.boolean().default(false),
  isActive: Joi.boolean().default(true)
});

// Schema for updating an ambulance driver
export const updateAmbulanceDriverSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  phoneNumber: Joi.string().pattern(/^[0-9+]+$/).min(10).max(15),
  licenseNumber: Joi.string().min(5).max(20),
  experience: Joi.number().integer().min(0),
  rating: Joi.number().min(0).max(5),
  totalTrips: Joi.number().integer().min(0),
  isVerified: Joi.boolean(),
  isActive: Joi.boolean()
}).min(1); // At least one field must be provided for update

// Schema for query parameters
export const queryAmbulanceDriverSchema = Joi.object({
  isActive: Joi.boolean(),
  isVerified: Joi.boolean(),
  minRating: Joi.number().min(0).max(5),
  minExperience: Joi.number().integer().min(0),
  search: Joi.string().min(1)
});

// Schema for ID parameter
export const idParamSchema = Joi.object({
  id: Joi.string().uuid().required()
});

// Validation rules for getting driver profile
export const getDriverProfileValidation = [];

// Validation rules for updating driver profile
export const updateDriverProfileValidation = [
  body('licenseNumber')
    .optional()
    .isString()
    .withMessage('License number must be a string'),
  body('licenseExpiry')
    .optional()
    .isISO8601()
    .withMessage('License expiry must be a valid date'),
  body('experience')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Experience must be a positive integer'),
  body('specialization')
    .optional()
    .isString()
    .withMessage('Specialization must be a string')
];

// Validation rules for getting assigned ambulance
export const getAssignedAmbulanceValidation = [];

// Validation rules for updating availability
export const updateAvailabilityValidation = [
  body('isAvailable')
    .isBoolean()
    .withMessage('Availability status must be a boolean')
];

// Validation rules for getting current booking
export const getCurrentBookingValidation = [];

// Validation rules for getting booking history
export const getBookingHistoryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
];

// Validation rules for updating location
export const updateLocationValidation = [
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180')
];

// Export all validation rules as a single object
export const ambulanceDriverValidation = {
  getDriverProfile: getDriverProfileValidation,
  updateDriverProfile: updateDriverProfileValidation,
  getAssignedAmbulance: getAssignedAmbulanceValidation,
  updateAvailability: updateAvailabilityValidation,
  getCurrentBooking: getCurrentBookingValidation,
  getBookingHistory: getBookingHistoryValidation,
  updateLocation: updateLocationValidation
}; 