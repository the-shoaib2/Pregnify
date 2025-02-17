import { useAuth } from "@/contexts/auth-context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Shield, Key, Smartphone, History, AlertTriangle } from "lucide-react"

export default function SecurityPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Security</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account security and authentication settings.
        </p>
      </div>
      <Separator />
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Multi-Factor Authentication</CardTitle>
            <CardDescription>
              Add an extra layer of security to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Two-Factor Authentication</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {user?.twoFactorEnabled 
                    ? "Two-factor authentication is enabled"
                    : "Protect your account with 2FA"}
                </p>
              </div>
              <Switch checked={user?.twoFactorEnabled} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Passkey</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {user?.isPasskeyEnabled 
                    ? "Passkey authentication is enabled"
                    : "Use passkeys for passwordless login"}
                </p>
              </div>
              <Switch checked={user?.isPasskeyEnabled} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Login History</CardTitle>
            <CardDescription>
              Recent login activity on your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user?.loginHistory?.slice(0, 5).map((login) => (
                <div key={login.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{login.deviceType}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      IP: {login.ipAddress} • {new Date(login.loginAt).toLocaleString()}
                    </p>
                  </div>
                  {login.successful ? (
                    <span className="text-xs text-green-500">Successful</span>
                  ) : (
                    <span className="text-xs text-red-500">Failed</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View All Activity</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
            <CardDescription>
              Your account security status and warnings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`h-4 w-4 ${user?.accountStatus === 'ACTIVE' ? 'text-green-500' : 'text-red-500'}`} />
                    <span className="font-medium">Account Status</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {user?.accountStatus}
                  </p>
                </div>
                {user?.accountStatus === 'ACTIVE' ? (
                  <span className="text-xs text-green-500">Active</span>
                ) : (
                  <span className="text-xs text-red-500">{user?.accountStatus}</span>
                )}
              </div>

              {user?.isAccountLocked && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">Account Locked</span>
                  </div>
                  <p className="mt-1 text-sm text-red-700">
                    Your account is currently locked. Please contact support for assistance.
                  </p>
                </div>
              )}

              {user?.accountSuspended && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">Account Suspended</span>
                  </div>
                  <p className="mt-1 text-sm text-red-700">
                    Your account is suspended until {new Date(user?.bannedUntil).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password to keep your account secure.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="current">Current Password</Label>
              <Input id="current" type="password" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new">New Password</Label>
              <Input id="new" type="password" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input id="confirm" type="password" />
            </div>
            <Button>Update Password</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 