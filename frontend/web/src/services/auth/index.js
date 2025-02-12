import api from '../api'

export const AuthService = {
  // Authentication
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  logout: (data) => api.post('/auth/logout', data),
  refreshToken: (data) => api.post('/auth/refresh-token', data),
  getCurrentUser: () => api.get('/auth/me'),
  
  // Password Recovery
  findUserForReset: async (data) => {
    try {
      const response = await api.post('/verification/forgot-password/find-user', {
        identify: data.searchTerm // can be email, phone, username, or name
      })
      
      if (!response.data?.success || !response.data?.data) {
        throw new Error('Invalid response format')
      }
      console.log(response);
      return response
    
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('No account found with this information')
      } else if (error.response?.status === 429) {
        throw new Error('Too many attempts. Please try again later')
      } else if (!error.response) {
        throw new Error('Network error. Please check your connection')
      }
      throw error
    }
  },

  sendResetCode: async ({ userId, method = 'email', type = 'code' }) => {
    try {
      const response = await api.post('/verification/forgot-password/send-verification', {
        userId,
        method,
        type
      })
      return response
    } catch (error) {
      if (error.response?.status === 429) {
        throw new Error('Too many code requests. Please wait before trying again')
      }
      throw error
    }
  },

  verifyResetCode: async ({ userId, code, method = 'email' }) => {
    try {
      const response = await api.post('/verification/forgot-password/verify-code', {
        userId,
        code,
        method
      })
      return response
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error('Invalid or expired code')
      }
      throw error
    }
  },

  resetPassword: async ({ token, newPassword, confirmPassword }) => {
    try {
      const response = await api.post('/verification/forgot-password/reset-password', {
        token,
        newPassword,
        confirmPassword
      })
      return response
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error('Password reset failed. Please try again')
      }
      throw error
    }
  }
} 