import { Outlet, Link, useLocation } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  User,
  UserCircle,
  Lock,
  Shield,
  Moon,
  Bell,
  Languages,
  Accessibility,
  CreditCard,
  FileText,
  Database,
  LayoutGrid,
  Cog,
  Settings,
  Save,
  Info,
  HelpCircle,
  LifeBuoy,
  Menu,
  X
} from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

const settingsNavGroups = [
  {
    title: "Account",
    description: "Manage your account settings and preferences",
    icon: User,
    items: [
      { title: "Profile", href: "/settings/account/profile", icon: UserCircle },
      { title: "Accounts", href: "/settings/account/accounts", icon: User },
      { title: "Security", href: "/settings/account/security", icon: Lock },
      { title: "Privacy", href: "/settings/account/privacy", icon: Shield }
    ]
  },
  {
    title: "Preferences",
    description: "Customize your application experience",
    icon: Settings,
    items: [
      { title: "Appearance", href: "/settings/preferences/appearance", icon: Moon },
      { title: "Notifications", href: "/settings/preferences/notifications", icon: Bell },
      { title: "Language", href: "/settings/preferences/language", icon: Languages },
      { title: "Accessibility", href: "/settings/preferences/accessibility", icon: Accessibility }
    ]
  },
  {
    title: "Billing",
    description: "Manage your billing and subscriptions",
    icon: CreditCard,
    items: [
      { title: "Payment", href: "/settings/billing/payment", icon: CreditCard },
      { title: "Subscription", href: "/settings/billing/subscription", icon: FileText }
    ]
  },
  {
    title: "System",
    description: "System settings and maintenance",
    icon: Cog,
    items: [
      { title: "Storage", href: "/settings/system/storage", icon: Database },
      { title: "Connected Apps", href: "/settings/system/apps", icon: LayoutGrid },
      { title: "Backup", href: "/settings/system/backup", icon: Save },
      { title: "Audit Logs", href: "/settings/system/logs", icon: FileText }
    ]
  },
  {
    title: "Help & Legal",
    description: "Get help and learn more about Pregnify",
    icon: HelpCircle,
    items: [
      { title: "Support", href: "/settings/help/support", icon: LifeBuoy },
      { title: "About", href: "/settings/help/about", icon: Info }
    ]
  }
]

export default function SettingsLayout() {
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Get current page title for breadcrumb
  const currentGroup = settingsNavGroups.find(group => 
    group.items.some(item => item.href === location.pathname)
  )
  const currentPage = currentGroup?.items.find(item => 
    item.href === location.pathname
  )?.title || "Settings"

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-14 items-center border-b bg-background px-4">
          <SidebarTrigger className="-ml-2" />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:inline-flex">
                <BreadcrumbLink to="/" as={Link}>Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:inline-flex" />
              <BreadcrumbItem>
                <BreadcrumbLink to="/settings" as={Link}>Settings</BreadcrumbLink>
              </BreadcrumbItem>
              {currentGroup && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{currentGroup.title}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
              {currentPage !== "Settings" && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{currentPage}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
          
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Navigation Sidebar - Desktop */}
          <aside className="hidden w-56 shrink-0 overflow-y-auto border-r bg-muted/40 lg:block">
            <SettingsNav groups={settingsNavGroups} />
          </aside>

          {/* Navigation Sidebar - Mobile */}
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetContent side="left" className="w-[80%] p-0 sm:w-[350px]">
              <div className="flex h-14 items-center border-b px-4">
                <h2 className="text-lg font-semibold">Settings</h2>
                <SheetClose className="ml-auto">
                  <X className="h-5 w-5" />
                </SheetClose>
              </div>
              <div className="overflow-y-auto">
                <SettingsNav groups={settingsNavGroups} onItemClick={() => setIsSidebarOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto">
            <div className="container max-w-3xl px-4 py-6">
              <Outlet />
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

// Separate component for the settings navigation
function SettingsNav({ groups, onItemClick }) {
  const location = useLocation()
  
  return (
    <nav className="space-y-2 p-4">
      {groups.map((group) => (
        <div key={group.title} className="space-y-2">
          <div className="flex items-center gap-2 px-2 pt-2">
            <group.icon className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-medium text-muted-foreground">
              {group.title}
            </h4>
          </div>
          <div className="flex flex-col space-y-1">
            {group.items.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={onItemClick}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  location.pathname === item.href
                    ? "bg-muted hover:bg-muted"
                    : "hover:bg-transparent hover:underline",
                  "justify-start"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  )
} 