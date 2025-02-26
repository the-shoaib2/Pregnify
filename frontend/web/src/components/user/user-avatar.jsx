import * as React from "react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export function UserAvatar({ user, className, showStatus = false }) {
  // Extract the actual user data from the response
  const userData = user?.data || user

  const displayName = React.useMemo(() => {
    if (!userData) return ''
    if (userData?.basicInfo?.name?.full) {
      return userData.basicInfo.name.full
    }
    if (userData?.basicInfo?.email) return userData.basicInfo.email.split('@')[0]
    return userData?.basicInfo?.username || userData?.basicInfo?.userID || ''
  }, [userData])

  const initials = React.useMemo(() => {
    if (!userData) return 'GU'
    
    // Get first letter of first name and last name
    const firstNameInitial = userData?.basicInfo?.name?.first?.charAt(0)
    const lastNameInitial = userData?.basicInfo?.name?.last?.charAt(0)
    
    if (firstNameInitial && lastNameInitial) {
      return `${firstNameInitial}${lastNameInitial}`.toUpperCase()
    }
    
    // Fallback to email if no name
    if (userData?.basicInfo?.email) {
      return userData.basicInfo.email.slice(0, 2).toUpperCase()
    }
    
    return 'GU'
  }, [userData])

  return (
    <div className="relative">
      <Avatar className={cn("", className)}>
        <AvatarImage 
          src={userData?.basicInfo?.avatar || '/avatars/default.jpg'} 
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

export function UserAvatarWithInfo({ user, className }) {
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