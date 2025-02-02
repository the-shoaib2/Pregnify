import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import Login from '@/pages/auth/login/page'
import Signup from '@/pages/auth/signup/page'
import Home from '@/pages/Home/page'
import Settings from '@/pages/settings/page'
import Profile from '@/pages/profile/page'
import LoadingScreen from '@/components/LoadingScreen'
import { Layout } from '@/components/layout'

// Configure future flags
const routerOptions = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
}

// Protected route component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <LoadingScreen />
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

// Public route component
function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}

// Main routes component
function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      
      <Route 
        path="/signup" 
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        } 
      />

      {/* Protected Routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        } 
      />

      {/* Catch-all route */}
      <Route 
        path="*" 
        element={<Navigate to="/" replace />} 
      />
    </Routes>
  )
}

// Main App component
function App() {
  return (
    <Router {...routerOptions}>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  )
}

export default App
