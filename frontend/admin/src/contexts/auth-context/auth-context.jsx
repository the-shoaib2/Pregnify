import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { ProfileService } from '@/services/settings'
import { AuthService } from '@/services/auth'
import { encryptData, decryptData, CONSTANTS } from '@/utils/security'

const AuthContext = createContext({})

const API_URL = import.meta.env.VITE_API_URL


export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    const cachedAuth = localStorage.getItem(CONSTANTS.AUTH_CACHE_KEY)
    return cachedAuth ? decryptData(cachedAuth) : { user: null, profile: null, tokens: null }
  })
  
  const [loading, setLoading] = useState(true)
  const [isLoadingUser, setIsLoadingUser] = useState(false)
  const authCheckInProgress = useRef(false)
  const lastFetchTime = useRef(Date.now())
  const refreshInProgress = useRef(false)
  const lastRefreshTime = useRef(Date.now())
  const MIN_REFRESH_INTERVAL = CONSTANTS.MIN_REFRESH_INTERVAL // 2 seconds between refreshes

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
    localStorage.setItem(CONSTANTS.AUTH_CACHE_KEY, encryptedState)
  }, [])

  // Optimize token handling
  const setAuthToken = useCallback((token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      const authData = {
        accessToken: token,
        timestamp: Date.now()
      }
      localStorage.setItem(CONSTANTS.AUTH_CACHE_KEY, encryptData({
        ...authState,
        tokens: authData
      }))
    }
  }, [authState])

  const fetchUserData = useCallback(async (force = false) => {
    try {
      const userData = await AuthService.fetchUserData(force)
      if (userData) {
        updateAuthCache({ ...authState, user: userData })
      }
      return userData
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      return null
    }
  }, [authState, updateAuthCache])

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
      
      if (!user || timeSinceLastFetch >= CONSTANTS.CACHE_DURATION) {
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


  const handleLogin = useCallback(async (credentials) => {
    try {
      setIsLoadingUser(true)
      
      const { user, tokens } = await AuthService.login(credentials)
      
      // Update local state with user data from login response
      updateAuthCache({
        user,
        tokens: {
          accessToken: tokens.accessToken,
          timestamp: Date.now()
        }
      })

      return { user, tokens }
    } catch (error) {
      toast.error(error.message || 'Login failed. Please try again.')
      throw error
    } finally {
      setIsLoadingUser(false)
    }
  }, [updateAuthCache])

  const handleLogout = useCallback(async () => {
    try {
      // Call the logout API through the service
      await AuthService.logout();
    } catch (error) {
      console.error('Error during logout:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear local state
      updateAuthCache({ user: null, profile: null });
      lastFetchTime.current = 0;
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem(CONSTANTS.AUTH_CACHE_KEY);
    }
  }, [updateAuthCache]);



  
  const refreshData = useCallback(async () => {
    const now = Date.now()
    if (now - lastRefreshTime.current < CONSTANTS.MIN_REFRESH_INTERVAL) {
      return { userData: user, profileData: profile }
    }

    lastRefreshTime.current = now
    const userData = await fetchUserData(true)
    // const profileData = await fetchProfile()
    
    return { userData, profileData }
  }, [fetchUserData, user])

  const contextValue = useMemo(() => ({
    user,
    loading,
    isLoadingUser,
    login: handleLogin,
    logout: handleLogout,
    fetchUserData,
    refreshData,
    checkAuth
  }), [user, loading, isLoadingUser, handleLogin, handleLogout, fetchUserData, refreshData, checkAuth, setAuthToken, updateAuthCache])

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