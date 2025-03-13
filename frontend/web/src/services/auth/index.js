import api from '../api'
import { memoize, debounce } from 'lodash'
import { CacheManager, CONSTANTS } from '../../utils/security'
import { logError } from '../../utils/errorHandler'
import { loadProfile } from '../settings/index'

const { CACHE_DURATION } = CONSTANTS
const MIN_REFRESH_INTERVAL = 2000 // 2 seconds

// Optimized auth service
export const AuthService = {
  login: async (credentials) => {
    try {
      // First, perform login
      const response = await api.post('/auth/login', credentials)
      
      if (!response.data?.tokens?.accessToken) {
        throw new Error('No access token received')
      }

      // Set token in API client
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.tokens.accessToken}`

      // Immediately fetch user data
      const userResponse = await api.get('/auth/user')
      
      // Update cache with both login response and user data
      CacheManager.set({
        user: userResponse.data.user,
        tokens: response.data.tokens,
        profile: response.data.profile,
        lastRefresh: Date.now()
      })

      return {
        ...response.data,
        user: userResponse.data.user
      }
    } catch (error) {
      CacheManager.clear()
      throw error
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/auth/logout')
      CacheManager.clear()
      return response
    } catch (error) {
      CacheManager.clear()
      throw error
    }
  },

  getProfile: async (options = {}) => {
    const { forceRefresh = false } = options
    return loadProfile(forceRefresh)
  },

  refreshToken: memoize(async () => {
    try {
      const cache = CacheManager.get()
      const response = await api.post('/auth/refresh', {
        refreshToken: cache.tokens?.refreshToken
      })
      
      // Update tokens in cache
      CacheManager.set({
        tokens: response.data.tokens
      })
      
      return response
    } catch (error) {
      CacheManager.clear()
      throw error
    }
  }, () => 'refresh_token', 300000), // 5 minutes cache

  register: async (data) => {
    const response = await api.post('/auth/register', data)
    CacheManager.clear() // Clear cache on new registration
    return response
  },

  getCurrentUser: memoize(
    async () => {
      const MAX_RETRIES = 3
      let retryCount = 0
  
      while (retryCount < MAX_RETRIES) {
        try {
          const cacheKey = 'user'
          const cache = CacheManager.get()
          if (cache[cacheKey] && Date.now() - cache.timestamp < CACHE_DURATION) {
            return cache[cacheKey]
          }
          const response = await api.get('/auth/user')
          CacheManager.set({
            [cacheKey]: response
          })
          console.log('User fetched from API:', response) // Debugging
          return response
        } catch (error) {
          retryCount++
          if (retryCount === MAX_RETRIES) {
            logError(error)
            throw error
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
        }
      }
    }
  ),
  
  findUserForReset: memoize(
    async (data) => {
      try {
        const response = await api.post('/verification/forgot-password/find-user', {
          identify: data.searchTerm
        })
        
        if (!response.data?.success || !response.data?.data) {
          throw new Error('Invalid response format')
        }
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
    (data) => data.searchTerm // Memoization key
  ),

  sendResetCode: debounce(
    async ({ userId, method = 'email', type = 'code' }) => {
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
    MIN_REFRESH_INTERVAL,
    { leading: true, trailing: false }
  ),

  verifyResetCode: memoize(
    async ({ userId, code, method = 'email' }) => {
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
    ({ userId, code }) => `${userId}-${code}` // Memoization key
  ),

  resetPassword: memoize(async ({ token, newPassword, confirmPassword }) => {
    try {
      const response = await api.post('/verification/forgot-password/reset-password', {
        token,
        newPassword,
        confirmPassword
      })
      CacheManager.clear()
      return response
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error('Password reset failed. Please try again')
      }
      throw error
    }
  }, (args) => JSON.stringify(args), 300000)  // 5 minutes
}
