import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { 
  Shield,
  FileText,
  User,
  Mail,
  Phone,
  Info,
  HelpCircle,
  CheckCircle2,
  Save,
  Loader2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { toast } from "react-hot-toast"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

export default function AccountTab({ user, formData, handleChange, handleSave, settingsLoading, updateSettings }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Account Information
        </CardTitle>
        <CardDescription>
          Your account details and verification status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User ID and Username */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">User ID</Label>
            <div className="flex items-center gap-2 bg-muted/50 rounded-md p-2 border">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <code className="font-mono text-sm">{user?.basicInfo?.userID || 'N/A'}</code>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">Username</Label>
            <div className="flex items-center gap-2">
              <Input 
                value={formData.basicInfo?.username}
                onChange={(e) => handleChange('basic', 'username', e.target.value)}
                placeholder="Enter username"
                className="font-medium"
              />
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-medium">Username Guidelines</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Must be unique</li>
                      <li>• 3-20 characters long</li>
                      <li>• Can contain letters, numbers, and underscores</li>
                      <li>• Cannot contain spaces or special characters</li>
                    </ul>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          </div>
        </div>

        {/* Email and Phone Verification */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email Address
                </Label>
                <p className="text-sm text-muted-foreground break-all">
                  {user?.basicInfo?.email || 'No email set'}
                </p>
              </div>
              {user?.basicInfo?.isEmailVerified ? (
                <Badge variant="success" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </Badge>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toast.info("Verification email sent!")}
                  className="h-7"
                >
                  Verify Email
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Phone Number
                </Label>
                <p className="text-sm text-muted-foreground">
                  {user?.basicInfo?.phoneNumber || 'No phone set'}
                </p>
              </div>
              {user?.basicInfo?.isSmsVerified ? (
                <Badge variant="success" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </Badge>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toast.info("Verification SMS sent!")}
                  className="h-7"
                >
                  Verify Phone
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Account Status and Timeline */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Account Status</Label>
                <p className="text-sm text-muted-foreground">
                  Your account is {user?.accountStatus?.toLowerCase() || 'inactive'}
                </p>
              </div>
              <Badge 
                variant={user?.basicInfo?.accountStatus === 'ACTIVE' ? 'success' : 'secondary'}
                className="uppercase"
              >
                {user?.basicInfo?.accountStatus || 'INACTIVE'}
              </Badge>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">Created</Label>
                <p className="text-sm font-medium">
                  {user?.basicInfo?.createdAt ? new Date(user?.basicInfo?.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">Last Login</Label>
                <p className="text-sm font-medium">
                  {user?.activity?.lastLoginAt ? new Date(user?.activity?.lastLoginAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Security */}
        <div className="rounded-lg border p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Account Security</Label>
                <p className="text-sm text-muted-foreground">
                  Additional security settings for your account
                </p>
              </div>
              <Switch
                checked={user?.multiFactorAuth}
                onCheckedChange={(checked) => {
                  toast.promise(
                    updateSettings('security', { multiFactorAuth: checked }),
                    {
                      loading: 'Updating security settings...',
                      success: 'Security settings updated',
                      error: 'Failed to update security settings'
                    }
                  )
                }}
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              Two-factor authentication is {user?.multiFactorAuth ? 'enabled' : 'disabled'}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t pt-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4" />
          Changes to your account settings may require verification
        </div>
        <Button 
          onClick={() => handleSave(formData)}
          disabled={settingsLoading}
        >
          {settingsLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Changes...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
} 