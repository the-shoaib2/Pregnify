"use client"

import { RoleBasedLayout } from "@/components/layout/role-based-layout"
import { useAuth } from "@/contexts/auth-context/auth-context"
import { Navigate, useLocation, useNavigate } from "react-router-dom"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Footer } from "../../components/footer"
import { 
  Home, 
  Heart, 
  Stethoscope, 
  MessageSquare, 
  Bot, 
  Phone, 
  Calendar,
  Baby,
  Activity
} from "lucide-react"

const navigationItems = [
  {
    title: "Home",
    path: "/pregnify/home",
    icon: Home,
    color: "text-blue-500"
  },
  {
    title: "Health",
    path: "/pregnify/health",
    icon: Heart,
    color: "text-red-500"
  },
  {
    title: "Doctors",
    path: "/pregnify/doctors",
    icon: Stethoscope,
    color: "text-green-500"
  },
  {
    title: "Messages",
    path: "/pregnify/messages",
    icon: MessageSquare,
    color: "text-purple-500"
  },
  {
    title: "AI Assistant",
    path: "/pregnify/ai-assistant",
    icon: Bot,
    color: "text-indigo-500"
  },
  {
    title: "Emergency",
    path: "/pregnify/emergency",
    icon: Phone,
    color: "text-orange-500"
  },
  {
    title: "Care",
    path: "/pregnify/care",
    icon: Baby,
    color: "text-pink-500"
  }
]

export default function PregnifyLayout({ children }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    )
  }

  // Check if user has access to pregnify section
  if (!user?.basicInfo?.role || 
      (user?.basicInfo?.role !== 'DOCTOR' && 
       user?.basicInfo?.role !== 'PATIENT' && 
       user?.basicInfo?.role !== 'GUEST')) {
    return <Navigate to="/dashboard" replace />
  }

  // Redirect to home if on root pregnify path
  if (location.pathname === "/pregnify") {
    return <Navigate to="/pregnify/home" replace />
  }

  return (
    <RoleBasedLayout 
      showHeader={true}
      headerTitle="Pregnify"
      isSettingsPage={false}
    >
      <div className="flex h-full flex-col">
        <div className="flex flex-1">
          {/* Sidebar Navigation */}
          <aside className="hidden w-64 border-r bg-muted/40 lg:block">
            <div className="p-4">
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 hover:bg-transparent mb-4" 
                onClick={() => navigate('/pregnify/home')}
              >
                <Activity className="h-5 w-5 text-primary" />
                <span className="text-lg font-medium">Pregnify</span>
              </Button>
              <nav className="flex flex-col gap-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  return (
                    <Link
                      key={item.title}
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                        isActive ? "bg-accent font-medium" : "transparent"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", item.color)} />
                      <span>{item.title}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <Suspense 
              fallback={
                <div className="flex h-full w-full items-center justify-center">
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              }
            >
              {children}
            </Suspense>
          </main>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </RoleBasedLayout>
  )
} 