import { Skeleton } from "@/components/ui/skeleton"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavUserSkeleton() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        <Skeleton className="h-4 w-16" />
      </SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center gap-3 px-3 py-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
} 