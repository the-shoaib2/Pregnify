import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

// Import icons
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
} from "lucide-react"

export const settingsNavGroups = [
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
      { title: "Data Management", href: "/settings/system/data", icon: FileText },
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

export function SettingsNav({ groups, onItemClick }) {
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