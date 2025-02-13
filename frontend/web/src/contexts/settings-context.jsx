import { createContext, useContext, useState, useEffect } from 'react'
import { SettingsService } from '@/services'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'react-hot-toast'

const SettingsContext = createContext({})

export function SettingsProvider({ children }) {
  const { user } = useAuth()
  const [settings, setSettings] = useState({
    personal: null,
    appearance: null,
    notifications: null,
    privacy: null,
    security: null,
    language: null,
    accessibility: null,
    storage: null,
    backup: null,
    apps: null
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Load settings when user is authenticated
  useEffect(() => {
    if (user) {
      loadSettings()
    } else {
      // Clear settings when user logs out
      setSettings({
        personal: null,
        appearance: null,
        notifications: null,
        privacy: null,
        security: null,
        language: null,
        accessibility: null,
        storage: null,
        backup: null,
        apps: null
      })
      setLoading(false)
    }
  }, [user])

  const loadSettings = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const response = await SettingsService.getSettings()
      setSettings(response.data)
    } catch (error) {
      if (user) {
        console.error('Failed to load settings:', error)
        toast.error('Failed to load settings')
      }
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (section, data) => {
    if (!user) return
    
    setSaving(true)
    try {
      let response
      switch (section) {
        case 'personal':
          response = await SettingsService.updatePersonalInfo(data)
          break
        case 'appearance':
          response = await SettingsService.updateAppearance(data)
          break
        case 'notifications':
          response = await SettingsService.updateNotifications(data)
          break
        case 'privacy':
          response = await SettingsService.updatePrivacy(data)
          break
        case 'security':
          response = await SettingsService.updateSecurity(data)
          break
        case 'language':
          response = await SettingsService.updateLanguage(data)
          break
        case 'accessibility':
          response = await SettingsService.updateAccessibility(data)
          break
        case 'storage':
          response = await SettingsService.updateStorage(data)
          break
        case 'backup':
          response = await SettingsService.updateBackup(data)
          break
        case 'apps':
          response = await SettingsService.updateConnectedApps(data)
          break
        default:
          throw new Error(`Unknown settings section: ${section}`)
      }
      
      // Update only the changed section
      setSettings(prev => ({
        ...prev,
        [section]: response.data
      }))
      
      toast.success('Settings updated successfully')
      return response.data
    } catch (error) {
      console.error('Failed to update settings:', error)
      toast.error(error?.response?.data?.message || 'Failed to update settings')
      throw error
    } finally {
      setSaving(false)
    }
  }

  // Get settings for a specific section
  const getSectionSettings = (section) => {
    return settings[section] || null
  }

  // Check if a specific section is loading
  const isSectionLoading = (section) => {
    return loading && !settings[section]
  }

  return (
    <SettingsContext.Provider 
      value={{
        settings,
        loading,
        saving,
        updateSettings,
        reloadSettings: loadSettings,
        getSectionSettings,
        isSectionLoading
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
} 