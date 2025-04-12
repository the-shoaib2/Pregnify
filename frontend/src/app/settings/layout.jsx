import { Outlet, useLocation } from "react-router-dom"
import { SettingsNav, settingsNavGroups } from "@/components/settings-nav"
import { RoleBasedLayout } from "@/components/layout/role-based-layout"

export default function SettingsLayout() {
  const location = useLocation()

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