"use client"

import React, { useState, useEffect, useCallback, Suspense, createContext } from "react"
import ErrorBoundary from "@/components/error-boundary"
import { MediaService, FileType, FileCategory } from "@/services/media"
import { toast } from "react-hot-toast"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Image, X } from "lucide-react"
import { Button } from "@/components/ui/button"

// Import separated components
import ImageCard from "./components/ImageCard"
import EmptyState from "./components/EmptyState"
import GallerySkeleton from "./components/GallerySkeleton"

// Create a context for media enums
export const MediaEnumsContext = createContext(null);

// Lazy loaded components with proper preloading
const LazyImageView = React.lazy(() => import("./components/ImageView"))

// Main PhotoGallery component
export const PhotoGallery = ({ onClose }) => {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  const [activeTab, setActiveTab] = useState("all")
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [mediaEnums, setMediaEnums] = useState(null)
  const [reactions, setReactions] = useState([])
  const [open, setOpen] = useState(false)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  // Fetch all necessary data on initial mount only
  useEffect(() => {
    // Use a flag to prevent duplicate API calls during React 18 double-rendering in dev mode
    if (initialLoadComplete) return;
    
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Fetch media enums and images in parallel
        const [enumsResponse, imagesResponse] = await Promise.all([
          MediaService.getMediaEnums(),
          MediaService.getFilesByType(FileType.IMAGE)
        ]);
        
        // Store the complete media enums data
        setMediaEnums(enumsResponse.data);
        
        // Extract reaction types from the enums response
        if (enumsResponse.data && enumsResponse.data.reactionTypes) {
          // Transform reaction types into a more usable format
          const reactionData = enumsResponse.data.reactionTypes.map(type => ({
            id: type.toLowerCase(),
            name: type.charAt(0) + type.slice(1).toLowerCase().replace('_', ' '),
            type: type,
            count: 0,
            active: false
          }));
          setReactions(reactionData);
        }
        
        // Process and normalize the image data
        const imageData = imagesResponse.data?.files || [];
        const processedImages = imageData.map(img => ({
          ...img,
          id: img.id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          url: img.url || img.path,
          title: img.title || img.name || 'Untitled',
          createdAt: img.createdAt || img.created_at || new Date().toISOString(),
          category: img.category || FileCategory.POST
        }));
        
        setImages(processedImages);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Failed to load gallery data");
        setImages([]);
      } finally {
        setLoading(false);
        setInitialLoadComplete(true);
      }
    };
    
    fetchInitialData();
  }, []);

  // Toggle header visibility
  const toggleHeader = useCallback(() => {
    setIsHeaderVisible(prev => !prev);
  }, []);

  // Fetch images based on active tab with improved error handling
  const fetchFilteredImages = useCallback(async () => {
    // Skip initial load as it's handled by the first useEffect
    if (!initialLoadComplete) return;
    
    setLoading(true);
    try {
      let response;

      if (activeTab === "profile") {
        response = await MediaService.getFilesByCategory(FileCategory.PROFILE);
      } else if (activeTab === "cover") {
        response = await MediaService.getFilesByCategory(FileCategory.COVER);
      } else if (activeTab === "post") {
        response = await MediaService.getFilesByCategory(FileCategory.POST);
      } else {
        // Fetch all images
        response = await MediaService.getFilesByType(FileType.IMAGE);
      }

      // Process and normalize the data
      const imageData = response.data?.files || [];
      const processedImages = imageData.map(img => ({
        ...img,
        id: img.id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: img.url || img.path,
        title: img.title || img.name || 'Untitled',
        createdAt: img.createdAt || img.created_at || new Date().toISOString(),
        category: img.category || activeTab.toUpperCase() || FileCategory.POST
      }));

      setImages(processedImages);
    } catch (error) {
      console.error("Error fetching images:", error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, initialLoadComplete]);

  // Fetch filtered images when tab changes or refresh is triggered
  useEffect(() => {
    if (initialLoadComplete) {
      fetchFilteredImages();
    }
  }, [fetchFilteredImages, refreshKey, initialLoadComplete]);

  // Handle image deletion
  const handleDelete = useCallback(async (image) => {
    if (!window.confirm("Are you sure you want to delete this image?")) {
      return;
    }

    try {
      await MediaService.deleteImage(image.id);
      setRefreshKey((prev) => prev + 1); // Trigger a refresh
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete image");
    }
  }, []);

  // Handle image sharing
  const handleShare = useCallback((image) => {
    setSelectedImage(image);
    // Implement sharing functionality or open sharing dialog
  }, []);

  // Handle image viewing
  const handleView = useCallback((image) => {
    setSelectedImage(image);
    setOpen(true);
  }, []);

  // Preload the ImageView component when the page loads
  useEffect(() => {
    // Preload the LazyImageView component
    const preloadImageView = () => {
      import("./components/ImageView");
    };
    preloadImageView();
  }, []);

  // Create a context value for media enums to pass to children
  const mediaContextValue = {
    mediaEnums,
    reactions
  };

  return (
    <MediaEnumsContext.Provider value={mediaContextValue}>
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
          
          {/* Close Button - Updated to use onClose prop */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-muted"
            onClick={(e) => {
              e.stopPropagation();
              if (onClose) onClose();
            }}
          >
            <X className="h-5 w-5" />

            
          </Button>
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
          <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center ">
            <Skeleton className="w-[400px] h-[300px] rounded-lg" />
          </div>}>
            {/* Only render LazyImageView when needed */}
            {open && mediaEnums && (
              <LazyImageView
                image={selectedImage}
                onClose={() => setOpen(false)}
                onUpdate={(updatedImage) => {
                  setImages(prevImages =>
                    prevImages.map(img =>
                      img.id === updatedImage.id ? updatedImage : img
                    )
                  )
                  setSelectedImage(updatedImage)
                }}
                open={open}
                mediaEnums={mediaEnums}
                reactions={reactions}
              />
            )}
          </Suspense>
        </ErrorBoundary>
      </Card>
    </MediaEnumsContext.Provider>
  )
}

// Export the PhotoGallery component directly for proper lazy loading
export default PhotoGallery;