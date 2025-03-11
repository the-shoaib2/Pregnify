import api from '../api'
import { memoize, debounce } from 'lodash'
import CryptoJS from 'crypto-js'

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const MIN_REFRESH_INTERVAL = 2000 // 2 seconds
const AUTH_CACHE_KEY = 'auth_cache'

// Encryption configuration
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY 

// Encryption functions
const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString()
}

const decryptData = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY)
    const decrypted = bytes.toString(CryptoJS.enc.Utf8)
    if (!decrypted) {
      localStorage.removeItem('auth_cache')
      return null
    }
    return JSON.parse(decrypted)
  } catch (error) {
    localStorage.removeItem('auth_cache')
    return null
  }
}

// Cache management
const getCache = () => {
  const cache = localStorage.getItem(AUTH_CACHE_KEY)
  return cache ? decryptData(cache) : { user: null, profile: null, tokens: null }
}

const setCache = (key, value) => {
  const cache = getCache()
  cache[key] = {
    value,
    timestamp: Date.now()
  }
  localStorage.setItem('auth_cache', encryptData(cache))
}

const clearCache = () => {
  localStorage.removeItem('auth_cache')
}

const isCacheValid = (key) => {
  const cache = getCache()
  const item = cache[key]
  if (!item) return false
  return Date.now() - item.timestamp < CACHE_DURATION
}

// Memoized and debounced API calls
const memoizedLogin = memoize(
  (credentials) => api.post('/auth/login', credentials),
  (credentials) => JSON.stringify(credentials)
)


const User = memoize(
  async () => {
    const MAX_RETRIES = 3
    let retryCount = 0

    while (retryCount < MAX_RETRIES) {
      try {
        const cacheKey = 'user'
        if (isCacheValid(cacheKey)) {
          return getCache()[cacheKey].value
        }
        const response = await api.get('/auth/me')
        setCache(cacheKey, response)
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
)

const logError = (error) => {
// Implement error logging logic here


  console.error(error)
}

export const AuthService = {
  // Authentication with optimized caching
  login: async (credentials) => {
    const response = await memoizedLogin(credentials)
    clearCache() // Clear cache on new login
    return response
  },

  register: async (data) => {
    const response = await api.post('/auth/register', data)
    clearCache() // Clear cache on new registration
    return response
  },

  logout: async (data) => {
    const response = await api.post('/auth/logout', data)
    clearCache() // Clear cache on logout
    memoizedLogin.cache.clear() // Clear memoization cache
    User.cache.clear()
    return response
  },

  refreshToken: debounce(
    (data) => api.post('/auth/refresh-token', data),
    MIN_REFRESH_INTERVAL,
    { leading: true, trailing: false }
  ),

  getCurrentUser: memoize(
    async () => {
      const MAX_RETRIES = 3
      let retryCount = 0
  
      while (retryCount < MAX_RETRIES) {
        try {
          const cacheKey = 'user'
          if (isCacheValid(cacheKey)) {
            return getCache()[cacheKey].value
          }
          const response = await api.get('/auth/user')
          setCache(cacheKey, response)
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
      clearCache()
      return response
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error('Password reset failed. Please try again')
      }
      throw error
    }
  }, (args) => JSON.stringify(args), 300000)
}