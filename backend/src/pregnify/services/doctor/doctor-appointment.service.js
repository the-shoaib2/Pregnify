import { PrismaClient } from '@prisma/client';
import { ApiError } from '../../utils/ApiError.js';

const prisma = new PrismaClient();

class DoctorAppointmentService {
  /**
   * Create a new appointment
   * @param {string} doctorId - The ID of the doctor
   * @param {Object} appointmentData - The appointment data
   * @returns {Promise<Object>} - The created appointment
   */
  async createAppointment(doctorId, appointmentData) {
    const {
      patientId,
      appointmentDate,
      timeSlot,
      type = 'SCHEDULED',
      amount,
      notes
    } = appointmentData;

    // Check if doctor exists
    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId }
    });

    if (!doctor) {
      throw new ApiError(404, "Doctor profile not found");
    }

    // Check if patient exists
    const patient = await prisma.user.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      throw new ApiError(404, "Patient not found");
    }

    // Check if the time slot is available
    const isSlotAvailable = await this.checkSlotAvailability(
      doctor.id,
      appointmentDate,
      timeSlot
    );

    if (!isSlotAvailable) {
      throw new ApiError(400, "The selected time slot is not available");
    }

    // Create the appointment
    const appointment = await prisma.doctorAppointment.create({
      data: {
        doctorId: doctor.id,
        patientId,
        appointmentDate,
        timeSlot,
        type,
        status: 'SCHEDULED',
        paymentStatus: 'PENDING',
        amount,
        notes
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            avatar: true
          }
        }
      }
    });

    return appointment;
  }

  /**
   * Get all appointments for a doctor
   * @param {string} doctorId - The ID of the doctor
   * @param {Object} query - Query parameters for filtering and pagination
   * @returns {Promise<Object>} - List of appointments with pagination info
   */
  async getAppointments(doctorId, query = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      startDate,
      endDate,
      search
    } = query;
    const skip = (page - 1) * limit;

    // Check if doctor exists
    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId }
    });

    if (!doctor) {
      throw new ApiError(404, "Doctor profile not found");
    }

    // Build filter conditions
    const where = {
      doctorId: doctor.id,
      ...(status && { status }),
      ...(type && { type }),
      ...(startDate && endDate && {
        appointmentDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }),
      ...(search && {
        patient: {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { email: { contains: search } }
          ]
        }
      })
    };

    // Get appointments with pagination
    const [appointments, total] = await Promise.all([
      prisma.doctorAppointment.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
              avatar: true
            }
          }
        },
        orderBy: {
          appointmentDate: 'asc'
        },
        skip,
        take: limit
      }),
      prisma.doctorAppointment.count({ where })
    ]);

    return {
      appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get a specific appointment
   * @param {string} doctorId - The ID of the doctor
   * @param {string} appointmentId - The ID of the appointment
   * @returns {Promise<Object>} - The appointment details
   */
  async getAppointment(doctorId, appointmentId) {
    // Check if doctor exists
    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId }
    });

    if (!doctor) {
      throw new ApiError(404, "Doctor profile not found");
    }

    // Get appointment
    const appointment = await prisma.doctorAppointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            avatar: true
          }
        }
      }
    });

    if (!appointment) {
      throw new ApiError(404, "Appointment not found");
    }

    if (appointment.doctorId !== doctor.id) {
      throw new ApiError(403, "You are not authorized to access this appointment");
    }

    return appointment;
  }

  /**
   * Update an appointment
   * @param {string} doctorId - The ID of the doctor
   * @param {string} appointmentId - The ID of the appointment
   * @param {Object} updateData - The data to update
   * @returns {Promise<Object>} - The updated appointment
   */
  async updateAppointment(doctorId, appointmentId, updateData) {
    const {
      appointmentDate,
      timeSlot,
      type,
      amount,
      notes
    } = updateData;

    // Check if doctor exists
    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId }
    });

    if (!doctor) {
      throw new ApiError(404, "Doctor profile not found");
    }

    // Check if appointment exists and belongs to the doctor
    const appointment = await prisma.doctorAppointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) {
      throw new ApiError(404, "Appointment not found");
    }

    if (appointment.doctorId !== doctor.id) {
      throw new ApiError(403, "You are not authorized to update this appointment");
    }

    // Check if the time slot is available (if date or time is being updated)
    if (appointmentDate || timeSlot) {
      const isSlotAvailable = await this.checkSlotAvailability(
        doctor.id,
        appointmentDate || appointment.appointmentDate,
        timeSlot || appointment.timeSlot,
        appointmentId
      );

      if (!isSlotAvailable) {
        throw new ApiError(400, "The selected time slot is not available");
      }
    }

    // Update the appointment
    const updatedAppointment = await prisma.doctorAppointment.update({
      where: { id: appointmentId },
      data: {
        ...(appointmentDate && { appointmentDate }),
        ...(timeSlot && { timeSlot }),
        ...(type && { type }),
        ...(amount && { amount }),
        ...(notes && { notes })
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            avatar: true
          }
        }
      }
    });

    return updatedAppointment;
  }

  /**
   * Cancel an appointment
   * @param {string} doctorId - The ID of the doctor
   * @param {string} appointmentId - The ID of the appointment
   * @param {string} reason - The reason for cancellation
   * @returns {Promise<Object>} - The cancelled appointment
   */
  async cancelAppointment(doctorId, appointmentId, reason) {
    // Check if doctor exists
    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId }
    });

    if (!doctor) {
      throw new ApiError(404, "Doctor profile not found");
    }

    // Check if appointment exists and belongs to the doctor
    const appointment = await prisma.doctorAppointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) {
      throw new ApiError(404, "Appointment not found");
    }

    if (appointment.doctorId !== doctor.id) {
      throw new ApiError(403, "You are not authorized to cancel this appointment");
    }

    // Check if appointment can be cancelled
    if (appointment.status === 'CANCELLED') {
      throw new ApiError(400, "Appointment is already cancelled");
    }

    if (appointment.status === 'COMPLETED') {
      throw new ApiError(400, "Cannot cancel a completed appointment");
    }

    // Cancel the appointment
    const cancelledAppointment = await prisma.doctorAppointment.update({
      where: { id: appointmentId },
      data: {
        status: 'CANCELLED',
        notes: reason ? `${appointment.notes || ''}\nCancellation reason: ${reason}` : appointment.notes
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            avatar: true
          }
        }
      }
    });

    return cancelledAppointment;
  }

  /**
   * Complete an appointment
   * @param {string} doctorId - The ID of the doctor
   * @param {string} appointmentId - The ID of the appointment
   * @param {Object} completionData - Data related to appointment completion
   * @returns {Promise<Object>} - The completed appointment
   */
  async completeAppointment(doctorId, appointmentId, completionData) {
    const { notes, diagnosis, prescription } = completionData;

    // Check if doctor exists
    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId }
    });

    if (!doctor) {
      throw new ApiError(404, "Doctor profile not found");
    }

    // Check if appointment exists and belongs to the doctor
    const appointment = await prisma.doctorAppointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) {
      throw new ApiError(404, "Appointment not found");
    }

    if (appointment.doctorId !== doctor.id) {
      throw new ApiError(403, "You are not authorized to complete this appointment");
    }

    // Check if appointment can be completed
    if (appointment.status === 'COMPLETED') {
      throw new ApiError(400, "Appointment is already completed");
    }

    if (appointment.status === 'CANCELLED') {
      throw new ApiError(400, "Cannot complete a cancelled appointment");
    }

    // Complete the appointment
    const completedAppointment = await prisma.doctorAppointment.update({
      where: { id: appointmentId },
      data: {
        status: 'COMPLETED',
        notes: notes ? `${appointment.notes || ''}\nCompletion notes: ${notes}` : appointment.notes,
        diagnosis,
        prescription
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            avatar: true
          }
        }
      }
    });

    return completedAppointment;
  }

  /**
   * Reschedule an appointment
   * @param {string} doctorId - The ID of the doctor
   * @param {string} appointmentId - The ID of the appointment
   * @param {Object} rescheduleData - The new appointment date and time
   * @returns {Promise<Object>} - The rescheduled appointment
   */
  async rescheduleAppointment(doctorId, appointmentId, rescheduleData) {
    const { appointmentDate, timeSlot, reason } = rescheduleData;

    // Check if doctor exists
    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId }
    });

    if (!doctor) {
      throw new ApiError(404, "Doctor profile not found");
    }

    // Check if appointment exists and belongs to the doctor
    const appointment = await prisma.doctorAppointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) {
      throw new ApiError(404, "Appointment not found");
    }

    if (appointment.doctorId !== doctor.id) {
      throw new ApiError(403, "You are not authorized to reschedule this appointment");
    }

    // Check if appointment can be rescheduled
    if (appointment.status === 'COMPLETED') {
      throw new ApiError(400, "Cannot reschedule a completed appointment");
    }

    if (appointment.status === 'CANCELLED') {
      throw new ApiError(400, "Cannot reschedule a cancelled appointment");
    }

    // Check if the new time slot is available
    const isSlotAvailable = await this.checkSlotAvailability(
      doctor.id,
      appointmentDate,
      timeSlot,
      appointmentId
    );

    if (!isSlotAvailable) {
      throw new ApiError(400, "The selected time slot is not available");
    }

    // Reschedule the appointment
    const rescheduledAppointment = await prisma.doctorAppointment.update({
      where: { id: appointmentId },
      data: {
        appointmentDate,
        timeSlot,
        notes: reason ? `${appointment.notes || ''}\nRescheduled: ${reason}` : appointment.notes
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            avatar: true
          }
        }
      }
    });

    return rescheduledAppointment;
  }

  /**
   * Get appointment statistics
   * @param {string} doctorId - The ID of the doctor
   * @param {Object} query - Query parameters for filtering
   * @returns {Promise<Object>} - Appointment statistics
   */
  async getAppointmentStatistics(doctorId, query = {}) {
    const { startDate, endDate } = query;

    // Check if doctor exists
    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId }
    });

    if (!doctor) {
      throw new ApiError(404, "Doctor profile not found");
    }

    // Build filter conditions
    const where = {
      doctorId: doctor.id,
      ...(startDate && endDate && {
        appointmentDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    // Get statistics
    const [
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
      upcomingAppointments,
      totalRevenue
    ] = await Promise.all([
      prisma.doctorAppointment.count({ where }),
      prisma.doctorAppointment.count({
        where: { ...where, status: 'COMPLETED' }
      }),
      prisma.doctorAppointment.count({
        where: { ...where, status: 'CANCELLED' }
      }),
      prisma.doctorAppointment.count({
        where: {
          ...where,
          status: 'SCHEDULED',
          appointmentDate: { gte: new Date() }
        }
      }),
      prisma.doctorAppointment.aggregate({
        where: { ...where, status: 'COMPLETED' },
        _sum: { amount: true }
      })
    ]);

    // Get appointments by status
    const appointmentsByStatus = await prisma.doctorAppointment.groupBy({
      by: ['status'],
      where,
      _count: true
    });

    // Get appointments by type
    const appointmentsByType = await prisma.doctorAppointment.groupBy({
      by: ['type'],
      where,
      _count: true
    });

    return {
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
      upcomingAppointments,
      totalRevenue: totalRevenue._sum.amount || 0,
      completionRate: totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0,
      cancellationRate: totalAppointments > 0 ? (cancelledAppointments / totalAppointments) * 100 : 0,
      appointmentsByStatus,
      appointmentsByType
    };
  }

  /**
   * Get available time slots
   * @param {string} doctorId - The ID of the doctor
   * @param {Object} query - Query parameters for filtering
   * @returns {Promise<Array>} - Available time slots
   */
  async getAvailableSlots(doctorId, query = {}) {
    const { date } = query;

    // Check if doctor exists
    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId }
    });

    if (!doctor) {
      throw new ApiError(404, "Doctor profile not found");
    }

    // Get doctor's available time slots
    const availableSlots = doctor.timeSlots || [];

    if (!date || availableSlots.length === 0) {
      return availableSlots;
    }

    // Get booked appointments for the specified date
    const bookedAppointments = await prisma.doctorAppointment.findMany({
      where: {
        doctorId: doctor.id,
        appointmentDate: new Date(date),
        status: { not: 'CANCELLED' }
      },
      select: {
        timeSlot: true
      }
    });

    // Filter out booked slots
    const bookedSlots = bookedAppointments.map(app => app.timeSlot);
    const availableTimeSlots = availableSlots.filter(slot => !bookedSlots.includes(slot));

    return availableTimeSlots;
  }

  /**
   * Get appointment history
   * @param {string} doctorId - The ID of the doctor
   * @param {Object} query - Query parameters for filtering and pagination
   * @returns {Promise<Object>} - Appointment history with pagination info
   */
  async getAppointmentHistory(doctorId, query = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate
    } = query;
    const skip = (page - 1) * limit;

    // Check if doctor exists
    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId }
    });

    if (!doctor) {
      throw new ApiError(404, "Doctor profile not found");
    }

    // Build filter conditions
    const where = {
      doctorId: doctor.id,
      ...(status && { status }),
      ...(startDate && endDate && {
        appointmentDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    // Get appointment history with pagination
    const [appointments, total] = await Promise.all([
      prisma.doctorAppointment.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
              avatar: true
            }
          }
        },
        orderBy: {
          appointmentDate: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.doctorAppointment.count({ where })
    ]);

    return {
      appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get upcoming appointments
   * @param {string} doctorId - The ID of the doctor
   * @param {Object} query - Query parameters for filtering and pagination
   * @returns {Promise<Object>} - Upcoming appointments with pagination info
   */
  async getUpcomingAppointments(doctorId, query = {}) {
    const {
      page = 1,
      limit = 10
    } = query;
    const skip = (page - 1) * limit;

    // Check if doctor exists
    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId }
    });

    if (!doctor) {
      throw new ApiError(404, "Doctor profile not found");
    }

    // Get upcoming appointments
    const where = {
      doctorId: doctor.id,
      status: 'SCHEDULED',
      appointmentDate: { gte: new Date() }
    };

    const [appointments, total] = await Promise.all([
      prisma.doctorAppointment.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
              avatar: true
            }
          }
        },
        orderBy: {
          appointmentDate: 'asc'
        },
        skip,
        take: limit
      }),
      prisma.doctorAppointment.count({ where })
    ]);

    return {
      appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get past appointments
   * @param {string} doctorId - The ID of the doctor
   * @param {Object} query - Query parameters for filtering and pagination
   * @returns {Promise<Object>} - Past appointments with pagination info
   */
  async getPastAppointments(doctorId, query = {}) {
    const {
      page = 1,
      limit = 10,
      status
    } = query;
    const skip = (page - 1) * limit;

    // Check if doctor exists
    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId }
    });

    if (!doctor) {
      throw new ApiError(404, "Doctor profile not found");
    }

    // Get past appointments
    const where = {
      doctorId: doctor.id,
      appointmentDate: { lt: new Date() },
      ...(status && { status })
    };

    const [appointments, total] = await Promise.all([
      prisma.doctorAppointment.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
              avatar: true
            }
          }
        },
        orderBy: {
          appointmentDate: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.doctorAppointment.count({ where })
    ]);

    return {
      appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get appointments by date range
   * @param {string} doctorId - The ID of the doctor
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {Promise<Array>} - Appointments within the date range
   */
  async getAppointmentsByDateRange(doctorId, startDate, endDate) {
    // Check if doctor exists
    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId }
    });

    if (!doctor) {
      throw new ApiError(404, "Doctor profile not found");
    }

    // Get appointments by date range
    const appointments = await prisma.doctorAppointment.findMany({
      where: {
        doctorId: doctor.id,
        appointmentDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            avatar: true
          }
        }
      },
      orderBy: {
        appointmentDate: 'asc'
      }
    });

    return appointments;
  }

  /**
   * Get appointments by patient
   * @param {string} doctorId - The ID of the doctor
   * @param {string} patientId - The ID of the patient
   * @returns {Promise<Array>} - Appointments for the patient
   */
  async getAppointmentsByPatient(doctorId, patientId) {
    // Check if doctor exists
    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId }
    });

    if (!doctor) {
      throw new ApiError(404, "Doctor profile not found");
    }

    // Check if patient exists
    const patient = await prisma.user.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      throw new ApiError(404, "Patient not found");
    }

    // Get appointments by patient
    const appointments = await prisma.doctorAppointment.findMany({
      where: {
        doctorId: doctor.id,
        patientId
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            avatar: true
          }
        }
      },
      orderBy: {
        appointmentDate: 'desc'
      }
    });

    return appointments;
  }

  /**
   * Get appointment notes
   * @param {string} doctorId - The ID of the doctor
   * @param {string} appointmentId - The ID of the appointment
   * @returns {Promise<Object>} - The appointment notes
   */
  async getAppointmentNotes(doctorId, appointmentId) {
    // Check if doctor exists
    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId }
    });

    if (!doctor) {
      throw new ApiError(404, "Doctor profile not found");
    }

    // Check if appointment exists and belongs to the doctor
    const appointment = await prisma.doctorAppointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) {
      throw new ApiError(404, "Appointment not found");
    }

    if (appointment.doctorId !== doctor.id) {
      throw new ApiError(403, "You are not authorized to access this appointment");
    }

    return {
      notes: appointment.notes,
      diagnosis: appointment.diagnosis,
      prescription: appointment.prescription
    };
  }

  /**
   * Add appointment notes
   * @param {string} doctorId - The ID of the doctor
   * @param {string} appointmentId - The ID of the appointment
   * @param {Object} notesData - The notes data
   * @returns {Promise<Object>} - The updated appointment notes
   */
  async addAppointmentNotes(doctorId, appointmentId, notesData) {
    const { notes, diagnosis, prescription } = notesData;

    // Check if doctor exists
    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId }
    });

    if (!doctor) {
      throw new ApiError(404, "Doctor profile not found");
    }

    // Check if appointment exists and belongs to the doctor
    const appointment = await prisma.doctorAppointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) {
      throw new ApiError(404, "Appointment not found");
    }

    if (appointment.doctorId !== doctor.id) {
      throw new ApiError(403, "You are not authorized to update this appointment");
    }

    // Update the appointment notes
    const updatedAppointment = await prisma.doctorAppointment.update({
      where: { id: appointmentId },
      data: {
        ...(notes && { notes: `${appointment.notes || ''}\n${notes}` }),
        ...(diagnosis && { diagnosis }),
        ...(prescription && { prescription })
      }
    });

    return {
      notes: updatedAppointment.notes,
      diagnosis: updatedAppointment.diagnosis,
      prescription: updatedAppointment.prescription
    };
  }

  /**
   * Check if a time slot is available
   * @param {string} doctorId - The ID of the doctor
   * @param {Date} appointmentDate - The appointment date
   * @param {string} timeSlot - The time slot
   * @param {string} [excludeAppointmentId] - Appointment ID to exclude from the check
   * @returns {Promise<boolean>} - Whether the slot is available
   */
  async checkSlotAvailability(doctorId, appointmentDate, timeSlot, excludeAppointmentId = null) {
    // Get doctor's available time slots
    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: doctorId }
    });

    if (!doctor || !doctor.timeSlots || !doctor.timeSlots.includes(timeSlot)) {
      return false;
    }

    // Check if the slot is already booked
    const where = {
      doctorId,
      appointmentDate,
      timeSlot,
      status: { not: 'CANCELLED' }
    };

    if (excludeAppointmentId) {
      where.id = { not: excludeAppointmentId };
    }

    const existingAppointment = await prisma.doctorAppointment.findFirst({ where });

    return !existingAppointment;
  }
}

export const doctorAppointmentService = new DoctorAppointmentService(); 