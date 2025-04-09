import { doctorProfileService } from '../../services/doctor/doctor-profile.service.js';
import { catchAsync } from '../../utils/catch-async.js';

/**
 * Create a new doctor profile
 * @route POST /api/v1/doctor/profile
 * @access Private
 */
export const createDoctorProfile = catchAsync(async (req, res) => {
  const profile = await doctorProfileService.createProfile(req.user.id, req.body);
  res.status(201).json({
    status: 'success',
    data: profile
  });
});

/**
 * 
 * Get all doctors
 * @route GET /api/v1/doctor/profile
 * @access Private
 */
export const getAllDoctors = catchAsync(async (req, res) => {
  const doctors = await doctorProfileService.getAllDoctors();
  res.status(200).json({
    status: 'success',
    data: doctors
  });
});

/**
 * Get doctor profile
 * @route GET /api/v1/doctor/profile
 * @access Private
 */
export const getDoctorProfile = catchAsync(async (req, res) => {
  const profile = await doctorProfileService.getProfile(req.user.id);
  res.status(200).json({
    status: 'success',
    data: profile
  });
});

/**
 * Update doctor profile
 * @route PUT /api/v1/doctor/profile
 * @access Private
 */
export const updateDoctorProfile = catchAsync(async (req, res) => {
  const profile = await doctorProfileService.updateProfile(req.user.id, req.body);
  res.status(200).json({
    status: 'success',
    data: profile
  });
});

/**
 * Delete doctor profile
 * @route DELETE /api/v1/doctor/profile
 * @access Private
 */
export const deleteDoctorProfile = catchAsync(async (req, res) => {
  await doctorProfileService.deleteProfile(req.user.id);
  res.status(204).json({
    status: 'success',
    data: null
  });
});

/**
 * Get doctor availability
 * @route GET /api/v1/doctor/profile/availability
 * @access Private
 */
export const getAvailability = catchAsync(async (req, res) => {
  const availability = await doctorProfileService.getAvailability(req.user.id);
  res.status(200).json({
    status: 'success',
    data: availability
  });
});

/**
 * Update doctor availability
 * @route PUT /api/v1/doctor/profile/availability
 * @access Private
 */
export const updateAvailability = catchAsync(async (req, res) => {
  const availability = await doctorProfileService.updateAvailability(req.user.id, req.body);
  res.status(200).json({
    status: 'success',
    data: availability
  });
});

/**
 * Get doctor specialties
 * @route GET /api/v1/doctor/profile/specialties
 * @access Private
 */
export const getSpecialties = catchAsync(async (req, res) => {
  const specialties = await doctorProfileService.getSpecialties(req.user.id);
  res.status(200).json({
    status: 'success',
    data: specialties
  });
});

/**
 * Update doctor specialties
 * @route PUT /api/v1/doctor/profile/specialties
 * @access Private
 */
export const updateSpecialties = catchAsync(async (req, res) => {
  const specialties = await doctorProfileService.updateSpecialties(req.user.id, req.body);
  res.status(200).json({
    status: 'success',
    data: specialties
  });
});

/**
 * Get doctor experience
 * @route GET /api/v1/doctor/profile/experience
 * @access Private
 */
export const getExperience = catchAsync(async (req, res) => {
  const experience = await doctorProfileService.getExperience(req.user.id);
  res.status(200).json({
    status: 'success',
    data: experience
  });
});

/**
 * Update doctor experience
 * @route PUT /api/v1/doctor/profile/experience
 * @access Private
 */
export const updateExperience = catchAsync(async (req, res) => {
  const experience = await doctorProfileService.updateExperience(req.user.id, req.body);
  res.status(200).json({
    status: 'success',
    data: experience
  });
});

/**
 * Get doctor education
 * @route GET /api/v1/doctor/profile/education
 * @access Private
 */
export const getEducation = catchAsync(async (req, res) => {
  const education = await doctorProfileService.getEducation(req.user.id);
  res.status(200).json({
    status: 'success',
    data: education
  });
});

/**
 * Update doctor education
 * @route PUT /api/v1/doctor/profile/education
 * @access Private
 */
export const updateEducation = catchAsync(async (req, res) => {
  const education = await doctorProfileService.updateEducation(req.user.id, req.body);
  res.status(200).json({
    status: 'success',
    data: education
  });
});

/**
 * Get doctor documents
 * @route GET /api/v1/doctor/profile/documents
 * @access Private
 */
export const getDocuments = catchAsync(async (req, res) => {
  const documents = await doctorProfileService.getDocuments(req.user.id);
  res.status(200).json({
    status: 'success',
    data: documents
  });
});

/**
 * Upload doctor document
 * @route POST /api/v1/doctor/profile/documents
 * @access Private
 */
export const uploadDocument = catchAsync(async (req, res) => {
  const document = await doctorProfileService.uploadDocument(req.user.id, req.file);
  res.status(201).json({
    status: 'success',
    data: document
  });
});

/**
 * Delete doctor document
 * @route DELETE /api/v1/doctor/profile/documents/:documentId
 * @access Private
 */
export const deleteDocument = catchAsync(async (req, res) => {
  await doctorProfileService.deleteDocument(req.user.id, req.params.documentId);
  res.status(204).json({
    status: 'success',
    data: null
  });
});

/**
 * Get doctor rating
 * @route GET /api/v1/doctor/profile/rating
 * @access Private
 */
export const getRating = catchAsync(async (req, res) => {
  const rating = await doctorProfileService.getRating(req.user.id);
  res.status(200).json({
    status: 'success',
    data: rating
  });
});

/**
 * Get doctor reviews
 * @route GET /api/v1/doctor/profile/reviews
 * @access Private
 */
export const getReviews = catchAsync(async (req, res) => {
  const reviews = await doctorProfileService.getReviews(req.user.id);
  res.status(200).json({
    status: 'success',
    data: reviews
  });
});

/**
 * Get doctor statistics
 * @route GET /api/v1/doctor/profile/statistics
 * @access Private
 */
export const getStatistics = catchAsync(async (req, res) => {
  const statistics = await doctorProfileService.getStatistics(req.user.id);
  res.status(200).json({
    status: 'success',
    data: statistics
  });
}); 