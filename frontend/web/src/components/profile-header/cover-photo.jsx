import { useState, useMemo, Suspense } from "react"
import { FileUpload } from "@/components/file-upload"
import { Button } from "@/components/ui/button"
import { Upload, Eye } from "lucide-react"
import { ImageDialog } from "@/components/image-view"
import { FileCategory, Visibility } from '@/services/media'
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

export function CoverPhotoSkeleton() {
  return (
    <div className="relative">
      <Skeleton className="h-40 w-full rounded-lg sm:h-48" />
      <div className="absolute right-4 top-4">
        <Skeleton className="h-7 w-7 rounded-full border-2 border-background" />
      </div>
    </div>
  )
}

export function CoverPhotoUpload({ user, onUpload, loading }) {
  const [showUpload, setShowUpload] = useState(false)
  const [showView, setShowView] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  const userData = useMemo(() => user?.data || user, [user])
  
  const coverPhotoUrl = useMemo(() => 
    userData?.basicInfo?.cover || '/covers/default.jpg',
    [userData?.basicInfo?.cover]
  )

  if (!userData || loading) {
    return <CoverPhotoSkeleton />
  }

  const handleImageLoad = () => {
    setTimeout(() => setImageLoaded(true), 50)
  }

  const handleImageError = (e) => {
    e.target.onerror = null
    e.target.src = '/covers/default.jpg'
    setTimeout(() => setImageLoaded(true), 50)
  }

  return (
    <>
      <div className="group relative h-40 w-full overflow-hidden rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 sm:h-48">
        {userData?.basicInfo?.cover ? (
          <>
            {!imageLoaded && (
              <div className="flex h-full items-center justify-center">
                <div className="h-6 w-6 animate-pulse rounded-full bg-muted" />
              </div>
            )}
            <div 
              className={cn(
                "relative h-full w-full cursor-pointer transition-opacity duration-300",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onClick={() => setShowView(true)}
            >
              <img
                src={coverPhotoUrl}
                alt="Cover"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading="eager"
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
            className="h-7 w-7 rounded-full border-2 border-background bg-background shadow-md transition-colors hover:bg-accent"
            onClick={() => setShowUpload(true)}
            disabled={loading}
          >
            <Upload className={cn("h-4 w-4", loading && "animate-pulse")} />
          </Button>
        </div>
      </div>

      {/* Dialogs */}
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

export default { CoverPhotoUpload } 