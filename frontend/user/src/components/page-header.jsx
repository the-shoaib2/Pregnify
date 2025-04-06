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
import React from 'react';
import { useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context/auth-context"

export function PageHeader({ 
  title,
  showBorder = true,
  showFullscreen = true,
  className,
  children,
  hidden,
  ...props 
}) {
  if (hidden) return null;

  const location = useLocation()
  const pathSegments = location.pathname.split('/').filter(Boolean)
  
  // Format the path segments for display
  const formatSegment = (segment) => {
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

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
            {pathSegments.map((segment, index) => {
              const isLast = index === pathSegments.length - 1
              const path = `/${pathSegments.slice(0, index + 1).join('/')}`
              const displayName = formatSegment(segment)

              return (
                <React.Fragment key={path}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{displayName}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={path}>{displayName}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              )
            })}
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