import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"
import { ButtonProfileCard } from "@/components/user-card/button-profile-card"
import { ProfileCard } from "@/components/user-card/profile-card"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  Globe,
  Mail,
  Activity,
  Bell,
  Users,
  Shield,
  Eye,
  EyeOff,
  UserPlus,
  UserMinus,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context/auth-context"

export default function AccountsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState({
    publicProfile: true,
    showEmail: false,
    activityVisible: true,
    allowFollowers: true,
    showOnlineStatus: true,
    allowTagging: true,
    showLastSeen: false,
    allowFriendRequests: true,
  })

  const handleToggle = (key) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: !prev[key] }
      toast.success(`Setting updated successfully`)
      return newSettings
    })
  }

  const handleProfileAction = (action) => {
    switch (action) {
      case 'follow':
        toast.success('User followed successfully')
        break
      case 'message':
        toast.success('Message dialog opened')
        break
      case 'report':
        toast.error('User reported')
        break
      case 'block':
        toast.error('User blocked')
        break
      default:
        break
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight">Account Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account visibility and interaction preferences
        </p>
      </div>
      <Separator />
      
      <ButtonProfileCard 
        user={{
          name: user?.basicInfo?.name?.firstName + " " + user?.basicInfo?.name?.lastName,
          username: user?.basicInfo?.username,
          avatar: user?.basicInfo?.avatar,
          email: user?.basicInfo?.email,
          bio: user?.basicInfo?.bio,
          verified: user?.basicInfo?.isVerified,
        }}
        href="/settings/account/profile"
      />
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Visibility Settings
            </CardTitle>
            <CardDescription>
              Control what others can see about your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="public-profile" className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                Public Profile
              </Label>
              <Switch
                id="public-profile"
                checked={settings.publicProfile}
                onCheckedChange={() => handleToggle('publicProfile')}
              />
            </div>
            
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="show-email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Show Email
              </Label>
              <Switch
                id="show-email"
                checked={settings.showEmail}
                onCheckedChange={() => handleToggle('showEmail')}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="activity-visible" className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                Activity Visible
              </Label>
              <Switch
                id="activity-visible"
                checked={settings.activityVisible}
                onCheckedChange={() => handleToggle('activityVisible')}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Social Settings
            </CardTitle>
            <CardDescription>
              Manage your social interactions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="allow-followers" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-muted-foreground" />
                Allow Followers
              </Label>
              <Switch
                id="allow-followers"
                checked={settings.allowFollowers}
                onCheckedChange={() => handleToggle('allowFollowers')}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="show-online" className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                Show Online Status
              </Label>
              <Switch
                id="show-online"
                checked={settings.showOnlineStatus}
                onCheckedChange={() => handleToggle('showOnlineStatus')}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="allow-tagging" className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                Allow Tagging
              </Label>
              <Switch
                id="allow-tagging"
                checked={settings.allowTagging}
                onCheckedChange={() => handleToggle('allowTagging')}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Controls
          </CardTitle>
          <CardDescription>
            Advanced privacy settings for your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="last-seen" className="flex items-center gap-2">
              <EyeOff className="h-4 w-4 text-muted-foreground" />
              Show Last Seen
            </Label>
            <Switch
              id="last-seen"
              checked={settings.showLastSeen}
              onCheckedChange={() => handleToggle('showLastSeen')}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="friend-requests" className="flex items-center gap-2">
              <UserMinus className="h-4 w-4 text-muted-foreground" />
              Allow Friend Requests
            </Label>
            <Switch
              id="friend-requests"
              checked={settings.allowFriendRequests}
              onCheckedChange={() => handleToggle('allowFriendRequests')}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => toast.success("Settings saved successfully")}
          >
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 