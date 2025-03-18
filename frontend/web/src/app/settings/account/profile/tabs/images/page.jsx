"use client"

import React, { useState, useEffect, useCallback, Suspense } from "react"
import ErrorBoundary from "@/components/error-boundary"
import { MediaService, FileType, FileCategory } from "@/services/media"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"
import {
  Card,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Image,
  Trash2,
  Share2,
  Eye,

} from "lucide-react"


// Image card component for displaying individual images
const ImageCard = ({ image, onView, onDelete, onShare }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  const handleImageError = (e) => {
    console.error("Image failed to load:", e)
    setIsLoading(false)
    e.target.src = "/avatars/default.jpg"
  }

  return (
    <Card
      className={cn("overflow-hidden transition-all duration-200 aspect-square rounded-none", {
        isHovered,
      })}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-full">
        <AspectRatio ratio={1 / 1} className="h-full">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <Skeleton className="h-full w-full" />
            </div>
          )}
          <img
            src={image.url}
            alt={image.title || "Image"}
            className={cn(
              "object-cover w-full h-full transition-opacity duration-300",
              isLoading ? "opacity-0" : "opacity-100"
            )}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </AspectRatio>
        {/*  Image actions overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full"
              onClick={() => onView(image)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full"
              onClick={() => onShare(image)}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="destructive"
              className="h-8 w-8 rounded-full"
              onClick={() => onDelete(image)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <CardFooter className="p-2 flex justify-between items-center">
        <div className="truncate text-xs">
          {image.title || "Untitled"}
        </div>
        <Badge variant="outline" className="text-xs">
          {new Date(image.createdAt || Date.now()).toLocaleDateString()}
        </Badge>
      </CardFooter>
    </Card>
  )
}

// Empty state component when no images are available
const EmptyState = () => (
  <Card className="w-full p-8 flex flex-col items-center justify-center">
    <div className="rounded-full bg-muted p-6 mb-4">
      <Image className="h-12 w-12 text-muted-foreground" />
    </div>
    <CardTitle className="mb-2">No photos yet</CardTitle>
    <CardDescription className="text-center mb-6">
      Your photo gallery is currently empty
    </CardDescription>
  </Card>
)

// Loading skeleton for the gallery
const GallerySkeleton = () => (
  <div className="space-y-6 animate-pulse">

    
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array(8)
        .fill(0)
        .map((_, i) => (
          <Card key={i} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
            <AspectRatio ratio={1 / 1}>
              <Skeleton className="h-full w-full bg-gradient-to-br from-muted/50 via-muted/70 to-muted/50 animate-gradient" />
            </AspectRatio>
          </Card>
        ))}
    </div>
  </div>
)

// Lazy loaded components
const LazyImageDialog = React.lazy(() => import("@/components/image-view").then(mod => ({ default: mod.ImageDialog })))

// Main PhotoGallery component
export const PhotoGallery = () => {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  // Toggle header visibility
  const toggleHeader = () => setIsHeaderVisible(prev => !prev)

  // Fetch images based on active tab with improved error handling
  const fetchImages = useCallback(async () => {
    setLoading(true)
    try {
      let response

      if (activeTab === "profile") {
        response = await MediaService.getFilesByCategory(FileCategory.PROFILE)
      } else if (activeTab === "cover") {
        response = await MediaService.getFilesByCategory(FileCategory.COVER)
      } else if (activeTab === "post") {
        response = await MediaService.getFilesByCategory(FileCategory.POST)
      } else {
        // Fetch all images
        response = await MediaService.getFilesByType(FileType.IMAGE)
      }

      // Process and normalize the data
      const imageData = response.data?.files || []
      const processedImages = imageData.map(img => ({
        ...img,
        // Ensure all required fields exist
        id: img.id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: img.url || img.path ,
        title: img.title || img.name || 'Untitled',
        createdAt: img.createdAt || img.created_at || new Date().toISOString(),
        category: img.category || activeTab.toUpperCase() || FileCategory.POST
      }))

      setImages(processedImages)
    } catch (error) {
      console.error("Error fetching images:", error)
      setImages([])
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  // Initial load and refresh when tab changes
  useEffect(() => {
    fetchImages()
  }, [fetchImages, refreshKey])

  // Handle image deletion
  const handleDelete = useCallback(async (image) => {
    if (!window.confirm("Are you sure you want to delete this image?")) {
      return
    }

    try {
      await MediaService.deleteImage(image.id)
      setRefreshKey((prev) => prev + 1) // Trigger a refresh
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Failed to delete image")
    }
  }, [])

  // Handle image sharing
  const handleShare = useCallback((image) => {
    setSelectedImage(image)
    // Implement sharing functionality or open sharing dialog
  }, [])

  // Handle image viewing
  const handleView = useCallback((image) => {
    setSelectedImage(image)
    setShowImageDialog(true)
  }, [])

  return (
    <Card className="w-full h-full p-6 space-y-6">
      <div 
        className={`flex items-center justify-between transition-opacity duration-300 ${isHeaderVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={toggleHeader}
      >
        <div>
          <h2 className="font-semibold tracking-tight flex items-center gap-2 text-xl"><Image className="h-5 w-5" /> Image Gallery</h2>
          <p className="text-sm text-muted-foreground">
            Manage your photos and media files
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className={`transition-opacity duration-300 ${isHeaderVisible ? 'opacity-100' : 'opacity-0'}`}>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full sm:w-auto"
        >
          <TabsList>
            <TabsTrigger value="all">All Photos</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="cover">Cover</TabsTrigger>
            <TabsTrigger value="post">Post</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Gallery Content */}
      {loading ? (
        <GallerySkeleton />
      ) : images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 overflow-y-auto max-h-[calc(100vh-300px)]">
          {images.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              onView={handleView}
              onDelete={handleDelete}
              onShare={handleShare}
            />
          ))}        
        </div>
      ) : (
        <EmptyState />
      )}

      {/* Image View Dialog */}
      <ErrorBoundary>
        <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Skeleton className="w-[400px] h-[300px] rounded-lg" />
        </div>}>
          <LazyImageDialog
            image={selectedImage}
            isOpen={showImageDialog}
            onClose={() => setShowImageDialog(false)}
            title={selectedImage?.title || "View Image"}
            description={selectedImage?.description || ""}
          />
        </Suspense>
      </ErrorBoundary>
    </Card>
  )
}

// Export the PhotoGallery component directly for proper lazy loading
export default PhotoGallery;