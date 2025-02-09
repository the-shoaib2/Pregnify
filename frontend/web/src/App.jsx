import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import LoadingScreen from '@/components/loading-screen'
import LoginPage from '@/app/login/page'
import RegisterPage from '@/app/register/page'
import DashboardPage from '@/app/dashboard/page'
import ForgotPasswordPage from '@/app/forgot-password/page'
import SettingsLayout from "@/app/settings/layout"
import ProfilePage from "@/app/settings/profile/page"
import PreferencesPage from "@/app/settings/preferences/page"
import SecurityPage from "@/app/settings/security/page"
import NotificationsPage from "@/app/settings/notifications/page"
import AccountPage from "@/app/settings/account/page"
import AppearancePage from "@/app/settings/appearance/page"
import PrivacyPage from "@/app/settings/privacy/page"
import { ThemeProvider } from "@/contexts/theme-context"
import { SettingsProvider } from '@/contexts/settings-context'

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

function App() {
  return (
    <Router {...routerOptions}>
      <AuthProvider>
        <SettingsProvider>
          <ThemeProvider>
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                } 
              />
              
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <RegisterPage />
                  </PublicRoute>
                } 
              />

              <Route 
                path="/forgot-password" 
                element={
                  <PublicRoute>
                    <ForgotPasswordPage />
                  </PublicRoute>
                } 
              />

              {/* Protected Routes */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />

              {/* Settings Routes */}
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <SettingsLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/settings/profile" replace />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="account" element={<AccountPage />} />
                <Route path="appearance" element={<AppearancePage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="preferences" element={<PreferencesPage />} />
                <Route path="privacy" element={<PrivacyPage />} />
                <Route path="security" element={<SecurityPage />} />
              </Route>

              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster position="top-right" />
          </ThemeProvider>
        </SettingsProvider>
      </AuthProvider>
    </Router>
  )
}

export default App