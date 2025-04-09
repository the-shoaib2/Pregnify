import express from 'express';
import { isAuthenticated } from '../../../middlewares/auth/auth.middleware.js';
import { isAdmin } from '../../../middlewares/auth/role.middleware.js';
import {
  createDoctorProfile,
  updateDoctorProfile,
  getDoctorProfile,
  getAllDoctors,
  deleteDoctorProfile,
  getAvailability,
  updateAvailability,
  getSpecialties,
  getExperience,
  updateExperience,
  getEducation,
  updateEducation,
  getDocuments,
  uploadDocument,
  deleteDocument,
  getRating,
  getReviews,
  getStatistics
} from '../../controllers/doctor/doctor-profile.controller.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Doctor registration and profile management
router.post('/register', isAdmin, createDoctorProfile);
router.put('/:id', isAdmin, updateDoctorProfile);
router.get('/:id', getDoctorProfile);
router.get('/', getAllDoctors);
router.delete('/:id', isAdmin, deleteDoctorProfile);

// Doctor availability management
router.get('/:id/availability', getAvailability);
router.put('/:id/availability', updateAvailability);

// Doctor specialties, experience, and education
router.get('/:id/specialties', getSpecialties);
router.get('/:id/experience', getExperience);
router.put('/:id/experience', updateExperience);
router.get('/:id/education', getEducation);
router.put('/:id/education', updateEducation);

// Doctor documents
router.get('/:id/documents', getDocuments);
router.post('/:id/documents', uploadDocument);
router.delete('/:id/documents/:documentId', deleteDocument);

// Doctor ratings and reviews
router.get('/:id/rating', getRating);
router.get('/:id/reviews', getReviews);

// Doctor statistics
router.get('/:id/statistics', getStatistics);

export default router; 