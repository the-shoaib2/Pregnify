import { catchAsync } from '../../utils/catch-async.js';
import { ambulanceBookingService } from '../../services/ambulance/ambulance-booking.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { StatusCodes } from 'http-status-codes';

/**
 * Create a new ambulance booking
 * @route POST /api/v1/ambulance/bookings
 * @access Private
 */
export const createBooking = catchAsync(async (req, res) => {
  const booking = await ambulanceBookingService.createBooking({
    ...req.body,
    patientId: req.user.id
  });

  res.status(StatusCodes.CREATED).json({
    status: 'success',
    message: 'Ambulance booking created successfully',
    data: booking
  });
});

/**
 * Get all ambulance bookings
 * @route GET /api/v1/ambulance/bookings
 * @access Private
 */
export const getAllBookings = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status, startDate, endDate, sortBy, sortOrder } = req.query;

  const bookings = await ambulanceBookingService.getBookings({
    page: parseInt(page),
    limit: parseInt(limit),
    status,
    startDate,
    endDate,
    sortBy,
    sortOrder
  });

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: bookings
  });
});

/**
 * Get booking by ID
 * @route GET /api/v1/ambulance/bookings/:bookingId
 * @access Private
 */
export const getBookingById = catchAsync(async (req, res) => {
  const booking = await ambulanceBookingService.getBookingById(req.params.bookingId);

  if (!booking) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Booking not found');
  }

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: booking
  });
});

/**
 * Update booking status
 * @route PATCH /api/v1/ambulance/bookings/:bookingId/status
 * @access Private
 */
export const updateBookingStatus = catchAsync(async (req, res) => {
  const { status, reason } = req.body;
  const booking = await ambulanceBookingService.updateBookingStatus(req.params.bookingId, status, reason);

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Booking status updated successfully',
    data: booking
  });
});

/**
 * Update booking payment status
 * @route PATCH /api/v1/ambulance/bookings/:bookingId/payment
 * @access Private
 */
export const updatePaymentStatus = catchAsync(async (req, res) => {
  const { paymentStatus, paymentMethod, transactionId, amount } = req.body;
  const booking = await ambulanceBookingService.updatePaymentStatus(
    req.params.bookingId,
    paymentStatus,
    paymentMethod,
    transactionId,
    amount
  );

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Payment status updated successfully',
    data: booking
  });
});

/**
 * Update booking location
 * @route PATCH /api/v1/ambulance/bookings/:bookingId/location
 * @access Private
 */
export const updateLocation = catchAsync(async (req, res) => {
  const { latitude, longitude, address } = req.body;
  const booking = await ambulanceBookingService.updateLocation(
    req.params.bookingId,
    latitude,
    longitude,
    address
  );

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Location updated successfully',
    data: booking
  });
});

/**
 * Update estimated arrival time
 * @route PATCH /api/v1/ambulance/bookings/:bookingId/estimated-arrival
 * @access Private
 */
export const updateEstimatedArrivalTime = catchAsync(async (req, res) => {
  const { estimatedArrivalTime } = req.body;
  const booking = await ambulanceBookingService.updateEstimatedArrival(
    req.params.bookingId,
    estimatedArrivalTime
  );

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Estimated arrival time updated successfully',
    data: booking
  });
});

/**
 * Cancel a booking
 * @route POST /api/v1/ambulance/bookings/:bookingId/cancel
 * @access Private
 */
export const cancelBooking = catchAsync(async (req, res) => {
  const { reason } = req.body;
  const booking = await ambulanceBookingService.cancelBooking(req.params.bookingId, reason);

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Booking cancelled successfully',
    data: booking
  });
});

/**
 * Add a review for a booking
 * @route POST /api/v1/ambulance/bookings/:bookingId/review
 * @access Private
 */
export const addReview = catchAsync(async (req, res) => {
  const { rating, comment } = req.body;
  const review = await ambulanceBookingService.addReview(
    req.params.bookingId,
    req.user.id,
    rating,
    comment
  );

  res.status(StatusCodes.CREATED).json({
    status: 'success',
    message: 'Review added successfully',
    data: review
  });
});

/**
 * Get available ambulances
 * @route GET /api/v1/ambulance/bookings/available
 * @access Private
 */
export const getAvailableAmbulances = catchAsync(async (req, res) => {
  const { latitude, longitude, type } = req.query;
  const ambulances = await ambulanceBookingService.getAvailableAmbulances(
    parseFloat(latitude),
    parseFloat(longitude),
    type
  );

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: ambulances
  });
});

/**
 * Get user bookings
 * @route GET /api/v1/ambulance/bookings/user
 * @access Private
 */
export const getUserBookings = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const bookings = await ambulanceBookingService.getUserBookings(
    req.user.id,
    parseInt(page),
    parseInt(limit)
  );

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: bookings
  });
});

/**
 * Get booking history
 * @route GET /api/v1/ambulance/bookings/history
 * @access Private
 */
export const getBookingHistory = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const history = await ambulanceBookingService.getBookingHistory(
    req.user.id,
    parseInt(page),
    parseInt(limit)
  );

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: history
  });
});

/**
 * Get booking stats
 * @route GET /api/v1/ambulance/bookings/stats
 * @access Private
 */
export const getBookingStats = catchAsync(async (req, res) => {
  const stats = await ambulanceBookingService.getBookingStats(req.user.id);

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: stats
  });
});

/**
 * Rate a booking
 * @route POST /api/v1/ambulance/bookings/:bookingId/rate
 * @access Private
 */
export const rateBooking = catchAsync(async (req, res) => {
  const { rating, comment } = req.body;
  const booking = await ambulanceBookingService.rateBooking(
    req.params.bookingId,
    req.user.id,
    rating,
    comment
  );

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Booking rated successfully',
    data: booking
  });
});

/**
 * Track booking
 * @route GET /api/v1/ambulance/bookings/:bookingId/track
 * @access Private
 */
export const trackBooking = catchAsync(async (req, res) => {
  const tracking = await ambulanceBookingService.trackBooking(req.params.bookingId);

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: tracking
  });
});

/**
 * Get estimated arrival time
 * @route GET /api/v1/ambulance/bookings/:bookingId/eta
 * @access Private
 */
export const getEstimatedArrivalTime = catchAsync(async (req, res) => {
  const eta = await ambulanceBookingService.getEstimatedArrivalTime(req.params.bookingId);

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: eta
  });
});

/**
 * Update booking
 * @route PUT /api/v1/ambulance/bookings/:bookingId
 * @access Private
 */
export const updateBooking = catchAsync(async (req, res) => {
  const booking = await ambulanceBookingService.updateBooking(
    req.params.bookingId,
    req.body
  );

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Booking updated successfully',
    data: booking
  });
});

/**
 * Get booking receipt
 * @route GET /api/v1/ambulance/bookings/:bookingId/receipt
 * @access Private
 */
export const getBookingReceipt = catchAsync(async (req, res) => {
  const receipt = await ambulanceBookingService.getBookingReceipt(req.params.bookingId);

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: receipt
  });
});

// Export all controller functions as a single object
export const ambulanceBookingController = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  updatePaymentStatus,
  updateLocation,
  updateEstimatedArrivalTime,
  cancelBooking,
  addReview,
  getAvailableAmbulances,
  getUserBookings,
  getBookingHistory,
  getBookingStats,
  rateBooking,
  trackBooking,
  getEstimatedArrivalTime,
  updateBooking,
  getBookingReceipt
}; 