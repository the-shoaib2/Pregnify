import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { FullscreenButton } from "@/components/fullscreen-button"
import { cn } from "@/lib/utils"

export function PageHeader({ 
  title,
  showDashboardLink = true,
  showBorder = true,
  showFullscreen = true,
  className,
  children,
  ...props 
}) {
  return (
    <header 
      className={cn(
        "flex h-16 shrink-0 items-center gap-2",
        showBorder && "border-b rounded-t-lg",
        className
      )} 
      {...props}
    >
      <div className={cn(
        "flex flex-1 items-center gap-2 px-4",
        showBorder && "rounded-t-lg"
      )}>
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        
        <Breadcrumb>
          <BreadcrumbList>
            {showDashboardLink && (
              <>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
            {children}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto flex items-center gap-2">
          {showFullscreen && <FullscreenButton className="hidden md:inline-flex" />}
        </div>
      </div>
    </header>
  )
} 