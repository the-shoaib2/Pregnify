import React, { useState, useContext, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  Heart, ThumbsUp, ThumbsDown, Smile, 
  Frown, Laugh, Meh, AlertCircle, 
  Flame, Star, Award, Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { MediaService } from "@/services/media"
import { toast } from "react-hot-toast"
import { MediaEnumsContext } from "../../page"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Map reaction types to icons
const reactionIcons = {
  LIKE: ThumbsUp,
  LOVE: Heart,
  HAHA: Laugh,
  CRY: Frown,
  CARE: Smile,
  WOW: AlertCircle,
  SAD: Meh,
  ANGRY: Flame,
  THUMBS_UP: ThumbsUp,
  THUMBS_DOWN: ThumbsDown,
  LAUGH: Laugh,
  SUPPORT: Award,
  THANK: Star,
  PRAY: Star,
  HOPE: Sparkles,
  JOY: Smile,
  CELEBRATE: () => "🎉" // Use emoji for this one
};

// Map reaction types to colors - updated with more subtle Apple-like colors
const reactionColors = {
  LIKE: "text-blue-400",
  LOVE: "text-rose-400",
  HAHA: "text-amber-400",
  CRY: "text-sky-400",
  CARE: "text-amber-300",
  WOW: "text-amber-400",
  SAD: "text-sky-400",
  ANGRY: "text-orange-400",
  THUMBS_UP: "text-blue-400",
  THUMBS_DOWN: "text-zinc-400",
  LAUGH: "text-amber-400",
  SUPPORT: "text-violet-400",
  THANK: "text-emerald-400",
  PRAY: "text-violet-300",
  HOPE: "text-emerald-300",
  JOY: "text-amber-300",
  CELEBRATE: "text-pink-400"
};

const ReactionComponent = ({ commentId, initialReactions = { likes: 0, loves: 0, dislikes: 0 } }) => {
  const [reactions, setReactions] = useState(initialReactions)
  const [userReaction, setUserReaction] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [reactionCounts, setReactionCounts] = useState({})
  
  // Get media enums from context
  const mediaContext = useContext(MediaEnumsContext)
  const availableReactions = mediaContext?.mediaEnums?.reactionTypes || []
  
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
      await MediaService.reactToComment(commentId, type)
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

  // Get the current reaction icon
  const CurrentReactionIcon = userReaction ? reactionIcons[userReaction] : ThumbsUp
  const currentColor = userReaction ? reactionColors[userReaction] : ""

  // Calculate total reactions
  const totalReactions = Object.values(reactionCounts).reduce((sum, count) => sum + count, 0)

  // Get top 3 reactions with counts > 0 to display
  const topReactions = Object.entries(reactionCounts)
    .filter(([_, count]) => count > 0)
    .sort(([_, countA], [__, countB]) => countB - countA)
    .slice(0, 3)

  return (
    <div className="flex items-center gap-1 mt-0.5">
      <Popover open={showReactionPicker} onOpenChange={setShowReactionPicker}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-5 px-1.5 text-xs flex items-center gap-1 hover:bg-muted/60 rounded-full transition-colors",
              userReaction && currentColor
            )}
          >
            <CurrentReactionIcon className="h-3 w-3" />
            <span className="text-xs">{totalReactions > 0 ? totalReactions : ""}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-1 w-auto shadow-lg rounded-xl border-none">
          <div className="flex gap-1 p-1">
            {availableReactions.slice(0, 7).map((type) => {
              const ReactionIcon = reactionIcons[type] || ThumbsUp
              const isEmoji = typeof ReactionIcon === 'function' && ReactionIcon.toString().includes('return "');
              
              return (
                <TooltipProvider key={type}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-7 w-7 rounded-full hover:bg-muted/80 transition-all duration-200",
                          reactionColors[type]
                        )}
                        onClick={() => handleReaction(type)}
                      >
                        {isEmoji ? (
                          <span className="text-sm">{ReactionIcon()}</span>
                        ) : (
                          <ReactionIcon className={cn(
                            "h-3.5 w-3.5 transition-transform",
                            isAnimating && userReaction === type && "animate-bounce"
                          )} />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="py-1 px-2 text-xs rounded-lg">
                      <p className="text-xs">{type.charAt(0) + type.slice(1).toLowerCase().replace('_', ' ')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>
      
      {topReactions.length > 0 && (
        <div className="flex -space-x-1 ml-1">
          {topReactions.map(([type, _]) => {
            const ReactionIcon = reactionIcons[type] || ThumbsUp;
            const isEmoji = typeof ReactionIcon === 'function' && ReactionIcon.toString().includes('return "');
            
            return (
              <div 
                key={type} 
                className={cn(
                  "h-4 w-4 rounded-full bg-background border border-muted/30 shadow-sm flex items-center justify-center",
                  reactionColors[type]
                )}
              >
                {isEmoji ? (
                  <span className="text-xs">{ReactionIcon()}</span>
                ) : (
                  <ReactionIcon className="h-2.5 w-2.5" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}

export default ReactionComponent