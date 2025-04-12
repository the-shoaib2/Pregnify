import { useAuth } from "@/contexts/auth-context/auth-context"
import { useIsMobile } from "@/hooks/use-mobile"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TopNav } from "@/components/top-nav"
import { PageHeader } from "@/components/page-header"
import { SettingsNav, settingsNavGroups } from "@/components/settings-nav"
import { SettingsNavBridge } from "@/components/settings-nav-bridge"

// Role-based layout configurations
const roleLayoutConfig = {
  SUPER_ADMIN: {
    showSidebar: true,
    showTopNav: false,
    showHeader: true,
    showSettingsNav: true,
    layoutType: 'sidebar',
    defaultPath: '/dashboard/overview'
  },
  ADMIN: {
    showSidebar: true,
    showTopNav: false,
    showHeader: true,
    showSettingsNav: true,
    layoutType: 'sidebar',
    defaultPath: '/dashboard/overview'
  },
  DOCTOR: {
    showSidebar: false,
    showTopNav: true,
    showHeader: false,
    showSettingsNav: false,
    layoutType: 'top-nav',
    defaultPath: '/'
  },
  PATIENT: {
    showSidebar: false,
    showTopNav: true,
    showHeader: false,
    showSettingsNav: false,
    layoutType: 'top-nav',
    defaultPath: '/'
  },
  GUEST: {
    showSidebar: false,
    showTopNav: true,
    showHeader: false,
    showSettingsNav: false,
    layoutType: 'top-nav',
    defaultPath: '/'
  },
  default: {
    showSidebar: false,
    showTopNav: true,
    showHeader: false,
    showSettingsNav: false,
    layoutType: 'top-nav',
    defaultPath: '/'
  }
}

export function RoleBasedLayout({
  children,
  showHeader = true,
  headerTitle = "",
  customLayout = null,
  isSettingsPage = false
}) {
  const { user } = useAuth()
  const userRole = user?.basicInfo?.role
  const isMobile = useIsMobile()

  // Get layout configuration for the current role
  const layoutConfig = roleLayoutConfig[userRole] || roleLayoutConfig.default

  // Override layout for mobile devices
  const showSidebar = layoutConfig.showSidebar && !isMobile
  const showTopNav = layoutConfig.showTopNav
  const showSettingsNav = layoutConfig.showSettingsNav && isSettingsPage

  // Determine header visibility based on role and showHeader prop
  const shouldShowHeader = showHeader && layoutConfig.showHeader

  // Use custom layout if provided
  if (customLayout) {
    return customLayout({ children, showHeader, headerTitle, userRole, isMobile })
  }

  return (
    <SidebarProvider>
      {showSidebar ? (
        <>
          <AppSidebar />
          <SidebarInset>
            {showTopNav && <TopNav />}
            {shouldShowHeader && <PageHeader title={headerTitle} className="sticky top-0 z-20 bg-background" />}
            <div className="flex flex-1 overflow-hidden lg:h-[calc(100vh)]">
              {/* Settings Navigation - Desktop */}
              {showSettingsNav && !isMobile && (
                <aside className="hidden w-56 shrink-0 overflow-y-auto border-r bg-muted/40 lg:block">
                  <SettingsNav groups={settingsNavGroups} />
                </aside>
              )}

              {/* Content Area */}
              <main className="flex-1 overflow-y-auto">
                {children}
              </main>
            </div>
          </SidebarInset>
        </>
      ) : (
        <>
          {showTopNav && <TopNav />}
          {shouldShowHeader && <PageHeader title={headerTitle} className="sticky top-0 z-20 bg-background" />}
          <div className="flex flex-1 overflow-hidden lg:h-[calc(100vh)]">
            {/* Settings Navigation - Desktop */}
            {showSettingsNav && !isMobile && (
              <aside className="hidden w-56 shrink-0 overflow-y-auto border-r bg-muted/40 lg:block">
                <SettingsNav groups={settingsNavGroups} />
              </aside>
            )}

            {/* Content Area */}
            <main className={`flex-1 overflow-y-auto ${
              isMobile 
                ? 'p-2 pt-4 mt-10 mb-16' 
                : 'p-2 sm:p-4 pt-4 mt-16'
            }`}>
              {children}
            </main>
          </div>
        </>
      )}

      {/* Settings Navigation Bridge - Only visible on mobile when on settings pages */}
      {showSettingsNav && isMobile && <SettingsNavBridge />}
    </SidebarProvider>
  )
} 