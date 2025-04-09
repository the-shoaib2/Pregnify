import { PrismaClient } from '@prisma/client';
import { ApiError } from '../../utils/ApiError.js';
import { StatusCodes } from 'http-status-codes';

const prisma = new PrismaClient();

class AmbulanceBookingService {
  /**
   * Create a new ambulance booking
   * @param {Object} bookingData - Booking data including patientId, ambulanceId, etc.
   * @returns {Promise<Object>} - Created booking
   */
  async createBooking(bookingData) {
    try {
      const booking = await prisma.ambulanceBooking.create({
        data: {
          ...bookingData,
          status: 'PENDING',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        include: {
          patient: true,
          ambulance: true
        }
      });

      return booking;
    } catch (error) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create booking');
    }
  }

  /**
   * Get all bookings with pagination and filtering
   * @param {Object} options - Query options including patientId, page, limit, etc.
   * @returns {Promise<Object>} - List of bookings with pagination info
   */
  async getBookings(options) {
    const {
      patientId,
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    const where = {
      ...(patientId && { patientId }),
      ...(status && { status }),
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    const [bookings, total] = await Promise.all([
      prisma.ambulanceBooking.findMany({
        where,
        include: {
          patient: true,
          ambulance: true
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder
        }
      }),
      prisma.ambulanceBooking.count({ where })
    ]);

    return {
      bookings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get a specific booking by ID
   * @param {string} bookingId - ID of the booking to retrieve
   * @returns {Promise<Object>} - Booking details
   */
  async getBookingById(bookingId) {
    const booking = await prisma.ambulanceBooking.findUnique({
      where: { id: bookingId },
      include: {
        patient: true,
        ambulance: true
      }
    });

    if (!booking) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Booking not found');
    }

    return booking;
  }

  /**
   * Update booking status
   * @param {string} bookingId - ID of the booking to update
   * @param {string} status - New status
   * @param {string} [reason] - Reason for status change
   * @returns {Promise<Object>} - Updated booking
   */
  async updateBookingStatus(bookingId, status, reason) {
    const booking = await prisma.ambulanceBooking.update({
      where: { id: bookingId },
      data: {
        status,
        ...(reason && { statusReason: reason }),
        updatedAt: new Date()
      },
      include: {
        patient: true,
        ambulance: true
      }
    });

    return booking;
  }

  /**
   * Update payment status
   * @param {string} bookingId - ID of the booking to update
   * @param {string} paymentStatus - New payment status
   * @param {string} paymentMethod - Payment method used
   * @param {string} transactionId - Transaction ID
   * @param {number} amount - Payment amount
   * @returns {Promise<Object>} - Updated booking
   */
  async updatePaymentStatus(bookingId, paymentStatus, paymentMethod, transactionId, amount) {
    const booking = await prisma.ambulanceBooking.update({
      where: { id: bookingId },
      data: {
        paymentStatus,
        paymentMethod,
        transactionId,
        amount,
        updatedAt: new Date()
      },
      include: {
        patient: true,
        ambulance: true
      }
    });

    return booking;
  }

  /**
   * Update booking location
   * @param {string} bookingId - ID of the booking to update
   * @param {number} latitude - New latitude
   * @param {number} longitude - New longitude
   * @param {string} address - New address
   * @returns {Promise<Object>} - Updated booking
   */
  async updateLocation(bookingId, latitude, longitude, address) {
    const booking = await prisma.ambulanceBooking.update({
      where: { id: bookingId },
      data: {
        latitude,
        longitude,
        address,
        updatedAt: new Date()
      },
      include: {
        patient: true,
        ambulance: true
      }
    });

    return booking;
  }

  /**
   * Update estimated arrival time
   * @param {string} bookingId - ID of the booking to update
   * @param {Date} estimatedArrivalTime - New estimated arrival time
   * @returns {Promise<Object>} - Updated booking
   */
  async updateEstimatedArrival(bookingId, estimatedArrivalTime) {
    const booking = await prisma.ambulanceBooking.update({
      where: { id: bookingId },
      data: {
        estimatedArrivalTime,
        updatedAt: new Date()
      },
      include: {
        patient: true,
        ambulance: true
      }
    });

    return booking;
  }

  /**
   * Cancel a booking
   * @param {string} bookingId - ID of the booking to cancel
   * @param {string} reason - Reason for cancellation
   * @returns {Promise<Object>} - Updated booking
   */
  async cancelBooking(bookingId, reason) {
    const booking = await prisma.ambulanceBooking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason,
        updatedAt: new Date()
      },
      include: {
        patient: true,
        ambulance: true
      }
    });

    return booking;
  }

  /**
   * Add a review for a booking
   * @param {string} bookingId - ID of the booking
   * @param {string} userId - ID of the user adding the review
   * @param {number} rating - Rating (1-5)
   * @param {string} comment - Review comment
   * @returns {Promise<Object>} - Created review
   */
  async addReview(bookingId, userId, rating, comment) {
    const review = await prisma.ambulanceReview.create({
      data: {
        bookingId,
        userId,
        rating,
        comment,
        createdAt: new Date()
      },
      include: {
        user: true,
        booking: true
      }
    });

    return review;
  }

  /**
   * Get booking statistics
   * @param {string} userId - ID of the user
   * @returns {Promise<Object>} - Booking statistics
   */
  async getBookingStatistics(userId) {
    const [
      totalBookings,
      completedBookings,
      cancelledBookings,
      pendingBookings,
      averageRating
    ] = await Promise.all([
      prisma.ambulanceBooking.count({ where: { patientId: userId } }),
      prisma.ambulanceBooking.count({ where: { patientId: userId, status: 'COMPLETED' } }),
      prisma.ambulanceBooking.count({ where: { patientId: userId, status: 'CANCELLED' } }),
      prisma.ambulanceBooking.count({ where: { patientId: userId, status: 'PENDING' } }),
      prisma.ambulanceReview.aggregate({
        where: { userId },
        _avg: { rating: true }
      })
    ]);

    return {
      totalBookings,
      completedBookings,
      cancelledBookings,
      pendingBookings,
      averageRating: averageRating._avg.rating || 0
    };
  }

  /**
   * Get available ambulances
   * @param {number} latitude - Current latitude
   * @param {number} longitude - Current longitude
   * @param {string} [type] - Ambulance type filter
   * @returns {Promise<Array>} - List of available ambulances
   */
  async getAvailableAmbulances(latitude, longitude, type) {
    const where = {
      status: 'AVAILABLE',
      ...(type && { type })
    };

    const ambulances = await prisma.ambulance.findMany({
      where,
      include: {
        currentLocation: true
      }
    });

    // Calculate distance for each ambulance and sort by distance
    return ambulances
      .map(ambulance => ({
        ...ambulance,
        distance: this.calculateDistance(
          latitude,
          longitude,
          ambulance.currentLocation.latitude,
          ambulance.currentLocation.longitude
        )
      }))
      .sort((a, b) => a.distance - b.distance);
  }

  /**
   * Get booking history
   * @param {string} userId - ID of the user
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} - Booking history with pagination
   */
  async getBookingHistory(userId, page = 1, limit = 10) {
    const [bookings, total] = await Promise.all([
      prisma.ambulanceBooking.findMany({
        where: {
          patientId: userId,
          status: { in: ['COMPLETED', 'CANCELLED'] }
        },
        include: {
          patient: true,
          ambulance: true
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.ambulanceBooking.count({
        where: {
          patientId: userId,
          status: { in: ['COMPLETED', 'CANCELLED'] }
        }
      })
    ]);

    return {
      bookings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get upcoming bookings
   * @param {string} userId - ID of the user
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} - Upcoming bookings with pagination
   */
  async getUpcomingBookings(userId, page = 1, limit = 10) {
    const [bookings, total] = await Promise.all([
      prisma.ambulanceBooking.findMany({
        where: {
          patientId: userId,
          status: { in: ['PENDING', 'CONFIRMED'] },
          scheduledTime: { gt: new Date() }
        },
        include: {
          patient: true,
          ambulance: true
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { scheduledTime: 'asc' }
      }),
      prisma.ambulanceBooking.count({
        where: {
          patientId: userId,
          status: { in: ['PENDING', 'CONFIRMED'] },
          scheduledTime: { gt: new Date() }
        }
      })
    ]);

    return {
      bookings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get past bookings
   * @param {string} userId - ID of the user
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} - Past bookings with pagination
   */
  async getPastBookings(userId, page = 1, limit = 10) {
    const [bookings, total] = await Promise.all([
      prisma.ambulanceBooking.findMany({
        where: {
          patientId: userId,
          status: { in: ['COMPLETED', 'CANCELLED'] },
          scheduledTime: { lt: new Date() }
        },
        include: {
          patient: true,
          ambulance: true
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { scheduledTime: 'desc' }
      }),
      prisma.ambulanceBooking.count({
        where: {
          patientId: userId,
          status: { in: ['COMPLETED', 'CANCELLED'] },
          scheduledTime: { lt: new Date() }
        }
      })
    ]);

    return {
      bookings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Calculate distance between two points using Haversine formula
   * @param {number} lat1 - Latitude of point 1
   * @param {number} lon1 - Longitude of point 1
   * @param {number} lat2 - Latitude of point 2
   * @param {number} lon2 - Longitude of point 2
   * @returns {number} - Distance in kilometers
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  /**
   * Convert degrees to radians
   * @param {number} deg - Degrees
   * @returns {number} - Radians
   */
  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }
}

export const ambulanceBookingService = new AmbulanceBookingService(); 