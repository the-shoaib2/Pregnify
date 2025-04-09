import { PrismaClient } from '@prisma/client';
import { ApiError } from '../../utils/ApiError.js';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catch-async.js';

const prisma = new PrismaClient();

/**
 * Get driver profile
 * @route GET /api/v1/ambulance/drivers/profile
 * @access Private
 */
export const getDriverProfile = catchAsync(async (req, res) => {
  const driver = await prisma.ambulanceDriver.findUnique({
    where: { userId: req.user.id },
    include: {
      user: true,
      ambulance: true
    }
  });

  if (!driver) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Driver profile not found');
  }

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: driver
  });
});

/**
 * Update driver profile
 * @route PATCH /api/v1/ambulance/drivers/profile
 * @access Private
 */
export const updateDriverProfile = catchAsync(async (req, res) => {
  const { licenseNumber, licenseExpiry, experience, specialization } = req.body;

  const driver = await prisma.ambulanceDriver.update({
    where: { userId: req.user.id },
    data: {
      licenseNumber,
      licenseExpiry,
      experience,
      specialization,
      updatedAt: new Date()
    },
    include: {
      user: true,
      ambulance: true
    }
  });

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Driver profile updated successfully',
    data: driver
  });
});

/**
 * Get driver's assigned ambulance
 * @route GET /api/v1/ambulance/drivers/ambulance
 * @access Private
 */
export const getAssignedAmbulance = catchAsync(async (req, res) => {
  const ambulance = await prisma.ambulance.findFirst({
    where: { driverId: req.user.id },
    include: {
      driver: true,
      bookings: {
        where: {
          status: {
            in: ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT']
          }
        }
      }
    }
  });

  if (!ambulance) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No ambulance assigned');
  }

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: ambulance
  });
});

/**
 * Update driver's availability status
 * @route PATCH /api/v1/ambulance/drivers/availability
 * @access Private
 */
export const updateAvailability = catchAsync(async (req, res) => {
  const { isAvailable } = req.body;

  const driver = await prisma.ambulanceDriver.update({
    where: { userId: req.user.id },
    data: {
      isAvailable,
      updatedAt: new Date()
    }
  });

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Availability status updated successfully',
    data: driver
  });
});

/**
 * Get driver's current booking
 * @route GET /api/v1/ambulance/drivers/current-booking
 * @access Private
 */
export const getCurrentBooking = catchAsync(async (req, res) => {
  const ambulance = await prisma.ambulance.findFirst({
    where: { driverId: req.user.id }
  });

  if (!ambulance) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No ambulance assigned');
  }

  const booking = await prisma.ambulanceBooking.findFirst({
    where: {
      ambulanceId: ambulance.id,
      status: {
        in: ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT']
      }
    },
    include: {
      patient: true,
      ambulance: true
    }
  });

  if (!booking) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No active booking found');
  }

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: booking
  });
});

/**
 * Get driver's booking history
 * @route GET /api/v1/ambulance/drivers/bookings
 * @access Private
 */
export const getBookingHistory = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, startDate, endDate } = req.query;

  const ambulance = await prisma.ambulance.findFirst({
    where: { driverId: req.user.id }
  });

  if (!ambulance) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No ambulance assigned');
  }

  const where = {
    ambulanceId: ambulance.id,
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
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.ambulanceBooking.count({ where })
  ]);

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      bookings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

/**
 * Update driver's location
 * @route PATCH /api/v1/ambulance/drivers/location
 * @access Private
 */
export const updateLocation = catchAsync(async (req, res) => {
  const { latitude, longitude } = req.body;

  const ambulance = await prisma.ambulance.findFirst({
    where: { driverId: req.user.id }
  });

  if (!ambulance) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No ambulance assigned');
  }

  await prisma.ambulance.update({
    where: { id: ambulance.id },
    data: {
      location: {
        latitude,
        longitude
      },
      updatedAt: new Date()
    }
  });

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Location updated successfully'
  });
});

// Export all controller functions as a single object
export const ambulanceDriverController = {
  getDriverProfile,
  updateDriverProfile,
  getAssignedAmbulance,
  updateAvailability,
  getCurrentBooking,
  getBookingHistory,
  updateLocation
}; 