import axios from 'axios'
import { CacheManager } from '../utils/security'

const API_URL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor with improved token handling
api.interceptors.request.use(
  (config) => {
    // Always get the latest token from CacheManager
    const token = CacheManager.getToken()
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Special handling for FormData
    if (config.data instanceof FormData) {
      // Set specific boundary
      const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2)
      config.headers['Content-Type'] = `multipart/form-data; boundary=${boundary}`
      
      // Don't transform the data
      config.transformRequest = [(data) => data]
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor with rate limiting and auth handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Handle rate limiting
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 5
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

        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken
        })

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
        // Clear cache on refresh failure
        CacheManager.clear()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api 