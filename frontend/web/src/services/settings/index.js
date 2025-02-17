import api from '../api'

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