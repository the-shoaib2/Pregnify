import api from '../api'
import { memoize } from 'lodash'
import { CacheManager, CONSTANTS } from '../../utils/security'
import { handleApiError } from '../../utils/errorHandler'

const { CACHE_DURATION } = CONSTANTS
const CACHE_KEY = CONSTANTS.AUTH_CACHE_KEY

// Admin API endpoints
const ADMIN_ENDPOINTS = {
  // Dashboard
  DASHBOARD: '/admin/dashboard',
  
  // User Management
  USERS: '/admin/users',
  CREATE_USER: '/admin/users',
  USER_DETAILS: (userId) => `/admin/users/${userId}`,
  UPDATE_USER: (userId) => `/admin/users/${userId}`,
  DELETE_USER: (userId) => `/admin/users/${userId}`,

  ACTIVITIES: '/admin/activities',
  ACTIVITY_DETAILS: (activityId) => `/admin/activities/${activityId}`,
  
  // Role Management
  ROLES: '/admin/roles',
  ROLE_DETAILS: (roleId) => `/admin/roles/${roleId}`,
  CREATE_ROLE: '/admin/roles',
  UPDATE_ROLE: (roleId) => `/admin/roles/${roleId}`,
  DELETE_ROLE: (roleId) => `/admin/roles/${roleId}`,
  
  // System Management
  SYSTEM_STATS: '/admin/system/stats',
  SYSTEM_LOGS: '/admin/system/logs',
  
  // Security Management
  SECURITY_AUDIT: '/admin/security/audit',
  SECURITY_LOCKDOWN: '/admin/security/lockdown',
  
  // Settings Management
  SETTINGS: '/admin/settings'
}

// Track ongoing requests
const requestCache = new Map()

// Admin Dashboard Service
export const DashboardService = {
  
  getDashboardData: memoize(
    async (refresh = false) => {
      const cacheKey = 'dashboard';
      
      // If a request is already in progress, return that promise
      if (!refresh && requestCache.has(cacheKey)) {
        return requestCache.get(cacheKey);
      }
      
      try {
        const response = await api.get(ADMIN_ENDPOINTS.DASHBOARD);
        return response.data;
      } catch (error) {
        const errorMessage = handleApiError(error);
        throw new Error(errorMessage);
      } finally {
        setTimeout(() => requestCache.delete(cacheKey), 2000);
      }
    },
    // Cache key based on refresh flag and time window
    (refresh = false) => `${refresh}-${Math.floor(Date.now() / 30000)}`
  )
}

// User Management Service
export const UserManagementService = {
  getAllUsers: async (params = {}) => {
    try {
      const response = await api.get(ADMIN_ENDPOINTS.USERS, { params });
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  createUser: async (data) => {
    try {
      const response = await api.post(ADMIN_ENDPOINTS.CREATE_USER, data);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },
  
  
  getUserById: async (userId) => {
    try {
      const response = await api.get(ADMIN_ENDPOINTS.USER_DETAILS(userId));
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },
  
  updateUser: async (userId, data) => {
    try {
      const response = await api.put(ADMIN_ENDPOINTS.USER_DETAILS(userId), data);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },
  
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(ADMIN_ENDPOINTS.USER_DETAILS(userId));
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },
  getAllActivities: async (userId) => {
    try {
      const response = await api.get(ADMIN_ENDPOINTS.ACTIVITIES);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  getActivitiesById: async (activityId) => {
    try {
      const response = await api.get(ADMIN_ENDPOINTS.ACTIVITY_DETAILS(activityId));
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },
  getActivitiesById: async (activityId ,userId) => {
    try {
      const response = await api.get(ADMIN_ENDPOINTS.USERS(userId));
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },
  deleteActivity: async (activityId) => {
    try {
      const response = await api.delete(ADMIN_ENDPOINTS.ACTIVITY_DETAILS(activityId));
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  }

}

// Role Management Service
export const RoleManagementService = {
  getAllRoles: async () => {
    try {
      const response = await api.get(ADMIN_ENDPOINTS.ROLES);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },
  
  createRole: async (data) => {
    try {
      const response = await api.post(ADMIN_ENDPOINTS.ROLES, data);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },
  
  updateRole: async (roleId, data) => {
    try {
      const response = await api.put(ADMIN_ENDPOINTS.ROLE_DETAILS(roleId), data);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },
  
  deleteRole: async (roleId) => {
    try {
      const response = await api.delete(ADMIN_ENDPOINTS.ROLE_DETAILS(roleId));
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  }
}

// System Management Service
export const SystemManagementService = {
  getSystemStats: async () => {
    try {
      const response = await api.get(ADMIN_ENDPOINTS.SYSTEM_STATS);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },
  
  getSystemLogs: async (params = {}) => {
    try {
      const response = await api.get(ADMIN_ENDPOINTS.SYSTEM_LOGS, { params });
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },
  
  clearSystemLogs: async () => {
    try {
      const response = await api.delete(ADMIN_ENDPOINTS.SYSTEM_LOGS);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  }
}

// Security Management Service
export const SecurityManagementService = {
  getSecurityAudit: async (params = {}) => {
    try {
      const response = await api.get(ADMIN_ENDPOINTS.SECURITY_AUDIT, { params });
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },
  
  enableLockdown: async () => {
    try {
      const response = await api.post(ADMIN_ENDPOINTS.SECURITY_LOCKDOWN);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },
  
  disableLockdown: async () => {
    try {
      const response = await api.delete(ADMIN_ENDPOINTS.SECURITY_LOCKDOWN);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  }
}

// Settings Management Service
export const SettingsManagementService = {
  getAdminSettings: async () => {
    try {
      const response = await api.get(ADMIN_ENDPOINTS.SETTINGS);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },
  
  updateAdminSettings: async (data) => {
    try {
      const response = await api.put(ADMIN_ENDPOINTS.SETTINGS, data);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  }
}

// Export all services
export default {
  DashboardService,
  UserManagementService,
  RoleManagementService,
  SystemManagementService,
  SecurityManagementService,
  SettingsManagementService
}