import * as React from "react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export function UserAvatar({ user, className, showStatus = false }) {
  // Create display name with better fallbacks
  const displayName = React.useMemo(() => {
    if (!user) return user?.role
    if (user.firstName && user.lastName && user.firstName !== 'undefined' && user.lastName !== 'undefined') {
      return `${user.firstName} ${user.lastName}`
    }
    if (user.email) return user.email?.split('@')[0] || user.role
    return user.email?.split('@')[0] || user.role
  }, [user])

  // Create initials with better fallbacks
  const initials = React.useMemo(() => {
    if (!user) return 'GU'
    
    // Get first letter of first name and last name
    const firstNameInitial = user?.firstName?.charAt(0)
    const lastNameInitial = user?.lastName?.charAt(0)
    
    if (firstNameInitial && lastNameInitial) {
      return `${firstNameInitial}${lastNameInitial}`.toUpperCase()
    }
    
    // Fallback to email if no name
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase()
    }
    
    return 'GU'
  }, [user])

  return (
    <div className="relative">
      <Avatar className={cn("", className)}>
        <AvatarImage 
          src={user?.avatar} 
          alt={displayName}
          className="object-cover"
          onError={(e) => {
            e.target.onerror = null
            e.target.src = '/avatars/default.jpg'
          }}
        />
        <AvatarFallback className="bg-primary/10 text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Status Indicator */}
      {showStatus && user?.status?.activeStatus && (
        <div className="absolute -right-0.5 -top-0.5 rounded-full border-2 border-background">
          <div className={cn(
            "h-3 w-3 rounded-full",
            user.status.activeStatus === "ONLINE" 
              ? "bg-green-500" 
              : "bg-red-500"
          )} />
        </div>
      )}
    </div>
  )
}

export function UserAvatarWithInfo({ user, className }) {
  // Format name with proper capitalization
  const formattedName = React.useMemo(() => {
    if (!user?.firstName || !user?.lastName) return ''
    
    const formatName = (name) => {
      return name
        .split(' ')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ')
    }

    const firstName = formatName(user.firstName)
    const lastName = formatName(user.lastName)
    
    return `${firstName} ${lastName}`
  }, [user])

  return (
    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
      <UserAvatar user={user} className={className || "h-8 w-8"} />
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">{formattedName}</span>
        <span className="truncate text-xs">{user?.email}</span>
      </div>
    </div>
  )
} 