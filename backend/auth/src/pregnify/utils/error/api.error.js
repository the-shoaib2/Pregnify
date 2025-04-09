/**
 * Base API Error class
 */
export class ApiError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Bad Request Error (400)
 */
export class BadRequestError extends ApiError {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

/**
 * Unauthorized Error (401)
 */
export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

/**
 * Forbidden Error (403)
 */
export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends ApiError {
  constructor(message = 'Not Found') {
    super(message, 404);
  }
}

/**
 * Conflict Error (409)
 */
export class ConflictError extends ApiError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

/**
 * Validation Error (422)
 */
export class ValidationError extends ApiError {
  constructor(message = 'Validation Error', errors = []) {
    super(message, 422);
    this.errors = errors;
  }
}

/**
 * Internal Server Error (500)
 */
export class InternalServerError extends ApiError {
  constructor(message = 'Internal Server Error') {
    super(message, 500);
  }
}

/**
 * Service Unavailable Error (503)
 */
export class ServiceUnavailableError extends ApiError {
  constructor(message = 'Service Unavailable') {
    super(message, 503);
  }
}

/**
 * Database Error
 */
export class DatabaseError extends ApiError {
  constructor(message = 'Database Error') {
    super(message, 500);
  }
}

/**
 * Authentication Error
 */
export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication Failed') {
    super(message, 401);
  }
}

/**
 * Authorization Error
 */
export class AuthorizationError extends ApiError {
  constructor(message = 'Authorization Failed') {
    super(message, 403);
  }
}

/**
 * Rate Limit Error (429)
 */
export class RateLimitError extends ApiError {
  constructor(message = 'Too Many Requests') {
    super(message, 429);
  }
}

/**
 * File Upload Error
 */
export class FileUploadError extends ApiError {
  constructor(message = 'File Upload Failed') {
    super(message, 400);
  }
}

/**
 * Payment Error
 */
export class PaymentError extends ApiError {
  constructor(message = 'Payment Failed') {
    super(message, 402);
  }
}

/**
 * Resource Exhausted Error
 */
export class ResourceExhaustedError extends ApiError {
  constructor(message = 'Resource Exhausted') {
    super(message, 429);
  }
}

/**
 * Custom error handler for API responses
 */
export const handleApiError = (error, req, res, next) => {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      ...(error.errors && { errors: error.errors })
    });
  }

  // Handle non-API errors
  console.error('Non-API Error:', error);
  return res.status(500).json({
    status: 'error',
    message: 'An unexpected error occurred'
  });
}; 