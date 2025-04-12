import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
  Activity,
  User,
  LogOut,
  Loader,
  ChevronRight,
  BriefcaseMedical,
  UsersRound,
  HandHeart,
  HeartPulse,
  Ambulance,
  BrainCircuit,
  MessageCircle
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/contexts/auth-context/auth-context"
import { PhoneNav } from "@/components/phone-nav"
import { useIsMobile } from "@/hooks/use-mobile"

const navItems = [
  {
    title: "Home",
    href: "/",
    icon: BriefcaseMedical,
  },
  {
    title: "Health",
    href: "/health",
    icon: HeartPulse,
  },
  {
    title: "Emergency",
    href: "/emergency",
    icon: Ambulance,
  },
  {
    title: "AI Assistant",
    href: "/ai-assistant",
    icon: BrainCircuit,
  },
  {
    title: "Doctors",
    href: "/doctors",
    icon: UsersRound,
  },
  {
    title: "Messages",
    href: "/messages",
    icon: MessageCircle,
  },
]

const settingsNavGroups = [
  {
    title: "Account",
    description: "Manage your account settings and preferences",
    icon: User,
    items: [
      { title: "Profile", href: "/settings/account/profile", icon: User },
      { title: "Accounts", href: "/settings/account/accounts", icon: User },
      { title: "Security", href: "/settings/account/security", icon: User },
      { title: "Privacy", href: "/settings/account/privacy", icon: User }
    ]
  },
  {
    title: "Preferences",
    description: "Customize your application experience",
    icon: User,
    items: [
      { title: "Appearance", href: "/settings/preferences/appearance", icon: User },
      { title: "Notifications", href: "/settings/preferences/notifications", icon: User },
      { title: "Language", href: "/settings/preferences/language", icon: User },
      { title: "Accessibility", href: "/settings/preferences/accessibility", icon: User }
    ]
  },
  {
    title: "Billing",
    description: "Manage your billing and subscriptions",
    icon: User,
    items: [
      { title: "Payment", href: "/settings/billing/payment", icon: User },
      { title: "Subscription", href: "/settings/billing/subscription", icon: User }
    ]
  },
  {
    title: "System",
    description: "System settings and maintenance",
    icon: User,
    items: [
      { title: "Storage", href: "/settings/system/storage", icon: User },
      { title: "Connected Apps", href: "/settings/system/apps", icon: User },
      { title: "Backup", href: "/settings/system/backup", icon: User },
      { title: "Data Management", href: "/settings/system/data", icon: User },
      { title: "Audit Logs", href: "/settings/system/logs", icon: User }
    ]
  },
  {
    title: "Help & Legal",
    description: "Get help and learn more about Pregnify",
    icon: User,
    items: [
      { title: "Support", href: "/settings/help/support", icon: User },
      { title: "About", href: "/settings/help/about", icon: User }
    ]
  }
]

export function TopNav() {
  const location = useLocation()
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [expandedGroup, setExpandedGroup] = useState(null)
  const { user, logout } = useAuth()
  const isMobile = useIsMobile()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoggingOut(false)
      setIsLogoutDialogOpen(false)
    }
  }

  const getInitials = (user) => {
    if (!user || !user?.basicInfo?.name?.firstName || !user?.basicInfo?.name?.lastName) return 'GU'
    return `${user.basicInfo?.name?.firstName.charAt(0)}${user.basicInfo?.name?.lastName.charAt(0)}`.toUpperCase()
  }

  const handleGroupClick = (groupTitle) => {
    setExpandedGroup(expandedGroup === groupTitle ? null : groupTitle)
  }

  const renderUserMenu = () => (
    <DropdownMenuContent align="end" className="w-64">
      <div className="p-2">
        {settingsNavGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <button
              onClick={() => handleGroupClick(group.title)}
              className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <div className="flex items-center gap-2">
                <group.icon className="h-4 w-4" />
                <span>{group.title}</span>
              </div>
              <ChevronRight 
                className={`h-4 w-4 transition-transform duration-200 ${
                  expandedGroup === group.title ? 'rotate-90' : ''
                }`}
              />
            </button>
            {expandedGroup === group.title && (
              <div className="grid gap-1 pl-6">
                {group.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link 
                        to={item.href} 
                        className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </DropdownMenuItem>
                  )
                })}
              </div>
            )}
            {group.title !== settingsNavGroups[settingsNavGroups.length - 1].title && (
              <div className="my-1 h-px bg-border" />
            )}
          </div>
        ))}
      </div>
      <DropdownMenuSeparator />
      <DropdownMenuItem 
        onClick={() => setIsLogoutDialogOpen(true)}
        className="flex items-center gap-2 px-2 py-1.5 text-sm text-red-600 bg-red-600/10 hover:bg-red-600 focus:bg-red-600 focus:text-white hover:text-white transition-colors duration-200"
      >
        <LogOut className="h-4 w-4" />
        <span>Logout</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  )

  // If on mobile, render the phone navigation
  if (isMobile) {
    return <PhoneNav />
  }

  return (
    <>
      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be redirected to the login page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
              disabled={isLoggingOut}>
              {isLoggingOut ? (
                <>
                  Logging out..
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                'Log out'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Desktop Navigation */}
      <nav className="fixed top-0 left-0 z-50 hidden w-full h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:block overflow-hidden">
        <div className="flex h-full items-center px-8 w-full">

          <Button variant="ghost" className="flex hover:bg-transparent items-center" onClick={() => navigate('/')}>
            <Activity className="h-15 w-15 text-primary" />
            <span className="text-xl font-medium">Pregnify</span>
          </Button>

          <div className="flex flex-1 items-center justify-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-md px-3 py-2 text-[10px] font-medium transition-colors",
                    location.pathname === item.href
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-6 w-6" />
                  <span className="whitespace-nowrap">{item.title}</span>
                </Link>
              )
            })}
          </div>

          <div className="flex w-40 items-center justify-end gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-10 w-10 rounded-full p-0"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    {user?.basicInfo?.avatar ? (
                      <img
                        src={user.basicInfo.avatar}
                        alt="User avatar"
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium">{getInitials(user)}</span>
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              {renderUserMenu()}
            </DropdownMenu>
          </div>
        </div>
      </nav>
    </>
  )
}