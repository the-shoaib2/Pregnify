import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'

const AuthContext = createContext({})

const API_URL = import.meta.env.VITE_API_URL

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLoadingUser, setIsLoadingUser] = useState(false)

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

  const fetchUserData = async () => {
    setIsLoadingUser(true)
    try {
      const response = await axios.get(`${API_URL}/auth/me`)
      setUser(response.data.user)
      return response.data.user
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      throw error
    } finally {
      setIsLoadingUser(false)
    }
  }

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken') || Cookies.get('accessToken')
      if (!token) {
        setLoading(false)
        return
      }

      await fetchUserData()

      // Note: response is not defined in this scope, so I assume you meant to use the response from fetchUserData
      // if (response?.data?.tokens?.accessToken) {
      //   setAuthToken(response.data.tokens.accessToken)
      // }
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
      if (response.data.tokens?.accessToken) {
        setAuthToken(response.data.tokens.accessToken)
        // Lazy load user data after registration
        await fetchUserData()
      }

      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }

  const login = async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials)
      
      if (response.data.tokens?.accessToken) {
        setAuthToken(response.data.tokens.accessToken)
        // Lazy load user data after login
        await fetchUserData()
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

  const sendPasswordResetEmail = async (email) => {
    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }

  const verifyResetCode = async (email, code) => {
    try {
      const response = await axios.post(`${API_URL}/auth/verify-reset-code`, { 
        email, 
        code 
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }

  const resetPassword = async (email, code, newPassword) => {
    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        email,
        code,
        newPassword
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoadingUser,
        login,
        logout,
        register,
        checkAuth,
        fetchUserData,
        sendPasswordResetEmail,
        verifyResetCode,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)