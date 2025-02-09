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

export function AvatarUpload({ user, onUpload, loading }) {
  const [isOpen, setIsOpen] = useState(false)
  const [imgSrc, setImgSrc] = useState('')
  const [crop, setCrop] = useState({
    unit: '%',
    width: 100,
    aspect: 1
  })
  const [croppedImageUrl, setCroppedImageUrl] = useState(null)

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setImgSrc(reader.result)
        setIsOpen(true)
      })
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxSize: 5242880, // 5MB
    multiple: false
  })

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
        const croppedImageUrl = URL.createObjectURL(blob)
        setCroppedImageUrl(croppedImageUrl)
        resolve(blob)
      }, 'image/jpeg', 1)
    })
  }

  const handleSave = async () => {
    try {
      const croppedImage = await getCroppedImg(imgSrc, crop)
      const response = await MediaService.uploadProfileImage(croppedImage)
      await onUpload(response)
      handleClose()
    } catch (error) {
      console.error('Error saving cropped image:', error)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setImgSrc('')
    setCroppedImageUrl(null)
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage 
            src={user?.avatarUrl} 
            alt={`${user?.firstName} ${user?.lastName}`} 
          />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <div {...getRootProps()} className="relative">
            <input {...getInputProps()} disabled={loading} />
            <Button variant="outline" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Change Avatar
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Recommended: Square image, at least 400x400px
          </p>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload Profile Picture</DialogTitle>
            <DialogDescription>
              Drag and drop your image here or click to select
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex flex-col items-center gap-4">
            {imgSrc && (
              <div className="relative max-h-[400px] overflow-auto rounded-lg border">
                <ReactCrop
                  crop={crop}
                  onChange={c => setCrop(c)}
                  aspect={1}
                  circularCrop
                >
                  <img
                    src={imgSrc}
                    alt="Crop me"
                    className="max-h-[400px] w-auto"
                  />
                </ReactCrop>
              </div>
            )}

            {!imgSrc && (
              <div
                {...getRootProps()}
                className={`flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
                  isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="mb-4 h-8 w-8 text-muted-foreground" />
                <p className="mb-2 text-sm font-medium">
                  {isDragActive ? 'Drop the file here' : 'Drag & drop an image here'}
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG or GIF (max. 5MB)
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!imgSrc || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload & Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 