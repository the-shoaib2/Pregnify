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

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Accounts</h3>
        <p className="text-sm text-muted-foreground">
          Manage your Accounts settings and data.
        </p>
      </div>
      <Separator />
      <Card>
        <CardHeader>
          <CardTitle>Accounts Settings</CardTitle>
          <CardDescription>
            Control your Accounts preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="profile-visible">Public Profile</Label>
            <Switch id="profile-visible" />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="show-email">Show Email</Label>
            <Switch id="show-email" />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="activity-visible">Activity Visible</Label>
            <Switch id="activity-visible" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 