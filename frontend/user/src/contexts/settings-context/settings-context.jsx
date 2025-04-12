import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { SettingsService } from '@/services'
import { useAuth } from '@/contexts/auth-context/auth-context'
import { toast } from 'react-hot-toast'
import { ProfileService } from '@/services/settings'
import { CacheManager, CONSTANTS } from '@/utils/security'

const SettingsContext = createContext({})

const API_URL = import.meta.env.VITE_API_URL

export function SettingsProvider({ children }) {
  const { user: authUser, login, refreshToken } = useAuth()
  const [state, setState] = useState({
    settings: null,
    profile: null,
    loading: false,
    isInitialized: false,
    error: null
  })
  
  // Add refs to track ongoing requests
  const profileFetchInProgress = useRef(false)
  const settingsFetchInProgress = useRef(false)
  const lastProfileFetchTime = useRef(0)

  // Improved profile fetching with better error handling
  const fetchProfile = useCallback(async (forceRefresh = false) => {
    if (!authUser) {
      setState(prev => ({ ...prev, error: 'Authentication required' }))
      return null
    }
    
    // Prevent duplicate requests within cooldown period
    const now = Date.now()
    if (!forceRefresh && 
        profileFetchInProgress.current || 
        (now - lastProfileFetchTime.current < CONSTANTS.MIN_REFRESH_INTERVAL)) {
      return state.profile
    }
    
    profileFetchInProgress.current = true
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      // Use cached profile if available and not forcing refresh
      if (!forceRefresh && state.profile) {
        return state.profile
      }
      
      const profile = await ProfileService.getProfile({ forceRefresh })
      
      if (profile) {
        setState(prev => ({ ...prev, profile, error: null }))
        lastProfileFetchTime.current = now
      }
      
      return profile
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        try {
          // Attempt to refresh token
          const newToken = await refreshToken()
          if (newToken) {
            // Retry the profile fetch with new token
            const profile = await ProfileService.getProfile({ forceRefresh: true })
            if (profile) {
              setState(prev => ({ ...prev, profile, error: null }))
              lastProfileFetchTime.current = Date.now()
              return profile
            }
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
          setState(prev => ({ 
            ...prev, 
            error: 'Please log in to view your profile',
            profile: null 
          }))
        }
      } else {
        setState(prev => ({ 
          ...prev, 
          error: 'Failed to load profile data'
        }))
        toast.error('Failed to load profile data')
      }
      return null
    } finally {
      setState(prev => ({ ...prev, loading: false }))
      profileFetchInProgress.current = false
    }
  }, [authUser, state.profile, refreshToken])

  // Load settings with request deduplication and token refresh
  const loadSettings = useCallback(async () => {
    if (settingsFetchInProgress.current) {
      return state.settings
    }
    
    settingsFetchInProgress.current = true
    
    try {
      setState(prev => ({ ...prev, loading: true }))
      
      const token = CacheManager.getToken()
      if (!token) {
        toast.error('Authentication required to load settings')
        setState(prev => ({ ...prev, loading: false }))
        return null
      }
      
      const response = await SettingsService.getSettings()
      setState(prev => ({ 
        ...prev, 
        settings: response.data,
        loading: false,
        isInitialized: true
      }))
      return response.data
    } catch (error) {
      console.error('Failed to load settings:', error)
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        try {
          // Attempt to refresh token
          const newToken = await refreshToken()
          if (newToken) {
            // Retry the settings fetch with new token
            const response = await SettingsService.getSettings()
            setState(prev => ({ 
              ...prev, 
              settings: response.data,
              loading: false,
              isInitialized: true
            }))
            return response.data
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
          toast.error('Authentication required to load settings')
        }
      } else {
        toast.error('Failed to load settings')
      }
      setState(prev => ({ ...prev, loading: false }))
      return null
    } finally {
      settingsFetchInProgress.current = false
    }
  }, [state.settings, refreshToken])

  const updateSettings = useCallback(async (section, data) => {
    setState(prev => ({ ...prev, loading: true }))
    try {
      const response = await SettingsService.updateSettings({ [section]: data })
      
      setState(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [section]: response.data[section]
        }
      }))
      
      if (section === 'profile') {
        await fetchProfile(true) // Force refresh after profile update
      }
      
      return response
    } catch (error) {
      console.error('Failed to update settings:', error)
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        try {
          // Attempt to refresh token
          const newToken = await refreshToken()
          if (newToken) {
            // Retry the settings update with new token
            const response = await SettingsService.updateSettings({ [section]: data })
            setState(prev => ({
              ...prev,
              settings: {
                ...prev.settings,
                [section]: response.data[section]
              }
            }))
            if (section === 'profile') {
              await fetchProfile(true)
            }
            return response
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
          throw new Error('Authentication required to update settings')
        }
      }
      throw error
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [fetchProfile, refreshToken])

  const value = useMemo(() => ({
    ...state,
    loadSettings,
    updateSettings,
    fetchProfile,
    error: state.error
  }), [state, loadSettings, updateSettings, fetchProfile])

  // Add cleanup for refs
  useEffect(() => {
    return () => {
      profileFetchInProgress.current = false
      lastProfileFetchTime.current = 0
    }
  }, [])

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext) 