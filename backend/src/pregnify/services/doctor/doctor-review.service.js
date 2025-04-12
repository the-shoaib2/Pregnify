import { prisma } from '../../../utils/database/prisma.js';
import { AppError } from '../../../utils/error/app.error.js';

class DoctorReviewService {
  async createReview(userId, { doctorId, rating, comment, appointmentId }) {
    // Validate doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId }
    });

    if (!doctor) {
      throw new AppError('Doctor not found', 404);
    }

    // Validate rating is between 1 and 5
    if (rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    // If appointmentId is provided, validate it exists and belongs to the user
    if (appointmentId) {
      const appointment = await prisma.doctorAppointment.findUnique({
        where: { id: appointmentId }
      });

      if (!appointment) {
        throw new AppError('Appointment not found', 404);
      }

      if (appointment.patientId !== userId) {
        throw new AppError('Unauthorized to review this appointment', 403);
      }
    }

    // Check if user has already reviewed this doctor
    const existingReview = await prisma.doctorReview.findFirst({
      where: {
        doctorId,
        userId
      }
    });

    if (existingReview) {
      throw new AppError('You have already reviewed this doctor', 400);
    }

    // Create review
    const review = await prisma.doctorReview.create({
      data: {
        doctorId,
        userId,
        rating,
        comment,
        appointmentId
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true
          }
        },
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return review;
  }

  async getDoctorReviews(doctorId, { page, limit, sortBy, sortOrder }) {
    // Validate doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId }
    });

    if (!doctor) {
      throw new AppError('Doctor not found', 404);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get reviews with pagination and sorting
    const [reviews, total] = await Promise.all([
      prisma.doctorReview.findMany({
        where: { doctorId },
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder.toLowerCase()
        },
        skip,
        take: limit
      }),
      prisma.doctorReview.count({
        where: { doctorId }
      })
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getReview(reviewId) {
    const review = await prisma.doctorReview.findUnique({
      where: { id: reviewId },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true
          }
        },
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    return review;
  }

  async updateReview(userId, reviewId, { rating, comment }) {
    const review = await prisma.doctorReview.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    // Verify user is the author of the review
    if (review.userId !== userId) {
      throw new AppError('Unauthorized to update this review', 403);
    }

    // Validate rating is between 1 and 5
    if (rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    const updatedReview = await prisma.doctorReview.update({
      where: { id: reviewId },
      data: {
        rating,
        comment,
        updatedAt: new Date()
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true
          }
        },
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return updatedReview;
  }

  async deleteReview(userId, reviewId) {
    const review = await prisma.doctorReview.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    // Verify user is the author of the review
    if (review.userId !== userId) {
      throw new AppError('Unauthorized to delete this review', 403);
    }

    await prisma.doctorReview.delete({
      where: { id: reviewId }
    });
  }

  async getReviewStats(doctorId) {
    // Validate doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId }
    });

    if (!doctor) {
      throw new AppError('Doctor not found', 404);
    }

    // Get review statistics
    const stats = await prisma.doctorReview.groupBy({
      by: ['rating'],
      where: { doctorId },
      _count: true
    });

    // Calculate average rating
    const totalReviews = stats.reduce((acc, curr) => acc + curr._count, 0);
    const averageRating = stats.reduce((acc, curr) => acc + (curr.rating * curr._count), 0) / totalReviews;

    return {
      totalReviews,
      averageRating: Number(averageRating.toFixed(1)),
      ratingDistribution: stats.reduce((acc, curr) => {
        acc[curr.rating] = curr._count;
        return acc;
      }, {})
    };
  }

  async reportReview(userId, reviewId, { reason, details }) {
    const review = await prisma.doctorReview.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    // Create report
    const report = await prisma.reviewReport.create({
      data: {
        reviewId,
        reportedBy: userId,
        reason,
        details
      }
    });

    return report;
  }

  async getMyReviews(userId, { page, limit }) {
    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get user's reviews with pagination
    const [reviews, total] = await Promise.all([
      prisma.doctorReview.findMany({
        where: { userId },
        include: {
          doctor: {
            select: {
              id: true,
              name: true,
              specialization: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.doctorReview.count({
        where: { userId }
      })
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}

export const doctorReviewService = new DoctorReviewService(); 