import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Profile() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Full Name</label>
                <p className="text-base">{user?.fullName}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Email</label>
                <p className="text-base">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Role</label>
                <p className="text-base capitalize">{user?.role?.toLowerCase()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Username</label>
                <p className="text-base">{user?.username}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Phone</label>
                <p className="text-base">{user?.phoneNumber || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">2FA Status</label>
                <p className="text-base">{user?.is2FAEnabled ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 