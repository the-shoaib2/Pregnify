import { useState, useMemo, memo } from "react"
import { FileUpload } from "@/components/file-upload"
import { Button } from "@/components/ui/button"
import { Upload, Eye } from "lucide-react"
import { ImageDialog } from "@/components/image-view"
import { FileCategory, Visibility } from '@/services/media'
import { cn } from "@/lib/utils"
import { CoverPhotoSkeleton } from "../profile-header-skeleton"

const CoverPhotoUpload = memo(({ user, onUpload, loading, onClick }) => {
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
        cover: data.basicInfo?.cover || data.personalInfo?.cover
      }
    }
  }, [user])
  
  const coverPhotoUrl = useMemo(() => 
    userData?.basicInfo?.cover,
    [userData?.basicInfo?.cover]
  )

  // Handle click event with optional callback
  const handleClick = (e) => {
    if (onClick) {
      onClick(e)
    } else {
      setShowView(true)
    }
  }

  return (
    <>
      <div className="group relative h-40 w-full overflow-hidden rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 sm:h-48">
        {/* Show actual cover photo when loaded */}
        {coverPhotoUrl && (
          <div className={cn(
            "relative h-full w-full transition-opacity duration-300",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}>
            <div 
              className="relative h-full w-full cursor-pointer"
              onClick={handleClick}
            >
              <img
                src={coverPhotoUrl}
                alt="Cover"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  e.target.onerror = null
                  setImageLoaded(true)
                }}
                loading="eager"
                fetchpriority="high"
                decoding="sync"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/20 group-hover:opacity-100">
                <Eye className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        )}

        {/* Show skeleton when image is not loaded or there's no cover photo */}
        {(!imageLoaded || !coverPhotoUrl) && <CoverPhotoSkeleton />}
        
        <div className="absolute right-4 top-4 z-20">
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
            <Upload className={cn("h-4 w-4", loading && "animate-pulse")} />
          </Button>
        </div>
      </div>

      {showView && (
        <ImageDialog
          image={coverPhotoUrl}
          title="Cover Photo"
          description="Your profile cover photo"
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
      )}
    </>
  )
})
CoverPhotoUpload.displayName = 'CoverPhotoUpload'

export { CoverPhotoUpload }