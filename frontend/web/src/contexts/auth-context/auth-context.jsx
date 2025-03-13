import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo, lazy } from 'react'
import axios from 'axios'
import { lazyLoad } from '@/utils/lazy-load.jsx'
import { toast } from 'react-hot-toast'
import { memoize } from 'lodash'
import CryptoJS from 'crypto-js'
import { ProfileService } from '@/services/settings'

const AuthContext = createContext({})

const API_URL = import.meta.env.VITE_API_URL

// Cache duration in milliseconds
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-secure-key'

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


export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    const cachedAuth = localStorage.getItem('auth_cache')
    return cachedAuth ? decryptData(cachedAuth) : { user: null, profile: null, tokens: null }
  })
  
  const [loading, setLoading] = useState(true)
  const [isLoadingUser, setIsLoadingUser] = useState(false)
  const authCheckInProgress = useRef(false)
  const lastFetchTime = useRef(Date.now())
  const refreshInProgress = useRef(false)
  const lastRefreshTime = useRef(Date.now())
  const MIN_REFRESH_INTERVAL = 2000 // 2 seconds between refreshes

  // Memoized auth state
  const { user, profile, tokens } = useMemo(() => authState, [authState])

  const updateAuthCache = useCallback((newState) => {
    const encryptedState = encryptData({
      ...newState,
      tokens: {
        accessToken: axios.defaults.headers.common['Authorization']?.split(' ')[1],
        timestamp: Date.now()
      }
    })
    setAuthState(newState)
    localStorage.setItem('auth_cache', encryptedState)
  }, [])

  const fetchProfile = useCallback(async () => {
    const profileData = await ProfileService.getProfile()
    if (profileData) {
      updateAuthCache({ ...authState, profile: profileData })
    }
    return profileData
  }, [authState, updateAuthCache])

  // Optimize token handling
  const setAuthToken = useCallback((token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      const authData = {
        accessToken: token,
        timestamp: Date.now()
      }
      localStorage.setItem('auth_cache', encryptData({
        ...authState,
        tokens: authData
      }))
    }
  }, [authState])

  const fetchUserData = useCallback(async (force = false) => {
    const MAX_RETRIES = 3
    let retryCount = 0

    while (retryCount < MAX_RETRIES) {
      try {
        // Don't fetch if already in progress
        if (refreshInProgress.current) return null
        
        const now = Date.now()
        const timeSinceLastRefresh = now - lastRefreshTime.current

        // Return cached data if within cache duration and not forced
        if (!force && user && timeSinceLastRefresh < CACHE_DURATION) {
          return user
        }

        // Prevent refresh spam
        if (timeSinceLastRefresh < MIN_REFRESH_INTERVAL) {
          return user
        }

        refreshInProgress.current = true
        
        try {
          const response = await axios.get(`${API_URL}/auth/user`)
          const userData = response.data.user
          updateAuthCache({ ...authState, user: userData })
          lastRefreshTime.current = now
          return userData
        } catch (error) {
          console.error('Failed to fetch user data:', error)
          // Don't return null immediately on first login attempt
          if (force && retryCount < MAX_RETRIES - 1) {
            throw error; // Propagate error to trigger retry
          }
          return null
        } finally {
          refreshInProgress.current = false
        }
      } catch (error) {
        retryCount++
        if (retryCount === MAX_RETRIES) {
          console.error('Failed to fetch user data after retries:', error)
          throw error
        }
        // Exponential backoff for retries
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1)))
      }
    }
  }, [user, authState, updateAuthCache])

  const checkAuth = useCallback(async () => {
    if (authCheckInProgress.current) return
    authCheckInProgress.current = true

    try {
      const token = tokens?.accessToken

      if (!token) {
        setLoading(false)
        return
      }

      setAuthToken(token)
      
      const now = Date.now()
      const timeSinceLastFetch = now - lastFetchTime.current
      
      if (!user || timeSinceLastFetch >= CACHE_DURATION) {
        await fetchUserData(true)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      handleLogout()
    } finally {
      setLoading(false)
      authCheckInProgress.current = false
    }
  }, [fetchUserData, setAuthToken, user, tokens])

  // Initialize auth state
  useEffect(() => {
    const token = tokens?.accessToken
    
    if (token) {
      setAuthToken(token)
      // Only check auth if we don't have cached user data
      if (!user) {
        checkAuth()
      } else {
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [setAuthToken, checkAuth, user, tokens])

  const handleLogout = useCallback(() => {
    updateAuthCache({ user: null, profile: null })
    lastFetchTime.current = 0
    delete axios.defaults.headers.common['Authorization']
    localStorage.removeItem('auth_cache')
  }, [updateAuthCache])

  const refreshData = useCallback(async () => {
    const now = Date.now()
    if (now - lastRefreshTime.current < MIN_REFRESH_INTERVAL) {
      return { userData: user, profileData: profile }
    }

    lastRefreshTime.current = now
    const userData = await fetchUserData(true)
    const profileData = await fetchProfile()
    
    return { userData, profileData }
  }, [fetchUserData, fetchProfile, user, profile])

  const contextValue = useMemo(() => ({
    user,
    profile,
    loading,
    isLoadingUser,
    login: async (credentials) => {
      try {
        setIsLoadingUser(true)
        // First, perform login
        const response = await axios.post(`${API_URL}/auth/login`, credentials)
        const { tokens } = response.data
        
        if (!tokens?.accessToken) {
          throw new Error('No access token received')
        }

        // Set the token immediately
        setAuthToken(tokens.accessToken)
        
        // Add a small delay before fetching user data to ensure token is properly set
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Retry user data fetch with exponential backoff
        let userData = null;
        let retryCount = 0;
        const MAX_LOGIN_RETRIES = 3;
        
        while (!userData && retryCount < MAX_LOGIN_RETRIES) {
          try {
            userData = await fetchUserData(true);
            if (!userData && retryCount === MAX_LOGIN_RETRIES - 1) {
              toast.error('Failed to fetch user data. Please try again.');
              throw new Error('Failed to fetch user data after multiple attempts');
            }
          } catch (error) {
            retryCount++;
            if (retryCount < MAX_LOGIN_RETRIES) {
              await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
            } else {
              throw error;
            }
          }
        }

        // Update cache with both token and user data
        updateAuthCache({
          user: userData,
          profile: null,
          tokens: {
            accessToken: tokens.accessToken,
            timestamp: Date.now()
          }
        })

        return response.data
      } catch (error) {
        toast.error(error.message || 'Login failed. Please try again.');
        throw error;
      } finally {
        setIsLoadingUser(false)
      }
    },
    logout: handleLogout,
    fetchUserData,
    refreshData,
    checkAuth
  }), [user, profile, loading, isLoadingUser, handleLogout, fetchUserData, refreshData, checkAuth, setAuthToken, updateAuthCache])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}