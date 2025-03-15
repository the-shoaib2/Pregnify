import api from '../api'
import { memoize, debounce } from 'lodash'
import { CacheManager, CONSTANTS } from '../../utils/security'
import { logError, retryRequest } from '../../utils/errorHandler'
import { loadProfile } from '../settings/index'

const MIN_REFRESH_INTERVAL = CONSTANTS.CACHE_DURATION
const CACHE_DURATION = CONSTANTS.CACHE_DURATION

// Track refresh token operations
let refreshTokenPromise = null

// Add request cache
const requestCache = new Map()

// Optimized auth service
export const AuthService = {
  login: async (credentials) => {
    try {
      console.time('Total Login Flow')
      
      // Single login request that returns all needed data
      const loginResponse = await api.post('/auth/login', credentials, {
        params: {
          include: 'user,profile,settings,preferences' // Include profile in initial request
        },
        headers: {
          'Priority': 'high'
        }
      })

      if (!loginResponse.data?.tokens?.accessToken) {
        throw new Error('No access token received')
      }

      // Batch process all data in memory
      const { tokens, user, profile, settings } = loginResponse.data

      // Set token for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`

      // Prepare and cache all data at once
      const cacheData = {
        tokens,
        user,
        profile, // Cache profile immediately
        settings,
        lastRefresh: Date.now(),
        timestamp: Date.now()
      }

      // Single cache update
      CacheManager.set(cacheData)

      console.timeEnd('Total Login Flow')
      return loginResponse.data
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

  // Optimized getProfile to use cached data first
  getProfile: memoize(
    async (options = {}) => {
      const opts = options || {}
      const { forceRefresh = false } = opts
      const cacheKey = 'profile'

      try {
        // Check request cache first to prevent duplicate in-flight requests
        if (!forceRefresh && requestCache.has(cacheKey)) {
          return requestCache.get(cacheKey)
        }

        const cache = CacheManager.get()
        
        // Use cached profile if valid and not forcing refresh
        if (!forceRefresh && cache.profile && 
            Date.now() - cache.timestamp < CACHE_DURATION) {
          return cache.profile
        }

        // Only fetch if needed
        const promise = api.get('/account/profile')
          .then(response => {
            const profile = response.data
            
            // Update cache with new profile data
            CacheManager.set({
              profile,
              lastRefresh: Date.now()
            })
            
            return profile
          })
          .catch(error => {
            requestCache.delete(cacheKey)
            throw error
          })
          .finally(() => {
            // Clear request cache after delay
            setTimeout(() => requestCache.delete(cacheKey), 2000)
          })

        // Store promise in request cache to prevent duplicate calls
        requestCache.set(cacheKey, promise)
        return promise

      } catch (error) {
        requestCache.delete(cacheKey)
        throw error
      }
    },
    // Cache key based on forceRefresh flag and time window
    (options = {}) => `${options?.forceRefresh || false}-${Math.floor(Date.now() / 30000)}`
  ),

  // Load user with options


  // Improved refresh token with singleton promise
  refreshToken: async () => {
    // If a refresh is already in progress, return that promise
    if (refreshTokenPromise) {
      return refreshTokenPromise
    }
    
    try {
      refreshTokenPromise = (async () => {
        const cache = CacheManager.get()
        
        if (!cache.tokens?.refreshToken) {
          throw new Error('No refresh token available')
        }
        
        const response = await api.post('/auth/refresh-token', {
          refreshToken: cache.tokens.refreshToken
        })
        
        // Update tokens in cache
        CacheManager.set({
          tokens: response.data.tokens
        })
        
        return response
      })()
      
      return await refreshTokenPromise
    } catch (error) {
      CacheManager.clear()
      throw error
    } finally {
      // Clear the promise reference after completion
      refreshTokenPromise = null
    }
  },

  register: async (data) => {
    const response = await api.post('/auth/register', data)
    CacheManager.clear() // Clear cache on new registration
    return response
  },

  getCurrentUser: memoize(
    async () => {
      const cacheKey = 'current-user'
      
      try {
        // Check request cache first
        if (requestCache.has(cacheKey)) {
          return requestCache.get(cacheKey)
        }

        const cache = CacheManager.get()
        
        // Use cached user if valid
        if (cache.user && Date.now() - cache.timestamp < CACHE_DURATION) {
          return cache.user
        }

        // Store promise in request cache
        const promise = api.get('/auth/user')
          .then(response => {
            const user = response.data
            
            // Update cache
            CacheManager.set({
              user,
              lastRefresh: Date.now()
            })
            
            return user
          })
          .finally(() => {
            // Clear request cache after 1 second
            setTimeout(() => requestCache.delete(cacheKey), 1000)
          })

        requestCache.set(cacheKey, promise)
        return promise

      } catch (error) {
        if (error.response?.status === 401) {
          requestCache.delete(cacheKey)
          try {
            await AuthService.refreshToken()
            return AuthService.getCurrentUser()
          } catch (refreshError) {
            CacheManager.clear() 
            throw refreshError
          }
        }
        throw error
      }
    },
    // Cache key based on timestamp (cache for 30 seconds)
    () => Math.floor(Date.now() / 30000)
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
