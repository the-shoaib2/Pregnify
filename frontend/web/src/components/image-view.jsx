import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
  Globe, 
  Lock, 
  Users, 
  Trash,
  Download,
  Share2,
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Maximize2,
  X
} from "lucide-react"
import { handleImageDownload, handleImageShare } from "@/lib/image-utils"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

export function ImageDialog({ 
  image, 
  title = "View Image",
  description = "Image preview",
  isOpen, 
  onClose, 
  onUploadClick 
}) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [privacy, setPrivacy] = useState('public')
  const [loading, setLoading] = useState(true)
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (isOpen) {
      setZoom(1)
      setRotation(0)
      setLoading(true)
      setImageSize({ width: 0, height: 0 })
    }
  }, [isOpen])

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target
    setImageSize({ width: naturalWidth, height: naturalHeight })
    setLoading(false)
  }

  const handleImageError = (e) => {
    console.error('Image failed to load:', e)
    e.target.onerror = null
    e.target.src = '/avatars/default.jpg'
    setLoading(false)
  }

  // Calculate aspect ratio and container styles
  const aspectRatio = imageSize.width / imageSize.height
  const isLandscape = aspectRatio > 1
  const containerStyle = {
    maxHeight: isLandscape ? '50vh' : '70vh',
    width: '100%',
    aspectRatio: isLandscape ? `${aspectRatio} / 1` : '1 / 1'
  }

  const imageControls = [
    {
      icon: ZoomOut,
      onClick: () => setZoom(z => Math.max(0.5, z - 0.1)),
      disabled: zoom <= 0.5 || loading
    },
    {
      icon: ZoomIn,
      onClick: () => setZoom(z => Math.min(2, z + 0.1)),
      disabled: zoom >= 2 || loading
    },
    { divider: true },
    {
      icon: RotateCcw,
      onClick: () => setRotation(r => r - 90),
      disabled: loading
    },
    {
      icon: RotateCw,
      onClick: () => setRotation(r => r + 90),
      disabled: loading
    }
  ]

  const quickActions = [
    {
      icon: Download,
      onClick: () => handleImageDownload(image, title),
      disabled: loading
    },
    {
      icon: Share2,
      onClick: () => handleImageShare(image, title),
      disabled: loading
    },
    onUploadClick && {
      icon: Upload,
      onClick: onUploadClick,
      disabled: loading
    },
    {
      icon: Maximize2,
      onClick: () => window.open(image, '_blank'),
      disabled: loading
    }
  ].filter(Boolean)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-hidden p-5 md:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {/* Image Container */}
        <div 
          className="relative mt-2 overflow-hidden rounded-md bg-muted/50"
          style={containerStyle}
        >
          {loading && <Skeleton className="absolute inset-0 z-10" />}
          <img 
            src={image || '/avatars/default.jpg'} 
            alt={title}
            className={cn(
              "h-full w-full transition-all duration-200",
              loading ? "opacity-0" : "opacity-100",
              isLandscape ? "object-contain" : "object-cover"
            )}
            style={{ 
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: 'center'
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>

        {/* Controls */}
        <div className="space-y-3 bg-background p-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Image Controls */}
            <ControlGroup>
              {imageControls.map((control, i) => 
                control.divider ? (
                  <div key={i} className="mx-0.5 h-3 w-px bg-border" />
                ) : (
                  <IconButton
                    key={i}
                    icon={control.icon}
                    onClick={control.onClick}
                    disabled={control.disabled}
                  />
                )
              )}
            </ControlGroup>

            {/* Quick Actions */}
            <ControlGroup>
              {quickActions.map((action, i) => (
                <IconButton
                  key={i}
                  icon={action.icon}
                  onClick={action.onClick}
                  disabled={action.disabled}
                />
              ))}
            </ControlGroup>

            {/* Privacy Menu */}
            <ControlGroup>
              <PrivacyMenu 
                privacy={privacy} 
                setPrivacy={setPrivacy}
                disabled={loading}
              />
            </ControlGroup>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Unified Control Components
function ControlGroup({ children }) {
  return (
    <div className="flex items-center rounded-md border bg-background p-1">
      {children}
    </div>
  )
}

function IconButton({ icon: Icon, onClick, disabled }) {
  return (
    <Button 
      variant="ghost" 
      size="icon"
      onClick={onClick}
      disabled={disabled}
      className="h-6 w-6 rounded-sm hover:bg-accent"
    >
      <Icon className="h-3 w-3" />
    </Button>
  )
}

function PrivacyMenu({ privacy, setPrivacy, disabled }) {
  const options = {
    public: { icon: Globe, label: 'Public' },
    friends: { icon: Users, label: 'Friends' },
    private: { icon: Lock, label: 'Private' }
  }

  const CurrentIcon = options[privacy].icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost"
          size="icon"
          disabled={disabled}
          className="h-6 w-auto rounded-sm px-2 hover:bg-accent"
        >
          <CurrentIcon className="mr-1 h-3 w-3" />
          <span className="text-xs">{options[privacy].label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-28"
      >
        {Object.entries(options).map(([key, { icon: Icon, label }]) => (
          <DropdownMenuItem 
            key={key}
            onClick={() => setPrivacy(key)}
            className={cn(
              "flex items-center px-2 py-1 text-xs",
              privacy === key && "bg-accent"
            )}
          >
            <Icon className="mr-1 h-3 w-3" /> {label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="flex items-center px-2 py-1 text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"
          disabled={disabled}
        >
          <Trash className="mr-1 h-3 w-3" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 