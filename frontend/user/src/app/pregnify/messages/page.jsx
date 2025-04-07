import { RoleBasedLayout } from "@/components/layout/role-based-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Send } from "lucide-react"

const Message = ({ isUser, content, time }) => (
  <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
    <div className={`flex max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={isUser ? "/user-avatar.jpg" : "/doctor-avatar.jpg"} />
        <AvatarFallback>{isUser ? "U" : "D"}</AvatarFallback>
      </Avatar>
      <div className={`rounded-lg p-3 ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
        <p className="text-sm">{content}</p>
        <span className={`text-xs ${isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
          {time}
        </span>
      </div>
    </div>
  </div>
)

export default function MessagesPage() {
  return (
    <RoleBasedLayout headerTitle="Messages">
      <div className="flex h-[calc(100vh-4rem)] flex-col gap-4 p-4">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Chat with Dr. Smith</CardTitle>
          </CardHeader>
          <CardContent className="flex h-[calc(100%-4rem)] flex-col">
            <ScrollArea className="flex-1">
              <div className="space-y-4 p-4">
                <Message
                  isUser={false}
                  content="Hello! How can I help you today?"
                  time="10:00 AM"
                />
                <Message
                  isUser={true}
                  content="I have some questions about my pregnancy diet."
                  time="10:02 AM"
                />
                <Message
                  isUser={false}
                  content="Of course! I'd be happy to help with your diet questions. What specific concerns do you have?"
                  time="10:03 AM"
                />
              </div>
            </ScrollArea>
            <div className="mt-4 flex gap-2">
              <Input placeholder="Type your message..." />
              <Button size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  )
} 