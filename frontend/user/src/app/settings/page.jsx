import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Link } from "react-router-dom"
import {
  Settings,
  User,
  Bell,
  Moon,
  CreditCard,
  Lock,
  Languages,
  HelpCircle,
  Database,
  Shield,
  LayoutGrid,
  Cog,
  Save,
  FileText,
  Info,
  UserCircle,
  Accessibility
} from "lucide-react"

const settingsGroups = [
  {
    title: "Account",
    description: "Manage your account settings and security",
    icon: User,
    items: [
      { title: "Profile", href: "/settings/account/profile", icon: UserCircle },
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
      { title: "Payment Methods", href: "/settings/billing/payment", icon: CreditCard },
      { title: "Subscriptions", href: "/settings/billing/subscription", icon: FileText }
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
  }
]

export default function SettingsPage() {

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight">Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      <Separator />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsGroups.map((group) => (
          <Card key={group.title}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <group.icon className="h-5 w-5" />
                <CardTitle>{group.title}</CardTitle>
              </div>
              <CardDescription>{group.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li key={item.title}>
                    <Link
                      to={item.href}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 