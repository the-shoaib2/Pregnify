import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'

const AuthContext = createContext({})

const API_URL = import.meta.env.VITE_API_URL

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Optimize token handling
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      localStorage.setItem('accessToken', token)
      Cookies.set('accessToken', token)
    }
  }

  // Initialize auth state
  useEffect(() => {
    const token = localStorage.getItem('accessToken') || Cookies.get('accessToken')
    if (token) {
      setAuthToken(token)
    }
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken') || Cookies.get('accessToken')
      if (!token) {
        setLoading(false)
        return
      }

      const response = await axios.get(`${API_URL}/auth/me`)
      // Directly set the user data from response
      setUser(response.data.user)

      if (response.data.tokens?.accessToken) {
        setAuthToken(response.data.tokens.accessToken)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      handleLogout()
    } finally {
      setLoading(false)
    }
  }

  const register = async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, credentials)
      setUser(response.data.user)
      
      if (response.data.tokens?.accessToken) {
        setAuthToken(response.data.tokens.accessToken)
      }

      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }

  const login = async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials)
      // Directly set the user data from response
      setUser(response.data.user)
      console.log("User data in login:", response.data.user)

      if (response.data.tokens?.accessToken) {
        setAuthToken(response.data.tokens.accessToken)
      }

      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    
    // Clear all auth-related cookies with proper path
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
  }

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`).catch((error) => {
        console.warn('Server logout failed, proceeding with local cleanup:', error)
      })
    } finally {
      handleLogout()
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)