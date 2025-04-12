import express from 'express';
import { isAuthenticated } from '../../../middlewares/auth/auth.middleware.js';
import { 
  createReview,
  getReview,
  updateReview,
  deleteReview,
  getDoctorReviews
} from '../../controllers/doctor/doctor-review.controller.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Create review
router.post('/', createReview);

// Get review by ID
router.get('/:reviewId', getReview);

// Update review
router.patch('/:reviewId', updateReview);

// Delete review
router.delete('/:reviewId', deleteReview);

// Get all reviews
router.get('/', getDoctorReviews);

export default router; 