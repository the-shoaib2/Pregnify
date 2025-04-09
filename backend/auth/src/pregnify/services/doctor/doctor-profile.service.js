import { PrismaClient } from '@prisma/client';
import { ApiError } from '../../utils/ApiError.js';

const prisma = new PrismaClient();

class DoctorProfileService {
  // Create a new doctor profile
  async createDoctorProfile(data) {
    const {
      userId,
      speciality,
      experience,
      availableDays,
      timeSlots,
      consultationFee,
      documents = []
    } = data;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Check if doctor profile already exists for this user
    const existingProfile = await prisma.doctorProfile.findUnique({
      where: { userId }
    });

    if (existingProfile) {
      throw new ApiError(400, "Doctor profile already exists for this user");
    }

    // Create doctor profile
    const doctorProfile = await prisma.doctorProfile.create({
      data: {
        userId,
        speciality,
        experience,
        availableDays,
        timeSlots,
        consultationFee,
        documents: {
          connect: documents.map(id => ({ id }))
        }
      },
      include: {
        documents: true
      }
    });

    return doctorProfile;
  }

  // Get all doctor profiles with filtering and pagination
  async getAllDoctorProfiles(filters = {}, pagination = {}) {
    const {
      speciality,
      minExperience,
      minRating,
      isVerified,
      isBlocked,
      search,
      page = 1,
      limit = 10
    } = filters;

    const skip = (page - 1) * limit;

    // Build filter conditions
    const where = {};
    
    if (speciality) {
      where.speciality = speciality;
    }
    
    if (minExperience !== undefined) {
      where.experience = {
        gte: parseInt(minExperience)
      };
    }
    
    if (minRating !== undefined) {
      where.rating = {
        gte: parseFloat(minRating)
      };
    }
    
    if (isVerified !== undefined) {
      where.isVerified = isVerified === 'true';
    }
    
    if (isBlocked !== undefined) {
      where.isBlocked = isBlocked === 'true';
    }
    
    if (search) {
      where.user = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    // Get total count for pagination
    const total = await prisma.doctorProfile.count({ where });

    // Get doctor profiles with pagination
    const doctorProfiles = await prisma.doctorProfile.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            avatar: true
          }
        },
        documents: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      doctorProfiles,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Get a single doctor profile by ID
  async getDoctorProfileById(id) {
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            avatar: true
          }
        },
        documents: true,
        appointments: true,
        reviews: true
      }
    });

    if (!doctorProfile) {
      throw new ApiError(404, "Doctor profile not found");
    }

    return doctorProfile;
  }

  // Get a doctor profile by user ID
  async getDoctorProfileByUserId(userId) {
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            avatar: true
          }
        },
        documents: true,
        appointments: true,
        reviews: true
      }
    });

    if (!doctorProfile) {
      throw new ApiError(404, "Doctor profile not found");
    }

    return doctorProfile;
  }

  // Update a doctor profile
  async updateDoctorProfile(id, data) {
    const {
      speciality,
      experience,
      availableDays,
      timeSlots,
      consultationFee,
      documents = []
    } = data;

    // Check if doctor profile exists
    const existingProfile = await prisma.doctorProfile.findUnique({
      where: { id }
    });

    if (!existingProfile) {
      throw new ApiError(404, "Doctor profile not found");
    }

    // Update doctor profile
    const updatedProfile = await prisma.doctorProfile.update({
      where: { id },
      data: {
        speciality,
        experience,
        availableDays,
        timeSlots,
        consultationFee,
        documents: {
          set: documents.map(id => ({ id }))
        }
      },
      include: {
        documents: true
      }
    });

    return updatedProfile;
  }

  // Delete a doctor profile
  async deleteDoctorProfile(id) {
    // Check if doctor profile exists
    const existingProfile = await prisma.doctorProfile.findUnique({
      where: { id },
      include: {
        appointments: true
      }
    });

    if (!existingProfile) {
      throw new ApiError(404, "Doctor profile not found");
    }

    // Check if doctor has appointments
    if (existingProfile.appointments.length > 0) {
      throw new ApiError(400, "Cannot delete doctor profile with existing appointments");
    }

    // Delete doctor profile
    await prisma.doctorProfile.delete({
      where: { id }
    });

    return true;
  }

  // Toggle doctor profile verification status
  async toggleVerification(id, isVerified) {
    // Check if doctor profile exists
    const existingProfile = await prisma.doctorProfile.findUnique({
      where: { id }
    });

    if (!existingProfile) {
      throw new ApiError(404, "Doctor profile not found");
    }

    // Update verification status
    const updatedProfile = await prisma.doctorProfile.update({
      where: { id },
      data: { isVerified }
    });

    return updatedProfile;
  }

  // Toggle doctor profile blocked status
  async toggleBlocked(id, isBlocked) {
    // Check if doctor profile exists
    const existingProfile = await prisma.doctorProfile.findUnique({
      where: { id }
    });

    if (!existingProfile) {
      throw new ApiError(404, "Doctor profile not found");
    }

    // Update blocked status
    const updatedProfile = await prisma.doctorProfile.update({
      where: { id },
      data: { isBlocked }
    });

    return updatedProfile;
  }

  // Update doctor profile rating
  async updateRating(id, rating) {
    // Check if doctor profile exists
    const existingProfile = await prisma.doctorProfile.findUnique({
      where: { id }
    });

    if (!existingProfile) {
      throw new ApiError(404, "Doctor profile not found");
    }

    // Calculate new rating
    const newRating = (existingProfile.rating * existingProfile.totalReviews + rating) / (existingProfile.totalReviews + 1);

    // Update rating
    const updatedProfile = await prisma.doctorProfile.update({
      where: { id },
      data: {
        rating: newRating,
        totalReviews: existingProfile.totalReviews + 1
      }
    });

    return updatedProfile;
  }

  // Get available time slots for a doctor
  async getAvailableTimeSlots(id, date) {
    // Check if doctor profile exists
    const existingProfile = await prisma.doctorProfile.findUnique({
      where: { id },
      include: {
        appointments: {
          where: {
            appointmentDate: {
              gte: new Date(date),
              lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1))
            }
          }
        }
      }
    });

    if (!existingProfile) {
      throw new ApiError(404, "Doctor profile not found");
    }

    // Get day of week (0-6, where 0 is Sunday)
    const dayOfWeek = new Date(date).getDay();

    // Check if doctor is available on this day
    if (!existingProfile.availableDays.includes(dayOfWeek)) {
      throw new ApiError(400, "Doctor is not available on this day");
    }

    // Get booked time slots
    const bookedTimeSlots = existingProfile.appointments.map(appointment => appointment.timeSlot);

    // Filter out booked time slots
    const availableTimeSlots = existingProfile.timeSlots.filter(timeSlot => !bookedTimeSlots.includes(timeSlot));

    return availableTimeSlots;
  }
}

export const doctorProfileService = new DoctorProfileService(); 