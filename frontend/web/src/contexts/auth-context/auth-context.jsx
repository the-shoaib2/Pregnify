import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { lazyLoad } from '@/utils/lazy-load.jsx'
import { toast } from 'react-hot-toast'
import { debounce, memoize } from 'lodash'

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

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    const cachedAuth = localStorage.getItem('auth_cache')
    return cachedAuth ? JSON.parse(cachedAuth) : { user: null, profile: null }
  })
  
  const [loading, setLoading] = useState(true)
  const [isLoadingUser, setIsLoadingUser] = useState(false)
  const authCheckInProgress = useRef(false)
  const lastFetchTime = useRef(Date.now())
  const profileFetchTimeout = useRef(null)
  const refreshInProgress = useRef(false)
  const lastRefreshTime = useRef(Date.now())
  const MIN_REFRESH_INTERVAL = 2000 // 2 seconds between refreshes

  // Memoized auth state
  const { user, profile } = useMemo(() => authState, [authState])

  const updateAuthCache = useCallback((newState) => {
    setAuthState(newState)
    localStorage.setItem('auth_cache', JSON.stringify(newState))
  }, [])

  const fetchProfile = useCallback(async () => {
    if (profileFetchTimeout.current) {
      clearTimeout(profileFetchTimeout.current)
    }

    return new Promise((resolve) => {
      profileFetchTimeout.current = setTimeout(async () => {
        const profileData = await fetchProfileData()
        if (profileData) {
          updateAuthCache({ ...authState, profile: profileData })
        }
        resolve(profileData)
      }, 500) // Half second delay
    })
  }, [authState, updateAuthCache])

  // Optimize token handling
  const setAuthToken = useCallback((token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // Batch localStorage and cookie operations
      const authData = {
        accessToken: token,
        timestamp: Date.now()
      }
      localStorage.setItem('auth_tokens', JSON.stringify(authData))
      Cookies.set('auth_tokens', JSON.stringify(authData))
    }
  }, [])

  const debouncedFetchUserData = useCallback(
    debounce(async (force = false) => {
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
    }, 500), // 500ms debounce
    [user, authState, updateAuthCache]
  )

  const checkAuth = useCallback(async () => {
    if (authCheckInProgress.current) return
    authCheckInProgress.current = true

    try {
      const authTokens = JSON.parse(localStorage.getItem('auth_tokens') || '{}')
      const token = authTokens.accessToken

      if (!token) {
        setLoading(false)
        return
      }

      setAuthToken(token)
      
      const now = Date.now()
      const timeSinceLastFetch = now - lastFetchTime.current
      
      if (!user || timeSinceLastFetch >= CACHE_DURATION) {
        await debouncedFetchUserData(true)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      handleLogout()
    } finally {
      setLoading(false)
      authCheckInProgress.current = false
    }
  }, [debouncedFetchUserData, setAuthToken, user])

  // Initialize auth state
  useEffect(() => {
    const authTokens = JSON.parse(localStorage.getItem('auth_tokens') || '{}')
    const token = authTokens.accessToken
    
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
  }, [setAuthToken, checkAuth, user])

  const handleLogout = useCallback(() => {
    // Clear auth state
    updateAuthCache({ user: null, profile: null })
    lastFetchTime.current = 0
    
    if (profileFetchTimeout.current) {
      clearTimeout(profileFetchTimeout.current)
    }
    
    // Batch clear operations
    const itemsToClear = {
      localStorage: ['auth_cache', 'auth_tokens'],
      cookies: ['auth_tokens']
    }
    
    itemsToClear.localStorage.forEach(key => localStorage.removeItem(key))
    itemsToClear.cookies.forEach(key => Cookies.remove(key, { path: '/' }))
    
    delete axios.defaults.headers.common['Authorization']
    
    // Clear any auth-related items
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('auth_') || key.includes('token')) {
        localStorage.removeItem(key)
      }
    })
    Object.keys(Cookies.get()).forEach(key => {
      if (key.startsWith('auth_') || key.includes('token')) {
        Cookies.remove(key, { path: '/' })
      }
    })
  }, [updateAuthCache])

  const refreshData = useCallback(async () => {
    const now = Date.now()
    if (now - lastRefreshTime.current < MIN_REFRESH_INTERVAL) {
      return { userData: user, profileData: profile }
    }

    try {
      const [userData, profileData] = await Promise.all([
        debouncedFetchUserData(true),
        fetchProfile()
      ])
      
      return { userData, profileData }
    } catch (error) {
      console.error('Failed to refresh data:', error)
      return { userData: user, profileData: profile }
    }
  }, [user, profile, debouncedFetchUserData, fetchProfile])

  const updateProfile = useCallback(async (data) => {
    try {
      const response = await axios.patch(`${API_URL}/account/profile`, data)
      updateAuthCache({ ...authState, profile: response.data })
      toast.success('Profile updated successfully')
      return response.data
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('Failed to update profile')
      throw error
    }
  }, [authState, updateAuthCache])

  const updateSettings = useCallback(async (data) => {
    try {
      const response = await axios.patch(`${API_URL}/account/settings`, data)
      updateAuthCache({ ...authState, user: { ...user, settings: response.data } })
      toast.success('Settings updated successfully')
      return response.data
    } catch (error) {
      console.error('Failed to update settings:', error)
      toast.error('Failed to update settings')
      throw error
    }
  }, [authState, user, updateAuthCache])

  const value = {
    user,
    profile,
    loading,
    isLoadingUser,
    refreshData,
    updateProfile,
    updateSettings,
    login: useCallback(async (credentials) => {
      try {
        const response = await axios.post(`${API_URL}/auth/login`, credentials)
        if (response.data.tokens?.accessToken) {
          setAuthToken(response.data.tokens.accessToken)
          await debouncedFetchUserData(true)
        }
        return response.data
      } catch (error) {
        throw error.response?.data || error
      }
    }, [setAuthToken, debouncedFetchUserData]),
    logout: useCallback(async () => {
      try {
        await axios.post(`${API_URL}/auth/logout`).catch((error) => {
          console.warn('Server logout failed, proceeding with local cleanup:', error)
        })
      } finally {
        handleLogout()
      }
    }, [handleLogout]),
    register: useCallback(async (credentials) => {
      try {
        const response = await axios.post(`${API_URL}/auth/register`, credentials)
        if (response.data.tokens?.accessToken) {
          setAuthToken(response.data.tokens.accessToken)
          await debouncedFetchUserData(true)
        }
        return response.data
      } catch (error) {
        throw error.response?.data || error
      }
    }, [setAuthToken, debouncedFetchUserData]),
    checkAuth,
    fetchUserData: debouncedFetchUserData,
  }

  return (
    <AuthContext.Provider value={value}>
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