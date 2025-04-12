import { RoleBasedLayout } from "@/components/layout/role-based-layout"
import { useAuth } from "@/contexts/auth-context/auth-context"
import { redirect } from "next/navigation"

export default function SystemLayout({ children }) {
  const { user } = useAuth()
  
  // Check if user has access to system settings
  if (!user?.basicInfo?.role || !['SUPER_ADMIN'].includes(user.basicInfo.role)) {
    redirect('/dashboard')
  }

  return (
    <RoleBasedLayout 
      showHeader={true}
      headerTitle="System Settings"
      isSettingsPage={false}
    >
      {children}
    </RoleBasedLayout>
  )
} 