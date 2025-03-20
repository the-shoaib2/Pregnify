import { useState, useEffect, memo, useCallback } from "react";
import { X, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const ImageCard = memo(({ user, onClose, onClick }) => {
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  
  // Get images from user data
  const images = useCallback(() => {
    if (!user?.basicInfo) return [];

    const avatarThumb = user?.basicInfo?.avatarThumb || user?.basicInfo?.avaterThumb;
    const coverThumb = user?.basicInfo?.coverThumb;

    console.log(avatarThumb, coverThumb);
    
    // Get proper initials for fallback
    const firstName = user?.basicInfo?.name?.firstName || '';
    const lastName = user?.basicInfo?.name?.lastName || '';
    const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';
    
    return [
      avatarThumb && { 
        type: 'avatar', 
        src: avatarThumb,
        fallback: initials,
        title: 'Avatar'
      },
      coverThumb && { 
        type: 'cover', 
        src: coverThumb,
        fallback: initials,
        title: 'Cover'
      }
    ].filter(img => img && img.src);
  }, [user?.basicInfo]);

  // Auto-rotate images
  useEffect(() => {
    if (images().length <= 1 || showFullscreen) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images().length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [images, showFullscreen]);

  // Preload images for smoother experience
  useEffect(() => {
    const imageList = images();
    if (imageList.length === 0) {
      setLoading(false);
      return;
    }

    let loadedCount = 0;
    const totalImages = imageList.length;
    
    imageList.forEach(image => {
      const img = new Image();
      img.src = image.src;
      img.onload = img.onerror = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          setLoading(false);
        }
      };
    });
    
    // Fallback in case images take too long to load
    const timeout = setTimeout(() => {
      if (loading) setLoading(false);
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, [images, loading]);

  // Handle card click
  const handleCardClick = useCallback((e) => {
    e.stopPropagation();
    if (onClick) {
      onClick(e);
    } else {
      setShowFullscreen(true);
    }
  }, [onClick]);

  // Handle image error
  const handleImageError = useCallback((index) => {
    setImageErrors(prev => ({
      ...prev,
      [index]: true
    }));
    setLoading(false);
  }, []);

  // Get current image data
  const currentImage = images()[currentIndex] || null;
  const hasImages = images().length > 0;

  return (
    <>
      <Card 
        className={cn(
          "relative flex flex-col items-center justify-center",
          "h-[160px] w-[160px] overflow-hidden rounded-lg",
          "bg-background border-2 border-border/50",
          "cursor-pointer transition-all duration-300",
          "hover:border-primary/20 hover:shadow-md",
          "group"
        )}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
      >
        {/* Close Button (if needed) */}
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6 rounded-full bg-background/80 shadow-sm z-20 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        {/* Content Container */}
        <div className="relative w-full h-full">
          {loading && <Skeleton className="absolute inset-0" />}

          {hasImages ? (
            <div className="w-full h-full">
              {/* Single image display */}
              {currentImage && (
                <div className="relative w-full h-full">
                  {imageErrors[currentIndex] ? (
                    <div className="h-full w-full flex items-center justify-center bg-muted/30">
                      <Avatar className="h-20 w-20">
                        <AvatarFallback className="bg-primary/10 text-primary text-xl">
                          {currentImage.fallback}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  ) : (
                    <img
                      src={currentImage.src}
                      alt={currentImage.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="eager"
                      decoding="async"
                      onError={() => handleImageError(currentIndex)}
                      onLoad={() => setLoading(false)}
                    />
                  )}
                  
                    {/* Center title overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0  opacity-100 transition-opacity">
                      <div className="px-2 py-1.5">
                        <span className="text-2xl font-semibold uppercase tracking-wide text-primary drop-shadow-lg">
                          {currentImage?.title?.replace(/\b\w/g, (char) => char.toUpperCase()) || "Untitled"}
                        </span>
                      </div>
                    </div>

                  
                  {/* Image type indicator */}
                  <div className="absolute bottom-2 left-2 right-2 flex justify-center z-10">
                    <div className="flex gap-1 px-1.5 py-1 rounded-full bg-background/60 backdrop-blur-[2px]">
                      {images().map((_, i) => (
                        <div 
                          key={i}
                          className={cn(
                            "w-1.5 h-1.5 rounded-full transition-colors duration-300",
                            currentIndex === i ? "bg-primary" : "bg-muted"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="p-3 rounded-full bg-muted">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Gallery</span>
            </div>
          )}

          {/* Hover Overlay */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-t from-background/90 to-transparent",
            "opacity-0 transition-all duration-300",
            "group-hover:opacity-100 flex items-center justify-center"
          )}>
            <div className="flex flex-col items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <ImageIcon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-medium">View All</span>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
});

ImageCard.displayName = 'ImageCard';
