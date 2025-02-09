import api from '../api'

export const AuthService = {
  // Authentication
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  logout: (data) => api.post('/auth/logout', data),
  refreshToken: (data) => api.post('/auth/refresh-token', data),
  getCurrentUser: () => api.get('/auth/me'),
  
  // Password Management
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  
  // Email Verification
  sendVerificationEmail: () => api.post('/auth/send-verification-email'),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
} 