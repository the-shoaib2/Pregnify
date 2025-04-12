import { useState, useRef, useEffect } from "react"
import { RoleBasedLayout } from "@/components/layout/role-based-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Send, Paperclip, Smile, Image, FileText, MoreVertical, MessageSquare, Users, Clock, Check, CheckCheck } from "lucide-react"

import { ChatList } from "./components/chat-list"
import { Message } from "./components/message"
import { CallButton, CallControls } from "./components/call-controls"

export default function MessagesPage() {
  const [activeChat, setActiveChat] = useState("Dr. Smith")
  const [callStatus, setCallStatus] = useState(null)
  const [messageText, setMessageText] = useState("")
  const [activeTab, setActiveTab] = useState("chats")
  const scrollAreaRef = useRef(null)

  const messages = [
    {
      id: 1,
      isUser: false,
      content: "Hello! How can I help you today?",
      time: "10:00 AM",
      name: "Dr. Smith",
      avatar: "/doctor-avatar.jpg",
      status: "read"
    },
    {
      id: 2,
      isUser: true,
      content: "I have some questions about my pregnancy diet.",
      time: "10:02 AM",
      name: "You",
      avatar: "/user-avatar.jpg",
      status: "delivered"
    },
    {
      id: 3,
      isUser: false,
      content: "Of course! I'd be happy to help with your diet questions. What specific concerns do you have?",
      time: "10:03 AM",
      name: "Dr. Smith",
      avatar: "/doctor-avatar.jpg",
      status: "read",
      reactions: [
        { icon: Smile, count: 1, isSelected: true }
      ]
    },
    {
      id: 4,
      isUser: true,
      content: "I'm wondering if I should be taking any specific supplements besides my prenatal vitamins?",
      time: "10:05 AM",
      name: "You",
      avatar: "/user-avatar.jpg",
      status: "sent",
      attachment: {
        type: "image",
        name: "diet_plan.jpg",
        size: "2.4 MB"
      }
    }
  ]

  const handleStartCall = (type) => {
    setCallStatus({
      type,
      status: "connecting",
      participant: {
        name: activeChat,
        avatar: "/doctor-avatar.jpg"
      }
    })
    // Simulate connecting
    setTimeout(() => {
      setCallStatus(prev => ({ ...prev, status: "connected" }))
    }, 2000)
  }
  
  const handleSendMessage = () => {
    if (!messageText.trim()) return
    
    // Add new message to the list
    const newMessage = {
      id: Date.now(),
      isUser: true,
      content: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      name: "You",
      avatar: "/user-avatar.jpg",
      status: "sending"
    }
    
    // Clear input
    setMessageText("")
    
    // Scroll to bottom after message is added
    setTimeout(() => {
      scrollAreaRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }
  
  useEffect(() => {
    // Scroll to bottom on initial load
    scrollAreaRef.current?.scrollIntoView()
  }, [])

  return (
    <RoleBasedLayout headerTitle="Messages">
      <Card className="flex h-[calc(100vh-4rem)] overflow-hidden gap-3 p-2">
        {/* Chat list sidebar - more compact with fixed width */}
        <div className="hidden md:block w-[280px] flex-shrink-0">
          <Tabs defaultValue="chats" value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <Card className="flex-1 border h-full shadow-sm">
              <CardHeader className="px-3 py-2 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Messages</CardTitle>
                </div>
              </CardHeader>
              <TabsContent value="chats" className="flex-1 h-[calc(100%-3.5rem)] p-0">
                <ChatList onChatSelect={setActiveChat} />
              </TabsContent>
            </Card>
          </Tabs>
        </div>
        {/* Message content area - adjusted for better spacing */}
        <div className="flex-1 flex flex-col mx-auto w-full relative">
          <Card className="flex-1 border shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between py-2 px-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
              <div>
                <CardTitle>{activeChat}</CardTitle>
                <CardDescription className="text-xs flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  Online
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CallButton type="audio" onClick={() => handleStartCall("audio")} />
                    </TooltipTrigger>
                    <TooltipContent>Audio Call</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CallButton type="video" onClick={() => handleStartCall("video")} />
                    </TooltipTrigger>
                    <TooltipContent>Video Call</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span>View profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Users className="mr-2 h-4 w-4" />
                      <span>Create group</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="flex h-[calc(100%-3.5rem)] flex-col p-0">
              <ScrollArea className="flex-1 px-3">
                <div className="space-y-1 py-3">
                  {messages.map((message, index) => (
                    <Message
                      key={message.id}
                      {...message}
                      isConsecutive={
                        index > 0 &&
                        messages[index - 1].isUser === message.isUser
                      }
                    />
                  ))}
                  <div ref={scrollAreaRef} />
                </div>
              </ScrollArea>
              <div className="p-3 flex gap-2 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent side="top" align="start" className="w-56 p-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="flex flex-col items-center justify-center h-20 space-y-2">
                        <Image className="h-6 w-6" />
                        <span className="text-xs">Image</span>
                      </Button>
                      <Button variant="outline" className="flex flex-col items-center justify-center h-20 space-y-2">
                        <FileText className="h-6 w-6" />
                        <span className="text-xs">Document</span>
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Input 
                  placeholder="Type your message..." 
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0">
                      <Smile className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent side="top" align="end" className="w-56 p-2">
                    <div className="grid grid-cols-6 gap-2">
                      {['😊','😂','❤️','👍','🎉','🙏','😍','🤔','👋','🥰'].map(emoji => (
                        <Button 
                          key={emoji} 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          onClick={() => setMessageText(prev => prev + emoji)}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="icon" 
                        className="shrink-0"
                        onClick={handleSendMessage}
                        disabled={!messageText.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Send message</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>
        </div>
      </Card>

      {callStatus && (
        <CallControls
          isOpen={true}
          onClose={() => setCallStatus(null)}
          type={callStatus.type}
          participant={callStatus.participant}
          status={callStatus.status}
        />
      )}
    </RoleBasedLayout>
  )
}