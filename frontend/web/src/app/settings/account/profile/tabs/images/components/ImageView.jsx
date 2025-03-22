import React, { useState, useEffect, useContext } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Textarea } from "@/components/ui/textarea"
import { 
  Pencil, Save, X, Heart, Share2, Download, ThumbsUp,
  Smile, Frown, Laugh, AlertCircle, Star, Award, Sparkles
} from "lucide-react"
import { toast } from "react-hot-toast"
import { MediaService } from "@/services/media"
import CommentBox from "./comments/CommentBox"
import { MediaEnumsContext } from "../page"
import { cn } from "@/lib/utils"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export const ImageView = ({ image, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [imageData, setImageData] = useState(null)
  const [userReaction, setUserReaction] = useState(null)
  const [reactionCounts, setReactionCounts] = useState({})
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [formData, setFormData] = useState({
    description: ""
  })

  // Get media enums from context
  const mediaContext = useContext(MediaEnumsContext)
  const availableReactions = mediaContext?.mediaEnums?.reactionTypes || []

  // Map reaction types to icons
  const reactionIcons = {
    LIKE: ThumbsUp,
    LOVE: Heart,
    HAHA: Laugh,
    CRY: Frown,
    CARE: Smile,
    WOW: AlertCircle,
    SAD: Frown,
    ANGRY: () => "😠",
    THUMBS_UP: ThumbsUp,
    THUMBS_DOWN: () => "👎",
    LAUGH: Laugh,
    SUPPORT: Award,
    THANK: Star,
    PRAY: () => "🙏",
    HOPE: Sparkles,
    JOY: Smile,
    CELEBRATE: () => "🎉"
  };

  // Map reaction types to colors
  const reactionColors = {
    LIKE: "text-blue-500",
    LOVE: "text-red-500",
    HAHA: "text-yellow-500",
    CRY: "text-blue-400",
    CARE: "text-yellow-400",
    WOW: "text-yellow-500",
    SAD: "text-blue-400",
    ANGRY: "text-orange-500",
    THUMBS_UP: "text-blue-500",
    THUMBS_DOWN: "text-gray-500",
    LAUGH: "text-yellow-500",
    SUPPORT: "text-purple-500",
    THANK: "text-green-500",
    PRAY: "text-purple-400",
    HOPE: "text-green-400",
    JOY: "text-yellow-400",
    CELEBRATE: "text-pink-500"
  };

  useEffect(() => {
    // Initialize reaction counts
    if (availableReactions.length > 0) {
      const initialCounts = {}
      availableReactions.forEach(type => {
        initialCounts[type] = 0
      })
      setReactionCounts(initialCounts)
    }
  }, [availableReactions])

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

        // If the image has reactions, update the counts
        if (detailedImage?.reactions) {
          setReactionCounts(prev => ({
            ...prev,
            ...detailedImage.reactions
          }))
        }
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

  const handleReaction = async (type) => {
    setIsAnimating(true)
    const prevReaction = userReaction
    const prevCounts = { ...reactionCounts }
    
    // If user clicks the same reaction, remove it
    if (userReaction === type) {
      setUserReaction(null)
      setReactionCounts(prev => ({
        ...prev,
        [type]: Math.max(0, prev[type] - 1)
      }))
    } else {
      // If user had a previous reaction, decrement it
      if (userReaction) {
        setReactionCounts(prev => ({
          ...prev,
          [userReaction]: Math.max(0, prev[userReaction] - 1)
        }))
      }
      
      // Set the new reaction
      setUserReaction(type)
      setReactionCounts(prev => ({
        ...prev,
        [type]: (prev[type] || 0) + 1
      }))
    }
    
    setShowReactionPicker(false)

    try {
      await MediaService.reactToImage(image.id, type)
      toast.success(`Reaction ${userReaction === type ? 'removed' : 'added'}`)
    } catch (error) {
      // Revert on failure
      setUserReaction(prevReaction)
      setReactionCounts(prevCounts)
      toast.error('Failed to update reaction')
    } finally {
      setTimeout(() => setIsAnimating(false), 300)
    }
  }

  if (loading) {
    return null;
  }

  // Get the current reaction icon
  const CurrentReactionIcon = userReaction ? reactionIcons[userReaction] : ThumbsUp
  const currentColor = userReaction ? reactionColors[userReaction] : ""
  
  // Calculate total reactions
  const totalReactions = Object.values(reactionCounts).reduce((sum, count) => sum + count, 0)

  // Get the top reactions to display
  const topReactions = Object.entries(reactionCounts)
    .filter(([_, count]) => count > 0)
    .sort(([_, countA], [__, countB]) => countB - countA)
    .slice(0, 3)
    .map(([type]) => type);

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 border-none">
        <div className="grid w-full gap-3 bg-background p-4 sm:rounded-lg">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-semibold">Image Details</DialogTitle>
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
              
              {/* Facebook-style reaction bar */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between items-center p-2 bg-gradient-to-t from-black/60 to-transparent">
                <div className="flex gap-1 items-center">
                  <Popover open={showReactionPicker} onOpenChange={setShowReactionPicker}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-7 px-2 text-xs flex items-center gap-1 hover:bg-white/20 text-white rounded-full",
                          userReaction && reactionColors[userReaction]
                        )}
                      >
                        {userReaction ? (
                          <>
                            {typeof reactionIcons[userReaction] === 'function' && 
                             reactionIcons[userReaction].toString().includes('return "') ? (
                              <span className="mr-1 text-base">{reactionIcons[userReaction]()}</span>
                            ) : (
                              <CurrentReactionIcon className="h-3.5 w-3.5 mr-1" />
                            )}
                            <span className="text-xs capitalize">{userReaction.toLowerCase().replace('_', ' ')}</span>
                          </>
                        ) : (
                          <>
                            <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                            <span className="text-xs">Like</span>
                          </>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-1 w-auto">
                      <div className="flex flex-wrap gap-1 p-1 max-w-[220px]">
                        {availableReactions.slice(0, 12).map((type) => {
                          const ReactionIcon = reactionIcons[type];
                          const isEmoji = typeof ReactionIcon === 'function' && ReactionIcon.toString().includes('return "');
                          
                          return (
                            <TooltipProvider key={type}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                      "h-8 w-8 rounded-full hover:bg-muted",
                                      reactionColors[type]
                                    )}
                                    onClick={() => handleReaction(type)}
                                  >
                                    {isEmoji ? (
                                      <span className="text-base">{ReactionIcon()}</span>
                                    ) : (
                                      <ReactionIcon className={cn(
                                        "h-4 w-4 transition-transform",
                                        isAnimating && userReaction === type && "animate-bounce"
                                      )} />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="py-1 px-2">
                                  <p className="text-xs">{type.charAt(0) + type.slice(1).toLowerCase().replace('_', ' ')}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  {totalReactions > 0 && (
                    <div className="flex items-center gap-1 text-xs text-white ml-1">
                      {topReactions.length > 0 && (
                        <div className="flex -space-x-1">
                          {topReactions.map(type => {
                            const ReactionIcon = reactionIcons[type];
                            const isEmoji = typeof ReactionIcon === 'function' && ReactionIcon.toString().includes('return "');
                            
                            return (
                              <div 
                                key={type} 
                                className={cn(
                                  "h-5 w-5 rounded-full bg-white/20 flex items-center justify-center",
                                  reactionColors[type]
                                )}
                              >
                                {isEmoji ? (
                                  <span className="text-xs">{ReactionIcon()}</span>
                                ) : (
                                  <ReactionIcon className="h-3 w-3" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <span>{totalReactions}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs flex items-center gap-1 hover:bg-white/20 text-white rounded-full"
                  >
                    <Share2 className="h-3.5 w-3.5 mr-1" />
                    <span className="text-xs">Share</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs flex items-center gap-1 hover:bg-white/20 text-white rounded-full"
                  >
                    <Download className="h-3.5 w-3.5 mr-1" />
                    <span className="text-xs">Download</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Right side - Information */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-medium">Information</h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7"
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
                        className="h-7"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" className="h-7" onClick={handleSubmit}>Save Changes</Button>
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
                
                {/* Comment section with compact design */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Comments</h4>
                  <CommentBox imageId={image.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ImageView