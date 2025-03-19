"use client"

import React, { useState, useEffect, useCallback, Suspense } from "react"
import ErrorBoundary from "@/components/error-boundary"
import { MediaService, FileType, FileCategory } from "@/services/media"
import { toast } from "react-hot-toast"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Image } from "lucide-react"

// Import separated components
import ImageCard from "./components/ImageCard"
import EmptyState from "./components/EmptyState"
import GallerySkeleton from "./components/GallerySkeleton"

// Lazy loaded components
const LazyImageView = React.lazy(() => import("./components/ImageView"))

// Main PhotoGallery component
export const PhotoGallery = () => {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [mediaEnums, setMediaEnums] = useState(null)

  // Fetch media enums when component mounts and mediaEnums is null
  useEffect(() => {
    const fetchMediaEnums = async () => {
      if (mediaEnums === null) {
        try {
          const response = await MediaService.getMediaEnums()
          setMediaEnums(response.data)
        } catch (error) {
          console.error("Error fetching media enums:", error)
          toast.error("Failed to load media settings")
        }
      }
    }
    fetchMediaEnums()
  }, [mediaEnums])

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

      {/* Image View Component */}
      <ErrorBoundary>
        <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Skeleton className="w-[400px] h-[300px] rounded-lg" />
        </div>}>
          {showImageDialog && (
            <LazyImageView
              image={selectedImage}
              onClose={() => setShowImageDialog(false)}
              onUpdate={(updatedImage) => {
                setImages(prevImages =>
                  prevImages.map(img =>
                    img.id === updatedImage.id ? updatedImage : img
                  )
                )
                setSelectedImage(updatedImage)
              }}
            />
          )}
        </Suspense>
      </ErrorBoundary>
    </Card>
  )
}

// Export the PhotoGallery component directly for proper lazy loading
export default PhotoGallery;