import api from '../../../api'
import { memoize } from 'lodash'
import { CacheManager, CONSTANTS } from '../../../../utils/security'
import { handleApiError } from '../../../../utils/errorHandler'

const { CACHE_DURATION } = CONSTANTS
const CACHE_KEY = CONSTANTS.AUTH_CACHE_KEY

// Profile constants
const PERSONAL_ENDPOINTS = {
  // Profile endpoints
  GET_PROFILE: '/account/profile/personal',
  UPDATE_BASIC_INFO: '/account/profile/personal/basic',
  
  // Education endpoints
  GET_EDUCATION: '/account/profile/personal/education',
  ADD_EDUCATION: '/account/profile/personal/education',
  UPDATE_EDUCATION: (id) => `/account/profile/personal/education/${id}`,
  DELETE_EDUCATION: (id) => `/account/profile/personal/education/${id}`,
  
  // Medical endpoints
  GET_MEDICAL: '/account/profile/personal/medical',
  UPDATE_MEDICAL: '/account/profile/personal/medical',
  
  // Medical reports endpoints
  GET_MEDICAL_REPORTS: '/account/profile/personal/medical/reports',
  ADD_MEDICAL_REPORT: '/account/profile/personal/medical/reports',
  UPDATE_MEDICAL_REPORT: (id) => `/account/profile/personal/medical/reports/${id}`,
  DELETE_MEDICAL_REPORT: (id) => `/account/profile/personal/medical/reports/${id}`,
  UPLOAD_MEDICAL_DOCUMENT: '/account/profile/personal/medical/documents',
  GET_MEDICAL_DOCUMENTS: '/account/profile/personal/medical/documents',
  DELETE_MEDICAL_DOCUMENT: (id) => `/account/profile/personal/medical/documents/${id}`
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
  },

  deleteEducation: async (id) => {
    try {
      const response = await api.delete(PERSONAL_ENDPOINTS.DELETE_EDUCATION(id));
      
      // Update cache or state if necessary
      const cache = CacheManager.get(CACHE_KEY);
      if (cache.profile && cache.profile.personal) {
        const updatedEducation = cache.profile.personal.education.filter(edu => edu.id !== id);
        CacheManager.set(CACHE_KEY, {
          profile: { ...cache.profile, personal: { ...cache.profile.personal, education: updatedEducation } },
          lastRefresh: Date.now()
        });
      }
      
      return response.data;
    } catch (error) {
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
  
  addMedicalInfo: async (data) => {
    try {
      const response = await api.post('/account/profile/personal/medical', data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error adding medical information:', error);
      return { success: false, error };
    }
  },  
  updateMedicalInfo: async (data) => {
    try {
      const response = await api.put('/account/profile/personal/medical', data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating medical information:', error);
      return { success: false, error };
    }
  },
  
  addMedicalReport: async (data) => {
    try {
      const response = await api.post('/account/profile/personal/medical/reports', data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error adding medical report:', error);
      return { success: false, error };
    }
  },
  
  uploadMedicalDocument: async (file, metadata) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('metadata', JSON.stringify(metadata));

      const response = await api.post('/account/profile/personal/medical/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error uploading medical document:', error);
      return { success: false, error };
    }
  },
  
  getMedicalDocuments: async () => {
    try {
      const response = await api.get('/account/profile/personal/medical/documents');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error getting medical documents:', error);
      return { success: false, error };
    }
  },
  
  deleteMedicalDocument: async (documentId) => {
    try {
      const response = await api.delete(`/account/profile/personal/medical/documents/${documentId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error deleting medical document:', error);
      return { success: false, error };
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
  uploadCoverImage: (file) => ProfileService.uploadCoverPhoto(file),

  // Basic Personal Info Methods
  getPersonalInfo: async () => {
    try {
      const response = await api.get(PERSONAL_ENDPOINTS.GET_PROFILE);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  updateBasicInfo: async (data) => {
    try {
      const response = await api.put(PERSONAL_ENDPOINTS.UPDATE_BASIC_INFO, data);
      
      // Update cache
      const cache = CacheManager.get(CACHE_KEY);
      if (cache.profile) {
        CacheManager.set(CACHE_KEY, {
          profile: { ...cache.profile, personal: { ...cache.profile.personal, ...data } },
          lastRefresh: Date.now()
        });
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Education Methods
  getEducation: async () => {
    try {
      const response = await api.get(PERSONAL_ENDPOINTS.GET_EDUCATION);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  addEducation: async (data) => {
    try {
      const response = await api.post(PERSONAL_ENDPOINTS.ADD_EDUCATION, data);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  updateEducation: async (id, data) => {
    try {
      const response = await api.put(PERSONAL_ENDPOINTS.UPDATE_EDUCATION(id), data);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  deleteEducation: async (id) => {
    try {
      const response = await api.delete(PERSONAL_ENDPOINTS.DELETE_EDUCATION(id));
      
      // Update cache or state if necessary
      const cache = CacheManager.get(CACHE_KEY);
      if (cache.profile && cache.profile.personal) {
        const updatedEducation = cache.profile.personal.education.filter(edu => edu.id !== id);
        CacheManager.set(CACHE_KEY, {
          profile: { ...cache.profile, personal: { ...cache.profile.personal, education: updatedEducation } },
          lastRefresh: Date.now()
        });
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Medical Info Methods
  getMedicalInfo: async () => {
    try {
      const response = await api.get(PERSONAL_ENDPOINTS.GET_MEDICAL);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  updateMedicalInfo: async (data) => {
    try {
      const response = await api.put(PERSONAL_ENDPOINTS.UPDATE_MEDICAL, data);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Medical Reports Methods
  getMedicalReports: async () => {
    try {
      const response = await api.get(PERSONAL_ENDPOINTS.GET_MEDICAL_REPORTS);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  addMedicalReport: async (data) => {
    try {
      const response = await api.post(PERSONAL_ENDPOINTS.ADD_MEDICAL_REPORT, data);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  updateMedicalReport: async (id, data) => {
    try {
      const response = await api.put(PERSONAL_ENDPOINTS.UPDATE_MEDICAL_REPORT(id), data);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  deleteMedicalReport: async (id) => {
    try {
      const response = await api.delete(PERSONAL_ENDPOINTS.DELETE_MEDICAL_REPORT(id));
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  }
}