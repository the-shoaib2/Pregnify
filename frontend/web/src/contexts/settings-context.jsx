import { createContext, useContext, useState, useEffect } from 'react'
import { SettingsService } from '@/services'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'react-hot-toast'

const SettingsContext = createContext({})

export function SettingsProvider({ children }) {
  const { user } = useAuth()
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Load settings only when user is authenticated
  useEffect(() => {
    if (user) {
      loadSettings()
    } else {
      // Clear settings when user logs out
      setSettings(null)
      setLoading(false)
    }
  }, [user])

  const loadSettings = async () => {
    if (!user) return // Don't load if not authenticated
    
    try {
      setLoading(true)
      const response = await SettingsService.getSettings()
      setSettings(response.data)
    } catch (error) {
      // Only show error if still authenticated
      if (user) {
        console.error('Failed to load settings:', error)
        toast.error('Failed to load settings')
      }
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (section, data) => {
    if (!user) return // Don't update if not authenticated
    
    setSaving(true)
    try {
      let response
      switch (section) {
        case 'personal':
          response = await SettingsService.updatePersonalInfo(data)
          break
        case 'education':
          response = await SettingsService.updateEducation(data)
          break
        case 'medical':
          response = await SettingsService.updateMedicalInfo(data)
          break
        case 'emergency':
          response = await SettingsService.updateEmergencyContacts(data)
          break
        case 'preferences':
          response = await SettingsService.updatePreferences(data)
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
        default:
          response = await SettingsService.updateSettings(data)
      }
      
      setSettings(prev => ({
        ...prev,
        ...response.data
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

  return (
    <SettingsContext.Provider 
      value={{
        settings,
        loading,
        saving,
        updateSettings,
        reloadSettings: loadSettings
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