import { RoleBasedLayout } from "@/components/layout/role-based-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Send, 
  Bot, 
  MessageSquare, 
  BrainCircuit,
  BookOpen,
  Stethoscope,
  Baby,
  Calendar
} from "lucide-react"

const Message = ({ isUser, content, time }) => (
  <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
    <div className={`flex max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
      <Avatar className="h-8 w-8">
        {isUser ? (
          <AvatarImage src="/user-avatar.jpg" />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10">
            <Bot className="h-4 w-4 text-primary" />
          </div>
        )}
        <AvatarFallback>{isUser ? "U" : "AI"}</AvatarFallback>
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

const QuickAction = ({ icon: Icon, title, description }) => (
  <Button variant="outline" className="flex h-auto flex-col items-start gap-2 p-4">
    <div className="rounded-full bg-primary/10 p-2">
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <div className="text-left">
      <h3 className="font-medium">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  </Button>
)

export default function AIAssistantPage() {
  const quickActions = [
    {
      icon: BookOpen,
      title: "Pregnancy Guide",
      description: "Get information about your current trimester"
    },
    {
      icon: Stethoscope,
      title: "Symptom Checker",
      description: "Check if your symptoms are normal"
    },
    {
      icon: Baby,
      title: "Baby Development",
      description: "Learn about your baby's growth"
    },
    {
      icon: Calendar,
      title: "Appointment Guide",
      description: "Get help scheduling appointments"
    }
  ]

  return (
    <RoleBasedLayout headerTitle="AI Assistant">
      <div className="flex h-[calc(100vh-4rem)] flex-col gap-4 p-4">
        <div className="grid flex-1 gap-4 md:grid-cols-2">
          {/* Chat Interface */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Chat with Pregnify AI</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <ScrollArea className="flex-1">
                <div className="space-y-4 p-4">
                  <Message
                    isUser={false}
                    content="Hello! I'm your pregnancy AI assistant. How can I help you today?"
                    time="10:00 AM"
                  />
                  <Message
                    isUser={true}
                    content="What should I expect in my second trimester?"
                    time="10:02 AM"
                  />
                  <Message
                    isUser={false}
                    content="In your second trimester, you'll likely experience reduced nausea, increased energy, and may start feeling your baby's movements. Would you like more specific information about any aspect?"
                    time="10:03 AM"
                  />
                </div>
              </ScrollArea>
              <div className="mt-4 flex gap-2">
                <Input placeholder="Ask me anything about your pregnancy..." />
                <Button size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <QuickAction key={index} {...action} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleBasedLayout>
  )
} 