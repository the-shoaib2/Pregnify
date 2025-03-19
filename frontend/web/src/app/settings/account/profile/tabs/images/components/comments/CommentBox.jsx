import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Check, Clock, AlertCircle } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/contexts/auth-context/auth-context"
import { MediaService } from "@/services/media"
import { toast } from "react-hot-toast"

const CommentBox = ({ imageId }) => {
  const { user } = useAuth()
  const [comment, setComment] = useState("")
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await MediaService.getFilesById(imageId)
        setComments(response.data.comments || [])
      } catch (error) {
        console.error("Failed to fetch comments:", error)
        toast.error("Failed to load comments")
      } finally {
        setLoading(false)
      }
    }

    if (imageId) {
      fetchComments()
    }
  }, [imageId])
  
  const handleSubmit = async () => {
    if (!comment.trim()) return
    
    // Create a new comment object with pending status
    const newComment = {
      id: Date.now().toString(),
      content: comment.trim(),
      status: "sending",
      createdAt: new Date().toISOString(),
      user: {
        id: user?.id,
        username: user?.username,
        firstName: user?.firstName,
        lastName: user?.lastName,
        avatarThumb: user?.avatarThumb,
        avatar: user?.avatar
      }
    }
    
    // Add comment to the list immediately for optimistic UI
    setComments(prev => [...prev, newComment])
    setComment("") // Clear input
    
    try {
      // Make the actual API call
      const response = await MediaService.addComment(imageId, comment.trim())
      
      // Update comment status to delivered with server response
      const updatedComment = {
        ...newComment,
        id: response.data.id,
        status: "delivered",
        createdAt: response.data.createdAt,
        user: response.data.user
      }
      
      setComments(prev =>
        prev.map(c => c.id === newComment.id ? updatedComment : c)
      )
      
      // No need to call onSubmit as we're managing comments internally
    } catch (error) {
      console.error("Failed to add comment:", error)
      toast.error("Failed to add comment. Please try again.")
      
      // Update comment status to failed
      setComments(prev =>
        prev.map(c =>
          c.id === newComment.id
            ? { ...c, status: "failed" }
            : c
        )
      )
    }
  }
  
  return (
    <div className="space-y-4">
      {/* Comments List */}
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-6">
          {comments.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">No comments yet</p>
            </div>
          ) : (
            comments.map(comment => (
              <div
                key={comment.id}
                className="flex items-start gap-4 group animate-in fade-in-0 duration-100 hover:bg-muted/30 rounded-lg p-3"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.user?.avatarThumb || comment.user?.avatar} alt={comment.user?.username} />
                  <AvatarFallback>{comment.user?.firstName?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{`${comment.user?.firstName || ''} ${comment.user?.lastName || ''}`}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="text-sm break-words rounded-lg bg-muted/50 p-3">
                      {comment.content}
                    </div>
                    <div className="absolute right-2 top-2">
                      {comment.status === "sending" && (
                        <Clock className="h-4 w-4 text-muted-foreground animate-pulse" />
                      )}
                      {comment.status === "delivered" && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                      {comment.status === "failed" && (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      
      {/* Comment Input */}
      <div className="flex gap-2">
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write a comment..."
          className="min-h-[60px]"
        />
        <Button
          onClick={handleSubmit}
          disabled={!comment.trim()}
          className="self-end"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default CommentBox