import { RoleBasedLayout } from "@/components/layout/role-based-layout"
import { useAuth } from "@/contexts/auth-context/auth-context"
import { redirect } from "next/navigation"

export default function DoctorsLayout({ children }) {
  const { user } = useAuth()
  
  // Check if user has access to doctor panel
  if (!user?.basicInfo?.role || !['SUPER_ADMIN', 'ADMIN'].includes(user.basicInfo.role)) {
    redirect('/dashboard')
  }

  return (
    <RoleBasedLayout 
      showHeader={true}
      headerTitle="Doctor Panel"
      isSettingsPage={false}
    >
      {children}
    </RoleBasedLayout>
  )
} 