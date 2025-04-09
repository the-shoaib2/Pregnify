import { prisma } from '../../../utils/database/prisma.js';
import { AppError } from '../../../utils/error/app.error.js';

class DoctorCallService {
  async initiateCall(userId, { doctorId, patientId, type, notes }) {
    // Validate doctor and patient exist
    const [doctor, patient] = await Promise.all([
      prisma.doctor.findUnique({ where: { id: doctorId } }),
      prisma.patient.findUnique({ where: { id: patientId } })
    ]);

    if (!doctor) {
      throw new AppError('Doctor not found', 404);
    }
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    // Check if there's an active call between doctor and patient
    const activeCall = await prisma.doctorCall.findFirst({
      where: {
        doctorId,
        patientId,
        status: 'ACTIVE'
      }
    });

    if (activeCall) {
      throw new AppError('There is already an active call between doctor and patient', 400);
    }

    // Create new call
    const call = await prisma.doctorCall.create({
      data: {
        doctorId,
        patientId,
        type,
        notes,
        status: 'PENDING',
        initiatedBy: userId
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true
          }
        },
        patient: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return call;
  }

  async acceptCall(userId, callId) {
    const call = await prisma.doctorCall.findUnique({
      where: { id: callId },
      include: {
        doctor: true,
        patient: true
      }
    });

    if (!call) {
      throw new AppError('Call not found', 404);
    }

    if (call.status !== 'PENDING') {
      throw new AppError('Call is not in pending status', 400);
    }

    // Verify user is either doctor or patient
    if (call.doctorId !== userId && call.patientId !== userId) {
      throw new AppError('Unauthorized to accept this call', 403);
    }

    const updatedCall = await prisma.doctorCall.update({
      where: { id: callId },
      data: {
        status: 'ACTIVE',
        acceptedAt: new Date()
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true
          }
        },
        patient: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return updatedCall;
  }

  async rejectCall(userId, callId, reason) {
    const call = await prisma.doctorCall.findUnique({
      where: { id: callId },
      include: {
        doctor: true,
        patient: true
      }
    });

    if (!call) {
      throw new AppError('Call not found', 404);
    }

    if (call.status !== 'PENDING') {
      throw new AppError('Call is not in pending status', 400);
    }

    // Verify user is either doctor or patient
    if (call.doctorId !== userId && call.patientId !== userId) {
      throw new AppError('Unauthorized to reject this call', 403);
    }

    const updatedCall = await prisma.doctorCall.update({
      where: { id: callId },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectionReason: reason
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true
          }
        },
        patient: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return updatedCall;
  }

  async endCall(userId, callId, reason) {
    const call = await prisma.doctorCall.findUnique({
      where: { id: callId },
      include: {
        doctor: true,
        patient: true
      }
    });

    if (!call) {
      throw new AppError('Call not found', 404);
    }

    if (call.status !== 'ACTIVE') {
      throw new AppError('Call is not active', 400);
    }

    // Verify user is either doctor or patient
    if (call.doctorId !== userId && call.patientId !== userId) {
      throw new AppError('Unauthorized to end this call', 403);
    }

    const updatedCall = await prisma.doctorCall.update({
      where: { id: callId },
      data: {
        status: 'ENDED',
        endedAt: new Date(),
        endReason: reason
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true
          }
        },
        patient: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return updatedCall;
  }

  async getCallHistory(userId, { status, type, startDate, endDate }) {
    const where = {
      OR: [
        { doctorId: userId },
        { patientId: userId }
      ]
    };

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const calls = await prisma.doctorCall.findMany({
      where,
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true
          }
        },
        patient: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return calls;
  }

  async getCallDetails(userId, callId) {
    const call = await prisma.doctorCall.findUnique({
      where: { id: callId },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true
          }
        },
        patient: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!call) {
      throw new AppError('Call not found', 404);
    }

    // Verify user is either doctor or patient
    if (call.doctorId !== userId && call.patientId !== userId) {
      throw new AppError('Unauthorized to view this call', 403);
    }

    return call;
  }

  async getActiveCalls(userId) {
    const calls = await prisma.doctorCall.findMany({
      where: {
        OR: [
          { doctorId: userId },
          { patientId: userId }
        ],
        status: 'ACTIVE'
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true
          }
        },
        patient: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return calls;
  }

  async getCallStats(userId, { startDate, endDate }) {
    const where = {
      OR: [
        { doctorId: userId },
        { patientId: userId }
      ]
    };

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const stats = await prisma.doctorCall.groupBy({
      by: ['status', 'type'],
      where,
      _count: true,
      _avg: {
        duration: true
      }
    });

    return stats;
  }

  async updateCallStatus(userId, callId, { status, notes }) {
    const call = await prisma.doctorCall.findUnique({
      where: { id: callId }
    });

    if (!call) {
      throw new AppError('Call not found', 404);
    }

    // Verify user is either doctor or patient
    if (call.doctorId !== userId && call.patientId !== userId) {
      throw new AppError('Unauthorized to update this call', 403);
    }

    const updatedCall = await prisma.doctorCall.update({
      where: { id: callId },
      data: {
        status,
        notes
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true
          }
        },
        patient: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return updatedCall;
  }

  async getCallParticipants(userId, callId) {
    const call = await prisma.doctorCall.findUnique({
      where: { id: callId },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true
          }
        },
        patient: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!call) {
      throw new AppError('Call not found', 404);
    }

    // Verify user is either doctor or patient
    if (call.doctorId !== userId && call.patientId !== userId) {
      throw new AppError('Unauthorized to view call participants', 403);
    }

    return {
      doctor: call.doctor,
      patient: call.patient
    };
  }
}

export const doctorCallService = new DoctorCallService(); 