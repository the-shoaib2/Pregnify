import { useState, useEffect, useRef } from "react"
import { FileUpload } from "@/components/file-upload"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Loader2, 
  Upload, 
  Eye
} from "lucide-react"
import { cn } from "@/lib/utils"
import { lazyLoad } from '@/utils/lazy-load.jsx'
import { ImageDialog } from "@/components/image-view"
import { FileCategory, Visibility } from '@/services/media'
import { useAuth } from '@/contexts/auth-context/auth-context'
import React from "react"

// Import the component with default export
const UserAvatar = lazyLoad(() => import('@/components/user/user-avatar').then(mod => ({ 
  default: mod.UserAvatar 
})))

function CoverPhotoUpload({ user, onUpload, loading }) {
  const [showUpload, setShowUpload] = useState(false)
  const [showView, setShowView] = useState(false)
  
  // Extract the actual user data from the response
  const userData = user?.data || user

  return (
    <>
      <div className="group relative h-40 w-full overflow-hidden rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 sm:h-48">
        {userData?.basicInfo?.cover ? (
          <>
            <div 
              className="relative h-full w-full cursor-pointer"
              onClick={() => setShowView(true)}
            >
              <img
                src={userData.basicInfo.cover || '/covers/default.jpg'}
                alt="Cover"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = '/covers/default.jpg'
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/20 group-hover:opacity-100">
                <Eye className="h-6 w-6 text-white" />
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">No cover photo</p>
          </div>
        )}
        
        <div className="absolute right-4 top-4">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-white/90 shadow-sm transition-colors hover:bg-white"
            onClick={() => setShowUpload(true)}
          >
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ImageDialog
        image={userData?.basicInfo?.cover}
        title="Cover Photo"
        description="Your profile cover photo"
        isOpen={showView}
        onClose={() => setShowView(false)}
        onUploadClick={() => {
          setShowView(false)
          setShowUpload(true)
        }}
      />

      <FileUpload
        user={user}
        title="Update Cover Photo"
        description="Choose a photo for your profile cover"
        onUpload={onUpload}
        loading={loading}
        aspect={16/9}
        circular={false}
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        fileCategory={FileCategory.COVER}
        initialState={{
          visibility: Visibility.PUBLIC,
          description: "Profile cover photo"
        }}
      />
    </>
  )
}

function ProfilePicture({ user, onUpload, loading }) {
  const [showUpload, setShowUpload] = useState(false)
  const [showView, setShowView] = useState(false)
  
  // Extract the actual user data from the response
  const userData = user?.data || user

  return (
    <div className="relative">
      <div className="group relative h-24 w-24">
        <div 
          className="relative cursor-pointer rounded-full border-4 border-background bg-background"
          onClick={() => setShowView(true)}
        >
          <div className="relative overflow-hidden rounded-full">
            <div className="transition-transform duration-200 group-hover:scale-[1.08]">
              <UserAvatar 
                user={userData} 
                className="h-[88px] w-[88px]"
                showStatus={false}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/20 group-hover:opacity-100">
              <Eye className="h-4 w-4 text-white" />
            </div>
          </div>

          <div className="absolute -bottom-0.5 -right-0.5">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-full border-2 border-background bg-background shadow-md transition-colors hover:bg-accent"
              onClick={(e) => {
                e.stopPropagation()
                setShowUpload(true)
              }}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Upload className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>

        {user?.status?.activeStatus && (
          <div className="absolute -right-1 -top-1 rounded-full border-2 border-background">
            <Badge 
              className={cn(
                "h-4 w-4 rounded-full p-0 shadow-sm transition-colors",
                user.status.activeStatus === "ONLINE" 
                  ? "bg-green-500" 
                  : "bg-red-500"
              )}
            />
          </div>
        )}
      </div>

      <ImageDialog
        image={userData?.basicInfo?.avatar}
        title="Profile Picture"
        description="Your profile picture"
        isOpen={showView}
        onClose={() => setShowView(false)}
        onUploadClick={() => {
          setShowView(false)
          setShowUpload(true)
        }}
      />

      <FileUpload
        user={user}
        title="Update Profile Picture"
        description="Choose a clear photo to help people recognize you"
        onUpload={onUpload}
        loading={loading}
        aspect={1}
        circular={true}
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        fileCategory={FileCategory.PROFILE}
        initialState={{
          visibility: Visibility.PUBLIC,
          description: user?.discription
        }}
      />
    </div>
  )
}

export function ProfileHeader() {
  const { profile, refreshData } = useAuth()
  const refreshTimeout = useRef(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showAvatarDialog, setShowAvatarDialog] = useState(false)
  const [showCoverDialog, setShowCoverDialog] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadType, setUploadType] = useState(null) // 'avatar' or 'cover'

  // Add console log to check profile data
  React.useEffect(() => {
    console.log('ProfileHeader profile:', profile)
  }, [profile])

  // Single refresh on mount
  useEffect(() => {
    const loadInitialData = async () => {
      if (!profile) {
        await refreshData()
      }
    }
    loadInitialData()
  }, [])

  // Debounced periodic refresh
  useEffect(() => {
    const debouncedRefresh = async () => {
      if (isRefreshing) return
      
      setIsRefreshing(true)
      try {
        await refreshData()
      } finally {
        setIsRefreshing(false)
      }
    }

    refreshTimeout.current = setInterval(debouncedRefresh, 300000) // 5 minutes

    return () => {
      if (refreshTimeout.current) {
        clearInterval(refreshTimeout.current)
      }
    }
  }, [])

  const handleUploadClick = (type) => {
    setUploadType(type)
    setShowUploadDialog(true)
  }

  const handleUploadComplete = async (file) => {
    if (uploadType === 'avatar') {
      // Handle avatar upload
    } else {
      // Handle cover upload
    }
    setShowUploadDialog(false)
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <CoverPhotoUpload 
          user={profile}
          onUpload={handleUploadComplete}
          loading={false}
        />
        
        <div className="absolute -bottom-2 left-4">
          <ProfilePicture 
            user={profile}
            onUpload={handleUploadComplete}
            loading={false}
          />
        </div>
      </div>

      <div className="mt-12 px-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">
                {profile?.basicInfo?.name?.firstName} {profile?.basicInfo?.name?.lastName}
              </h2>
              
              {/* Status Badge */}
              <div className="relative">
                {profile?.basicInfo?.status?.activeStatus === "ONLINE" && (
                  <Badge className="h-2.5 w-2.5 rounded-full bg-green-500 p-0" />
                )}
                {(profile?.basicInfo?.status?.activeStatus === "OFFLINE" || profile?.basicInfo?.status?.activeStatus === "UNDEFINED") && (
                  <Badge className="h-2.5 w-2.5 rounded-full bg-red-500 p-0" />
                )}
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              {profile?.basicInfo?.bio || profile?.basicInfo?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Image Preview Dialogs */}
      <ImageDialog
        image={profile?.basicInfo?.avatar}
        title="Profile Picture"
        isOpen={showAvatarDialog}
        onClose={() => setShowAvatarDialog(false)}
      />

      <ImageDialog
        image={profile?.basicInfo?.cover}
        title="Cover Photo"
        isOpen={showCoverDialog}
        onClose={() => setShowCoverDialog(false)}
      />
    </div>
  )
} 