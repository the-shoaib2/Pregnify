"use client"

import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context/auth-context"
import { RoleBasedLayout } from "@/components/layout/role-based-layout"


import DashboardOverview from "./overview/page"
import DashboardAnalytics from "./analytics/page"
import DashboardNotifications from "./notifications/page"


export function DashboardRoutes() {
  const { user } = useAuth()
  const location = useLocation()
  const path = location.pathname


  const renderContent = () => {
    switch (path) {
      case '/dashboard/analytics':
        return <DashboardAnalytics />
      case '/dashboard/notifications':
        return <DashboardNotifications />
      case '/dashboard/overview':
      default:
        return <DashboardOverview />
    }
  }

  return (
    <RoleBasedLayout showHeader={true} headerTitle="Dashboard">
      <div className="flex flex-1 flex-col gap-2 p-2">
          {renderContent()}
      </div>
    </RoleBasedLayout>
  )
}

// Keep default export for backward compatibility
export default DashboardRoutes
