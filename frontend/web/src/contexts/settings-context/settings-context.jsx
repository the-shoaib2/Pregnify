import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { SettingsService } from '@/services'
import { useAuth } from '@/contexts/auth-context/auth-context'
import { toast } from 'react-hot-toast'
import { ProfileService } from '@/services/settings'
import { CacheManager } from '@/utils/security'
import { CONSTANTS } from '@/utils/security'

const SettingsContext = createContext({})

const API_URL = import.meta.env.VITE_API_URL

export function SettingsProvider({ children }) {
  const { user: authUser } = useAuth()
  const [state, setState] = useState({
    settings: null,
    profile: null,
    loading: false,
    isInitialized: false
  })
  
  // Add refs to track ongoing requests
  const profileFetchInProgress = useRef(false)
  const settingsFetchInProgress = useRef(false)
  const lastProfileFetchTime = useRef(0)

  // Improved profile fetching with proper error handling and request deduplication
  const fetchProfile = useCallback(async (forceRefresh = false) => {
    if (!authUser) return null
    
    // Prevent duplicate requests within cooldown period
    const now = Date.now()
    if (!forceRefresh && 
        profileFetchInProgress.current || 
        (now - lastProfileFetchTime.current < CONSTANTS.MIN_REFRESH_INTERVAL)) {
      return state.profile
    }
    
    profileFetchInProgress.current = true
    
    try {
      setState(prev => ({ ...prev, loading: true }))
      
      const token = CacheManager.getToken()
      if (!token) {
        toast.error('Authentication required to load profile')
        return null
      }
      
      const profile = await ProfileService.getProfile(forceRefresh)
      setState(prev => ({ ...prev, profile, loading: false }))
      lastProfileFetchTime.current = Date.now()
      return profile
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      
      if (error.message.includes('Authentication required')) {
        toast.error('Please log in to view your profile')
      } else {
        toast.error('Failed to load profile data')
      }
      
      setState(prev => ({ ...prev, loading: false }))
      return null
    } finally {
      profileFetchInProgress.current = false
    }
  }, [authUser, state.profile])

  // Load settings with request deduplication
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
      toast.error('Failed to load settings')
      setState(prev => ({ ...prev, loading: false }))
      return null
    } finally {
      settingsFetchInProgress.current = false
    }
  }, [state.settings])

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
      throw error
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [fetchProfile])

  const value = useMemo(() => ({
    ...state,
    loadSettings,
    updateSettings,
    fetchProfile
  }), [state, loadSettings, updateSettings, fetchProfile])

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext) 