import { useState, useEffect, useMemo, Suspense } from "react"
import { Badge } from "@/components/ui/badge"
import { ImageDialog } from "@/components/image-view"
import { useAuth } from '@/contexts/auth-context/auth-context'
import React from "react"
import { lazyLoad } from '@/utils/lazy-load.jsx'
import { Loader2 } from "lucide-react"

// Simple loading component
function LoadingSpinner() {
  return (
    <div className="flex h-48 w-full items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )
}

// Lazy load components with suspense
const ProfilePicture = lazyLoad(() => import('./profile-picture').then(mod => ({ 
  default: mod.ProfilePicture 
})), {
  LoadingComponent: LoadingSpinner
})

const CoverPhotoUpload = lazyLoad(() => import('./cover-photo').then(mod => ({ 
  default: mod.CoverPhotoUpload 
})), {
  LoadingComponent: LoadingSpinner
})

export function ProfileHeader() {
  const { profile, refreshData } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [showAvatarDialog, setShowAvatarDialog] = useState(false)
  const [showCoverDialog, setShowCoverDialog] = useState(false)
  const [uploadType, setUploadType] = useState(null)

  // Add loading states for specific actions
  const [isAvatarLoading, setIsAvatarLoading] = useState(false)
  const [isCoverLoading, setIsCoverLoading] = useState(false)

  // Memoize user data
  const userData = useMemo(() => profile?.data || profile, [profile])

  // Optimize loading state changes
  useEffect(() => {
    let mounted = true;
    
    if (!profile && mounted) {
      refreshData().finally(() => {
        if (mounted) {
          // Reduced delay for faster response
          requestAnimationFrame(() => setIsLoading(false));
        }
      });
    } else {
      setIsLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [profile, refreshData]);

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

  if (isLoading || !userData) {
    return <LoadingSpinner />
  }
  
  return (
    <div className="space-y-4">
      <Suspense fallback={<LoadingSpinner />}>
        <div className="relative">
          <CoverPhotoUpload 
            user={userData}
            onUpload={(file) => handleUploadComplete(file, 'cover')}
            loading={isCoverLoading}
          />
          
          <div className="absolute -bottom-2 left-4 z-10">
            <ProfilePicture 
              user={userData}
              onUpload={(file) => handleUploadComplete(file, 'avatar')}
              loading={isAvatarLoading}
            />
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
                  {(userData?.basicInfo?.status?.activeStatus === "OFFLINE" || userData?.basicInfo?.status?.activeStatus === "UNDEFINED") && (
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
      </Suspense>
    </div>
  )
} 