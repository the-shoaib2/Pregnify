import { useState } from "react"
import { ImageUpload } from "@/components/image-upload"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Loader2, 
  Upload, 
  MoreHorizontal, 
  Download, 
  Share2, 
  Globe, 
  Lock, 
  Users, 
  Trash, 
  ZoomIn,
  ZoomOut,
  RotateCw,
  Eye
} from "lucide-react"
import { cn } from "@/lib/utils"
import { UserAvatar } from "@/components/user/user-avatar"
import { ImageDialog } from "@/components/image-view"

function CoverPhotoUpload({ user, onUpload, loading }) {
  const [showUpload, setShowUpload] = useState(false)
  const [showView, setShowView] = useState(false)

  return (
    <>
      <div className="group relative h-40 w-full overflow-hidden rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 sm:h-48">
        {user?.coverImage ? (
          <>
            <div 
              className="relative h-full w-full cursor-pointer"
              onClick={() => setShowView(true)}
            >
              <img
                src={user.coverImage}
                alt="Cover"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
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
        image={user?.coverImage}
        title="Cover Photo"
        isOpen={showView}
        onClose={() => setShowView(false)}
        onUploadClick={() => {
          setShowView(false)
          setShowUpload(true)
        }}
      />

      <ImageUpload
        user={user}
        title="Update Cover Photo"
        description="Choose a photo for your profile cover"
        onUpload={onUpload}
        loading={loading}
        aspect={16/9}
        circular={false}
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
      />
    </>
  )
}

function ProfilePicture({ user, onUpload, loading }) {
  const [showUpload, setShowUpload] = useState(false)
  const [showView, setShowView] = useState(false)

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
                user={user} 
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
        image={user?.avatarUrl}
        title="Profile Picture"
        isOpen={showView}
        onClose={() => setShowView(false)}
        onUploadClick={() => {
          setShowView(false)
          setShowUpload(true)
        }}
      />

      <ImageUpload
        user={user}
        title="Update Profile Picture"
        description="Choose a clear photo to help people recognize you"
        onUpload={onUpload}
        loading={loading}
        aspect={1}
        circular={true}
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
      />
    </div>
  )
}

export function ProfileHeader({ 
  user, 
  onAvatarUpload, 
  onCoverUpload, 
  uploadingImage, 
  uploadingCover 
}) {
  const [showAvatarDialog, setShowAvatarDialog] = useState(false)
  const [showCoverDialog, setShowCoverDialog] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadType, setUploadType] = useState(null) // 'avatar' or 'cover'

  const handleUploadClick = (type) => {
    setUploadType(type)
    setShowUploadDialog(true)
  }

  const handleUploadComplete = async (file) => {
    if (uploadType === 'avatar') {
      await onAvatarUpload(file)
    } else {
      await onCoverUpload(file)
    }
    setShowUploadDialog(false)
  }

  return (
    <div className="space-y-4">
      <div className="relative ">
        <CoverPhotoUpload 
          user={user}
          onUpload={onCoverUpload}
          loading={uploadingCover}
        />
        
        <div className="absolute -bottom-2 left-4">
          <ProfilePicture 
            user={user}
            onUpload={onAvatarUpload}
            loading={uploadingImage}
          />
        </div>
      </div>

      <div className="mt-12 px-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">
                {user.firstName} {user.lastName}
              </h2>
              
              {/* Status Badge */}
              <div className="relative">
                {user?.status?.activeStatus === "ONLINE" && (
                  <Badge className="h-2.5 w-2.5 rounded-full bg-green-500 p-0" />
                )}
                {(user?.status?.activeStatus === "OFFLINE" || user?.status?.activeStatus === "UNDEFINED") && (
                  <Badge className="h-2.5 w-2.5 rounded-full bg-red-500 p-0" />
                )}
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              {user.bio || user.discription}
            </p>
          </div>
        </div>
      </div>

      {/* Image Preview Dialogs */}
      <ImageDialog
        image={user?.avatarUrl}
        title="Profile Picture"
        isOpen={showAvatarDialog}
        onClose={() => setShowAvatarDialog(false)}
      />

      <ImageDialog
        image={user?.coverImage}
        title="Cover Photo"
        isOpen={showCoverDialog}
        onClose={() => setShowCoverDialog(false)}
      />
    </div>
  )
} 