import { useState, useEffect, useMemo, Suspense } from "react"
import { Badge } from "@/components/ui/badge"
import { ImageDialog } from "@/components/image-view"
import { useAuth } from '@/contexts/auth-context/auth-context'
import React from "react"
import { lazyLoad } from '@/utils/lazy-load.jsx'
import { Skeleton } from "@/components/ui/skeleton"
import { CoverPhotoSkeleton } from './cover-photo'
import { ProfilePictureSkeleton } from './profile-picture'


// Profile Header Skeleton Component
function ProfileHeaderSkeleton() {
  return (
    <div className="space-y-4">
      <div className="relative">
        {/* Cover photo skeleton */}
        <div className="relative">
          <Skeleton className="h-40 w-full rounded-lg sm:h-48" />
          <div className="absolute right-4 top-4">
            <Skeleton className="h-7 w-7 rounded-full border-2 border-background" />
          </div>
        </div>
        
        {/* Profile picture skeleton */}
        <div className="absolute -bottom-2 left-4 z-10">
          <div className="relative">
            <div className="relative rounded-full border-4 border-background">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="absolute -bottom-0.5 -right-0.5">
                <Skeleton className="h-7 w-7 rounded-full border-2 border-background" />
              </div>
            </div>
            <div className="absolute -right-1 -top-1">
              <Skeleton className="h-4 w-4 rounded-full border-2 border-background" />
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="mt-12 px-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-2.5 w-2.5 rounded-full" />
          </div>
          <Skeleton className="h-4 w-[60%]" />
        </div>
      </div>
    </div>
  )
}

// Lazy load components with suspense
const ProfilePicture = lazyLoad(() => import('./profile-picture').then(mod => ({ 
  default: mod.ProfilePicture 
})))

const CoverPhotoUpload = lazyLoad(() => import('./cover-photo').then(mod => ({ 
  default: mod.CoverPhotoUpload 
})))

export function ProfileHeader({ user, loading }) {
  const { profile, refreshData } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [showAvatarDialog, setShowAvatarDialog] = useState(false)
  const [showCoverDialog, setShowCoverDialog] = useState(false)
  const [uploadType, setUploadType] = useState(null)
  const [isAvatarLoading, setIsAvatarLoading] = useState(false)
  const [isCoverLoading, setIsCoverLoading] = useState(false)

  const userData = useMemo(() => user?.data || user || profile?.data || profile, [user, profile])

  useEffect(() => {
    if (userData) {
      setIsLoading(false)
    }
  }, [userData])

  if (isLoading || loading || !userData) {
    return <ProfileHeaderSkeleton />
  }

  const handleUploadComplete = async (file, type) => {
    try {
      if (type === 'avatar') {
        setIsAvatarLoading(true)
        // Handle avatar upload
      } else {
        setIsCoverLoading(true)
        // Handle cover upload
      }
      await refreshData()
    } finally {
      setIsAvatarLoading(false)
      setIsCoverLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Suspense fallback={<CoverPhotoSkeleton />}>
          <CoverPhotoUpload 
            user={userData}
            onUpload={(file) => handleUploadComplete(file, 'cover')}
            loading={isCoverLoading}
          />
        </Suspense>
        
        <div className="absolute -bottom-2 left-4 z-10">
          <Suspense fallback={<ProfilePictureSkeleton />}>
            <ProfilePicture 
              user={userData}
              onUpload={(file) => handleUploadComplete(file, 'avatar')}
              loading={isAvatarLoading}
            />
          </Suspense>
        </div>
      </div>

      <div className="mt-12 px-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">
                {userData?.basicInfo?.name?.firstName} {userData?.basicInfo?.name?.lastName}
              </h2>
              
              {/* Status Badge */}
              <div className="relative">
                {userData?.basicInfo?.status?.activeStatus === "ONLINE" && (
                  <Badge className="h-2.5 w-2.5 rounded-full bg-green-500 p-0" />
                )}
                {(userData?.basicInfo?.status?.activeStatus === "OFFLINE" || 
                  userData?.basicInfo?.status?.activeStatus === "UNDEFINED") && (
                  <Badge className="h-2.5 w-2.5 rounded-full bg-red-500 p-0" />
                )}
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              {userData?.basicInfo?.bio || userData?.basicInfo?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <ImageDialog
        image={userData?.basicInfo?.avatar}
        title="Profile Picture"
        isOpen={showAvatarDialog}
        onClose={() => setShowAvatarDialog(false)}
      />

      <ImageDialog
        image={userData?.basicInfo?.cover}
        title="Cover Photo"
        isOpen={showCoverDialog}
        onClose={() => setShowCoverDialog(false)}
      />
    </div>
  )
} 