import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';
import { calculateDistance } from '../../utils/geolocation.js';
import { sendNotification } from '../../utils/notifications.js';
import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../../utils/ApiError.js';
import { catchAsync } from '../../utils/catch-async.js';

const prisma = new PrismaClient();

// Get all ambulances
export const getAllAmbulances = catchAsync(async (req, res) => {
  const ambulances = await prisma.ambulance.findMany({
    include: {
      driver: true,
      bookings: true
    }
  });
  res.status(StatusCodes.OK).json({
    status: 'success',
    data: ambulances
  });
});

// Get ambulance by ID
export const getAmbulanceById = catchAsync(async (req, res) => {
  const { ambulanceId } = req.params;
  const ambulance = await prisma.ambulance.findUnique({
    where: { id: ambulanceId },
    include: {
      driver: true,
      bookings: true
    }
  });
  if (!ambulance) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Ambulance not found');
  }
  res.status(StatusCodes.OK).json({
    status: 'success',
    data: ambulance
  });
});

// Get ambulance status
export const getAmbulanceStatus = catchAsync(async (req, res) => {
  const { ambulanceId } = req.params;
  const ambulance = await prisma.ambulance.findUnique({
    where: { id: ambulanceId },
    select: { status: true }
  });
  if (!ambulance) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Ambulance not found');
  }
  res.status(StatusCodes.OK).json({
    status: 'success',
    data: ambulance.status
  });
});

// Get ambulance location
export const getAmbulanceLocation = catchAsync(async (req, res) => {
  const { ambulanceId } = req.params;
  const ambulance = await prisma.ambulance.findUnique({
    where: { id: ambulanceId },
    select: { location: true }
  });
  if (!ambulance) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Ambulance not found');
  }
  res.status(StatusCodes.OK).json({
    status: 'success',
    data: ambulance.location
  });
});

// Get ambulance type
export const getAmbulanceType = catchAsync(async (req, res) => {
  const { ambulanceId } = req.params;
  const ambulance = await prisma.ambulance.findUnique({
    where: { id: ambulanceId },
    select: { type: true }
  });
  if (!ambulance) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Ambulance not found');
  }
  res.status(StatusCodes.OK).json({
    status: 'success',
    data: ambulance.type
  });
});

// Get ambulance equipment
export const getAmbulanceEquipment = catchAsync(async (req, res) => {
  const { ambulanceId } = req.params;
  const ambulance = await prisma.ambulance.findUnique({
    where: { id: ambulanceId },
    select: { equipment: true }
  });
  if (!ambulance) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Ambulance not found');
  }
  res.status(StatusCodes.OK).json({
    status: 'success',
    data: ambulance.equipment
  });
});

// Get ambulance maintenance history
export const getMaintenanceHistory = catchAsync(async (req, res) => {
  const { ambulanceId } = req.params;
  const { startDate, endDate } = req.query;

  const where = {
    ambulanceId,
    ...(startDate && endDate && {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    })
  };

  const maintenanceHistory = await prisma.maintenanceRecord.findMany({
    where,
    orderBy: {
      date: 'desc'
    }
  });

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: maintenanceHistory
  });
});

// Get ambulance service area
export const getServiceArea = catchAsync(async (req, res) => {
  const { ambulanceId } = req.params;
  const ambulance = await prisma.ambulance.findUnique({
    where: { id: ambulanceId },
    select: { serviceArea: true }
  });
  if (!ambulance) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Ambulance not found');
  }
  res.status(StatusCodes.OK).json({
    status: 'success',
    data: ambulance.serviceArea
  });
});

// Export all controller functions as a single object
export const ambulanceController = {
  getAllAmbulances,
  getAmbulanceById,
  getAmbulanceStatus,
  getAmbulanceLocation,
  getAmbulanceType,
  getAmbulanceEquipment,
  getMaintenanceHistory,
  getServiceArea
}; 