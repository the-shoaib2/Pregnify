import * as React from "react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

// Add UserAvatarSkeleton component
export function UserAvatarSkeleton({ className }) {
  return (
    <div className="relative">
      <Skeleton className={cn("rounded-full", className || "h-10 w-10")} />
    </div>
  )
}

export function UserAvatar({ 
  user, 
  className, 
  showStatus = false, 
  isLoading, 
  onLoad,
  useThumb = true,
  priority = false
}) {
  const userData = user?.data || user

  const displayName = React.useMemo(() => {
    if (!userData) return 'Guest User'
    if (userData?.basicInfo?.name?.firstName && userData?.basicInfo?.name?.lastName) {
      return `${userData.basicInfo.name.firstName} ${userData.basicInfo.name.lastName}`
    }
    if (userData?.basicInfo?.email) return userData.basicInfo.email.split('@')[0]
    return userData?.basicInfo?.username || userData?.basicInfo?.userID || 'Guest User'
  }, [userData])

  const avatarUrl = React.useMemo(() => {
    if (!userData?.basicInfo) return null
    
    // If useThumb is true, try thumbnail first
    if (useThumb) {
      return userData.basicInfo.avatarThumb || userData.basicInfo.avatar || null
    }
    
    // If useThumb is false, use full avatar
    return userData.basicInfo.avatar || userData.basicInfo.avatarThumb || null
  }, [userData?.basicInfo, useThumb])

  const initials = React.useMemo(() => {
    if (!userData?.basicInfo) return 'GU'
    
    // Try to get initials from firstName and lastName
    const firstNameInitial = userData.basicInfo?.name?.firstName?.charAt(0)
    const lastNameInitial = userData.basicInfo?.name?.lastName?.charAt(0)
    
    if (firstNameInitial && lastNameInitial) {
      return `${firstNameInitial}${lastNameInitial}`.toUpperCase()
    }
    
    // Try to get initials from email
    if (userData.basicInfo?.email) {
      const emailInitials = userData.basicInfo.email
        .split('@')[0]
        .slice(0, 2)
        .toUpperCase()
      if (emailInitials) return emailInitials
    }
    
    // Try to get initials from username
    if (userData.basicInfo?.username) {
      return userData.basicInfo.username.slice(0, 2).toUpperCase()
    }

    // Try to get initials from userID
    if (userData.basicInfo?.userID) {
      return userData.basicInfo.userID.slice(0, 2).toUpperCase()
    }
    
    // Final fallback
    return 'GU'
  }, [userData])



  return (
    <div className="relative">
      <Avatar className={cn(
        "transition-all duration-300",
        className
      )}>
        <AvatarImage 
          src={avatarUrl}
          alt={displayName}
          className="object-cover"
          onError={(e) => {
            e.target.onerror = null
            e.target.src = ''
          }}
          onLoad={onLoad}
        />
        <AvatarFallback 
          className="bg-primary/10 text-primary"
          delayMs={100}
        >
          {initials}
        </AvatarFallback>
      </Avatar>

      {showStatus && userData?.accountStatus?.activeStatus && (
        <div className="absolute -right-0.5 -top-0.5 rounded-full border-2 border-background">
          <div className={cn(
            "h-3 w-3 rounded-full",
            userData.accountStatus.activeStatus === "ONLINE" 
              ? "bg-green-500" 
              : "bg-red-500"
          )} />
        </div>
      )}
    </div>
  )
}

export function UserAvatarWithInfo({ user, className, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-1 py-1.5">
        <UserAvatarSkeleton className={className || "h-8 w-8"} />
        <div className="grid flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-1 h-3 w-32" />
        </div>
      </div>
    )
  }

  // Format name with proper capitalization and null checks
  const formattedName = React.useMemo(() => {
    if (!user?.basicInfo?.name?.firstName || !user?.basicInfo?.name?.lastName) {
      return user?.basicInfo?.email?.split('@')[0] || user?.basicInfo?.role || ''
    }
    
    const formatName = (name) => {
      if (!name) return ''
      return name
        .split(' ')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ')
    }

    const firstName = formatName(user?.basicInfo?.name?.firstName)
    const lastName = formatName(user?.basicInfo?.name?.lastName)
    
    return `${firstName} ${lastName}`.trim()
  }, [user])

  return (
    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
      <UserAvatar user={user} className={className || "h-8 w-8"} />
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">{formattedName}</span>
        <span className="truncate text-xs">{user?.basicInfo?.email}</span>
      </div>
    </div>
  )
} 