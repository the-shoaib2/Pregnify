import { PrismaClient } from '@prisma/client';
import { ApiError } from '../../utils/ApiError.js';

const prisma = new PrismaClient();

class AmbulanceService {
  /**
   * Get all ambulances
   * @param {Object} query - Query parameters for filtering and pagination
   * @returns {Promise<Object>} - List of ambulances with pagination info
   */
  async getAllAmbulances(query = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      isActive,
      search
    } = query;
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where = {
      ...(status && { status }),
      ...(type && { type }),
      ...(isActive !== undefined && { isActive: isActive === 'true' }),
      ...(search && {
        OR: [
          { vehicleNumber: { contains: search } },
          { driver: { name: { contains: search } } }
        ]
      })
    };

    // Get ambulances with pagination
    const [ambulances, total] = await Promise.all([
      prisma.ambulance.findMany({
        where,
        include: {
          driver: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
              licenseNumber: true,
              experience: true,
              rating: true,
              totalTrips: true,
              isVerified: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.ambulance.count({ where })
    ]);

    return {
      ambulances,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get ambulance by ID
   * @param {string} ambulanceId - The ID of the ambulance
   * @returns {Promise<Object>} - The ambulance details
   */
  async getAmbulanceById(ambulanceId) {
    const ambulance = await prisma.ambulance.findUnique({
      where: { id: ambulanceId },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            licenseNumber: true,
            experience: true,
            rating: true,
            totalTrips: true,
            isVerified: true
          }
        }
      }
    });

    if (!ambulance) {
      throw new ApiError(404, "Ambulance not found");
    }

    return ambulance;
  }

  /**
   * Get ambulance status
   * @param {string} ambulanceId - The ID of the ambulance
   * @returns {Promise<Object>} - The ambulance status
   */
  async getAmbulanceStatus(ambulanceId) {
    const ambulance = await prisma.ambulance.findUnique({
      where: { id: ambulanceId },
      select: {
        id: true,
        vehicleNumber: true,
        status: true,
        isActive: true
      }
    });

    if (!ambulance) {
      throw new ApiError(404, "Ambulance not found");
    }

    return {
      id: ambulance.id,
      vehicleNumber: ambulance.vehicleNumber,
      status: ambulance.status,
      isActive: ambulance.isActive
    };
  }

  /**
   * Get ambulance location
   * @param {string} ambulanceId - The ID of the ambulance
   * @returns {Promise<Object>} - The ambulance location
   */
  async getAmbulanceLocation(ambulanceId) {
    const ambulance = await prisma.ambulance.findUnique({
      where: { id: ambulanceId },
      select: {
        id: true,
        vehicleNumber: true,
        location: true
      }
    });

    if (!ambulance) {
      throw new ApiError(404, "Ambulance not found");
    }

    return {
      id: ambulance.id,
      vehicleNumber: ambulance.vehicleNumber,
      location: ambulance.location
    };
  }

  /**
   * Get ambulance type
   * @param {string} ambulanceId - The ID of the ambulance
   * @returns {Promise<Object>} - The ambulance type
   */
  async getAmbulanceType(ambulanceId) {
    const ambulance = await prisma.ambulance.findUnique({
      where: { id: ambulanceId },
      select: {
        id: true,
        vehicleNumber: true,
        type: true
      }
    });

    if (!ambulance) {
      throw new ApiError(404, "Ambulance not found");
    }

    return {
      id: ambulance.id,
      vehicleNumber: ambulance.vehicleNumber,
      type: ambulance.type
    };
  }

  /**
   * Get ambulance equipment
   * @param {string} ambulanceId - The ID of the ambulance
   * @returns {Promise<Object>} - The ambulance equipment
   */
  async getAmbulanceEquipment(ambulanceId) {
    // This is a placeholder as the schema doesn't have equipment field
    // In a real application, you would have an equipment model or field
    const ambulance = await prisma.ambulance.findUnique({
      where: { id: ambulanceId },
      select: {
        id: true,
        vehicleNumber: true,
        type: true
      }
    });

    if (!ambulance) {
      throw new ApiError(404, "Ambulance not found");
    }

    // Mock equipment based on ambulance type
    const equipment = {
      BASIC: [
        "Basic First Aid Kit",
        "Oxygen Cylinder",
        "Stretcher",
        "Blood Pressure Monitor",
        "Thermometer"
      ],
      ADVANCED: [
        "Advanced First Aid Kit",
        "Oxygen Cylinder",
        "Stretcher",
        "Blood Pressure Monitor",
        "Thermometer",
        "ECG Machine",
        "Defibrillator",
        "Ventilator"
      ],
      ICU: [
        "ICU Equipment",
        "Oxygen Cylinder",
        "Stretcher",
        "Blood Pressure Monitor",
        "Thermometer",
        "ECG Machine",
        "Defibrillator",
        "Ventilator",
        "ICU Bed",
        "Infusion Pumps",
        "Patient Monitor"
      ]
    };

    return {
      id: ambulance.id,
      vehicleNumber: ambulance.vehicleNumber,
      type: ambulance.type,
      equipment: equipment[ambulance.type] || []
    };
  }

  /**
   * Get ambulance maintenance history
   * @param {string} ambulanceId - The ID of the ambulance
   * @returns {Promise<Object>} - The ambulance maintenance history
   */
  async getAmbulanceMaintenance(ambulanceId) {
    // This is a placeholder as the schema doesn't have maintenance history
    // In a real application, you would have a maintenance model
    const ambulance = await prisma.ambulance.findUnique({
      where: { id: ambulanceId },
      select: {
        id: true,
        vehicleNumber: true,
        type: true,
        status: true
      }
    });

    if (!ambulance) {
      throw new ApiError(404, "Ambulance not found");
    }

    // Mock maintenance history
    const maintenanceHistory = [
      {
        id: "1",
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        type: "ROUTINE",
        description: "Regular maintenance check",
        cost: 500,
        performedBy: "City Auto Service"
      },
      {
        id: "2",
        date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        type: "REPAIR",
        description: "Brake system repair",
        cost: 1200,
        performedBy: "City Auto Service"
      }
    ];

    return {
      id: ambulance.id,
      vehicleNumber: ambulance.vehicleNumber,
      type: ambulance.type,
      status: ambulance.status,
      maintenanceHistory
    };
  }

  /**
   * Get ambulance service area
   * @param {string} ambulanceId - The ID of the ambulance
   * @returns {Promise<Object>} - The ambulance service area
   */
  async getAmbulanceServiceArea(ambulanceId) {
    // This is a placeholder as the schema doesn't have service area
    // In a real application, you would have a service area model or field
    const ambulance = await prisma.ambulance.findUnique({
      where: { id: ambulanceId },
      select: {
        id: true,
        vehicleNumber: true,
        type: true
      }
    });

    if (!ambulance) {
      throw new ApiError(404, "Ambulance not found");
    }

    // Mock service area based on ambulance type
    const serviceAreas = {
      BASIC: {
        radius: 10, // km
        coverage: "Urban areas"
      },
      ADVANCED: {
        radius: 20, // km
        coverage: "Urban and suburban areas"
      },
      ICU: {
        radius: 30, // km
        coverage: "Urban, suburban, and rural areas"
      }
    };

    return {
      id: ambulance.id,
      vehicleNumber: ambulance.vehicleNumber,
      type: ambulance.type,
      serviceArea: serviceAreas[ambulance.type] || serviceAreas.BASIC
    };
  }

  /**
   * Update ambulance status
   * @param {string} ambulanceId - The ID of the ambulance
   * @param {Object} statusData - The status data
   * @returns {Promise<Object>} - The updated ambulance status
   */
  async updateAmbulanceStatus(ambulanceId, statusData) {
    const { status, isActive } = statusData;

    // Check if ambulance exists
    const ambulance = await prisma.ambulance.findUnique({
      where: { id: ambulanceId }
    });

    if (!ambulance) {
      throw new ApiError(404, "Ambulance not found");
    }

    // Update the ambulance status
    const updatedAmbulance = await prisma.ambulance.update({
      where: { id: ambulanceId },
      data: {
        ...(status && { status }),
        ...(isActive !== undefined && { isActive })
      },
      select: {
        id: true,
        vehicleNumber: true,
        status: true,
        isActive: true
      }
    });

    return updatedAmbulance;
  }

  /**
   * Update ambulance location
   * @param {string} ambulanceId - The ID of the ambulance
   * @param {Object} locationData - The location data
   * @returns {Promise<Object>} - The updated ambulance location
   */
  async updateAmbulanceLocation(ambulanceId, locationData) {
    const { latitude, longitude, address } = locationData;

    // Check if ambulance exists
    const ambulance = await prisma.ambulance.findUnique({
      where: { id: ambulanceId }
    });

    if (!ambulance) {
      throw new ApiError(404, "Ambulance not found");
    }

    // Update the ambulance location
    const updatedAmbulance = await prisma.ambulance.update({
      where: { id: ambulanceId },
      data: {
        location: {
          latitude,
          longitude,
          address
        }
      },
      select: {
        id: true,
        vehicleNumber: true,
        location: true
      }
    });

    return updatedAmbulance;
  }

  /**
   * Add maintenance record
   * @param {string} ambulanceId - The ID of the ambulance
   * @param {Object} maintenanceData - The maintenance data
   * @returns {Promise<Object>} - The added maintenance record
   */
  async addMaintenanceRecord(ambulanceId, maintenanceData) {
    // This is a placeholder as the schema doesn't have maintenance records
    // In a real application, you would have a maintenance model
    const { type, description, cost, performedBy, date } = maintenanceData;

    // Check if ambulance exists
    const ambulance = await prisma.ambulance.findUnique({
      where: { id: ambulanceId }
    });

    if (!ambulance) {
      throw new ApiError(404, "Ambulance not found");
    }

    // Mock adding maintenance record
    const maintenanceRecord = {
      id: Date.now().toString(),
      ambulanceId,
      date: date ? new Date(date) : new Date(),
      type,
      description,
      cost,
      performedBy
    };

    // In a real application, you would save this to the database
    // await prisma.maintenanceRecord.create({
    //   data: {
    //     ambulanceId,
    //     date: date ? new Date(date) : new Date(),
    //     type,
    //     description,
    //     cost,
    //     performedBy
    //   }
    // });

    return maintenanceRecord;
  }

  /**
   * Get available ambulances
   * @param {Object} query - Query parameters for filtering and pagination
   * @returns {Promise<Object>} - List of available ambulances with pagination info
   */
  async getAvailableAmbulances(query = {}) {
    const {
      page = 1,
      limit = 10,
      type,
      search
    } = query;
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where = {
      status: 'AVAILABLE',
      isActive: true,
      ...(type && { type }),
      ...(search && {
        OR: [
          { vehicleNumber: { contains: search } },
          { driver: { name: { contains: search } } }
        ]
      })
    };

    // Get available ambulances with pagination
    const [ambulances, total] = await Promise.all([
      prisma.ambulance.findMany({
        where,
        include: {
          driver: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
              licenseNumber: true,
              experience: true,
              rating: true,
              totalTrips: true,
              isVerified: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.ambulance.count({ where })
    ]);

    return {
      ambulances,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get ambulances by type
   * @param {string} type - The ambulance type
   * @param {Object} query - Query parameters for filtering and pagination
   * @returns {Promise<Object>} - List of ambulances with pagination info
   */
  async getAmbulancesByType(type, query = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      isActive,
      search
    } = query;
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where = {
      type,
      ...(status && { status }),
      ...(isActive !== undefined && { isActive: isActive === 'true' }),
      ...(search && {
        OR: [
          { vehicleNumber: { contains: search } },
          { driver: { name: { contains: search } } }
        ]
      })
    };

    // Get ambulances by type with pagination
    const [ambulances, total] = await Promise.all([
      prisma.ambulance.findMany({
        where,
        include: {
          driver: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
              licenseNumber: true,
              experience: true,
              rating: true,
              totalTrips: true,
              isVerified: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.ambulance.count({ where })
    ]);

    return {
      ambulances,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get ambulances in service area
   * @param {Object} query - Query parameters for filtering and pagination
   * @returns {Promise<Object>} - List of ambulances in service area with pagination info
   */
  async getAmbulancesInServiceArea(query = {}) {
    const {
      page = 1,
      limit = 10,
      latitude,
      longitude,
      radius = 10, // Default radius in km
      type,
      status
    } = query;
    const skip = (page - 1) * limit;

    // Check if location is provided
    if (!latitude || !longitude) {
      throw new ApiError(400, "Latitude and longitude are required");
    }

    // Build filter conditions
    const where = {
      ...(type && { type }),
      ...(status && { status }),
      isActive: true
    };

    // Get all ambulances that match the filter
    const ambulances = await prisma.ambulance.findMany({
      where,
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            licenseNumber: true,
            experience: true,
            rating: true,
            totalTrips: true,
            isVerified: true
          }
        }
      }
    });

    // Filter ambulances by distance (this would be done by the database in a real application)
    const ambulancesInRange = ambulances.filter(ambulance => {
      const ambulanceLocation = ambulance.location;
      if (!ambulanceLocation || !ambulanceLocation.latitude || !ambulanceLocation.longitude) {
        return false;
      }

      // Calculate distance using Haversine formula
      const distance = this.calculateDistance(
        latitude,
        longitude,
        ambulanceLocation.latitude,
        ambulanceLocation.longitude
      );

      return distance <= radius;
    });

    // Apply pagination
    const total = ambulancesInRange.length;
    const paginatedAmbulances = ambulancesInRange.slice(skip, skip + limit);

    return {
      ambulances: paginatedAmbulances,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get ambulance statistics
   * @param {Object} query - Query parameters for filtering
   * @returns {Promise<Object>} - Ambulance statistics
   */
  async getAmbulanceStatistics(query = {}) {
    const { startDate, endDate } = query;

    // Build filter conditions
    const where = {
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    // Get statistics
    const [
      totalAmbulances,
      availableAmbulances,
      busyAmbulances,
      offlineAmbulances,
      maintenanceAmbulances
    ] = await Promise.all([
      prisma.ambulance.count({ where }),
      prisma.ambulance.count({ where: { ...where, status: 'AVAILABLE' } }),
      prisma.ambulance.count({ where: { ...where, status: 'BUSY' } }),
      prisma.ambulance.count({ where: { ...where, status: 'OFFLINE' } }),
      prisma.ambulance.count({ where: { ...where, status: 'MAINTENANCE' } })
    ]);

    // Get ambulances by type
    const ambulancesByType = await prisma.ambulance.groupBy({
      by: ['type'],
      where,
      _count: true
    });

    // Get total bookings
    const totalBookings = await prisma.ambulanceBooking.count({
      where: {
        ...(startDate && endDate && {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        })
      }
    });

    // Get bookings by status
    const bookingsByStatus = await prisma.ambulanceBooking.groupBy({
      by: ['status'],
      where: {
        ...(startDate && endDate && {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        })
      },
      _count: true
    });

    return {
      totalAmbulances,
      availableAmbulances,
      busyAmbulances,
      offlineAmbulances,
      maintenanceAmbulances,
      availabilityRate: totalAmbulances > 0 ? (availableAmbulances / totalAmbulances) * 100 : 0,
      ambulancesByType,
      totalBookings,
      bookingsByStatus
    };
  }

  /**
   * Calculate distance between two points using Haversine formula
   * @param {number} lat1 - Latitude of first point
   * @param {number} lon1 - Longitude of first point
   * @param {number} lat2 - Latitude of second point
   * @param {number} lon2 - Longitude of second point
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
    const distance = R * c; // Distance in km
    return distance;
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

export const ambulanceService = new AmbulanceService(); 