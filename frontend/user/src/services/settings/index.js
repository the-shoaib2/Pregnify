import api from '../api'
import { memoize } from 'lodash'
import { CacheManager, CONSTANTS } from '../../utils/security'
import { handleApiError } from '../../utils/errorHandler'

const { CACHE_DURATION } = CONSTANTS
const CACHE_KEY = CONSTANTS.AUTH_CACHE_KEY

// Profile constants
const PROFILE_ENDPOINTS = {
  GET_PROFILE: '/account/profile',
  UPDATE_PROFILE: '/account/profile/update',
  UPLOAD_AVATAR: '/account/profile/avatar',
  UPLOAD_COVER: '/account/profile/cover'
}

// Track ongoing profile requests
let profileRequestPromise = null;
let lastProfileFetchTime = 0;
const MIN_FETCH_INTERVAL = 1000; // 1 second minimum between fetches

// Add request cache for deduplication
const requestCache = new Map()

// Profile loader with improved error handling
export const loadProfile = async (refresh = false) => {
  const now = Date.now();
  const cache = CacheManager.get(CONSTANTS.AUTH_CACHE_KEY);
  const token = cache?.tokens?.accessToken;
  const cacheKey = 'profile';

  // If a request is already in progress, return that promise
  if (!refresh && requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey);
  }

  // Check cache first if not forcing refresh
  if (!refresh && 
      cache.profile && 
      now - lastProfileFetchTime < MIN_FETCH_INTERVAL &&
      now - cache.timestamp < CACHE_DURATION) {
    return cache.profile;
  }

  // Ensure we have a valid token
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    // Create a new request promise
    profileRequestPromise = (async () => {
      const response = await api.get(PROFILE_ENDPOINTS.GET_PROFILE);
      
      const profile = response.data;
      
      // Update cache with new profile data
      CacheManager.set(CONSTANTS.AUTH_CACHE_KEY, {
        ...cache,
        profile,
        lastRefresh: now
      });

      lastProfileFetchTime = now;
      return profile;
    })();

    // Store in request cache
    requestCache.set(cacheKey, profileRequestPromise);
    
    const result = await profileRequestPromise;
    return result;
  } catch (error) {
    if (error.response?.status === 401 || error.message === 'Authentication required') {
      CacheManager.clear(CONSTANTS.AUTH_CACHE_KEY);
      throw new Error('Authentication required');
    }
    const errorMessage = handleApiError(error);
    throw new Error(errorMessage);
  } finally {
    profileRequestPromise = null;
    setTimeout(() => requestCache.delete(cacheKey), 2000);
  }
}

// Centralized profile handling with comprehensive error handling
export const ProfileService = {
  // Optimized getProfile to use cached data first with memoization
  getProfile: memoize(
    async (options = {}) => {
      const opts = options || {};
      const { refresh = false } = opts;
      
      try {
        return await loadProfile(refresh);
      } catch (error) {
        console.error('Profile fetch error:', error);
        throw error;
      }
    },
    // Cache key based on refresh flag and time window
    (options = {}) => `${options?.refresh || false}-${Math.floor(Date.now() / 30000)}`
  ),

  updateProfile: async (data) => {
    try {
      const response = await api.patch(PROFILE_ENDPOINTS.UPDATE_PROFILE, data);
      
      // Update cache with new profile data
      const cache = CacheManager.get(CACHE_KEY);
      if (cache.profile) {
        CacheManager.set(CACHE_KEY, {
          profile: { ...cache.profile, ...data },
          lastRefresh: Date.now()
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await api.post(PROFILE_ENDPOINTS.UPLOAD_AVATAR, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update avatar in cache if profile exists
      const cache = CacheManager.get(CACHE_KEY);
      if (cache.profile) {
        CacheManager.set(CACHE_KEY, {
          profile: { 
            ...cache.profile, 
            avatar: response.data.avatar || response.data.url || response.data
          },
          lastRefresh: Date.now()
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating avatar:', error);
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  uploadCoverPhoto: async (file) => {
    try {
      const formData = new FormData();
      formData.append('cover', file);
      
      const response = await api.post(PROFILE_ENDPOINTS.UPLOAD_COVER, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update cover photo in cache if profile exists
      const cache = CacheManager.get(CACHE_KEY);
      if (cache.profile) {
        CacheManager.set(CACHE_KEY, {
          profile: { 
            ...cache.profile, 
            coverPhoto: response.data.cover || response.data.url || response.data
          },
          lastRefresh: Date.now()
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating cover photo:', error);
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  }
}

// Comprehensive settings service with improved error handling
export const SettingsService = {
  // Profile & Personal Info
  getProfile: async (refresh = false) => {
    try {
      return await ProfileService.getProfile({ refresh });
    } catch (error) {
      console.error('Settings profile fetch error:', error);
      throw error;
    }
  },
  
  updatePersonalInfo: async (data) => {
    try {
      const response = await api.patch('/account/profile/update', data);
      
      // Update profile in cache
      const cache = CacheManager.get(CACHE_KEY);
      if (cache.profile) {
        CacheManager.set(CACHE_KEY, {
          profile: { ...cache.profile, ...data },
          lastRefresh: Date.now()
        });
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },
  
  updateEducation: async (data) => {
    try {
      const response = await api.patch('/account/education', data);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },
  
  updateMedicalInfo: async (data) => {
    try {
      const response = await api.patch('/account/medical-info', data);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },
  
  updateEmergencyContacts: async (data) => {
    try {
      const response = await api.patch('/account/emergency-contacts', data);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Account Settings
  getSettings: async () => {
    try {
      const response = await api.get('/account/settings');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },
  
  updateSettings: async (data) => {
    try {
      const response = await api.patch('/account/settings', data);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },
  
  updateSecurity: async (data) => {
    try {
      const response = await api.patch('/account/security', data);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },
  
  // Preferences
  updatePreferences: async (data) => {
    try {
      const response = await api.patch('/account/preferences', data);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },
  
  updateAppearance: async (data) => {
    try {
      const response = await api.patch('/account/appearance', data);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },
  
  updateNotifications: async (data) => {
    try {
      const response = await api.patch('/account/notifications', data);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },
  
  updatePrivacy: async (data) => {
    try {
      const response = await api.patch('/account/privacy', data);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Activity & Account Management
  getActivityLogs: async () => {
    try {
      const response = await api.get('/account/activity');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },
  
  deleteAccount: async () => {
    try {
      const response = await api.delete('/account/delete');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Profile Image - using the ProfileService methods for consistency
  uploadProfileImage: (file) => ProfileService.uploadAvatar(file),
  uploadCoverImage: (file) => ProfileService.uploadCoverPhoto(file)
}