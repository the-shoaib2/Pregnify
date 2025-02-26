import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { SettingsService } from '@/services'
import { useAuth } from '@/contexts/auth-context/auth-context'
import { toast } from 'react-hot-toast'
import axios from 'axios'

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

  // Memoize fetchProfile to prevent unnecessary re-renders
  const fetchProfile = useCallback(async () => {
    if (!authUser) return null
    
    try {
      const response = await axios.get(`${API_URL}/account/profile`)
      setState(prev => ({ ...prev, profile: response.data }))
      return response.data
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      toast.error('Failed to load profile data')
      return null
    }
  }, [authUser])

  // Instead, only load settings when explicitly requested
  const loadSettings = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
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
      setState(prev => ({ ...prev, loading: false }))
      return null
    }
  }, [])

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
        await fetchProfile()
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
    loadSettings, // Expose loadSettings so it can be called when needed
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