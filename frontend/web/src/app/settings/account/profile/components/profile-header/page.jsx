import { useState, useEffect, useMemo, memo } from "react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from '@/contexts/auth-context/auth-context'
import { cn } from "@/lib/utils"
import { CoverPhotoUpload } from './cover-photo'
import { ProfilePicture } from './profile-picture'
import { ProfileHeaderSkeleton } from '../profile-header-skeleton'

const ProfileHeader = memo(({ 
  user, 
  profile, 
  profileData: parentProfileData, 
  loading, 
  uploadingImage, 
  uploadingCover, 
  onAvatarClick, 
  onCoverClick,
  onUploadComplete
}) => {
  const [isAvatarLoading, setIsAvatarLoading] = useState(false)
  const [isCoverLoading, setIsCoverLoading] = useState(false)

  // Use the profile data passed from parent component
  const userData = useMemo(() => {
    // Ensure we have a valid data object to work with
    return parentProfileData || profile?.data || user || {}
  }, [parentProfileData, profile?.data, user])

  const handleAvatarUpload = async (file) => {
    try {
      setIsAvatarLoading(true)
      await onUploadComplete(file, 'avatar')
    } catch (error) {
      console.error('Avatar upload error:', error)
    } finally {
      setIsAvatarLoading(false)
    }
  }

  const handleCoverUpload = async (file) => {
    try {
      setIsCoverLoading(true)
      await onUploadComplete(file, 'cover')
    } catch (error) {
      console.error('Cover upload error:', error)
    } finally {
      setIsCoverLoading(false)
    }
  }

  // Show skeleton during loading or when data is not available
  if (loading || !userData) {
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
          onUpload={handleCoverUpload}
          loading={isCoverLoading || uploadingCover}
          onClick={onCoverClick}
        />
        
        <div className="absolute -bottom-2 left-4 z-10">
          <ProfilePicture 
            user={userData}
            onUpload={handleAvatarUpload}
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