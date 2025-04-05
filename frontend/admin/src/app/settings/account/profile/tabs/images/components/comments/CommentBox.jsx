import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Check, Clock, AlertCircle, Pencil, Trash } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/contexts/auth-context/auth-context"
import { MediaService } from "@/services/media"
import { toast } from "react-hot-toast"
import ReactionComponent from "./ReactionComponent"

const CommentBox = ({ imageId }) => {
  const { user } = useAuth()
  const [comment, setComment] = useState("")
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingCommentId, setEditingCommentId] = useState(null)
  const commentsEndRef = useRef(null)

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }

  useEffect(() => {
    if (comments.length > 0 && !loading) {
      scrollToBottom()
    }
  }, [comments.length, loading])

  const fetchComments = async () => {
    try {
      const response = await MediaService.getFilesById(imageId)
      if (response?.data?.comments) {
        // Sort comments by creation date (newest at the bottom)
        const sortedComments = [...response.data.comments]
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          .map(comment => ({
            ...comment,
            status: "delivered"
          }))
        setComments(sortedComments)
      }
    } catch (error) {
      if (error?.response?.status === 429) {
        // Handle rate limiting with exponential backoff
        const retryAfter = error.response.headers['retry-after'] || 5
        toast.error(`Rate limited. Retrying in ${retryAfter} seconds`)
        setTimeout(() => fetchComments(), retryAfter * 1000)
      } else {
        console.error("Failed to fetch comments:", error)
        toast.error("Failed to load comments")
        setComments([])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
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
        firstName: user?.firstName || user?.username?.split(' ')[0] || 'User',
        lastName: user?.lastName || '',
        avatarThumb: user?.avatar || user?.avatarThumb
      }
    }
    
    // Add the new comment to the list
    setComments(prev => [...prev, newComment])
    setComment("")
    
    // Scroll to the bottom to show the new comment
    setTimeout(scrollToBottom, 100)
    
    try {
      const response = await MediaService.addComment(imageId, newComment.content)
      
      // Update the comment with the server response
      setComments(prev => 
        prev.map(c => 
          c.id === newComment.id 
            ? { 
                ...response.data, 
                status: "delivered",
                user: response.data.user || newComment.user
              } 
            : c
        )
      )
      
      // Scroll to the bottom again after the comment is updated
      setTimeout(scrollToBottom, 100)
    } catch (error) {
      console.error("Failed to add comment:", error)
      
      // Mark the comment as failed
      setComments(prev => 
        prev.map(c => 
          c.id === newComment.id 
            ? { ...c, status: "failed" } 
            : c
        )
      )
      
      toast.error("Failed to add comment")
    }
  }

  const handleEdit = (commentId, content) => {
    setEditingCommentId(commentId)
    setComment(content)
  }

  const handleDelete = async (commentId) => {
    try {
      await MediaService.deleteComment(imageId, commentId)
      setComments(prev => prev.filter(c => c.id !== commentId))
      toast.success("Comment deleted successfully")
    } catch (error) {
      console.error("Failed to delete comment:", error)
      toast.error("Failed to delete comment")
    }
  }

  const handleUpdate = async () => {
    if (!comment.trim() || !editingCommentId) return

    try {
      const response = await MediaService.updateComment(imageId, editingCommentId, comment.trim())
      setComments(prev =>
        prev.map(c =>
          c.id === editingCommentId
            ? { ...c, content: comment.trim(), status: "delivered" }
            : c
        )
      )
      setEditingCommentId(null)
      setComment("")
      toast.success("Comment updated successfully")
    } catch (error) {
      console.error("Failed to update comment:", error)
      toast.error("Failed to update comment")
    }
  }

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[300px] pr-4 relative">
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-[200px]">
              <p className="text-sm text-muted-foreground animate-pulse">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex items-center justify-center h-[200px]">
              <p className="text-sm text-muted-foreground">No comments yet</p>
            </div>
          ) : (
            comments.map(comment => (
              <div
                key={comment.id}
                className="group relative flex items-start gap-2 rounded-lg p-2 transition-all duration-200 hover:bg-muted/30 animate-in fade-in-0 slide-in-from-bottom-2"
              >
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarImage src={comment.user?.avatarThumb || comment.user?.avatar} alt={comment.user?.username} />
                  <AvatarFallback>{comment.user?.firstName?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium truncate">
                      {`${comment.user?.firstName || ''} ${comment.user?.lastName || ''}`}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="relative rounded-md bg-muted/40 p-2">
                    <p className="text-xs break-words pr-6">{comment.content}</p>
                    <div className="absolute right-1.5 top-1.5">
                      {comment.status === "sending" && (
                        <Clock className="h-3 w-3 text-muted-foreground animate-pulse" />
                      )}
                      {comment.status === "delivered" && (
                        <Check className="h-3 w-3 text-green-500" />
                      )}
                      {comment.status === "failed" && (
                        <AlertCircle className="h-3 w-3 text-destructive" />
                      )}
                    </div>
                  </div>
                  <ReactionComponent commentId={comment.id} initialReactions={{
                    likes: comment.likes || 0,
                    loves: comment.loves || 0,
                    dislikes: comment.dislikes || 0
                  }} />
                </div>
                {comment.user?.id === user?.id && (
                  <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-muted"
                      onClick={() => handleEdit(comment.id, comment.content)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleDelete(comment.id)}
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={commentsEndRef} />
        </div>
      </ScrollArea>
      
      <div className="flex gap-2">
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write a comment..."
          className="min-h-[45px] resize-none text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (editingCommentId) {
                handleUpdate();
              } else {
                handleSubmit();
              }
            }
          }}
        />
        <Button
          onClick={editingCommentId ? handleUpdate : handleSubmit}
          disabled={!comment.trim()}
          className="self-end h-[45px] px-3 transition-all duration-200 hover:scale-105"
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

export default CommentBox