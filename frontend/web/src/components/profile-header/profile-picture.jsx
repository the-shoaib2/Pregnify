import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileUpload } from "@/components/file-upload"
import { ImageDialog } from "@/components/image-view"
import { FileCategory, Visibility } from '@/services/media'
import { Upload, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { lazyLoad } from '@/utils/lazy-load.jsx'
import { Skeleton } from "@/components/ui/skeleton"

// Import the component with default export
const UserAvatar = lazyLoad(() => import('@/components/user/user-avatar').then(mod => ({ 
  default: mod.UserAvatar 
})))

// Profile Picture Skeleton Component
export function ProfilePictureSkeleton() {
  return (
    <div className="relative">
      <div className="group relative h-24 w-24">
        <div className="relative rounded-full border-4 border-background">
          <Skeleton className="h-[88px] w-[88px] rounded-full" />
          
          {/* Upload button skeleton */}
          <div className="absolute -bottom-0.5 -right-0.5">
            <Skeleton className="h-7 w-7 rounded-full border-2 border-background" />
          </div>
        </div>

        {/* Status badge skeleton */}
        <div className="absolute -right-1 -top-1">
          <Skeleton className="h-4 w-4 rounded-full border-2 border-background" />
        </div>
      </div>
    </div>
  )
}

export function ProfilePicture({ user, onUpload, loading }) {
  const [showUpload, setShowUpload] = useState(false)
  const [showView, setShowView] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  // Memoize user data
  const userData = useMemo(() => user?.data || user, [user])

  // Memoize status class
  const statusClass = useMemo(() => 
    cn(
      "h-4 w-4 rounded-full p-0 shadow-sm transition-colors",
      userData?.status?.activeStatus === "ONLINE" 
        ? "bg-green-500" 
        : "bg-red-500"
    ),
    [userData?.status?.activeStatus]
  )

  const handleUploadClick = (e) => {
    e.stopPropagation()
    setShowUpload(true)
  }

  if (!userData || loading) {
    return <ProfilePictureSkeleton />
  }

  return (
    <div className="relative">
      <div className="group relative h-24 w-24">
        <div 
          className="relative cursor-pointer rounded-full border-4 border-background bg-background"
          onClick={() => setShowView(true)}
        >
          <div className="relative overflow-hidden rounded-full">
            <div className={cn(
              "transition-transform duration-200 group-hover:scale-[1.08]",
              !imageLoaded && "opacity-0"
            )}>
              <UserAvatar 
                user={userData} 
                className="h-[88px] w-[88px]"
                showStatus={false}
                onLoad={() => setImageLoaded(true)}
              />
            </div>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Skeleton className="h-full w-full rounded-full" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/20 group-hover:opacity-100">
              <Eye className="h-4 w-4 text-white" />
            </div>
          </div>

          <div className="absolute -bottom-0.5 -right-0.5">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-full border-2 border-background bg-background shadow-md transition-colors hover:bg-accent"
              onClick={handleUploadClick}
              disabled={loading}
            >
              <Upload className={cn("h-3 w-3", loading && "opacity-50")} />
            </Button>
          </div>
        </div>

        {userData?.status?.activeStatus && (
          <div className="absolute -right-1 -top-1 rounded-full border-2 border-background">
            <Badge className={statusClass} />
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
          description: "Profile picture"
        }}
      />
    </div>
  )
}

// Add a default export
export default { ProfilePicture } 