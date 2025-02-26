import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { lazyLoad } from '@/utils/lazy-load.jsx'

const AuthContext = createContext({})

const API_URL = import.meta.env.VITE_API_URL

// Cache duration in milliseconds
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Lazy load profile fetching
const fetchProfileData = async () => {
  try {
    const response = await axios.get(`${API_URL}/account/profile`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch profile:', error)
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Initialize from localStorage if available
    const cachedUser = localStorage.getItem('cached_user')
    return cachedUser ? JSON.parse(cachedUser) : null
  })
  const [profile, setProfile] = useState(() => {
    const cachedProfile = localStorage.getItem('cached_profile')
    return cachedProfile ? JSON.parse(cachedProfile) : null
  })
  const [loading, setLoading] = useState(true)
  const [isLoadingUser, setIsLoadingUser] = useState(false)
  const authCheckInProgress = useRef(false)
  const lastFetchTime = useRef(Date.now())
  const profileFetchTimeout = useRef(null)

  const fetchProfile = useCallback(async () => {
    if (profileFetchTimeout.current) {
      clearTimeout(profileFetchTimeout.current)
    }

    // Use a timeout to delay profile fetch
    return new Promise((resolve) => {
      profileFetchTimeout.current = setTimeout(async () => {
        const profileData = await fetchProfileData()
        if (profileData) {
          setProfile(profileData)
          localStorage.setItem('cached_profile', JSON.stringify(profileData))
        }
        resolve(profileData)
      }, 500) // Half second delay
    })
  }, [])

  // Optimize token handling
  const setAuthToken = useCallback((token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      localStorage.setItem('accessToken', token)
      Cookies.set('accessToken', token)
    }
  }, [])

  const debouncedFetchUserData = useCallback(async (force = false) => {
    if (isLoadingUser) return null
    
    const now = Date.now()
    const timeSinceLastFetch = now - lastFetchTime.current

    // Return cached data if within cache duration and not forced
    if (!force && user && timeSinceLastFetch < CACHE_DURATION) {
      return user
    }

    setIsLoadingUser(true)
    try {
      const response = await axios.get(`${API_URL}/auth/user`)
      const userData = response.data.user
      setUser(userData)
      localStorage.setItem('cached_user', JSON.stringify(userData))
      lastFetchTime.current = now

      // Lazy load profile after user data is fetched
      fetchProfile()

      return userData
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      return null
    } finally {
      setIsLoadingUser(false)
    }
  }, [isLoadingUser, user, fetchProfile])

  const checkAuth = useCallback(async () => {
    if (authCheckInProgress.current) return
    authCheckInProgress.current = true

    try {
      const token = localStorage.getItem('accessToken') || Cookies.get('accessToken')
      if (!token) {
        setLoading(false)
        return
      }

      setAuthToken(token)
      // Only fetch if cache is expired
      const now = Date.now()
      const timeSinceLastFetch = now - lastFetchTime.current
      if (timeSinceLastFetch >= CACHE_DURATION) {
        await debouncedFetchUserData(true)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      handleLogout()
    } finally {
      setLoading(false)
      authCheckInProgress.current = false
    }
  }, [debouncedFetchUserData, setAuthToken])

  // Initialize auth state
  useEffect(() => {
    const token = localStorage.getItem('accessToken') || Cookies.get('accessToken')
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
    setUser(null)
    setProfile(null)
    localStorage.removeItem('cached_user')
    localStorage.removeItem('cached_profile')
    lastFetchTime.current = 0
    
    if (profileFetchTimeout.current) {
      clearTimeout(profileFetchTimeout.current)
    }
    
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    
    Cookies.remove('accessToken', { path: '/' })
    Cookies.remove('refreshToken', { path: '/' })
    Cookies.remove('user', { path: '/' })
    Cookies.remove('session', { path: '/' })
    
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
  }, [])

  const value = {
    user,
    profile,
    loading,
    isLoadingUser,
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