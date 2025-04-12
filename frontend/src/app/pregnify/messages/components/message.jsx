import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Heart, ThumbsUp, Smile, Phone, Video, MoreVertical, FileText, Image as ImageIcon } from "lucide-react"

const MessageReaction = ({ icon: Icon, count, isSelected, onClick }) => (
  <Button
    variant="ghost"
    size="sm"
    className={`h-6 px-2 gap-1 ${isSelected ? 'bg-primary/10 text-primary' : ''}`}
    onClick={onClick}
  >
    <Icon className="h-3 w-3" />
    <span className="text-xs">{count}</span>
  </Button>
)

const MessageAttachment = ({ type, name, size }) => {
  const icons = {
    file: FileText,
    image: ImageIcon
  }
  const Icon = icons[type] || FileText

  return (
    <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 max-w-xs">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{name}</p>
        <p className="text-xs text-muted-foreground">{size}</p>
      </div>
    </div>
  )
}

export function Message({
  isUser,
  content,
  time,
  avatar,
  name,
  reactions,
  attachment,
  showAvatar = true,
  isConsecutive = false
}) {
  const [showReactions, setShowReactions] = useState(false)

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mt-0.5' : 'mt-3'}`}>
      <div
        className={`flex max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-1.5`}
        onMouseEnter={() => setShowReactions(true)}
        onMouseLeave={() => setShowReactions(false)}
      >
        {showAvatar && !isUser ? (
          <Avatar className="h-7 w-7 mt-auto mb-0.5">
            <AvatarImage src={avatar} />
            <AvatarFallback className="text-xs">{name[0]}</AvatarFallback>
          </Avatar>
        ) : null}
        <div className="space-y-0.5">
          {!isConsecutive && !isUser && (
            <span className="text-xs font-medium ml-0.5">{name}</span>
          )}
          <div
            className={`relative rounded-lg py-2 px-2.5 ${
              isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}
          >
            {attachment && <MessageAttachment {...attachment} />}
            <p className="text-sm whitespace-pre-wrap break-words leading-snug">{content}</p>
            <div className="flex items-center justify-between mt-0.5">
              <span
                className={`text-[10px] ${
                  isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                }`}
              >
                {time}
              </span>
            </div>
            {showReactions && (
              <div className="absolute -bottom-7 bg-background border rounded-full shadow-sm p-0.5 flex gap-0.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-rose-50 hover:text-rose-500">
                      <Heart className="h-2.5 w-2.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="py-1 px-2 text-xs">Love</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-blue-50 hover:text-blue-500">
                      <ThumbsUp className="h-2.5 w-2.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="py-1 px-2 text-xs">Like</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-amber-50 hover:text-amber-500">
                      <Smile className="h-2.5 w-2.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="py-1 px-2 text-xs">Smile</TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
          {reactions?.length > 0 && (
            <div className="flex gap-1">
              {reactions.map((reaction, index) => (
                <MessageReaction key={index} {...reaction} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}