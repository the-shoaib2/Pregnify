import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { PageHeader } from "@/components/page-header"
import { TopNav } from "@/components/top-nav"
import { useAuth } from "@/contexts/auth-context/auth-context"

export default function AppLayout({ children }) {
  const { user } = useAuth()
  const userRole = user?.basicInfo?.role

  // Determine which navigation to show based on role
  const showSidebar = userRole !== 'PATIENT' && userRole !== 'GUEST'
  const showTopNav = userRole === 'PATIENT' || userRole === 'GUEST'

  return (
    <SidebarProvider>
      {showSidebar ? (
        <>
          <AppSidebar />
          <SidebarInset>
            {showTopNav && <TopNav />}
            <main className="flex-1 overflow-hidden p-4 mt-16">
              {children}
            </main>
          </SidebarInset>
        </>
      ) : (
        <>
          {showTopNav && <TopNav />}
          <main className="flex-1 overflow-hidden p-4 mt-16">
            {children}
          </main>
        </>
      )}
      <PageHeader hidden={showTopNav} />
    </SidebarProvider>
  )
}
