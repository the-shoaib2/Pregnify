import { Outlet, useLocation } from "react-router-dom"
import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/auth-context/auth-context"
import { useIsMobile } from "@/hooks/use-mobile"
import { SettingsNav, settingsNavGroups } from "@/components/settings-nav"
import { RoleBasedLayout } from "@/components/layout/role-based-layout"

export default function SettingsLayout() {
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { user } = useAuth()
  const userRole = user?.basicInfo?.role
  const isMobile = useIsMobile()

  const currentGroup = settingsNavGroups.find(group => 
    group.items.some(item => item.href === location.pathname)
  )
  const currentPage = currentGroup?.items.find(item => 
    item.href === location.pathname
  )?.title || "Settings"

  return (
    <RoleBasedLayout 
      isSettingsPage={true}
      headerTitle={currentPage}
    >
      <div className="container max-w-3xl px-4 py-6">
        <Outlet />
      </div>
    </RoleBasedLayout>
  )
} 