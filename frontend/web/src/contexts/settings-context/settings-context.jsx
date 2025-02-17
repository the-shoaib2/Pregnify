import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context/auth-context'
import { SettingsService } from '@/services/settings'
import { toast } from 'react-hot-toast'

const SettingsContext = createContext({})

export function SettingsProvider({ children }) {
  const { user, setUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState(null)

  // Load initial settings
  useEffect(() => {
    if (user) {
      loadSettings()
    } else {
      console.log('No user, clearing settings')
      setSettings(null)
      setLoading(false)
    }
  }, [user])

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true)
      console.log('Loading settings...')
      const response = await SettingsService.getProfile()
      setSettings(response.data.data)
    } catch (error) {
      console.error('Failed to load settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }, [])

  const updateSettings = useCallback(async (type, data) => {
    try {
      setLoading(true)
      let response

      switch (type) {
        case 'profile':
          response = await SettingsService.updatePersonalInfo(data)
          break
        case 'preferences':
          response = await SettingsService.updatePreferences(data)
          break
        default:
          throw new Error('Invalid settings type')
      }

      // Update local state
      setSettings(prev => ({
        ...prev,
        ...response.data.data
      }))

      // Update user context if needed
      setUser(prev => ({
        ...prev,
        ...response.data.data
      }))

      return response.data
    } catch (error) {
      console.error('Failed to update settings:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [setUser])

  return (
    <SettingsContext.Provider value={{
      settings,
      loading,
      updateSettings,
      reloadSettings: loadSettings
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext) 