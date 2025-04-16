import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Context Providers
import { ThemeProvider } from "@/contexts/theme-context"
import { AuthProvider, useAuth } from '@/contexts/auth-context/auth-context'
import { SettingsProvider } from '@/contexts/settings-context/settings-context'

// Components
import LoadingScreen from '@/components/loading-screen'
import TermsOfService from "@/components/legal/terms-of-service"
import PrivacyPolicy from "@/components/legal/privacy-policy"

// Auth Pages
import LoginPage from '@/app/auth/login/page'
import RegisterPage from '@/app/auth/register/page'
import ForgotPasswordPage from '@/app/forgot-password/page'

// Settings Pages
import SettingsLayout from "@/app/settings/layout"
import SettingsPage from "@/app/settings/page"
import AccountPage from "@/app/settings/account/page"
import ProfilePage from "@/app/settings/account/profile/page"
import AccountsPage from "@/app/settings/account/accounts/page"
import SecurityPage from "@/app/settings/account/security/page"
import PrivacyPage from "@/app/settings/account/privacy/page"
import PreferencesPage from "@/app/settings/preferences/page"
import NotificationsPage from "@/app/settings/preferences/notifications/page"
import AppearancePage from "@/app/settings/preferences/appearance/appearance/page"
import LanguagePage from "@/app/settings/preferences/language/page"
import AccessibilityPage from "@/app/settings/preferences/accessibility/page"
import BillingPage from "@/app/settings/billing/page"
import PaymentPage from "@/app/settings/billing/payment/page"
import SubscriptionPage from "@/app/settings/billing/subscription/page"
import SystemPage from "@/app/settings/system/page"
import StoragePage from "@/app/settings/system/storage/page"
import ConnectedAppsPage from "@/app/settings/system/apps/page"
import BackupPage from "@/app/settings/system/backup/page"
import DataManagementPage from "@/app/settings/system/data/page"
import AuditLogsPage from "@/app/settings/system/log/page"
import SupportPage from "@/app/settings/help/support/page"
import AboutPage from "@/app/settings/help/about/page"

// Pregnify Pages
import PregnifyPage from "@/app/pregnify/home/page"
import HealthPage from "@/app/pregnify/health/page"
import MessagesPage from "@/app/pregnify/messages/page"
import EmergencyPage from "@/app/pregnify/emergency/page"
import AIAssistantPage from "@/app/pregnify/ai-assistant/page"
import DoctorsPage from "@/app/pregnify/doctors/page"

// Dashboard and User Management
import DashboardRoutes from "@/app/dashboard/page"
import UsersRoutes from "@/app/users/page"

// Constants

// Router Configuration
const routerOptions = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
}

// Route Components
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(user?.basicInfo?.role)) {
    return user?.basicInfo?.role === 'SUPER_ADMIN' || user?.basicInfo?.role === 'ADMIN'
      ? <Navigate to="/dashboard/overview" replace />
      : <Navigate to="/" replace />
  }

  return children
}

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (user) {
    return user?.basicInfo?.role === 'SUPER_ADMIN' || user?.basicInfo?.role === 'ADMIN'
      ? <Navigate to="/dashboard/overview" replace />
      : <Navigate to="/" replace />
  }

  return children
}

const RootRoute = () => {
  const { user } = useAuth()
  return (user?.basicInfo?.role === 'SUPER_ADMIN' || user?.basicInfo?.role === 'ADMIN')
    ? <Navigate to="/dashboard/overview" replace />
    : <PregnifyPage />
}

// Main App Component
function App() {
  return (
    <Router {...routerOptions}>
      <AuthProvider>
        <SettingsProvider>
          <ThemeProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

              {/* Root Route */}
              <Route path="/" element={<ProtectedRoute><RootRoute /></ProtectedRoute>} />

              {/* Dashboard Routes */}
              <Route path="/dashboard/*" element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
                  <DashboardRoutes />
                </ProtectedRoute>
              } />

              {/* Pregnify Routes */}
              <Route path="/health" element={
                <ProtectedRoute allowedRoles={['DOCTOR', 'PATIENT', 'GUEST']}>
                  <HealthPage />
                </ProtectedRoute>
              } />
              <Route path="/emergency" element={
                <ProtectedRoute allowedRoles={['DOCTOR', 'PATIENT', 'GUEST']}>
                  <EmergencyPage />
                </ProtectedRoute>
              } />
              <Route path="/ai-assistant" element={
                <ProtectedRoute allowedRoles={['DOCTOR', 'PATIENT', 'GUEST']}>
                  <AIAssistantPage />
                </ProtectedRoute>
              } />
              <Route path="/ai-assistant/:pregnancyId" element={
                <ProtectedRoute allowedRoles={['DOCTOR', 'PATIENT', 'GUEST']}>
                  <AIAssistantPage />
                </ProtectedRoute>
              } />
              <Route path="/doctors" element={
                <ProtectedRoute allowedRoles={['DOCTOR', 'PATIENT', 'GUEST']}>
                  <DoctorsPage />
                </ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute allowedRoles={['DOCTOR', 'PATIENT', 'GUEST']}>
                  <MessagesPage />
                </ProtectedRoute>
              } />

              {/* User Management Routes */}
              <Route path="/users/*" element={<ProtectedRoute><UsersRoutes /></ProtectedRoute>} />

              {/* Settings Routes */}
              <Route path="/settings" element={<ProtectedRoute><SettingsLayout /></ProtectedRoute>}>
                <Route index element={<SettingsPage />} />
                
                {/* Account Settings */}
                <Route path="account">
                  <Route index element={<AccountPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="accounts" element={<AccountsPage />} />
                  <Route path="security" element={<SecurityPage />} />
                  <Route path="privacy" element={<PrivacyPage />} />
                </Route>

                {/* Preferences */}
                <Route path="preferences">
                  <Route index element={<PreferencesPage />} />
                  <Route path="appearance" element={<AppearancePage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="language" element={<LanguagePage />} />
                  <Route path="accessibility" element={<AccessibilityPage />} />
                </Route>

                {/* Billing */}
                <Route path="billing">
                  <Route index element={<BillingPage />} />
                  <Route path="payment" element={<PaymentPage />} />
                  <Route path="subscription" element={<SubscriptionPage />} />
                </Route>

                {/* System */}
                <Route path="system">
                  <Route index element={<SystemPage />} />
                  <Route path="storage" element={<StoragePage />} />
                  <Route path="apps" element={<ConnectedAppsPage />} />
                  <Route path="backup" element={<BackupPage />} />
                  <Route path="data" element={<DataManagementPage />} />
                  <Route path="logs" element={<AuditLogsPage />} />
                </Route>

                {/* Help */}
                <Route path="help">
                  <Route index element={<Navigate to="/settings/help/support" replace />} />
                  <Route path="support" element={<SupportPage />} />
                  <Route path="about" element={<AboutPage />} />
                </Route>
              </Route>

              {/* Legal Routes */}
              <Route path="/legal/terms" element={<TermsOfService />} />
              <Route path="/legal/privacy" element={<PrivacyPolicy />} />

              {/* Catch-all Route */}
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