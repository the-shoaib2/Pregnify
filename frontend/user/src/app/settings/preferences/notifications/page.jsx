import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Notifications</h3>
        <p className="text-sm text-muted-foreground">
          Configure your notification preferences.
        </p>
      </div>
      <Separator />
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Choose what notifications you want to receive.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="comments">Comments</Label>
              <Switch id="comments" defaultChecked />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="mentions">Mentions</Label>
              <Switch id="mentions" defaultChecked />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="follows">Follows</Label>
              <Switch id="follows" />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="messages">Direct Messages</Label>
              <Switch id="messages" defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 