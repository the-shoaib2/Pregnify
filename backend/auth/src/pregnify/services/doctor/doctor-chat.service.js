import { PrismaClient } from '@prisma/client';
import { ApiError } from '../../utils/ApiError.js';

const prisma = new PrismaClient();

class DoctorChatService {
  /**
   * Send a message to a patient
   * @param {string} doctorId - The ID of the doctor sending the message
   * @param {Object} messageData - The message data
   * @returns {Promise<Object>} - The created message
   */
  async sendMessage(doctorId, messageData) {
    const { patientId, message } = messageData;

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

    // Create the message
    const newMessage = await prisma.doctorChat.create({
      data: {
        doctorId: doctor.id,
        patientId,
        message,
        isRead: false
      }
    });

    return newMessage;
  }

  /**
   * Get all chat conversations for a doctor
   * @param {string} doctorId - The ID of the doctor
   * @param {Object} query - Query parameters for filtering and pagination
   * @returns {Promise<Array>} - List of conversations
   */
  async getConversations(doctorId, query = {}) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    // Check if doctor exists
    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId }
    });

    if (!doctor) {
      throw new ApiError(404, "Doctor profile not found");
    }

    // Get unique patients the doctor has chatted with
    const conversations = await prisma.doctorChat.findMany({
      where: {
        doctorId: doctor.id,
        ...(search && {
          patient: {
            OR: [
              { firstName: { contains: search } },
              { lastName: { contains: search } },
              { email: { contains: search } }
            ]
          }
        })
      },
      select: {
        patientId: true,
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        _count: {
          select: {
            id: true
          }
        },
        _max: {
          select: {
            createdAt: true
          }
        }
      },
      distinct: ['patientId'],
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format the conversations
    const formattedConversations = conversations.map(conv => ({
      patientId: conv.patientId,
      patient: conv.patient,
      messageCount: conv._count.id,
      lastMessageAt: conv._max.createdAt
    }));

    return formattedConversations;
  }

  /**
   * Get a specific chat conversation with a patient
   * @param {string} doctorId - The ID of the doctor
   * @param {string} patientId - The ID of the patient
   * @returns {Promise<Object>} - The conversation details
   */
  async getConversation(doctorId, patientId) {
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

    // Get conversation details
    const conversation = await prisma.doctorChat.findFirst({
      where: {
        doctorId: doctor.id,
        patientId
      },
      select: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        _count: {
          select: {
            id: true
          }
        },
        _max: {
          select: {
            createdAt: true
          }
        }
      }
    });

    if (!conversation) {
      throw new ApiError(404, "Conversation not found");
    }

    return {
      patientId,
      patient: conversation.patient,
      messageCount: conversation._count.id,
      lastMessageAt: conversation._max.createdAt
    };
  }

  /**
   * Get chat messages for a specific conversation
   * @param {string} doctorId - The ID of the doctor
   * @param {string} patientId - The ID of the patient
   * @param {Object} query - Query parameters for filtering and pagination
   * @returns {Promise<Array>} - List of messages
   */
  async getMessages(doctorId, patientId, query = {}) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    // Check if doctor exists
    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId }
    });

    if (!doctor) {
      throw new ApiError(404, "Doctor profile not found");
    }

    // Get messages
    const messages = await prisma.doctorChat.findMany({
      where: {
        doctorId: doctor.id,
        patientId
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    return messages;
  }

  /**
   * Mark messages as read
   * @param {string} doctorId - The ID of the doctor
   * @param {string} patientId - The ID of the patient
   * @returns {Promise<Object>} - The result of the operation
   */
  async markMessagesAsRead(doctorId, patientId) {
    // Check if doctor exists
    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId }
    });

    if (!doctor) {
      throw new ApiError(404, "Doctor profile not found");
    }

    // Update messages
    const result = await prisma.doctorChat.updateMany({
      where: {
        doctorId: doctor.id,
        patientId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    return {
      updatedCount: result.count
    };
  }

  /**
   * Delete a message
   * @param {string} doctorId - The ID of the doctor
   * @param {string} messageId - The ID of the message to delete
   * @returns {Promise<void>}
   */
  async deleteMessage(doctorId, messageId) {
    // Check if doctor exists
    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId }
    });

    if (!doctor) {
      throw new ApiError(404, "Doctor profile not found");
    }

    // Check if message exists and belongs to the doctor
    const message = await prisma.doctorChat.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      throw new ApiError(404, "Message not found");
    }

    if (message.doctorId !== doctor.id) {
      throw new ApiError(403, "You are not authorized to delete this message");
    }

    // Delete the message
    await prisma.doctorChat.delete({
      where: { id: messageId }
    });
  }

  /**
   * Get unread message count
   * @param {string} doctorId - The ID of the doctor
   * @returns {Promise<number>} - The count of unread messages
   */
  async getUnreadCount(doctorId) {
    // Check if doctor exists
    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId }
    });

    if (!doctor) {
      throw new ApiError(404, "Doctor profile not found");
    }

    // Count unread messages
    const count = await prisma.doctorChat.count({
      where: {
        doctorId: doctor.id,
        isRead: false
      }
    });

    return count;
  }
}

export const doctorChatService = new DoctorChatService(); 