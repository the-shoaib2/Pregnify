import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Save, X, Heart, Share2, Download, ThumbsUp } from "lucide-react"
import { toast } from "react-hot-toast"
import { MediaService } from "@/services/media"
import CommentBox from "./comments/CommentBox"

export const ImageView = ({ image, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [imageData, setImageData] = useState(null)
  const [reactions, setReactions] = useState({
    likes: 0,
    loves: 0,
    shares: 0,
    downloads: 0
  })
  const [formData, setFormData] = useState({
    description: ""
  })

  useEffect(() => {
    const fetchImageDetails = async () => {
      try {
        const response = await MediaService.getFilesById(image.id)
        const detailedImage = response.data
        setImageData(detailedImage)
        setFormData({
          title: detailedImage?.title || "",
          description: detailedImage?.description || "",
          category: detailedImage?.category || ""
        })
      } catch (error) {
        console.error("Error fetching image details:", error)
        toast.error("Failed to load image details")
      } finally {
        setLoading(false)
      }
    }

    if (image?.id) {
      fetchImageDetails()
    }
  }, [image?.id])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async () => {
    try {
      await MediaService.updateImage(image.id, formData)
      onUpdate({ ...image, ...formData })
      setIsEditing(false)
      toast.success("Image information updated successfully")
    } catch (error) {
      console.error("Update error:", error)
      toast.error("Failed to update image information")
    }
  }

  if (loading) {
    return 
  }

  return (
    <Card className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] gap-3 border bg-background p-4 shadow-lg duration-200 sm:rounded-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Image Details</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left side - Image */}
          <div className="relative">
            <AspectRatio ratio={1}>
              <img
                src={image.url}
                alt={image.title || "Image"}
                className="object-contain w-full h-full rounded-md"
              />
            </AspectRatio>
            <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-3 p-3 bg-gradient-to-t from-black/50 to-transparent">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-primary hover:bg-white/20 group"
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                <span className="text-xs">{reactions.likes}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-red-500 hover:bg-white/20 group"
              >
                <Heart className="h-4 w-4 mr-1" />
                <span className="text-xs">{reactions.loves}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-blue-500 hover:bg-white/20 group"
              >
                <Share2 className="h-4 w-4 mr-1" />
                <span className="text-xs">{reactions.shares}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-green-500 hover:bg-white/20 group"
              >
                <Download className="h-4 w-4 mr-1" />
                <span className="text-xs">{reactions.downloads}</span>
              </Button>
            </div>
          </div>

          {/* Right side - Information */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-medium">Information</h3>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                ) : (
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                )}
                {isEditing ? "Save" : "Edit"}
              </Button>
            </div>

            <div className="space-y-2.5">
              {isEditing ? (
                <>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter image description"
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" className="h-8" onClick={handleSubmit}>Save Changes</Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="text-xs text-muted-foreground">Description</span>
                    <p className="text-sm mt-0.5">{image.description || "No description"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Upload Date</span>
                    <p className="text-sm mt-0.5">
                      {new Date(image.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </>
              )}
              {/* Comment  */}
              <CommentBox imageId={image.id} />
            </div>
          </div>
        </div>
        
      </div>
    </Card>
  )
}

export default ImageView