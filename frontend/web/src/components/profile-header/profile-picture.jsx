import { useState, useMemo, memo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileUpload } from "@/components/file-upload"
import { ImageDialog } from "@/components/image-view"
import { FileCategory, Visibility } from '@/services/media'
import { Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { UserAvatar } from "@/components/user/user-avatar"

const ProfilePictureSkeleton = memo(() => (
  <div className="relative">
    <div className="group relative h-24 w-24 animate-in fade-in duration-500">
      <div className="relative rounded-full border-4 border-background">
        <div className="h-[88px] w-[88px] rounded-full bg-muted" />
        <div className="absolute -bottom-0.5 -right-0.5">
          <div className="h-7 w-7 rounded-full border-2 border-background bg-muted" />
        </div>
      </div>
      <div className="absolute -right-1 -top-1">
        <div className="h-4 w-4 rounded-full border-2 border-background bg-muted" />
      </div>
    </div>
  </div>
))
ProfilePictureSkeleton.displayName = 'ProfilePictureSkeleton'

const ProfilePicture = memo(({ user, onUpload, loading }) => {
  const [showUpload, setShowUpload] = useState(false)
  const [showView, setShowView] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  const userData = useMemo(() => user?.data || user, [user])

  return (
    <div className="relative">
      <div className="group relative h-24 w-24">
        <div 
          className={cn(
            "relative cursor-pointer rounded-full border-4 border-background bg-background transition-opacity duration-300",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setShowView(true)}
        >
          <UserAvatar 
            user={userData} 
            className="h-[88px] w-[88px]"
            showStatus={false}
            onLoad={() => setImageLoaded(true)}
            useThumb={false}
          />
          
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
              <Upload className={cn("h-3 w-3", loading && "animate-pulse")} />
            </Button>
          </div>
        </div>

        {!imageLoaded && <ProfilePictureSkeleton />}

        {userData?.status?.activeStatus && (
          <div className="absolute -right-1 -top-1 rounded-full border-2 border-background">
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
            description: "Profile picture"
          }}
        />
      )}
    </div>
  )
})
ProfilePicture.displayName = 'ProfilePicture'

export { ProfilePictureSkeleton, ProfilePicture } 