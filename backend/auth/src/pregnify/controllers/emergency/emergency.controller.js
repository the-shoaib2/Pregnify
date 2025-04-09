import { emergencyService } from '../../../services/emergency/emergency.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { catchAsync } from '../../utils/catch-async.js';

// Emergency Request Management
export const createEmergencyRequest = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const emergencyData = req.body;
  
  const emergencyRequest = await emergencyService.createEmergencyRequest(userId, emergencyData);
  
  res.status(201).json({
    status: 'success',
    data: emergencyRequest
  });
});

export const getEmergencyRequests = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const requests = await emergencyService.getEmergencyRequests(userId);
  
  res.status(200).json({
    status: 'success',
    data: requests
  });
});

export const getEmergencyRequest = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { id } = req.params;
  
  const request = await emergencyService.getEmergencyRequest(userId, id);
  
  res.status(200).json({
    status: 'success',
    data: request
  });
});

export const updateEmergencyRequest = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { id } = req.params;
  const updateData = req.body;
  
  const updatedRequest = await emergencyService.updateEmergencyRequest(userId, id, updateData);
  
  res.status(200).json({
    status: 'success',
    data: updatedRequest
  });
});

export const cancelEmergencyRequest = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { id } = req.params;
  
  await emergencyService.cancelEmergencyRequest(userId, id);
  
  res.status(200).json({
    status: 'success',
    message: 'Emergency request cancelled successfully'
  });
});

// Nearby Services
export const getNearbyAmbulances = catchAsync(async (req, res) => {
  const { latitude, longitude, radius } = req.query;
  
  const ambulances = await emergencyService.getNearbyAmbulances(latitude, longitude, radius);
  
  res.status(200).json({
    status: 'success',
    data: ambulances
  });
});

export const getNearbyHospitals = catchAsync(async (req, res) => {
  const { latitude, longitude, radius } = req.query;
  
  const hospitals = await emergencyService.getNearbyHospitals(latitude, longitude, radius);
  
  res.status(200).json({
    status: 'success',
    data: hospitals
  });
});

// Emergency Contacts
export const getEmergencyContacts = catchAsync(async (req, res) => {
  const { userId } = req.user;
  
  const contacts = await emergencyService.getEmergencyContacts(userId);
  
  res.status(200).json({
    status: 'success',
    data: contacts
  });
});

export const addEmergencyContact = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const contactData = req.body;
  
  const contact = await emergencyService.addEmergencyContact(userId, contactData);
  
  res.status(201).json({
    status: 'success',
    data: contact
  });
});

export const updateEmergencyContact = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { id } = req.params;
  const updateData = req.body;
  
  const contact = await emergencyService.updateEmergencyContact(userId, id, updateData);
  
  res.status(200).json({
    status: 'success',
    data: contact
  });
});

export const deleteEmergencyContact = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { id } = req.params;
  
  await emergencyService.deleteEmergencyContact(userId, id);
  
  res.status(200).json({
    status: 'success',
    message: 'Emergency contact deleted successfully'
  });
}); 