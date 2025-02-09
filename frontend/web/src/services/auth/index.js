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

  // Password Recovery
  findUserForReset: async (data) => {
    try {
      const response = await api.post('/auth/forgot-password/find-user', data)
      
      // Validate response structure
      if (!response.data?.success || !response.data?.data) {
        throw new Error('Invalid response format')
      }

      return response
    } catch (error) {
      console.error('AuthService: Find user error:', error)
      
      // Enhance error message based on error type
      if (error.response?.status === 404) {
        error.message = 'User not found'
      } else if (error.response?.status === 429) {
        error.message = 'Too many attempts. Please try again later'
      } else if (!error.response) {
        error.message = 'Network error. Please check your connection'
      }
      
      throw error
    }
  },

  sendResetCode: async (data) => {
    try {
      const response = await api.post('/auth/forgot-password/send-code', data)
      return response
    } catch (error) {
      console.error('AuthService: Send code error:', error)
      throw error
    }
  },

  verifyResetCode: async (data) => {
    try {
      const response = await api.post('/auth/forgot-password/verify-code', data)
      return response
    } catch (error) {
      console.error('AuthService: Verify code error:', error)
      throw error
    }
  },

  resetPassword: async (data) => {
    try {
      const response = await api.post('/auth/forgot-password/reset', data)
      return response
    } catch (error) {
      console.error('AuthService: Reset password error:', error)
      throw error
    }
  }
} 