import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../../utils/ApiError.js';
import { catchAsync } from '../../utils/catch-async.js';

const prisma = new PrismaClient();

/**
 * Create a new appointment
 * @route POST /api/v1/doctor/appointments
 * @access Private
 */
export const createAppointment = catchAsync(async (req, res) => {
  const { patientId, date, time, type, notes } = req.body;
  const doctorId = req.user.id;

  const appointment = await prisma.appointment.create({
    data: {
      doctorId,
      patientId,
      date,
      time,
      type,
      notes,
      status: 'SCHEDULED',
    },
    include: {
      doctor: true,
      patient: true,
    },
  });

  res.status(StatusCodes.CREATED).json({
    status: 'success',
    data: appointment,
  });
});

/**
 * Get all appointments for a doctor
 * @route GET /api/v1/doctor/appointments
 * @access Private
 */
export const getDoctorAppointments = catchAsync(async (req, res) => {
  const doctorId = req.user.id;
  const { page = 1, limit = 20, status, startDate, endDate } = req.query;
  const skip = (page - 1) * limit;

  const where = {
    doctorId,
    ...(status && { status }),
    ...(startDate && endDate && {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    }),
  };

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      patient: true,
    },
    orderBy: {
      date: 'desc',
    },
    skip,
    take: parseInt(limit),
  });

  const total = await prisma.appointment.count({ where });

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: appointments,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * Get a single appointment
 * @route GET /api/v1/doctor/appointments/:appointmentId
 * @access Private
 */
export const getAppointment = catchAsync(async (req, res) => {
  const { appointmentId } = req.params;
  const doctorId = req.user.id;

  const appointment = await prisma.appointment.findUnique({
    where: {
      id: appointmentId,
      doctorId,
    },
    include: {
      doctor: true,
      patient: true,
    },
  });

  if (!appointment) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Appointment not found');
  }

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: appointment,
  });
});

/**
 * Update an appointment
 * @route PATCH /api/v1/doctor/appointments/:appointmentId
 * @access Private
 */
export const updateAppointment = catchAsync(async (req, res) => {
  const { appointmentId } = req.params;
  const { date, time, type, notes, status } = req.body;
  const doctorId = req.user.id;

  const appointment = await prisma.appointment.findUnique({
    where: {
      id: appointmentId,
      doctorId,
    },
  });

  if (!appointment) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Appointment not found');
  }

  const updatedAppointment = await prisma.appointment.update({
    where: {
      id: appointmentId,
    },
    data: {
      date,
      time,
      type,
      notes,
      status,
    },
    include: {
      doctor: true,
      patient: true,
    },
  });

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: updatedAppointment,
  });
});

/**
 * Cancel an appointment
 * @route PATCH /api/v1/doctor/appointments/:appointmentId/cancel
 * @access Private
 */
export const cancelAppointment = catchAsync(async (req, res) => {
  const { appointmentId } = req.params;
  const { reason } = req.body;
  const doctorId = req.user.id;

  const appointment = await prisma.appointment.findUnique({
    where: {
      id: appointmentId,
      doctorId,
    },
  });

  if (!appointment) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Appointment not found');
  }

  if (appointment.status === 'CANCELLED') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Appointment is already cancelled');
  }

  const updatedAppointment = await prisma.appointment.update({
    where: {
      id: appointmentId,
    },
    data: {
      status: 'CANCELLED',
      cancellationReason: reason,
    },
    include: {
      doctor: true,
      patient: true,
    },
  });

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: updatedAppointment,
  });
});

/**
 * Get appointment statistics
 * @route GET /api/v1/doctor/appointments/statistics
 * @access Private
 */
export const getAppointmentStatistics = catchAsync(async (req, res) => {
  const doctorId = req.user.id;
  const { startDate, endDate } = req.query;

  const where = {
    doctorId,
    ...(startDate && endDate && {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    }),
  };

  const statistics = await prisma.appointment.groupBy({
    by: ['status'],
    where,
    _count: {
      id: true,
    },
  });

  const totalAppointments = await prisma.appointment.count({ where });
  const completedAppointments = await prisma.appointment.count({
    where: {
      ...where,
      status: 'COMPLETED',
    },
  });

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      statistics,
      totalAppointments,
      completedAppointments,
      completionRate: totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0,
    },
  });
});

/**
 * Get upcoming appointments
 * @route GET /api/v1/doctor/appointments/upcoming
 * @access Private
 */
export const getUpcomingAppointments = catchAsync(async (req, res) => {
  const doctorId = req.user.id;
  const { limit = 5 } = req.query;

  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      date: {
        gte: new Date(),
      },
      status: 'SCHEDULED',
    },
    include: {
      patient: true,
    },
    orderBy: {
      date: 'asc',
    },
    take: parseInt(limit),
  });

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: appointments,
  });
});

/**
 * Get appointment history
 * @route GET /api/v1/doctor/appointments/history
 * @access Private
 */
export const getAppointmentHistory = catchAsync(async (req, res) => {
  const doctorId = req.user.id;
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      date: {
        lt: new Date(),
      },
    },
    include: {
      patient: true,
    },
    orderBy: {
      date: 'desc',
    },
    skip,
    take: parseInt(limit),
  });

  const total = await prisma.appointment.count({
    where: {
      doctorId,
      date: {
        lt: new Date(),
      },
    },
  });

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: appointments,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * Get appointment reminders
 * @route GET /api/v1/doctor/appointments/reminders
 * @access Private
 */
export const getAppointmentReminders = catchAsync(async (req, res) => {
  const doctorId = req.user.id;
  const { days = 7 } = req.query;

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + parseInt(days));

  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      date: {
        gte: startDate,
        lte: endDate,
      },
      status: 'SCHEDULED',
    },
    include: {
      patient: true,
    },
    orderBy: {
      date: 'asc',
    },
  });

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: appointments,
  });
});

// Export all controller functions as a single object
export const doctorAppointmentController = {
  createAppointment,
  getDoctorAppointments,
  getAppointment,
  updateAppointment,
  cancelAppointment,
  getAppointmentStatistics,
  getUpcomingAppointments,
  getAppointmentHistory,
  getAppointmentReminders,
}; 