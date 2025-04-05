import { useState, useMemo, memo } from "react"
import { FileUpload } from "@/components/file-upload"
import { Button } from "@/components/ui/button"
import { Upload, Eye, Image as ImageIcon } from "lucide-react"
import { ImageDialog } from "@/components/image-view"
import { FileCategory, Visibility } from '@/services/media'
import { cn } from "@/lib/utils"
import { CoverPhotoSkeleton } from "../profile-header-skeleton"

const CoverPhotoUpload = memo(({ profile, onUpload, loading, onClick }) => {
  const [showUpload, setShowUpload] = useState(false)
  const [showView, setShowView] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  const profileData = useMemo(() => profile?.data || profile || {}, [profile]);

  const coverUrl = useMemo(() => profileData?.basicInfo?.cover, [profileData?.basicInfo?.cover])
  const coverThumbUrl = useMemo(() => profileData?.basicInfo?.coverThumb, [profileData?.basicInfo?.coverThumb])
  const hasCover = !!coverUrl || !!coverThumbUrl;
  
  // Handle click event with optional callback
  const handleClick = (e) => {
    if (onClick) {
      onClick(e)
    } else if (hasCover) {
      setShowView(true)
    }
  }

  return (
    <>
      <div className="group relative h-40 w-full overflow-hidden rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 sm:h-48">
        {/* Show actual cover photo when loaded */}
        {coverUrl && (
          <div className={cn(
            "relative h-full w-full transition-opacity duration-300",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}>
            <div 
              className="relative h-full w-full cursor-pointer"
              onClick={handleClick}
            >
              <img
                src={coverUrl}
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

        {/* Show skeleton when image is loading */}
        {hasCover && !imageLoaded && <CoverPhotoSkeleton />}
        
        {/* Show placeholder when there's no cover */}
        {!hasCover && (
          <div className="flex h-full w-full bg-muted border border-transparent flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              <ImageIcon className="h-6 w-6 text-muted-foreground/80" />
              <p className="text-sm font-medium text-muted-foreground/80">No cover photo</p>
            </div>
          </div>
        )}
        
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

      {showView && hasCover && (
        <ImageDialog
          image={coverUrl}
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
          profile={profile}
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