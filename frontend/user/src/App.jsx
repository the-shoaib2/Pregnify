import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from '@/contexts/auth-context/auth-context'
import LoadingScreen from '@/components/loading-screen'
import LoginPage from '@/app/auth/login/page'
import RegisterPage from '@/app/auth/register/page'
import DashboardPage from '@/app/dashboard/page'
import ForgotPasswordPage from '@/app/forgot-password/page'
import SettingsLayout from "@/app/settings/layout"
import ProfilePage from "@/app/settings/account/profile/page"
import AccountsPage from "@/app/settings/account/accounts/page"
import PreferencesPage from "@/app/settings/preferences/page"
import SecurityPage from "@/app/settings/account/security/page"
import NotificationsPage from "@/app/settings/preferences/notifications/page"
import AccountPage from "@/app/settings/account/page"
import AppearancePage from "@/app/settings/preferences/appearance/appearance/page"
import PrivacyPage from "@/app/settings/account/privacy/page"
import { ThemeProvider } from "@/contexts/theme-context"
import { SettingsProvider } from '@/contexts/settings-context/settings-context'
import { TermsOfService } from "@/components/legal/terms-of-service"
import { PrivacyPolicy } from "@/components/legal/privacy-policy"
import SettingsPage from "@/app/settings/page"
import LanguagePage from "@/app/settings/preferences/language/page"
import PaymentPage from "@/app/settings/billing/payment/page"
import SubscriptionPage from "@/app/settings/billing/subscription/page"
import StoragePage from "@/app/settings/system/storage/page"
import ConnectedAppsPage from "@/app/settings/system/apps/page"
import BackupPage from "@/app/settings/system/backup/page"
import DataManagementPage from "@/app/settings/system/data/page"
import AuditLogsPage from "@/app/settings/system/log/page"
import AccessibilityPage from "@/app/settings/preferences/accessibility/page"
import BillingPage from "@/app/settings/billing/page"
import SystemPage from "@/app/settings/system/page"
import SupportPage from "@/app/settings/help/support/page"
import AboutPage from "@/app/settings/help/about/page"

// Pregnify Routes
// import PregnifyPage from "@/app/pregnify/page"
import HealthPage from "@/app/pregnify/health/page"
import MessagesPage from "@/app/pregnify/messages/page"
import CarePage from "@/app/pregnify/care/page"
import EmergencyPage from "@/app/pregnify/emergency/page"
import AIAssistantPage from "@/app/pregnify/ai-assistant/page"
import DoctorsPage from "@/app/pregnify/doctors/page"

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

              {/* Pregnify Routes */}
              <Route
                path="/health"
                element={
                  <ProtectedRoute>
                    <HealthPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <MessagesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/care"
                element={
                  <ProtectedRoute>
                    <CarePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/emergency"
                element={
                  <ProtectedRoute>
                    <EmergencyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai-assistant"
                element={
                  <ProtectedRoute>
                    <AIAssistantPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctors"
                element={
                  <ProtectedRoute>
                    <DoctorsPage />
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

                {/* Help & Legal */}
                <Route path="help">
                  <Route index element={<Navigate to="/settings/help/support" replace />} />
                  <Route path="support" element={<SupportPage />} />
                  <Route path="about" element={<AboutPage />} />
                </Route>
              </Route>

              {/* Legal Routes */}
              <Route path="/legal/terms" element={<TermsOfService />} />
              <Route path="/legal/privacy" element={<PrivacyPolicy />} />

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