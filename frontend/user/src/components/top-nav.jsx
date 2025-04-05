import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
  Activity,
  Stethoscope,
  Ambulance,
  Bot,
  LineChart,
  MessageSquare,
  Menu,
  User,
  Settings,
  CreditCard,
  Database,
  LifeBuoy,
  LogOut,
  HeartPulse,
  ClipboardList,
  BrainCircuit,
  Bell
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context/auth-context"

const navItems = [
  {
    title: "Health",
    href: "/health",
    icon: HeartPulse,
  },
  {
    title: "Care",
    href: "/care",
    icon: ClipboardList,
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
    title: "Predictions",
    href: "/ai-predictions",
    icon: LineChart,
  },
  {
    title: "Messages",
    href: "/messages",
    icon: Bell,
  },
]

const userMenuItems = [
  {
    title: "Account",
    href: "/settings/account/profile",
    icon: User,
  },
  {
    title: "Preferences",
    href: "/settings/preferences",
    icon: Settings,
  },
  {
    title: "Billing",
    href: "/settings/billing",
    icon: CreditCard,
  },
  {
    title: "System",
    href: "/settings/system",
    icon: Database,
  },
  {
    title: "Help & Legal",
    href: "/settings/help",
    icon: LifeBuoy,
  },
]

export function TopNav() {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  const getInitials = (user) => {
    if (!user || !user?.basicInfo?.name?.firstName || !user?.basicInfo?.name?.lastName) return 'GU'
    return `${user.basicInfo?.name?.firstName.charAt(0)}${user.basicInfo?.name?.lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <nav className="fixed top-0 left-0 z-50 w-full h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center px-8">
        {/* Logo */}
        <div className="flex w-40 items-center gap-4">
          <Activity className="h-8 w-8 text-primary" />
          <span className="text-sm font-medium">Pregnify</span>
        </div>

        {/* Desktop Navigation */}
        <div className="flex flex-1 items-center justify-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-md px-2 py-2 text-[10px] font-medium transition-colors",
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

        {/* User Menu */}
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
            <DropdownMenuContent align="end" className="w-56">
              {userMenuItems.map((item) => {
                const Icon = item.icon
                return (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link to={item.href} className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </DropdownMenuItem>
                )
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="flex items-center gap-3 text-red-600">
                <LogOut className="h-5 w-5" />
                <span className="text-sm">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-0">
              <div className="flex h-16 items-center border-b px-4">
                <h2 className="text-lg font-semibold">Menu</h2>
              </div>
              <div className="flex flex-col space-y-2 p-4">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                        location.pathname === item.href
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  )
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}