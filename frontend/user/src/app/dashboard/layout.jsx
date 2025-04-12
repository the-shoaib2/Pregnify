import { RoleBasedLayout } from "@/components/layout/role-based-layout"
import { useAuth } from "@/contexts/auth-context/auth-context"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLayout({ children }) {
  const { user, isLoading } = useAuth()
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    )
  }

  // Check if user has access to dashboard
  if (!user?.basicInfo?.role) {
    redirect('/login')
  }

  return (
    <RoleBasedLayout 
      showHeader={true}
      headerTitle="Dashboard"
      isSettingsPage={false}
    >
      <Suspense 
        fallback={
          <div className="flex h-full w-full items-center justify-center">
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        }
      >
        {children}
      </Suspense>
    </RoleBasedLayout>
  )
} 