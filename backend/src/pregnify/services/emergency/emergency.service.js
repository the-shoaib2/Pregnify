import prisma from '../../../utils/database/prisma.js';
import { ApiError } from '../../../utils/error/api.error.js';

class EmergencyService {
  // Emergency Request Management
  async createEmergencyRequest(userId, emergencyData) {
    const { type, location, description, severity } = emergencyData;

    const emergencyRequest = await prisma.emergencyRequest.create({
      data: {
        userId,
        type,
        location: JSON.stringify(location),
        description,
        severity,
        status: 'PENDING'
      }
    });

    // Notify nearby services based on type
    if (type === 'AMBULANCE') {
      await this.notifyNearbyAmbulances(location);
    } else if (type === 'HOSPITAL') {
      await this.notifyNearbyHospitals(location);
    }

    return emergencyRequest;
  }

  async getEmergencyRequests(userId) {
    return await prisma.emergencyRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getEmergencyRequest(userId, requestId) {
    const request = await prisma.emergencyRequest.findFirst({
      where: {
        id: requestId,
        userId
      }
    });

    if (!request) {
      throw new ApiError(404, 'Emergency request not found');
    }

    return request;
  }

  async updateEmergencyRequest(userId, requestId, updateData) {
    const request = await this.getEmergencyRequest(userId, requestId);

    return await prisma.emergencyRequest.update({
      where: { id: requestId },
      data: updateData
    });
  }

  async cancelEmergencyRequest(userId, requestId) {
    const request = await this.getEmergencyRequest(userId, requestId);

    return await prisma.emergencyRequest.update({
      where: { id: requestId },
      data: { status: 'CANCELLED' }
    });
  }

  // Nearby Services
  async getNearbyAmbulances(latitude, longitude, radius = 5) {
    // In a real implementation, this would use a geospatial query
    // For now, we'll return all available ambulances
    return await prisma.ambulance.findMany({
      where: {
        status: 'AVAILABLE'
      }
    });
  }

  async getNearbyHospitals(latitude, longitude, radius = 5) {
    // In a real implementation, this would use a geospatial query
    // For now, we'll return all hospitals
    return await prisma.hospital.findMany({
      where: {
        isActive: true
      }
    });
  }

  // Emergency Contacts
  async getEmergencyContacts(userId) {
    return await prisma.emergencyContact.findMany({
      where: { userId }
    });
  }

  async addEmergencyContact(userId, contactData) {
    const { name, relation, phone, isPrimary } = contactData;

    return await prisma.emergencyContact.create({
      data: {
        userId,
        name,
        relation,
        phone,
        isPrimary
      }
    });
  }

  async updateEmergencyContact(userId, contactId, updateData) {
    const contact = await prisma.emergencyContact.findFirst({
      where: {
        id: contactId,
        userId
      }
    });

    if (!contact) {
      throw new ApiError(404, 'Emergency contact not found');
    }

    return await prisma.emergencyContact.update({
      where: { id: contactId },
      data: updateData
    });
  }

  async deleteEmergencyContact(userId, contactId) {
    const contact = await prisma.emergencyContact.findFirst({
      where: {
        id: contactId,
        userId
      }
    });

    if (!contact) {
      throw new ApiError(404, 'Emergency contact not found');
    }

    await prisma.emergencyContact.delete({
      where: { id: contactId }
    });
  }

  // Helper Methods
  async notifyNearbyAmbulances(location) {
    // Implement notification logic (e.g., push notifications, SMS)
    console.log('Notifying nearby ambulances at location:', location);
  }

  async notifyNearbyHospitals(location) {
    // Implement notification logic (e.g., push notifications, SMS)
    console.log('Notifying nearby hospitals at location:', location);
  }
}

export const emergencyService = new EmergencyService(); 