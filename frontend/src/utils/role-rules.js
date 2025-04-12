// Role constants
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  PATIENT: 'PATIENT',
  GUEST: 'GUEST'
}

// Role-based route permissions
export const ROUTE_PERMISSIONS = {
  DASHBOARD: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  PREGNIFY: [ROLES.DOCTOR, ROLES.PATIENT, ROLES.GUEST],
  SETTINGS: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR, ROLES.PATIENT, ROLES.GUEST]
}

// Role-based default paths
export const DEFAULT_PATHS = {
  [ROLES.SUPER_ADMIN]: '/dashboard/overview',
  [ROLES.ADMIN]: '/dashboard/overview',
  [ROLES.DOCTOR]: '/',
  [ROLES.PATIENT]: '/',
  [ROLES.GUEST]: '/'
}

// Helper functions
export const hasRole = (user, roles) => {
  if (!user?.basicInfo?.role) return false
  return roles.includes(user.basicInfo.role)
}

export const isAdmin = (user) => {
  return hasRole(user, [ROLES.SUPER_ADMIN, ROLES.ADMIN])
}

export const isPregnifyUser = (user) => {
  return hasRole(user, [ROLES.DOCTOR, ROLES.PATIENT, ROLES.GUEST])
}

export const getDefaultPath = (user) => {
  if (!user?.basicInfo?.role) return '/login'
  return DEFAULT_PATHS[user.basicInfo.role] || '/'
}

// Role-based layout configurations
export const LAYOUT_CONFIG = {
  [ROLES.SUPER_ADMIN]: {
    showSidebar: true,
    showTopNav: false,
    showHeader: true,
    showSettingsNav: true,
    layoutType: 'dashboard'
  },
  [ROLES.ADMIN]: {
    showSidebar: true,
    showTopNav: false,
    showHeader: true,
    showSettingsNav: true,
    layoutType: 'dashboard'
  },
  [ROLES.DOCTOR]: {
    showSidebar: false,
    showTopNav: true,
    showHeader: true,
    showSettingsNav: false,
    layoutType: 'pregnify'
  },
  [ROLES.PATIENT]: {
    showSidebar: false,
    showTopNav: true,
    showHeader: true,
    showSettingsNav: false,
    layoutType: 'pregnify'
  },
  [ROLES.GUEST]: {
    showSidebar: false,
    showTopNav: true,
    showHeader: true,
    showSettingsNav: false,
    layoutType: 'pregnify'
  }
} 