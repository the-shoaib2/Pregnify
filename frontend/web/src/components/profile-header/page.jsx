import { useState, useEffect, useMemo, memo } from "react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from '@/contexts/auth-context/auth-context'
import { cn } from "@/lib/utils"
import { CoverPhotoSkeleton, CoverPhotoUpload } from './cover-photo'
import { ProfilePictureSkeleton, ProfilePicture } from './profile-picture'
import { AuthService } from '@/services/auth'

const ProfileHeaderSkeleton = memo(() => (
  <div className="space-y-4 animate-in fade-in duration-300">
    <div className="relative">
      <CoverPhotoSkeleton />
      <div className="absolute -bottom-2 left-4 z-10">
        <ProfilePictureSkeleton />
      </div>
    </div>
  </div>
))
ProfileHeaderSkeleton.displayName = 'ProfileHeaderSkeleton'

const ProfileHeader = memo(({ user, loading, uploadingImage, uploadingCover, onAvatarClick, onCoverClick }) => {
  const { profile, refreshData } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isAvatarLoading, setIsAvatarLoading] = useState(false)
  const [isCoverLoading, setIsCoverLoading] = useState(false)

  useEffect(() => {
    AuthService.getProfile()
      .catch(error => {
        if (error.message === 'Authentication required') {
          // Handle auth error (redirect to login, etc)
        }
      })
  }, [])

  const userData = useMemo(() => {
    // Ensure we have a valid data object to work with
    const data = profile?.data || user || {}
    return data
  }, [user, profile])

  useEffect(() => {
    if (userData) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [userData])

  const handleUploadComplete = async (file, type) => {
    try {
      if (type === 'avatar') {
        setIsAvatarLoading(true)
      } else {
        setIsCoverLoading(true)
      }
      await refreshData()
    } finally {
      setIsAvatarLoading(false)
      setIsCoverLoading(false)
    }
  }

  if (isLoading || loading || !userData) {
    return <ProfileHeaderSkeleton />
  }

  return (
    <div className={cn(
      "space-y-4 transition-all duration-300",
      loading ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
    )}>
      <div className="relative">
        <CoverPhotoUpload 
          user={userData}
          onUpload={(file) => handleUploadComplete(file, 'cover')}
          loading={isCoverLoading || uploadingCover}
          onClick={onCoverClick}
        />
        
        <div className="absolute -bottom-2 left-4 z-10">
          <ProfilePicture 
            user={userData}
            onUpload={(file) => handleUploadComplete(file, 'avatar')}
            loading={isAvatarLoading || uploadingImage}
            onClick={onAvatarClick}
          />
        </div>
      </div>

      <div className="mt-12 px-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {/* Name and description or bio */}
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold">
                  {userData?.basicInfo?.name?.firstName || userData?.personalInfo?.name?.firstName} {userData?.basicInfo?.name?.lastName || userData?.personalInfo?.name?.lastName}
                </h2>
              </div>
              
              {/* Status Badge */}
              <div className="relative">
                {userData?.accountStatus?.activeStatus === "ONLINE" && (
                  <Badge className="h-2.5 w-2.5 rounded-full bg-green-500 p-0 border-2 border-primary/80 shadow-sm" />
                )}
                {(userData?.accountStatus?.activeStatus === "OFFLINE" || 
                  userData?.accountStatus?.activeStatus === "UNDEFINED") && (
                  <Badge className="h-2.5 w-2.5 rounded-full bg-gray-500 p-0 border-2 border-primary/80 shadow-sm" />
                )}
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              {userData?.basicInfo?.bio || userData?.basicInfo?.description}
            </p>
            <p className="text-sm text-muted-foreground">
              {userData?.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
})
ProfileHeader.displayName = 'ProfileHeader'

export { ProfileHeader } 