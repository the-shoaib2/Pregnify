import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Eye, Share2, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export const ImageCard = ({ image, onView, onDelete, onShare }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  const handleImageError = (e) => {
    console.error("Image failed to load:", e)
    setIsLoading(false)
    e.target.src = "/avatars/default.jpg"
  }

  const handleDeleteClick = (e) => {
    e.stopPropagation()
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = () => {
    onDelete(image)
    setShowDeleteDialog(false)
  }

  return (
    <>
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
                onClick={handleDeleteClick}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this image? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              className="mt-2 sm:mt-0"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              className="mt-2 sm:mt-0"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ImageCard