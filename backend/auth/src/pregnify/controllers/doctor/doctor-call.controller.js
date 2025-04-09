/**
 * Doctor Call Controller
 * Handles doctor call-related operations
 */

import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../../utils/ApiError.js';
import { catchAsync } from '../../utils/catch-async.js';

const prisma = new PrismaClient();

/**
 * Get all doctor calls
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getAllDoctorCalls = async (req, res, next) => {
  try {
    // Implementation to get all doctor calls
    res.status(200).json({
      success: true,
      message: 'Doctor calls retrieved successfully',
      data: [] // Replace with actual data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single doctor call by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getDoctorCallById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Implementation to get a single doctor call by ID
    res.status(200).json({
      success: true,
      message: 'Doctor call retrieved successfully',
      data: {} // Replace with actual data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new doctor call
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const createDoctorCall = async (req, res, next) => {
  try {
    const callData = req.body;
    
    // Implementation to create a new doctor call
    res.status(201).json({
      success: true,
      message: 'Doctor call created successfully',
      data: {} // Replace with actual data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a doctor call
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const updateDoctorCall = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Implementation to update a doctor call
    res.status(200).json({
      success: true,
      message: 'Doctor call updated successfully',
      data: {} // Replace with actual data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a doctor call
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const deleteDoctorCall = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Implementation to delete a doctor call
    res.status(200).json({
      success: true,
      message: 'Doctor call deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Start a new call
 * @route POST /api/v1/doctor/calls
 * @access Private
 */
export const startCall = catchAsync(async (req, res) => {
  const { patientId, type, notes } = req.body;
  const doctorId = req.user.id;

  const call = await prisma.call.create({
    data: {
      doctorId,
      patientId,
      type,
      notes,
      status: 'ACTIVE',
      startTime: new Date(),
    },
    include: {
      doctor: true,
      patient: true,
    },
  });

  res.status(StatusCodes.CREATED).json({
    status: 'success',
    data: call,
  });
});

/**
 * End an active call
 * @route PATCH /api/v1/doctor/calls/:callId/end
 * @access Private
 */
export const endCall = catchAsync(async (req, res) => {
  const { callId } = req.params;
  const { notes, duration, qualityMetrics } = req.body;

  const call = await prisma.call.update({
    where: {
      id: callId,
      doctorId: req.user.id,
      status: 'ACTIVE',
    },
    data: {
      status: 'COMPLETED',
      endTime: new Date(),
      notes,
      duration,
      qualityMetrics: qualityMetrics ? JSON.stringify(qualityMetrics) : null,
    },
    include: {
      doctor: true,
      patient: true,
    },
  });

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: call,
  });
});

/**
 * Get call history
 * @route GET /api/v1/doctor/calls/history
 * @access Private
 */
export const getCallHistory = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, status, startDate, endDate } = req.query;
  const skip = (page - 1) * limit;

  const where = {
    doctorId: req.user.id,
    ...(status && { status }),
    ...(startDate && endDate && {
      startTime: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    }),
  };

  const calls = await prisma.call.findMany({
    where,
    include: {
      doctor: true,
      patient: true,
    },
    orderBy: {
      startTime: 'desc',
    },
    skip,
    take: parseInt(limit),
  });

  const total = await prisma.call.count({ where });

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: calls,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * Get call details
 * @route GET /api/v1/doctor/calls/:callId
 * @access Private
 */
export const getCallDetails = catchAsync(async (req, res) => {
  const { callId } = req.params;

  const call = await prisma.call.findUnique({
    where: {
      id: callId,
      doctorId: req.user.id,
    },
    include: {
      doctor: true,
      patient: true,
    },
  });

  if (!call) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Call not found');
  }

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: call,
  });
});

/**
 * Update call status
 * @route PATCH /api/v1/doctor/calls/:callId/status
 * @access Private
 */
export const updateCallStatus = catchAsync(async (req, res) => {
  const { callId } = req.params;
  const { status } = req.body;

  const call = await prisma.call.update({
    where: {
      id: callId,
      doctorId: req.user.id,
    },
    data: { status },
    include: {
      doctor: true,
      patient: true,
    },
  });

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: call,
  });
});

/**
 * Get call statistics
 * @route GET /api/v1/doctor/calls/statistics
 * @access Private
 */
export const getCallStatistics = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;

  const where = {
    doctorId: req.user.id,
    ...(startDate && endDate && {
      startTime: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    }),
  };

  const statistics = await prisma.call.groupBy({
    by: ['status'],
    where,
    _count: {
      id: true,
    },
    _avg: {
      duration: true,
    },
  });

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: statistics,
  });
});

/**
 * Get active calls
 * @route GET /api/v1/doctor/calls/active
 * @access Private
 */
export const getActiveCalls = catchAsync(async (req, res) => {
  const calls = await prisma.call.findMany({
    where: {
      doctorId: req.user.id,
      status: 'ACTIVE',
    },
    include: {
      doctor: true,
      patient: true,
    },
  });

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: calls,
  });
});

/**
 * Get call recordings
 * @route GET /api/v1/doctor/calls/:callId/recordings
 * @access Private
 */
export const getCallRecordings = catchAsync(async (req, res) => {
  const { callId } = req.params;

  const recordings = await prisma.callRecording.findMany({
    where: {
      callId,
      call: {
        doctorId: req.user.id,
      },
    },
  });

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: recordings,
  });
});

/**
 * Add call notes
 * @route POST /api/v1/doctor/calls/:callId/notes
 * @access Private
 */
export const addCallNotes = catchAsync(async (req, res) => {
  const { callId } = req.params;
  const { notes } = req.body;

  const call = await prisma.call.update({
    where: {
      id: callId,
      doctorId: req.user.id,
    },
    data: { notes },
    include: {
      doctor: true,
      patient: true,
    },
  });

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: call,
  });
});

/**
 * Get call quality metrics
 * @route GET /api/v1/doctor/calls/:callId/quality
 * @access Private
 */
export const getCallQualityMetrics = catchAsync(async (req, res) => {
  const { callId } = req.params;

  const call = await prisma.call.findUnique({
    where: {
      id: callId,
      doctorId: req.user.id,
    },
    select: {
      qualityMetrics: true,
    },
  });

  if (!call) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Call not found');
  }

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: call.qualityMetrics ? JSON.parse(call.qualityMetrics) : null,
  });
});

// Export all controller functions as a single object
export const doctorCallController = {
  startCall,
  endCall,
  getCallHistory,
  getCallDetails,
  updateCallStatus,
  getCallStatistics,
  getActiveCalls,
  getCallRecordings,
  addCallNotes,
  getCallQualityMetrics,
}; 