import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, Loader2, X, Share2, Download, MessageSquare, Globe, Lock, Users, Settings } from "lucide-react"
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { useDropzone } from 'react-dropzone'
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MediaService, FileType, FileCategory, Visibility } from '@/services/media'
import { toast } from 'react-hot-toast'
import { UserAvatar } from "@/components/user/user-avatar"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { AspectRatio } from "@/components/ui/aspect-ratio"

export function FileUpload({ 
  user, 
  onUpload, 
  loading, 
  description = "Drag and drop your image here or click to select",
  aspect = 1,
  circular = true,
  isOpen,
  onClose,
  maxCropHeight = 350,
  cropSizes = {
    width: 90,
    height: 90,
  },
  fileCategory = FileCategory.POST
}) {
  const [imgSrc, setImgSrc] = useState('')
  const [uploadState, setUploadState] = useState({
    fileType: 'IMAGE',
    fileCategory: fileCategory,
    visibility: 'PUBLIC',
    title: " ",
    description: '',
    allowComments: "true",
    allowSharing: "true",
    allowDownload: "true",
    customAudience: '""'
  })
  const [crop, setCrop] = useState({
    unit: '%',
    width: cropSizes.width,
    height: cropSizes.height,
    x: 5,
    y: 5,
    aspect: aspect
  })
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [uploadCancelled, setUploadCancelled] = useState(false)
  const [showProgressDialog, setShowProgressDialog] = useState(false)

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
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.heic', '.heif']
    },
    maxSize: 1024 * 1024 * 10, // 10MB
    multiple: false
  })

  const handleClose = () => {
    setImgSrc('')
    onClose()
  }

  const getCroppedImg = async (imageSrc, crop) => {
    try {
      const image = new Image()
      image.src = imageSrc

      await new Promise((resolve, reject) => {
        image.onload = resolve
        image.onerror = reject
      })

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      // Calculate dimensions based on crop percentages
      const sourceWidth = (image.width * crop.width) / 100
      const sourceHeight = (image.height * crop.height) / 100
      const sourceX = (image.width * crop.x) / 100
      const sourceY = (image.height * crop.y) / 100

      // Set canvas dimensions to match crop size
      canvas.width = sourceWidth
      canvas.height = sourceHeight

      // Draw the cropped portion
      ctx.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        sourceWidth,
        sourceHeight
      )

      // Convert canvas to blob
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'))
            return
          }
          // Create a File object with proper name and type
          const file = new File([blob], 'image.jpg', { 
            type: 'image/jpeg',
            lastModified: Date.now()
          })
          resolve(file)
        }, 'image/jpeg', 0.95) // Slightly reduced quality for better file size
      })
    } catch (error) {
      console.error('Error cropping image:', error)
      throw new Error('Failed to crop image')
    }
  }

  const handleSave = async () => {
    let toastId = null;
    try {
      setIsLoading(true)
      setUploadProgress(0)
      setShowProgressDialog(true)

      const croppedImage = await getCroppedImg(imgSrc, crop)
      

      const handleProgress = (progressEvent) => {
        if (progressEvent.lengthComputable) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          setUploadProgress(percentCompleted)
        }
      }

      // Pass all required fields explicitly
      const response = await MediaService.fileUpload(croppedImage, {
        fileCategory: fileCategory,
        description: uploadState.description || "",
        onProgress: handleProgress
      })

      if (response?.data?.data?.file?.url) {
        setUploadProgress(100)
        toast.success('Upload successful')
        
        if (onUpload) {
          onUpload(response.data.data)
        }

        handleClose()
      } else {
        throw new Error('Upload failed')
      }

    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error.message || 'Failed to upload image'
      toast.error(errorMessage, { id: toastId })
    } finally {
      setIsLoading(false)
      setUploadProgress(0)
      setShowProgressDialog(false)
    }
  }

  const handleCancelUpload = () => {
    setUploadCancelled(true)
    setShowProgressDialog(false)
    setIsLoading(false)
    setUploadProgress(0)
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-[600px]">
        {(isLoading || uploadProgress > 0) && (
          <div className="absolute inset-x-0 top-0">
            <Progress 
              value={uploadProgress} 
              className="h-1 rounded-none"
            />
          </div>
        )}

        <DialogHeader className="px-4 pt-4">
          <DialogTitle>Upload Image</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
          <div className="space-y-4">
          {imgSrc ? (
            <div className="relative overflow-hidden rounded-lg border bg-muted/50">
              {imageLoading && (
                <Skeleton className="absolute inset-0" />
              )}
              <AspectRatio ratio={aspect}>
                <div className="h-full max-h-[350px] overflow-auto">
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
                      className="h-full w-full object-contain"
                      style={{ maxHeight: '350px' }}
                      onLoad={handleImageLoad}
                    />
                  </ReactCrop>
                </div>
              </AspectRatio>
              <div className="absolute left-4 top-4 rounded-md bg-background/80 px-2 py-1 text-xs backdrop-blur-sm">
                <p className="text-muted-foreground">
                  Drag to move • Drag corners to resize
                </p>
              </div>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={cn(
                  "flex h-[350px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
                isDragActive 
                  ? "border-primary bg-primary/5" 
                  : "border-muted hover:border-muted-foreground/50",
                  "sm:h-[300px]"
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

          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Textarea
                  placeholder="Add a description..."
                  value={uploadState.description}
                  onChange={(e) => setUploadState(prev => ({ ...prev, description: e.target.value }))}
                  className="h-20"
                />
                
                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <Select
                    value={uploadState.visibility}
                    onValueChange={(value) => setUploadState(prev => ({ 
                      ...prev, 
                      visibility: value,
                      // Reset customAudience when not CUSTOM
                      customAudience: value !== Visibility.CUSTOM ? '' : prev.customAudience
                    }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Visibility.PUBLIC}>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Public
                        </div>
                      </SelectItem>
                      <SelectItem value={Visibility.PRIVATE}>
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Private
                        </div>
                      </SelectItem>
                      <SelectItem value={Visibility.FRIENDS}>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Friends Only
                        </div>
                      </SelectItem>
                      <SelectItem value={Visibility.CUSTOM}>
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Custom
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Show Custom Audience Input when CUSTOM is selected */}
                  {uploadState.visibility === Visibility.CUSTOM && (
                    <div className="mt-2">
                      <Label>Custom Audience</Label>
                      <Input
                        placeholder="Enter emails or usernames"
                        value={uploadState.customAudience}
                        onChange={(e) => setUploadState(prev => ({ 
                          ...prev, 
                          customAudience: e.target.value 
                        }))}
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Allow Comments
                </Label>
                <Switch
                  checked={uploadState.allowComments}
                  onCheckedChange={(checked) => 
                    setUploadState(prev => ({ ...prev, allowComments: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Allow Sharing
                </Label>
                <Switch
                  checked={uploadState.allowSharing}
                  onCheckedChange={(checked) => 
                    setUploadState(prev => ({ ...prev, allowSharing: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Allow Download
                </Label>
                <Switch
                  checked={uploadState.allowDownload}
                  onCheckedChange={(checked) => 
                    setUploadState(prev => ({ ...prev, allowDownload: checked }))
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t bg-muted/50 px-4 py-3">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button 
              variant="ghost" 
              onClick={handleClose}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {imgSrc && (
                <Button 
                  variant="ghost"
                  onClick={() => setImgSrc('')}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  Change Image
                </Button>
              )}
              <Button 
                onClick={handleSave} 
                disabled={!imgSrc || isLoading}
                className="w-full sm:min-w-[100px] sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {uploadProgress < 100 ? 'Uploading...' : 'Processing...'}
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