/**
 * Represents an API error.
 * Extends the built-in Error class to include additional properties.
 */
class ApiError extends Error {
    /**
     * Creates an instance of ApiError.
     * 
     * @param {number} statusCode - The HTTP status code associated with the error.
     * @param {string} [message="Something went wrong"] - A message describing the error.
     * @param {Array} [errors=[]] - An array of additional error details.
     * @param {string} [stack=""] - The stack trace of the error.
     */
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.success = false;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    /**
     * Creates a Bad Request error.
     * 
     * @param {string} [message="Bad Request"] - A message describing the error.
     * @param {Array} [errors=[]] - An array of additional error details.
     * @returns {ApiError} - An instance of ApiError with a 400 status code.
     */
    static badRequest(message = "Bad Request", errors = []) {
        return new ApiError(400, message, errors);
    }

    /**
     * Creates an Unauthorized error.
     * 
     * @param {string} [message="Unauthorized"] - A message describing the error.
     * @param {Array} [errors=[]] - An array of additional error details.
     * @returns {ApiError} - An instance of ApiError with a 401 status code.
     */
    static unauthorized(message = "Unauthorized", errors = []) {
        return new ApiError(401, message, errors);
    }

    /**
     * Creates a Forbidden error.
     * 
     * @param {string} [message="Forbidden"] - A message describing the error.
     * @param {Array} [errors=[]] - An array of additional error details.
     * @returns {ApiError} - An instance of ApiError with a 403 status code.
     */
    static forbidden(message = "Forbidden", errors = []) {
        return new ApiError(403, message, errors);
    }

    /**
     * Creates a Not Found error.
     * 
     * @param {string} [message="Not Found"] - A message describing the error.
     * @param {Array} [errors=[]] - An array of additional error details.
     * @returns {ApiError} - An instance of ApiError with a 404 status code.
     */
    static notFound(message = "Not Found", errors = []) {
        return new ApiError(404, message, errors);
    }

    /**
     * Creates an Internal Server Error.
     * 
     * @param {string} [message="Internal Server Error"] - A message describing the error.
     * @param {Array} [errors=[]] - An array of additional error details.
     * @returns {ApiError} - An instance of ApiError with a 500 status code.
     */
    static internalError(message = "Internal Server Error", errors = []) {
        return new ApiError(500, message, errors);
    }

    /**
     * Creates a Conflict error.
     * 
     * @param {string} [message="Conflict"] - A message describing the error.
     * @param {Array} [errors=[]] - An array of additional error details.
     * @returns {ApiError} - An instance of ApiError with a 409 status code.
     */
    static conflict(message = "Conflict", errors = []) {
        return new ApiError(409, message, errors);
    }

    /**
     * Creates an Unprocessable Entity error.
     * 
     * @param {string} [message="Unprocessable Entity"] - A message describing the error.
     * @param {Array} [errors=[]] - An array of additional error details.
     * @returns {ApiError} - An instance of ApiError with a 422 status code.
     */
    static unprocessableEntity(message = "Unprocessable Entity", errors = []) {
        return new ApiError(422, message, errors);
    }

    /**
     * Creates a Too Many Requests error.
     * 
     * @param {string} [message="Too Many Requests"] - A message describing the error.
     * @param {Array} [errors=[]] - An array of additional error details.
     * @returns {ApiError} - An instance of ApiError with a 429 status code.
     */
    static tooManyRequests(message = "Too Many Requests", errors = []) {
        return new ApiError(429, message, errors);
    }

    /**
     * Creates a Service Unavailable error.
     * 
     * @param {string} [message="Service Unavailable"] - A message describing the error.
     * @param {Array} [errors=[]] - An array of additional error details.
     * @returns {ApiError} - An instance of ApiError with a 503 status code.
     */
    static serviceUnavailable(message = "Service Unavailable", errors = []) {
        return new ApiError(503, message, errors);
    }

    /**
     * Creates a Database Operation Error.
     * 
     * @param {string} [message="Database Operation Failed"] - A message describing the error.
     * @param {Array} [errors=[]] - An array of additional error details.
     * @returns {ApiError} - An instance of ApiError with a 500 status code.
     */
    static databaseError(message = "Database Operation Failed", errors = []) {
        return new ApiError(500, message, errors);
    }

    /**
     * Creates a Validation Error for database operations.
     * 
     * @param {string} [message="Database Validation Failed"] - A message describing the error.
     * @param {Array} [errors=[]] - An array of additional error details.
     * @returns {ApiError} - An instance of ApiError with a 400 status code.
     */
    static databaseValidationError(message = "Database Validation Failed", errors = []) {
        return new ApiError(400, message, errors);
    }
}

export default ApiError;
