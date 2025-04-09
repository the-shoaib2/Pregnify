/**
 * Ambulance Validation
 * Handles validation for ambulance-related operations
 */

import { body, param, query } from 'express-validator';

/**
 * Validation rules for creating an ambulance
 */
export const createAmbulanceValidation = [
  body('vehicleNumber')
    .notEmpty()
    .withMessage('Vehicle number is required')
    .isString()
    .withMessage('Vehicle number must be a string'),
  body('type')
    .notEmpty()
    .withMessage('Ambulance type is required')
    .isIn(['BASIC', 'ADVANCED', 'NEONATAL', 'CARDIAC'])
    .withMessage('Invalid ambulance type'),
  body('location')
    .notEmpty()
    .withMessage('Location is required')
    .isObject()
    .withMessage('Location must be an object')
    .custom((value) => {
      if (!value.latitude || !value.longitude) {
        throw new Error('Location must contain latitude and longitude');
      }
      return true;
    }),
  body('driverId')
    .notEmpty()
    .withMessage('Driver ID is required')
    .isString()
    .withMessage('Driver ID must be a string')
];

/**
 * Validation rules for updating an ambulance
 */
export const updateAmbulanceValidation = [
  param('id')
    .notEmpty()
    .withMessage('Ambulance ID is required')
    .isString()
    .withMessage('Ambulance ID must be a string'),
  body('vehicleNumber')
    .optional()
    .isString()
    .withMessage('Vehicle number must be a string'),
  body('type')
    .optional()
    .isIn(['BASIC', 'ADVANCED', 'NEONATAL', 'CARDIAC'])
    .withMessage('Invalid ambulance type'),
  body('location')
    .optional()
    .isObject()
    .withMessage('Location must be an object')
    .custom((value) => {
      if (!value.latitude || !value.longitude) {
        throw new Error('Location must contain latitude and longitude');
      }
      return true;
    }),
  body('status')
    .optional()
    .isIn(['AVAILABLE', 'BUSY', 'MAINTENANCE', 'OFFLINE'])
    .withMessage('Invalid status'),
  body('driverId')
    .optional()
    .isString()
    .withMessage('Driver ID must be a string')
];

/**
 * Validation rules for booking an ambulance
 */
export const bookAmbulanceValidation = [
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
    .withMessage('Invalid status')
];

/**
 * Validation rules for updating ambulance location
 */
export const updateLocationValidation = [
  param('id')
    .notEmpty()
    .withMessage('Ambulance ID is required')
    .isString()
    .withMessage('Ambulance ID must be a string'),
  body('location')
    .notEmpty()
    .withMessage('Location is required')
    .isObject()
    .withMessage('Location must be an object')
    .custom((value) => {
      if (!value.latitude || !value.longitude) {
        throw new Error('Location must contain latitude and longitude');
      }
      return true;
    })
];

// Validation rules for getting ambulance by ID
export const getAmbulanceValidation = [
  param('ambulanceId')
    .isString()
    .withMessage('Ambulance ID must be a string')
];

// Validation rules for getting ambulance status
export const getAmbulanceStatusValidation = [
  param('ambulanceId')
    .isString()
    .withMessage('Ambulance ID must be a string')
];

// Validation rules for getting ambulance location
export const getAmbulanceLocationValidation = [
  param('ambulanceId')
    .isString()
    .withMessage('Ambulance ID must be a string')
];

// Validation rules for getting ambulance type
export const getAmbulanceTypeValidation = [
  param('ambulanceId')
    .isString()
    .withMessage('Ambulance ID must be a string')
];

// Validation rules for getting ambulance equipment
export const getAmbulanceEquipmentValidation = [
  param('ambulanceId')
    .isString()
    .withMessage('Ambulance ID must be a string')
];

// Validation rules for getting maintenance history
export const getMaintenanceHistoryValidation = [
  param('ambulanceId')
    .isString()
    .withMessage('Ambulance ID must be a string'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
];

// Validation rules for getting service area
export const getServiceArea = [
  param('ambulanceId')
    .notEmpty()
    .withMessage('Ambulance ID is required')
    .isString()
    .withMessage('Ambulance ID must be a string')
];

/**
 * Export all validations as a single object
 */
export const ambulanceValidation = {
  createAmbulance: createAmbulanceValidation,
  updateAmbulance: updateAmbulanceValidation,
  bookAmbulance: bookAmbulanceValidation,
  updateBookingStatus: updateBookingStatusValidation,
  updateLocation: updateLocationValidation,
  getAmbulance: getAmbulanceValidation,
  getAmbulanceStatus: getAmbulanceStatusValidation,
  getAmbulanceLocation: getAmbulanceLocationValidation,
  getAmbulanceType: getAmbulanceTypeValidation,
  getAmbulanceEquipment: getAmbulanceEquipmentValidation,
  getMaintenanceHistory: getMaintenanceHistoryValidation,
  getServiceArea
}; 