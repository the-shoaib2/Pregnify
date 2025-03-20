import { useState, useEffect, memo } from "react";
import { X, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export const ImageCard = memo(({ avatarThumb, coverThumb, onClose, onClick }) => {
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState('avatar');
  const [showFullscreen, setShowFullscreen] = useState(false);
  
  // Optimized auto slide with RAF
  useEffect(() => {
    if (!avatarThumb || !coverThumb || showFullscreen) return;
    
    let rafId;
    let lastTime = 0;
    const interval = 3000;

    const animate = (timestamp) => {
      if (!lastTime) lastTime = timestamp;
      const progress = timestamp - lastTime;

      if (progress >= interval) {
        setCurrentImage(prev => prev === 'avatar' ? 'cover' : 'avatar');
        lastTime = timestamp;
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [avatarThumb, coverThumb, showFullscreen]);

  // Preload images
  useEffect(() => {
    const preloadImage = (src) => {
      if (!src) return;
      const img = new Image();
      img.src = src;
    };

    preloadImage(avatarThumb);
    preloadImage(coverThumb);
  }, [avatarThumb, coverThumb]);

  // Handle card click - either show fullscreen or call onClick
  const handleCardClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick(e);
    } else {
      setShowFullscreen(true);
    }
  };

  // Create an array of available images
  const images = [
    avatarThumb && { type: 'avatar', src: avatarThumb },
    coverThumb && { type: 'cover', src: coverThumb }
  ].filter(Boolean);

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

          {(avatarThumb || coverThumb) ? (
            <Carousel 
              className="w-full h-full"
              opts={{
                align: "start",
                loop: true,
              }}
              orientation="horizontal"
              current={currentImage === 'avatar' ? 0 : 1}
            >
              <CarouselContent className="h-full">
                {avatarThumb && (
                  <CarouselItem className="h-full basis-full">
                    <img
                      src={avatarThumb}
                      alt="Profile"
                      className="h-full w-full object-cover"
                      loading="eager"
                      decoding="async"
                      onLoad={() => setLoading(false)}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/avatars/default.jpg";
                        setLoading(false);
                      }}
                    />
                  </CarouselItem>
                )}

                {coverThumb && (
                  <CarouselItem className="h-full basis-full">
                    <img
                      src={coverThumb}
                      alt="Cover"
                      className="h-full w-full object-cover"
                      loading="eager"
                      decoding="async"
                      onLoad={() => setLoading(false)}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/covers/default.jpg";
                        setLoading(false);
                      }}
                    />
                  </CarouselItem>
                )}
              </CarouselContent>

              {/* Minimal Indicator */}
              <div className="absolute bottom-2 left-2 right-2 flex justify-center z-10">
                <div className="flex gap-1 px-1.5 py-1 rounded-full bg-background/60 backdrop-blur-[2px]">
                  {[avatarThumb, coverThumb].map((_, i) => (
                    <div 
                      key={i}
                      className={cn(
                        "w-1 h-1 rounded-full transition-colors duration-300",
                        currentImage === (i === 0 ? 'avatar' : 'cover') ? "bg-primary" : "bg-muted"
                      )}
                    />
                  ))}
                </div>
              </div>
            </Carousel>
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
            "absolute inset-0 bg-gradient-to-t from-background/90 to-background/60",
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

      {/* Fullscreen Dialog for Image Slideshow */}
      <Dialog open={showFullscreen} onOpenChange={setShowFullscreen}>
        <DialogContent className="max-w-screen-lg p-0 overflow-hidden bg-background/95 backdrop-blur-sm border-none shadow-2xl transition-all duration-300 ease-in-out" 
          onInteractOutside={(e) => e.preventDefault()}
        >
          <div className="relative w-full h-[80vh]">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 rounded-full bg-background/80 hover:bg-background/90 shadow-md"
              onClick={() => setShowFullscreen(false)}
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Fullscreen Carousel */}
            <Carousel
              className="w-full h-full"
              opts={{
                align: "center",
                loop: true,
              }}
            >
              <CarouselContent className="h-full">
                {images.map((image, index) => (
                  <CarouselItem key={index} className="h-full basis-full flex items-center justify-center p-6">
                    <div className="relative w-full h-full max-h-[70vh] flex items-center justify-center">
                      <img
                        src={image.src}
                        alt={image.type === 'avatar' ? 'Profile Picture' : 'Cover Photo'}
                        className="max-h-full max-w-full object-contain rounded-lg shadow-lg transition-transform duration-300 hover:scale-[1.02]"
                      />
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-background/80 backdrop-blur-sm rounded-full text-sm font-medium">
                        {image.type === 'avatar' ? 'Profile Picture' : 'Cover Photo'}
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              
              <CarouselPrevious className="left-4 bg-background/80 hover:bg-background/90" />
              <CarouselNext className="right-4 bg-background/80 hover:bg-background/90" />
            </Carousel>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

ImageCard.displayName = 'ImageCard';
