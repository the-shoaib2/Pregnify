import axios from 'axios'
import { CacheManager } from '../utils/security'

const API_URL = import.meta.env.VITE_API_URL

// Add performance tracking
const performanceLog = {
  requests: new Map(),
  logTiming: (config, duration) => {
    console.log(`🚀 ${config.method.toUpperCase()} ${config.url}: ${duration}ms`)
  }
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // Browser-compatible timeout and retry settings
  timeout: 10000,
  validateStatus: status => status < 500,
  retry: 1,
  retryDelay: 1000,
  // Performance options
  decompress: true,
  maxRedirects: 5,
  transitional: {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: true
  }
})

// Optimize request queue with memory cleanup
const requestQueue = new Map()
const queueTimeout = 50 // Reduce queue timeout

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    performanceLog.requests.set(config, Date.now())
    
    const token = CacheManager.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Queue similar requests with shorter timeout
    const requestKey = `${config.method}-${config.url}`
    if (requestQueue.has(requestKey)) {
      return requestQueue.get(requestKey)
    }

    const promise = Promise.resolve(config)
    requestQueue.set(requestKey, promise)
    setTimeout(() => requestQueue.delete(requestKey), queueTimeout)

    return promise
  },
  (error) => Promise.reject(error)
)

// Response interceptor with timing and safe caching
api.interceptors.response.use(
  (response) => {
    // Calculate and log request duration
    const startTime = performanceLog.requests.get(response.config)
    if (startTime) {
      const duration = Date.now() - startTime
      performanceLog.logTiming(response.config, duration)
      performanceLog.requests.delete(response.config)
    }

    // Cache successful GET responses if caching headers allow
    if (response.config.method === 'get') {
      try {
        const cacheKey = `api-cache-${response.config.url}`
        sessionStorage.setItem(cacheKey, JSON.stringify({
          data: response.data,
          timestamp: Date.now()
        }))
      } catch (e) {
        console.warn('Cache storage failed:', e)
      }
    }

    return response
  },
  async (error) => {
    // Log timing for errors too
    if (error.config) {
      const startTime = performanceLog.requests.get(error.config)
      if (startTime) {
        const duration = Date.now() - startTime
        performanceLog.logTiming(error.config, duration)
        performanceLog.requests.delete(error.config)
      }
    }

    const originalRequest = error.config

    // Handle rate limiting
    if (error.response?.status === 429) {
      const retryAfter = parseInt(error.response.headers['retry-after']) || 5
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000))
      return api(originalRequest)
    }

    // Handle authentication errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const cache = CacheManager.get()
        const refreshToken = cache.tokens?.refreshToken
        
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        console.time('Token Refresh')
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken
        })
        console.timeEnd('Token Refresh')

        const { accessToken } = response.data
        
        // Update token in cache
        CacheManager.set({
          tokens: {
            ...cache.tokens,
            accessToken
          }
        })
        
        // Update the current request's authorization header
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        CacheManager.clear()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api 