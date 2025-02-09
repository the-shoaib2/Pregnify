import api from '../api'

export const UserService = {
  // Profile Management
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.patch('/user/profile', data),
  
  // Activity & Sessions
  getActivityLogs: () => api.get('/user/activity'),
  getSessions: () => api.get('/user/sessions'),
  revokeSession: (sessionId) => api.delete(`/user/sessions/${sessionId}`),
  
  // Security
  updateSecuritySettings: (data) => api.patch('/user/security', data),
  getSecurityLogs: () => api.get('/user/security/logs'),
} 