import { createContext, useContext, useState, useEffect } from 'react'
import { SettingsService } from '@/services'
import { useAuth } from '@/contexts/auth-context/auth-context'
import { toast } from 'react-hot-toast'

const SettingsContext = createContext({})

export function SettingsProvider({ children }) {
  const { user: authUser, updateUser } = useAuth()
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await SettingsService.getSettings()
      setSettings(response.data)
      
      // Update auth context if needed
      if (response.data?.profile && updateUser) {
        updateUser({
          ...authUser,
          ...response.data.profile
        })
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (section, data) => {
    try {
      setLoading(true)
      const response = await SettingsService.updateSettings({ [section]: data })
      setSettings(prev => ({
        ...prev,
        [section]: response.data[section]
      }))
      
      // Update auth context if profile was updated
      if (section === 'profile' && updateUser) {
        updateUser({
          ...authUser,
          ...data
        })
      }
      
      return response
    } catch (error) {
      console.error('Failed to update settings:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext) 