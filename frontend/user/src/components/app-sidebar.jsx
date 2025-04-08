import * as React from "react"
import {
  Bot,
  Command,
  LifeBuoy,
  Send,
  Settings,
  Users,
  Calendar,
  Activity,
  MessageSquare,
  Database,
  FileText,
  UserCog,
  Ambulance,
  LineChart,
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import NavUser from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context/auth-context"
import { getNavItems, commonNavItems } from "@/config/app-navigation"

export function AppSidebar({ ...props }) {
  const { user } = useAuth()
  const location = useLocation()
  
  const userRole = user?.basicInfo?.role
  
  const navMainItems = React.useMemo(() => 
    getNavItems(userRole || 'GUEST'), [userRole]
  )

  const getInitials = (user) => {
    if (!user || !user?.basicInfo?.name?.firstName || !user?.basicInfo?.name?.lastName) return 'GU'
    return `${user.basicInfo?.name?.firstName.charAt(0)}${user.basicInfo?.name?.lastName.charAt(0)}`.toUpperCase()
  }

  // Check if we're on a settings page
  const isSettingsPage = location.pathname.startsWith('/settings')

  // Filter out settings items from secondary nav when on settings pages
  const filteredNavSecondary = React.useMemo(() => {
    if (!isSettingsPage) return commonNavItems
    
    return commonNavItems.filter(item => 
      !item.href?.startsWith('/settings')
    )
  }, [isSettingsPage])

  const sidebarData = {
    user: {
      name: user ? `${user?.basicInfo?.name?.firstName} ${user?.basicInfo?.name?.lastName}` : 'Guest User',
      email: user?.basicInfo?.email,
      avatar: user?.basicInfo?.avatarThumb || user?.basicInfo?.avatar || null,
      initials: getInitials(user)
    },
    navMain: navMainItems,
    navSecondary: filteredNavSecondary,
    projects: []
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Pregnify</span>
                  <span className="truncate text-xs">{userRole}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarData.navMain} />
        {/* <NavProjects projects={sidebarData.projects} /> */}
        <NavSecondary items={sidebarData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
