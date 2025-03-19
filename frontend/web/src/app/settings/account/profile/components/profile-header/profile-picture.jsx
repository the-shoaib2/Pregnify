import { useState, useMemo, memo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileUpload } from "@/components/file-upload"
import { ImageDialog } from "@/components/image-view"
import { FileCategory, Visibility } from '@/services/media'
import { Upload, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { UserAvatar } from "@/components/user/user-avatar"
import { ProfilePictureSkeleton } from "../profile-header-skeleton"

const ProfilePicture = memo(({ user, onUpload, loading, onClick }) => {
  const [showUpload, setShowUpload] = useState(false)
  const [showView, setShowView] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  const userData = useMemo(() => {
    const data = user?.data || user || {}
    return {
      ...data,
      basicInfo: {
        ...data.basicInfo,
        ...data.personalInfo,
        avatar: data.basicInfo?.avatar || data.personalInfo?.avatar
      }
    }
  }, [user])

  // Handle click event with optional callback
  const handleClick = (e) => {
    if (onClick) {
      onClick(e)
    } else {
      setShowView(true)
    }
  }

  return (
    <div className="relative">
      <div className="group relative h-24 w-24">
        {userData?.basicInfo?.avatar && (
          <div 
            className={cn(
              "relative cursor-pointer rounded-full border-4 border-background bg-background",
              "transition-all duration-300",
              "after:absolute after:inset-0 after:rounded-full after:opacity-0 group-hover:after:opacity/40 group-hover:after:bg-black/40 after:transition-opacity",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onClick={handleClick}
          >
            <div className="transition-transform duration-300 group-hover:scale-105">
              <UserAvatar 
                user={userData} 
                className="h-[88px] w-[88px]"
                showStatus={false}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
                useThumb={true}
                priority={true}
                loading="eager"
                fetchPriority="high"
              />
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <Eye className="h-4 w-4 text-white" />
            </div>

            <div className="absolute -bottom-0.5 -right-0.5 z-20">
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
                <Upload className={cn("h-3 w-3", loading && "animate-pulse")} />
              </Button>
            </div>
          </div>
        )}

        {/* Show skeleton when image is not loaded or there's no avatar */}
        {(!imageLoaded || !userData?.basicInfo?.avatar) && <ProfilePictureSkeleton />}

        {userData?.status?.activeStatus && (
          <div className="absolute -right-1 -top-1 rounded-full border-2 border-background z-30">
            <Badge className={cn(
              "h-4 w-4 rounded-full p-0",
              userData.status.activeStatus === "ONLINE" 
                ? "bg-green-500" 
                : "bg-red-500"
            )} />
          </div>
        )}
      </div>

      {showView && (
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
      )}

      {showUpload && (
        <FileUpload
          user={user}
          title="Update Profile Picture"
          description="Choose a photo for your profile"
          onUpload={onUpload}
          loading={loading}
          aspect={1}
          circular={true}
          isOpen={showUpload}
          onClose={() => setShowUpload(false)}
          fileCategory={FileCategory.AVATAR}
          initialState={{
            visibility: Visibility.PUBLIC,
            description: "Profile picture"
          }}
        />
      )}
    </div>
  )
})
ProfilePicture.displayName = 'ProfilePicture'

export { ProfilePicture }