import api from '../api'
import { CacheManager, CONSTANTS } from '../../utils/security'
import { AuthService } from '../auth'
import { handleApiError } from '../../utils/errorHandler'

const { CACHE_DURATION } = CONSTANTS

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

// Profile loader with improved error handling and request deduplication
export const loadProfile = async (forceRefresh = false) => {
  const now = Date.now();
  const cache = CacheManager.get();
  const token = CacheManager.getToken();

  // If a request is already in progress, return that promise
  if (profileRequestPromise && !forceRefresh) {
    return profileRequestPromise;
  }

  // Check cache first if not forcing refresh and not within minimum fetch interval
  if (!forceRefresh && 
      cache.profile && 
      now - lastProfileFetchTime > MIN_FETCH_INTERVAL &&
      now - cache.lastRefresh < CACHE_DURATION) {
    return cache.profile;
  }

  // Ensure we have a token
  if (!token) {
    try {
      // Try to refresh the token
      await AuthService.refreshToken();
    } catch (error) {
      console.error('Authentication required for profile loading:', error);
      throw new Error('Authentication required');
    }
  }

  try {
    // Create a new request promise
    profileRequestPromise = (async () => {
      // Use the API instance which will automatically include the token
      const response = await api.get(PROFILE_ENDPOINTS.GET_PROFILE);
      
      const profile = response.data;
      
      // Update cache
      CacheManager.set({
        profile,
        lastRefresh: now
      });

      lastProfileFetchTime = now;
      return profile;
    })();

    return await profileRequestPromise;
  } catch (error) {
    if (error.response?.status === 401) {
      CacheManager.clear();
      throw new Error('Authentication required');
    }
    const errorMessage = handleApiError(error);
    throw new Error(errorMessage);
  } finally {
    // Clear the promise reference after completion
    profileRequestPromise = null;
  }
}

// Centralized profile handling
export const ProfileService = {
  getProfile: async (forceRefresh = false) => {
    try {
      return await loadProfile(forceRefresh);
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error;
    }
  },

  updateProfile: (data) => api.patch(PROFILE_ENDPOINTS.UPDATE_PROFILE, data),
}

export const SettingsService = {
  // Profile & Personal Info
  getProfile: () => api.get('/account/profile'),
  updatePersonalInfo: (data) => api.patch('/account/profile/update', data),
  updateEducation: (data) => api.patch('/account/education', data),
  updateMedicalInfo: (data) => api.patch('/account/medical-info', data),
  updateEmergencyContacts: (data) => api.patch('/account/emergency-contacts', data),

  // Account Settings
  getSettings: () => api.get('/account/settings'),
  updateSettings: (data) => api.patch('/account/settings', data),
  updateSecurity: (data) => api.patch('/account/security', data),
  
  // Preferences
  updatePreferences: (data) => api.patch('/account/preferences', data),
  updateAppearance: (data) => api.patch('/account/appearance', data),
  updateNotifications: (data) => api.patch('/account/notifications', data),
  updatePrivacy: (data) => api.patch('/account/privacy', data),

   // Activity & Account Management
   getActivityLogs: () => api.get('/account/activity'),
   deleteAccount: () => api.delete('/account/delete'),

 
   // Profile Image
   uploadProfileImage: (file) => {
     const formData = new FormData()
     formData.append('avatar', file)
     return api.post('/account/profile/avatar', formData, {
       headers: {
         'Content-Type': 'multipart/form-data'
       }
     })
   },
   
   uploadCoverImage: (file) => {
     const formData = new FormData()
     formData.append('cover', file)
     return api.post('/account/profile/cover', formData, {
       headers: {
         'Content-Type': 'multipart/form-data'
       }
     })
   }
} 