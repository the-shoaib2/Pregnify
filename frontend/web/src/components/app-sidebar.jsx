import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter 
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  Settings,
  Building2,
  UserCog,
  Activity,
  ClipboardList,
  MessageSquare,
  Bell,
  BarChart,
  LogOut
} from "lucide-react"

const routes = {
  SUPER_ADMIN: [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      variant: "default"
    },
    {
      title: "Users",
      icon: Users,
      href: "/users",
      variant: "ghost"
    },
    {
      title: "Departments",
      icon: Building2,
      href: "/departments",
      variant: "ghost"
    },
    {
      title: "Analytics",
      icon: BarChart,
      href: "/analytics",
      variant: "ghost"
    }
  ],
  ADMIN: [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      variant: "default"
    },
    {
      title: "Patients",
      icon: Users,
      href: "/patients",
      variant: "ghost"
    },
    {
      title: "Appointments",
      icon: CalendarDays,
      href: "/appointments",
      variant: "ghost"
    },
    {
      title: "Reports",
      icon: FileText,
      href: "/reports",
      variant: "ghost"
    }
  ],
  DOCTOR: [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      variant: "default"
    },
    {
      title: "My Patients",
      icon: Users,
      href: "/my-patients",
      variant: "ghost"
    },
    {
      title: "Appointments",
      icon: CalendarDays,
      href: "/appointments",
      variant: "ghost"
    },
    {
      title: "Medical Records",
      icon: ClipboardList,
      href: "/records",
      variant: "ghost"
    }
  ]
}

export function AppSidebar({ className }) {
  const { user, logout } = useAuth()
  
  // Don't render sidebar if no user or role
  if (!user?.role) return null

  const userRoutes = routes[user.role] || []

  return (
    <Sidebar className={cn("border-r", className)}>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6" />
          <h2 className="text-lg font-semibold">Medical System</h2>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <div className="space-y-1">
              {userRoutes.map((route) => (
                <Button
                  key={route.href}
                  variant={route.variant}
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <Link to={route.href}>
                    <route.icon className="mr-2 h-4 w-4" />
                    {route.title}
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          <div className="px-3 py-2">
            <h3 className="mb-2 px-4 text-sm font-medium">Settings</h3>
            <div className="space-y-1">
              <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                <Link to="/profile">
                  <UserCog className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                <Link to="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-medium">{user?.fullName}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
