import { useState } from "react"
import { AvatarUpload } from "@/components/avatar-upload"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
  RotateCw
} from "lucide-react"
import { toast } from "react-hot-toast"

// Add these utility functions outside of components
const handleImageDownload = async (image, title) => {
  try {
    const response = await fetch(image)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.jpg`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    toast.success('Image downloaded successfully')
  } catch (error) {
    toast.error('Failed to download image')
  }
}

const handleImageShare = async (image, title) => {
  try {
    if (navigator.share) {
      await navigator.share({
        title,
        text: `Check out my ${title.toLowerCase()}`,
        url: image
      })
    } else {
      await navigator.clipboard.writeText(image)
      toast.success('Image URL copied to clipboard')
    }
  } catch (error) {
    toast.error('Failed to share image')
  }
}

function ImageDialog({ image, title, isOpen, onClose }) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{title}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setZoom(z => Math.min(2, z + 0.1))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setRotation(r => r + 90)}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="relative overflow-hidden rounded-lg">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-contain transition-all duration-200"
            style={{ 
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              maxHeight: '60vh'
            }}
          />
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleImageDownload(image, title)}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleImageShare(image, title)}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Globe className="mr-2 h-4 w-4" />
                Public
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Globe className="mr-2 h-4 w-4" /> Public
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Users className="mr-2 h-4 w-4" /> Friends
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Lock className="mr-2 h-4 w-4" /> Private
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CoverPhotoUpload({ user, onUpload, loading, onClick }) {
  return (
    <div className="group relative h-48 w-full overflow-hidden rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 sm:h-64 lg:h-80">
      {user?.coverImage ? (
        <>
          <img
            src={user.coverImage}
            alt="Cover"
            className="h-full w-full cursor-pointer object-cover transition-transform duration-300 group-hover:scale-105"
            onClick={onClick}
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </>
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-muted-foreground">No cover photo</p>
        </div>
      )}
      
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white/90 hover:bg-white"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem 
              onClick={() => handleImageDownload(user.coverImage, 'Cover Photo')}
            >
              <Download className="mr-2 h-4 w-4" /> Download
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleImageShare(user.coverImage, 'Cover Photo')}
            >
              <Share2 className="mr-2 h-4 w-4" /> Share
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Globe className="mr-2 h-4 w-4" /> Public
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Users className="mr-2 h-4 w-4" /> Friends
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Lock className="mr-2 h-4 w-4" /> Private
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <label 
          htmlFor="cover-upload" 
          className="flex cursor-pointer items-center gap-2 rounded-md bg-white/90 px-3 py-2 text-sm font-medium shadow-sm hover:bg-white"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Change Cover
            </>
          )}
        </label>
        <input
          id="cover-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onUpload(e.target.files[0])}
          disabled={loading}
        />
      </div>
    </div>
  )
}

function ProfilePicture({ user, onUpload, loading }) {
  return (
    <div className="relative">
      <div className="group relative h-24 w-24">
        <AvatarUpload 
          user={user} 
          onUpload={onUpload}
          loading={loading}
          className="h-full w-full border-4 border-white shadow-lg"
        />
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
          <label 
            htmlFor="avatar-upload"
            className="cursor-pointer text-xs font-medium text-white"
          >
            Change
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onUpload(e.target.files[0])}
            disabled={loading}
          />
        </div>
      </div>
      {user?.status?.activeStatus === "ONLINE" && (
        <Badge className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-green-500 p-0" />
      )}
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

  return (
    <>
      {/* Profile Header with Cover and Avatar */}
      <div className="relative">
        <CoverPhotoUpload 
          user={user}
          onUpload={onCoverUpload}
          loading={uploadingCover}
          onClick={() => user?.coverImage && setShowCoverDialog(true)}
        />
        
        <div className="absolute -bottom-12 left-4">
          <ProfilePicture 
            user={user}
            onUpload={onAvatarUpload}
            loading={uploadingImage}
          />
        </div>
      </div>

      {/* Add spacing to account for overlapping avatar */}
      <div className="mt-16">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-sm text-muted-foreground">
            {user.bio || user.discription}
          </p>
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
    </>
  )
} 