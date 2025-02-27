import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { BadgeCheck, Clock, Mail, AtSign, Info, Shield } from "lucide-react"
import { getInitials } from "@/lib/utils"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Separator } from "@/components/ui/separator"
import { useState, useRef } from "react"

export function ButtonProfileCard({ user, href }) {
  // Extract user data from response if needed
  const userData = user?.data || user;
  const buttonRef = useRef(null);

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button
          variant="outline"
          className="h-auto w-full justify-start p-3"
          asChild
          ref={buttonRef}
        >
          <a href={href} className="flex items-center gap-3">
            <Avatar className="h-14 w-14">
              <AvatarImage src={userData?.basicInfo?.avatar} alt={userData?.basicInfo?.name?.firstName} />
              <AvatarFallback>{getInitials(userData?.basicInfo?.name?.firstName || userData?.basicInfo?.username)}</AvatarFallback>
            </Avatar>

            {/* Main Profile Info - More Compact */}
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold">
                  {userData?.basicInfo?.name?.firstName} {userData?.basicInfo?.name?.lastName}
                </span>
                {userData?.basicInfo?.isVerified && (
                  <BadgeCheck className="h-4 w-4 text-primary" />
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {userData?.basicInfo?.email}
              </span>

              {/* Bio */}
              {(userData?.basicInfo?.bio || userData?.basicInfo?.description) && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {userData?.basicInfo?.bio || userData?.basicInfo?.description}
                </p>
              )}
            </div>
          </a>
        </Button>
      </HoverCardTrigger>
      
      <HoverCardContent 
        className="w-auto"
        align="center"
        side="bottom"
        alignOffset={-50}
        sideOffset={10}
      >
        <div className="space-y-3">
          {/* Header - More Compact */}
          <div className="flex gap-3">
            <Avatar className="h-16 w-16">
              <AvatarImage src={userData?.basicInfo?.avatar} />
              <AvatarFallback>{getInitials(userData?.basicInfo?.name?.firstName || userData?.basicInfo?.username)}</AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1">
                <h4 className="text-sm font-semibold">
                  {userData?.basicInfo?.name?.firstName} {userData?.basicInfo?.name?.lastName}
                </h4>
                {userData?.basicInfo?.isVerified && (
                  <BadgeCheck className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <AtSign className="h-3 w-3" />
                  {userData?.basicInfo?.username}
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {userData?.basicInfo?.email}
                </div>
              </div>
            </div>
          </div>

          {/* Stats - Compact Grid */}
          <div className="grid grid-cols-3 gap-2 rounded-md bg-muted/30 p-2 text-center">
            <div>
              <div className="text-sm font-semibold">{userData?.stats?.posts || 0}</div>
              <div className="text-[10px] text-muted-foreground">Posts</div>
            </div>
            <div>
              <div className="text-sm font-semibold">{userData?.stats?.followers || 0}</div>
              <div className="text-[10px] text-muted-foreground">Followers</div>
            </div>
            <div>
              <div className="text-sm font-semibold">{userData?.stats?.following || 0}</div>
              <div className="text-[10px] text-muted-foreground">Following</div>
            </div>
          </div>

          {/* Account Info - Compact List */}
          <div className="space-y-1.5 rounded-md bg-muted/30 p-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-primary" />
                <span>Status:</span>
              </div>
              <span className="text-muted-foreground">
                {userData?.basicInfo?.isVerified ? 'Verified' : 'Not Verified'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Joined:</span>
              </div>
              <span className="text-muted-foreground">
                {new Date(userData?.timestamps?.created).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <div className={`h-1.5 w-1.5 rounded-full ${
                userData?.accountStatus?.activeStatus === 'ONLINE' 
                  ? 'bg-green-500' 
                  : 'bg-red-500'
              }`} />
              <span className="text-muted-foreground">
                {userData?.accountStatus?.activeStatus === 'ONLINE' 
                  ? 'Online' 
                  : 'Offline'}
              </span>
            </div>
          </div>

          {/* Bio - If exists */}
          {(userData?.basicInfo?.bio || userData?.basicInfo?.description) && (
            <div className="space-y-1 rounded-md bg-muted/30 p-2">
              <div className="flex items-center gap-1 text-xs">
                <Info className="h-3 w-3" />
                <span className="font-medium">About</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {userData?.basicInfo?.bio || userData?.basicInfo?.description}
              </p>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
} 