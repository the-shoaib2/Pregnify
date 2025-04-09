// Re-export all error classes from api.error.js
export {
  ApiError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError,
  ServiceUnavailableError,
  DatabaseError,
  AuthenticationError,
  AuthorizationError,
  RateLimitError,
  FileUploadError,
  PaymentError,
  ResourceExhaustedError,
  handleApiError
} from './error/api.error.js'; 