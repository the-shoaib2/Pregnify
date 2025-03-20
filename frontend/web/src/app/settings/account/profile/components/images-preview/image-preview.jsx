import { useState, useEffect } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export function ImageCard({ avatar, cover, onClose, onClick }) {
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState('avatar');
  
  // Auto slide effect
  useEffect(() => {
    if (avatar && cover) {
      const interval = setInterval(() => {
        setCurrentImage(prev => prev === 'avatar' ? 'cover' : 'avatar');
      }, 3000); // Change image every 3 seconds

      return () => clearInterval(interval);
    }
  }, [avatar, cover]);

  return (
    <Card 
      className={cn(
        "relative flex flex-col items-center justify-center",
        "h-[160px] w-[160px] overflow-hidden rounded-lg",
        "bg-background border-2 border-border/50",
        "cursor-pointer transition-all duration-300",
        "hover:border-primary/20 hover:shadow-md",
        "group"
      )}
      onClick={onClick}
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

        {(avatar || cover) ? (
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
              {/* Avatar Item */}
              {avatar && (
                <CarouselItem className="h-full basis-full">
                  <div className="relative h-full w-full">
                    <img
                      src={avatar}
                      alt="Profile Picture"
                      className="h-full w-full object-cover"
                      onLoad={() => setLoading(false)}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/avatars/default.jpg";
                        setLoading(false);
                      }}
                    />
                  </div>
                </CarouselItem>
              )}

              {/* Cover Item */}
              {cover && (
                <CarouselItem className="h-full basis-full">
                  <div className="relative h-full w-full">
                    <img
                      src={cover}
                      alt="Cover Photo"
                      className="h-full w-full object-cover"
                      onLoad={() => setLoading(false)}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/covers/default.jpg";
                        setLoading(false);
                      }}
                    />
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>

            {/* Image Type Indicator */}
            <div className="absolute bottom-2 left-2 right-2 flex justify-center z-10">
              <div className="flex gap-1 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm">
                <div 
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors duration-300",
                    currentImage === 'avatar' ? "bg-primary" : "bg-muted"
                  )}
                />
                <div 
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors duration-300",
                    currentImage === 'cover' ? "bg-primary" : "bg-muted"
                  )}
                />
              </div>
            </div>
          </Carousel>
        ) : (
          // Default Icon View when no images
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="p-3 rounded-full bg-muted">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Photo Gallery</span>
          </div>
        )}

        {/* Hover Overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-background/90 to-background/60",
          "opacity-0 transition-all duration-300",
          "group-hover:opacity-100 flex items-center justify-center"
        )}>
          <div className="flex flex-col items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <div className="p-2 rounded-full bg-primary/10">
              <ImageIcon className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-medium">View Gallery</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
