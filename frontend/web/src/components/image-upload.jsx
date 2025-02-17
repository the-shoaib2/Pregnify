import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, Loader2, X } from "lucide-react"
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { useDropzone } from 'react-dropzone'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MediaService } from '@/services'
import { toast } from 'react-hot-toast'
import { UserAvatar } from "@/components/user/user-avatar"
import { cn } from "@/lib/utils"

export function ImageUpload({ 
  user, 
  onUpload, 
  loading, 
  title = "Upload Image",
  description = "Drag and drop your image here or click to select",
  aspect = 1,
  circular = true,
  isOpen,
  onClose
}) {
  const [imgSrc, setImgSrc] = useState('')
  const [crop, setCrop] = useState({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5,
    aspect: aspect
  })

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0]
      if (file) {
        const reader = new FileReader()
        reader.addEventListener('load', () => {
          setImgSrc(reader.result)
        })
        reader.readAsDataURL(file)
      }
    },
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxSize: 5242880, // 5MB
    multiple: false
  })

  const handleClose = () => {
    setImgSrc('')
    onClose()
  }

  const handleSave = async () => {
    try {
      const croppedImage = await getCroppedImg(imgSrc, crop)
      const response = await MediaService.uploadProfileImage(croppedImage)
      await onUpload(response.data?.avatarUrl || response.data?.url || response.data)
      handleClose()
    } catch (error) {
      console.error('Error saving cropped image:', error)
      toast.error('Failed to upload image')
    }
  }

  const getCroppedImg = async (imageSrc, crop) => {
    const image = new Image()
    image.src = imageSrc

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    const maxSize = Math.min(image.width, image.height)
    canvas.width = maxSize
    canvas.height = maxSize

    ctx.drawImage(
      image,
      (image.width - maxSize) * (crop.x / 100),
      (image.height - maxSize) * (crop.y / 100),
      maxSize,
      maxSize,
      0,
      0,
      maxSize,
      maxSize
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Canvas is empty')
          return
        }
        blob.name = 'cropped.jpeg'
        resolve(blob)
      }, 'image/jpeg', 1)
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-[550px]">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-4 pb-4">
          {imgSrc ? (
            // Crop View
            <div className="relative overflow-hidden rounded-lg border bg-muted/50">
              <div className="max-h-[400px] overflow-auto">
                <ReactCrop
                  crop={crop}
                  onChange={c => setCrop(c)}
                  aspect={aspect}
                  circularCrop={circular}
                  className="relative"
                >
                  <img
                    src={imgSrc}
                    alt="Crop me"
                    className="max-h-[400px] w-auto"
                    style={{ maxWidth: '100%' }}
                  />
                </ReactCrop>
              </div>
              {/* Crop Instructions */}
              <div className="absolute left-4 top-4 rounded-md bg-background/80 px-2 py-1 text-xs backdrop-blur-sm">
                <p className="text-muted-foreground">
                  Drag to move • Drag corners to resize
                </p>
              </div>
            </div>
          ) : (
            // Upload View
            <div
              {...getRootProps()}
              className={cn(
                "flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
                isDragActive 
                  ? "border-primary bg-primary/5" 
                  : "border-muted hover:border-muted-foreground/50",
                "relative overflow-hidden"
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-full bg-muted p-4">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">
                    {isDragActive ? 'Drop the file here' : 'Drag & drop an image here'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG or GIF (max. 5MB)
                  </p>
                </div>
              </div>
              {isDragActive && (
                <div className="absolute inset-0 bg-primary/5 backdrop-blur-sm" />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-muted/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              {imgSrc && (
                <Button 
                  variant="ghost"
                  onClick={() => setImgSrc('')}
                  disabled={loading}
                >
                  Change Image
                </Button>
              )}
              <Button 
                onClick={handleSave} 
                disabled={!imgSrc || loading}
                className="min-w-[100px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading
                  </>
                ) : (
                  'Upload & Save'
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 