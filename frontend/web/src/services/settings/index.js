import api from '../api'
import { CacheManager, CONSTANTS } from '../../utils/security'
import { AuthService } from '../auth'

const { CACHE_DURATION } = CONSTANTS

// Profile loader with auth check
export const loadProfile = async (forceRefresh = false) => {
  const cache = CacheManager.get()
  const token = CacheManager.getToken()

  // Check if we need to refresh token
  if (!token) {
    try {
      await AuthService.refreshToken()
    } catch (error) {
      throw new Error('Authentication required')
    }
  }

  // Check cache first
  if (!forceRefresh && 
      cache.profile && 
      Date.now() - cache.lastRefresh < CACHE_DURATION) {
    return cache.profile
  }

  try {
    const response = await api.get('/account/profile', {
      headers: {
        Authorization: `Bearer ${CacheManager.getToken()}`
      }
    })
    
    const profile = response.data

    // Update cache
    CacheManager.set({
      profile,
      lastRefresh: Date.now()
    })

    return profile
  } catch (error) {
    if (error.response?.status === 401) {
      CacheManager.clear()
      throw new Error('Authentication required')
    }
    throw error
  }
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