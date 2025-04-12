import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Search, MessageSquare, Phone, Video, Users, Clock } from "lucide-react"

const ChatItem = ({ name, avatar, lastMessage, time, unread, isOnline, isActive, onClick }) => (
  <div 
      className={`p-2.5 hover:bg-muted rounded-lg cursor-pointer transition-colors ${isActive ? 'bg-muted/80 shadow-sm' : ''}`}
      onClick={() => onClick(name)}
    >
    <div className="flex items-center gap-3">
      <div className="relative">
        <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
          <AvatarImage src={avatar} />
          <AvatarFallback className="text-sm font-medium">{name[0]}</AvatarFallback>
        </Avatar>
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm truncate">{name}</h3>
          <span className="text-xs text-muted-foreground ml-1">{time}</span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xs text-muted-foreground truncate">{lastMessage}</p>
          {unread > 0 && (
            <Badge variant="secondary" className="ml-1.5 h-5 min-w-5 flex items-center justify-center px-1.5">
              <span className="text-[10px]">{unread}</span>
            </Badge>
          )}
        </div>
      </div>
    </div>
  </div>
)

export function ChatList({ onChatSelect }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeChat, setActiveChat] = useState("Dr. Smith")

  const chats = [
    {
      id: 1,
      name: "Dr. Smith",
      avatar: "/doctor-avatar.jpg",
      lastMessage: "What specific concerns do you have?",
      time: "10:03 AM",
      unread: 0,
      isOnline: true,
      type: "doctor"
    },
    {
      id: 2,
      name: "Pregnancy Support Group",
      avatar: "/community-avatar.jpg",
      lastMessage: "Thanks for sharing your experience!",
      time: "9:45 AM",
      unread: 3,
      isOnline: false,
      type: "group"
    },
    {
      id: 3,
      name: "Dr. Johnson",
      avatar: "/doctor-avatar-2.jpg",
      lastMessage: "Your test results look good",
      time: "Yesterday",
      unread: 0,
      isOnline: false,
      type: "doctor"
    },
    {
      id: 4,
      name: "New Moms Community",
      avatar: "/community-avatar-2.jpg",
      lastMessage: "Welcome to our support group!",
      time: "Yesterday",
      unread: 1,
      isOnline: false,
      type: "group"
    }
  ]

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleChatSelect = (chatName) => {
    setActiveChat(chatName)
    onChatSelect?.(chatName)
  }

  return (
    <Card className="w-full h-full border-r border-muted flex flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="p-2 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            className="pl-8 h-8 bg-background/50 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="py-1.5 px-1 space-y-1">
          {filteredChats.map((chat) => (
            <ChatItem
              key={chat.id}
              {...chat}
              isActive={chat.name === activeChat}
              onClick={() => handleChatSelect(chat.name)}
            />
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
}