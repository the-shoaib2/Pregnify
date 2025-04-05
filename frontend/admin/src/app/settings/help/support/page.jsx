import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Mail, MessageCircle, Phone, Globe } from "lucide-react"

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Support</h3>
        <p className="text-sm text-muted-foreground">
          Get help and support for your account.
        </p>
      </div>
      <Separator />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
            <CardDescription>
              Get in touch with our support team.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center gap-4">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div className="grid gap-1">
                <div className="font-medium">Email Support</div>
                <div className="text-sm text-muted-foreground">
                  support@pregnify.com
                </div>
              </div>
              <Button className="ml-auto" variant="outline">
                Send Email
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <MessageCircle className="h-5 w-5 text-muted-foreground" />
              <div className="grid gap-1">
                <div className="font-medium">Live Chat</div>
                <div className="text-sm text-muted-foreground">
                  Available 24/7
                </div>
              </div>
              <Button className="ml-auto" variant="outline">
                Start Chat
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Help Resources</CardTitle>
            <CardDescription>
              Browse our help documentation and guides.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button variant="outline" className="justify-start">
              <Globe className="mr-2 h-4 w-4" />
              Knowledge Base
            </Button>
            <Button variant="outline" className="justify-start">
              <MessageCircle className="mr-2 h-4 w-4" />
              Community Forums
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 