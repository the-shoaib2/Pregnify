import CryptoJS from 'crypto-js'
import { memoize } from 'lodash'

// Cache configuration
const CACHE_DURATION = 15 * 24 * 60 * 1000 // 15 minutes
const AUTH_CACHE_KEY = 'auth_cache'
const MIN_REFRESH_INTERVAL = 2000 // 2 seconds between refreshes
// Encryption configuration
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY

// Cache structure
const initialCache = {
  user: null,
  profile: null,
  tokens: null,
  timestamp: null,
  lastRefresh: null
}

// Encryption functions with error handling
const encryptData = (data) => {
  try {
    return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString()
  } catch (error) {
    console.error('Encryption error:', error)
    return null
  }
}

const decryptData = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY)
    const decrypted = bytes.toString(CryptoJS.enc.Utf8)
    if (!decrypted) return null
    return JSON.parse(decrypted)
  } catch (error) {
    console.error('Decryption error:', error)
    return null
  }
}

// Add new memoized token getter
const memoizedGetToken = memoize(
  () => {
    try {
      const cache = localStorage.getItem(AUTH_CACHE_KEY)
      if (!cache) return null
      
      const decrypted = decryptData(cache)
      return decrypted?.tokens?.accessToken || null
    } catch (error) {
      console.error('Token retrieval error:', error)
      return null
    }
  },
  // Cache for 1 minute
  () => Math.floor(Date.now() / 60000)
)

// Improved cache manager with token validation
export const CacheManager = {
  get: () => {
    try {
      const cache = localStorage.getItem(AUTH_CACHE_KEY)
      if (!cache) return { ...initialCache }
      
      const decrypted = decryptData(cache)
      if (!decrypted) return { ...initialCache }
      
      // Check cache validity
      if (Date.now() - decrypted.timestamp > CACHE_DURATION) {
        CacheManager.clear()
        return { ...initialCache }
      }
      
      return decrypted
    } catch (error) {
      console.error('Cache retrieval error:', error)
      return { ...initialCache }
    }
  },

  set: (data) => {
    try {
      const currentCache = CacheManager.get()
      const newCache = {
        ...currentCache,
        ...data,
        timestamp: Date.now()
      }
      const encrypted = encryptData(newCache)
      if (encrypted) {
        localStorage.setItem(AUTH_CACHE_KEY, encrypted)
      }
    } catch (error) {
      console.error('Cache set error:', error)
    }
  },

  clear: () => {
    try {
      localStorage.removeItem(AUTH_CACHE_KEY)
    } catch (error) {
      console.error('Cache clear error:', error)
    }
  },

  getToken: () => {
    return memoizedGetToken()
  },
  
  // Check if token is valid (not expired)
  isTokenValid: () => {
    try {
      const cache = CacheManager.get()
      if (!cache.tokens?.accessToken) return false
      
      // Check if token timestamp is within cache duration
      return Date.now() - cache.timestamp < CACHE_DURATION
    } catch (error) {
      console.error('Token validation error:', error)
      return false
    }
  },

  // Add new method to invalidate token cache
  invalidateTokenCache: () => {
    memoizedGetToken.cache.clear()
  }
}

export const CONSTANTS = {
  CACHE_DURATION,
  AUTH_CACHE_KEY,
  MIN_REFRESH_INTERVAL
}

export { encryptData, decryptData } 