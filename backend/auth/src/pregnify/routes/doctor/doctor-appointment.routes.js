import express from 'express';
import {
  createAppointment,
  getDoctorAppointments,
  getAppointment,
  updateAppointment,
  cancelAppointment,
  getAppointmentStatistics,
  getUpcomingAppointments,
  getAppointmentHistory,
  getAppointmentReminders
} from '../../controllers/doctor/doctor-appointment.controller.js';
import { isAuthenticated } from '../../../middlewares/auth/auth.middleware.js';
import { hasAnyRole } from '../../../middlewares/auth/role.middleware.js';

const router = express.Router();

// Create a new appointment
router.post(
  '/',
  isAuthenticated,
  hasAnyRole(['DOCTOR']),
  createAppointment
);

// Get all appointments for a doctor
router.get(
  '/',
  isAuthenticated,
  hasAnyRole(['DOCTOR']),
  getDoctorAppointments
);

// Get a single appointment
router.get(
  '/:id',
  isAuthenticated,
  hasAnyRole(['DOCTOR']),
  getAppointment
);

// Update an appointment
router.put(
  '/:id',
  isAuthenticated,
  hasAnyRole(['DOCTOR']),
  updateAppointment
);

// Cancel an appointment
router.delete(
  '/:id',
  isAuthenticated,
  hasAnyRole(['DOCTOR']),
  cancelAppointment
);

// Get appointment statistics
router.get(
  '/statistics',
  isAuthenticated,
  hasAnyRole(['DOCTOR']),
  getAppointmentStatistics
);

// Get upcoming appointments
router.get(
  '/upcoming',
  isAuthenticated,
  hasAnyRole(['DOCTOR']),
  getUpcomingAppointments
);

// Get appointment history
router.get(
  '/history',
  isAuthenticated,
  hasAnyRole(['DOCTOR']),
  getAppointmentHistory
);

// Get appointment reminders
router.get(
  '/reminders',
  isAuthenticated,
  hasAnyRole(['DOCTOR']),
  getAppointmentReminders
);

export default router; 