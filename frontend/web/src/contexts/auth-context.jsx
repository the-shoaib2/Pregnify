import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authAPI, setAuthToken } from '@/services/api'
import { toast } from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentStore, setCurrentStore] = useState(null)
  const [stores, setStores] = useState([])
  const navigate = useNavigate()
  const location = useLocation()

  const checkAuth = async () => {
    try {
      const response = await authAPI.checkAuth()
      if (response.success) {
        setUser(response.data)
      }
    } catch (error) {
      if (error.status === 429) {
        // If rate limited, try again after a delay
        setTimeout(checkAuth, 2000)
        return
      }
      console.error('Auth check failed:', error)
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  // Check auth status on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setAuthToken(token)
      checkAuth()
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      
      if (response.success) {
        setUser(response.data)
        return response.data
      }
      
      throw new Error('Login failed')
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const handleLogout = () => {
    setUser(null)
    setCurrentStore(null)
    setStores([])
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('currentStore')
    if (!isPublicRoute(location.pathname)) {
      navigate('/login', { replace: true })
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      handleLogout()
    }
  }

  // Helper function to check if route is public
  const isPublicRoute = (path) => {
    return ['/login', '/signup', '/'].includes(path)
  }

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 