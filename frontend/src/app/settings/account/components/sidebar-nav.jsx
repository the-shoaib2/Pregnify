import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import * as Icons from "lucide-react"

export function SidebarNav({ items }) {
  const pathname = usePathname()

  return (
    <nav className="flex w-full space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
      {items.map((item) => {
        const Icon = Icons[item.icon]
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "justify-start",
              pathname === item.href
                ? "bg-muted hover:bg-muted"
                : "hover:bg-transparent hover:underline",
              "flex items-center rounded-md px-3 py-2 text-sm font-medium"
            )}
          >
            <Icon className="mr-2 h-4 w-4" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
} 