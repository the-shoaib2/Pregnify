import { body, param, query } from 'express-validator';

export const doctorAppointmentValidation = {
  createAppointment: [
    body('patientId')
      .notEmpty()
      .withMessage('Patient ID is required')
      .isString()
      .withMessage('Patient ID must be a string'),
    body('date')
      .notEmpty()
      .withMessage('Date is required')
      .isISO8601()
      .withMessage('Date must be a valid ISO8601 date'),
    body('time')
      .notEmpty()
      .withMessage('Time is required')
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Time must be in HH:MM format'),
    body('type')
      .notEmpty()
      .withMessage('Type is required')
      .isString()
      .withMessage('Type must be a string'),
    body('notes')
      .optional()
      .isString()
      .withMessage('Notes must be a string'),
  ],

  getDoctorAppointments: [
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
      .isIn(['SCHEDULED', 'COMPLETED', 'CANCELLED'])
      .withMessage('Invalid status'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO8601 date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO8601 date'),
  ],

  getAppointment: [
    param('appointmentId')
      .notEmpty()
      .withMessage('Appointment ID is required')
      .isString()
      .withMessage('Appointment ID must be a string'),
  ],

  updateAppointment: [
    param('appointmentId')
      .notEmpty()
      .withMessage('Appointment ID is required')
      .isString()
      .withMessage('Appointment ID must be a string'),
    body('date')
      .optional()
      .isISO8601()
      .withMessage('Date must be a valid ISO8601 date'),
    body('time')
      .optional()
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Time must be in HH:MM format'),
    body('type')
      .optional()
      .isString()
      .withMessage('Type must be a string'),
    body('notes')
      .optional()
      .isString()
      .withMessage('Notes must be a string'),
    body('status')
      .optional()
      .isIn(['SCHEDULED', 'COMPLETED', 'CANCELLED'])
      .withMessage('Invalid status'),
  ],

  cancelAppointment: [
    param('appointmentId')
      .notEmpty()
      .withMessage('Appointment ID is required')
      .isString()
      .withMessage('Appointment ID must be a string'),
    body('reason')
      .notEmpty()
      .withMessage('Cancellation reason is required')
      .isString()
      .withMessage('Cancellation reason must be a string'),
  ],

  getAppointmentStatistics: [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO8601 date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO8601 date'),
  ],

  getUpcomingAppointments: [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ],

  getAppointmentHistory: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ],

  getAppointmentReminders: [
    query('days')
      .optional()
      .isInt({ min: 1, max: 30 })
      .withMessage('Days must be between 1 and 30'),
  ],
}; 