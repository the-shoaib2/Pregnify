import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { PageHeader } from "@/components/page-header"
import { TopNav } from "@/components/top-nav"
import { useAuth } from "@/contexts/auth-context/auth-context"
import { useIsMobile } from "@/hooks/use-mobile"

export default function AppLayout({ children }) {
  const { user } = useAuth()
  const userRole = user?.basicInfo?.role
  const isMobile = useIsMobile()

  // Determine which navigation to show based on role and device
  const showSidebar = !isMobile && (userRole !== 'PATIENT' && userRole !== 'GUEST')
  const showTopNav = userRole === 'PATIENT' || userRole === 'GUEST' || isMobile

  return (
    <SidebarProvider>
      {showSidebar ? (
        <>
          <AppSidebar />
          <SidebarInset>
            {showTopNav && <TopNav />}
            <main className="flex-1 overflow-hidden">
              {children}
            </main>
          </SidebarInset>
        </>
      ) : (
        <>
          {showTopNav && <TopNav />}
          <main className={`flex-1 overflow-hidden ${isMobile ? 'p-4 mt-12' : 'p-4 mt-16'}`}>
            {children}
          </main>
        </>
      )}
    </SidebarProvider>
  )
}
