import { SidebarNav } from "./components/sidebar-nav"
import { ScrollArea } from "@/components/ui/scroll-area"

const sidebarNavItems = [
  {
    title: "Profile",
    href: "/settings/account/profile",
    icon: "User"
  },
  {
    title: "Accounts",
    href: "/settings/account/accounts",
    icon: "Users" 
  },
  {
    title: "Privacy",
    href: "/settings/account/privacy",
    icon: "Shield"
  },
  {
    title: "Security",
    href: "/settings/account/security", 
    icon: "Lock"
  }
]

export default function SettingsLayout({ children }) {
  return (
    <div className="container relative mx-auto flex min-h-screen w-full flex-col space-y-6 py-6 lg:space-y-0 lg:py-8">
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex-1 lg:max-w-3xl">
          <ScrollArea className="h-full">
            {children}
          </ScrollArea>
        </div>
      </div>
    </div>
  )
} 