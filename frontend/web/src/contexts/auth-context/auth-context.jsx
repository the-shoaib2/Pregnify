import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo, lazy } from 'react'
import axios from 'axios'
import { lazyLoad } from '@/utils/lazy-load.jsx'
import { toast } from 'react-hot-toast'
import { memoize } from 'lodash'
import CryptoJS from 'crypto-js'

const AuthContext = createContext({})

const API_URL = import.meta.env.VITE_API_URL

// Cache duration in milliseconds
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Memoized profile fetching
const fetchProfileData = memoize(async () => {
  try {
    const response = await axios.get(`${API_URL}/account/profile`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch profile:', error)
    return null
  }
})

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
    const profileData = await fetchProfileData()
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
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
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
        const response = await axios.post(`${API_URL}/auth/login`, credentials)
        const { tokens } = response.data
        
        if (tokens?.accessToken) {
          setAuthToken(tokens.accessToken)
          await fetchUserData(true)
          return response.data
        }
        throw new Error('No access token received')
      } finally {
        setIsLoadingUser(false)
      }
    },
    logout: handleLogout,
    fetchUserData,
    refreshData,
    checkAuth
  }), [user, profile, loading, isLoadingUser, handleLogout, fetchUserData, refreshData, checkAuth])

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