import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart, ThumbsUp, ThumbsDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { MediaService } from "@/services/media"
import { toast } from "react-hot-toast"

const ReactionComponent = ({ commentId, initialReactions = { likes: 0, loves: 0, dislikes: 0 } }) => {
  const [reactions, setReactions] = useState(initialReactions)
  const [userReactions, setUserReactions] = useState({
    liked: false,
    loved: false,
    disliked: false
  })
  const [isAnimating, setIsAnimating] = useState(false)

  const handleReaction = async (type) => {
    setIsAnimating(true)
    const prevState = { ...userReactions }
    const prevReactions = { ...reactions }

    // Optimistic update
    setUserReactions(prev => {
      const newState = { ...prev }
      newState[type] = !prev[type]
      return newState
    })

    setReactions(prev => {
      const newCount = { ...prev }
      if (type === 'liked') newCount.likes += !prevState.liked ? 1 : -1
      if (type === 'loved') newCount.loves += !prevState.loved ? 1 : -1
      if (type === 'disliked') newCount.dislikes += !prevState.disliked ? 1 : -1
      return newCount
    })

    try {
      await MediaService.reactToComment(commentId, type)
      toast.success(`Reaction ${!prevState[type] ? 'added' : 'removed'}`)
    } catch (error) {
      // Revert on failure
      setUserReactions(prevState)
      setReactions(prevReactions)
      toast.error('Failed to update reaction')
    } finally {
      setTimeout(() => setIsAnimating(false), 300)
    }
  }

  return (
    <div className="flex items-center gap-1 mt-0.5">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-5 w-5 hover:bg-muted relative group",
          userReactions.loved && "text-red-500"
        )}
        onClick={() => handleReaction('loved')}
      >
        <Heart
          className={cn(
            "h-3 w-3 transition-transform",
            isAnimating && userReactions.loved && "animate-bounce"
          )}
        />
        {reactions.loves > 0 && (
          <span className="absolute -top-2 -right-2 text-[10px] font-medium bg-primary/10 px-1 rounded-full">
            {reactions.loves}
          </span>
        )}
        <span className="sr-only">Love</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-5 w-5 hover:bg-muted relative group",
          userReactions.liked && "text-blue-500"
        )}
        onClick={() => handleReaction('liked')}
      >
        <ThumbsUp
          className={cn(
            "h-3 w-3 transition-transform",
            isAnimating && userReactions.liked && "animate-bounce"
          )}
        />
        {reactions.likes > 0 && (
          <span className="absolute -top-2 -right-2 text-[10px] font-medium bg-primary/10 px-1 rounded-full">
            {reactions.likes}
          </span>
        )}
        <span className="sr-only">Like</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-5 w-5 hover:bg-muted relative group",
          userReactions.disliked && "text-gray-500"
        )}
        onClick={() => handleReaction('disliked')}
      >
        <ThumbsDown
          className={cn(
            "h-3 w-3 transition-transform",
            isAnimating && userReactions.disliked && "animate-bounce"
          )}
        />
        {reactions.dislikes > 0 && (
          <span className="absolute -top-2 -right-2 text-[10px] font-medium bg-primary/10 px-1 rounded-full">
            {reactions.dislikes}
          </span>
        )}
        <span className="sr-only">Dislike</span>
      </Button>
    </div>
  )
}

export default ReactionComponent