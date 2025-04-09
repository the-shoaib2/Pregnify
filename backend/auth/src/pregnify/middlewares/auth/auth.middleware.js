import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../../utils/ApiError.js';

/**
 * Middleware to verify JWT token and authenticate user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const isAuthenticated = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'No token provided');
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid token');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user has required roles
 * @param {Array} roles - Array of required roles
 * @returns {Function} Express middleware function
 */
export const hasRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const hasRequiredRole = roles.some(role => req.user.roles.includes(role));
    if (!hasRequiredRole) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'User not authorized');
    }

    next();
  };
}; 