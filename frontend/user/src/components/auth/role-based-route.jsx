import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/auth-context/auth-context'
import { LoadingScreen } from '@/components/loading-screen'
import { hasRole, getDefaultPath } from '@/utils/role-rules'

export function RoleBasedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check if user has access to this route
  if (allowedRoles && !hasRole(user, allowedRoles)) {
    return <Navigate to={getDefaultPath(user)} replace />
  }

  return children
}

export function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (user) {
    return <Navigate to={getDefaultPath(user)} replace />
  }

  return children
}

export function RootRoute() {
  const { user } = useAuth()
  return <Navigate to={getDefaultPath(user)} replace />
} 