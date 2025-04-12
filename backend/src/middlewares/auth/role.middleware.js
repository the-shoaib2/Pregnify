import ApiError from '../../utils/error/api.error.js';

/**
 * Middleware to check if user has required role
 * @param {string[]} roles - Array of allowed roles
 * @returns {Function} Express middleware function
 */
export const hasRole = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Unauthorized - User not authenticated');
      }

      if (!req.user.role) {
        throw new ApiError(403, 'Forbidden - User has no role assigned');
      }

      if (!roles.includes(req.user.role)) {
        throw new ApiError(403, 'Forbidden - User does not have required role');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user is admin
 * @returns {Function} Express middleware function
 */
export const isAdmin = () => {
  return hasRole(['ADMIN', 'SUPER_ADMIN']);
};

/**
 * Middleware to check if user is doctor
 * @returns {Function} Express middleware function
 */
export const isDoctor = () => {
  return hasRole(['DOCTOR']);
};

/**
 * Middleware to check if user is patient
 * @returns {Function} Express middleware function
 */
export const isPatient = () => {
  return hasRole(['PATIENT']);
};

/**
 * Middleware to check if user is ambulance driver
 * @returns {Function} Express middleware function
 */
export const isAmbulanceDriver = () => {
  return hasRole(['AMBULANCE_DRIVER']);
};

/**
 * Middleware to check if user is super admin
 * @returns {Function} Express middleware function
 */
export const isSuperAdmin = () => {
  return hasRole(['SUPER_ADMIN']);
};

/**
 * Middleware to check if user has any of the specified roles
 * @param {string[]} roles - Array of allowed roles
 * @returns {Function} Express middleware function
 */
export const hasAnyRole = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Unauthorized - User not authenticated');
      }

      if (!req.user.role) {
        throw new ApiError(403, 'Forbidden - User has no role assigned');
      }

      const hasRequiredRole = roles.some(role => req.user.role === role);
      if (!hasRequiredRole) {
        throw new ApiError(403, 'Forbidden - User does not have any of the required roles');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user has all of the specified roles
 * @param {string[]} roles - Array of required roles
 * @returns {Function} Express middleware function
 */
export const hasAllRoles = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Unauthorized - User not authenticated');
      }

      if (!req.user.role) {
        throw new ApiError(403, 'Forbidden - User has no role assigned');
      }

      const hasAllRequiredRoles = roles.every(role => req.user.role === role);
      if (!hasAllRequiredRoles) {
        throw new ApiError(403, 'Forbidden - User does not have all required roles');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}; 