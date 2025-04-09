/**
 * Doctor Review Controller
 * Handles doctor review-related operations
 */

import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../../utils/ApiError.js';
import { catchAsync } from '../../utils/catch-async.js';

const prisma = new PrismaClient();

/**
 * Get all doctor reviews
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getAllDoctorReviews = async (req, res, next) => {
  try {
    // Implementation to get all doctor reviews
    res.status(200).json({
      success: true,
      message: 'Doctor reviews retrieved successfully',
      data: [] // Replace with actual data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single doctor review by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getDoctorReviewById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Implementation to get a single doctor review by ID
    res.status(200).json({
      success: true,
      message: 'Doctor review retrieved successfully',
      data: {} // Replace with actual data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new doctor review
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const createDoctorReview = async (req, res, next) => {
  try {
    const reviewData = req.body;
    
    // Implementation to create a new doctor review
    res.status(201).json({
      success: true,
      message: 'Doctor review created successfully',
      data: {} // Replace with actual data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a doctor review
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const updateDoctorReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Implementation to update a doctor review
    res.status(200).json({
      success: true,
      message: 'Doctor review updated successfully',
      data: {} // Replace with actual data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a doctor review
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const deleteDoctorReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Implementation to delete a doctor review
    res.status(200).json({
      success: true,
      message: 'Doctor review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new review
 * @route POST /api/v1/doctor/reviews
 * @access Private
 */
export const createReview = catchAsync(async (req, res) => {
  const { doctorId, rating, comment, appointmentId } = req.body;
  const patientId = req.user.id;

  const review = await prisma.review.create({
    data: {
      doctorId,
      patientId,
      rating,
      comment,
      appointmentId,
    },
    include: {
      doctor: true,
      patient: true,
    },
  });

  res.status(StatusCodes.CREATED).json({
    status: 'success',
    data: review,
  });
});

/**
 * Get all reviews for a doctor
 * @route GET /api/v1/doctor/reviews
 * @access Public
 */
export const getDoctorReviews = catchAsync(async (req, res) => {
  const { doctorId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const reviews = await prisma.review.findMany({
    where: {
      doctorId,
    },
    include: {
      patient: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take: parseInt(limit),
  });

  const total = await prisma.review.count({
    where: {
      doctorId,
    },
  });

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: reviews,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * Get a single review
 * @route GET /api/v1/doctor/reviews/:reviewId
 * @access Public
 */
export const getReview = catchAsync(async (req, res) => {
  const { reviewId } = req.params;

  const review = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
    include: {
      doctor: true,
      patient: true,
    },
  });

  if (!review) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Review not found');
  }

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: review,
  });
});

/**
 * Update a review
 * @route PATCH /api/v1/doctor/reviews/:reviewId
 * @access Private
 */
export const updateReview = catchAsync(async (req, res) => {
  const { reviewId } = req.params;
  const { rating, comment } = req.body;
  const patientId = req.user.id;

  const review = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
  });

  if (!review) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Review not found');
  }

  if (review.patientId !== patientId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You can only update your own reviews');
  }

  const updatedReview = await prisma.review.update({
    where: {
      id: reviewId,
    },
    data: {
      rating,
      comment,
    },
    include: {
      doctor: true,
      patient: true,
    },
  });

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: updatedReview,
  });
});

/**
 * Delete a review
 * @route DELETE /api/v1/doctor/reviews/:reviewId
 * @access Private
 */
export const deleteReview = catchAsync(async (req, res) => {
  const { reviewId } = req.params;
  const patientId = req.user.id;

  const review = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
  });

  if (!review) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Review not found');
  }

  if (review.patientId !== patientId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You can only delete your own reviews');
  }

  await prisma.review.delete({
    where: {
      id: reviewId,
    },
  });

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Review deleted successfully',
  });
});

/**
 * Get review statistics for a doctor
 * @route GET /api/v1/doctor/reviews/statistics/:doctorId
 * @access Public
 */
export const getReviewStatistics = catchAsync(async (req, res) => {
  const { doctorId } = req.params;

  const statistics = await prisma.review.aggregate({
    where: {
      doctorId,
    },
    _avg: {
      rating: true,
    },
    _count: {
      id: true,
    },
  });

  const ratingDistribution = await prisma.review.groupBy({
    by: ['rating'],
    where: {
      doctorId,
    },
    _count: {
      rating: true,
    },
  });

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      averageRating: statistics._avg.rating,
      totalReviews: statistics._count.id,
      ratingDistribution,
    },
  });
});

/**
 * Get recent reviews
 * @route GET /api/v1/doctor/reviews/recent
 * @access Public
 */
export const getRecentReviews = catchAsync(async (req, res) => {
  const { limit = 5 } = req.query;

  const reviews = await prisma.review.findMany({
    include: {
      doctor: true,
      patient: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: parseInt(limit),
  });

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: reviews,
  });
});

/**
 * Get patient's reviews
 * @route GET /api/v1/doctor/reviews/patient
 * @access Private
 */
export const getPatientReviews = catchAsync(async (req, res) => {
  const patientId = req.user.id;
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const reviews = await prisma.review.findMany({
    where: {
      patientId,
    },
    include: {
      doctor: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take: parseInt(limit),
  });

  const total = await prisma.review.count({
    where: {
      patientId,
    },
  });

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: reviews,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * Get doctor's average rating
 * @route GET /api/v1/doctor/reviews/average/:doctorId
 * @access Public
 */
export const getDoctorAverageRating = catchAsync(async (req, res) => {
  const { doctorId } = req.params;

  const statistics = await prisma.review.aggregate({
    where: {
      doctorId,
    },
    _avg: {
      rating: true,
    },
    _count: {
      id: true,
    },
  });

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      averageRating: statistics._avg.rating,
      totalReviews: statistics._count.id,
    },
  });
});

// Export all controller functions as a single object
export const doctorReviewController = {
  createReview,
  getDoctorReviews,
  getReview,
  updateReview,
  deleteReview,
  getReviewStatistics,
  getRecentReviews,
  getPatientReviews,
  getDoctorAverageRating,
}; 