import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  CreditCard,
  Building,
  Package,
  Clock,
  DollarSign,
  CreditCard as CardIcon,
  RefreshCcw,
} from "lucide-react"

function AccountSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {Array(2).fill(null).map((_, i) => (
          <div key={i} className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array(3).fill(null).map((_, j) => (
                  <div key={j} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AccountPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const preferences = user?.preferences?.[0] || {}

  if (!user) return <AccountSkeleton />

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight">Account Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account preferences and billing information
        </p>
      </div>
      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Subscription Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Subscription Plan</CardTitle>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {preferences.subscriptionPlan || "BASIC"}
              </span>
            </div>
            <CardDescription>
              Manage your subscription and billing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <div className="flex items-center text-sm">
                  <Package className="mr-2 h-4 w-4" />
                  Current Plan
                </div>
                <div className="text-xs text-muted-foreground">
                  {preferences.subscriptionPlan || "Basic Plan"}
                </div>
              </div>
              <Button variant="outline" size="sm">
                Upgrade
              </Button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <div className="flex items-center text-sm">
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Auto-Renewal
                </div>
                <div className="text-xs text-muted-foreground">
                  {preferences.isAutoRenewEnabled ? "Enabled" : "Disabled"}
                </div>
              </div>
              <Switch checked={preferences.isAutoRenewEnabled} />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <div className="flex items-center text-sm">
                  <Clock className="mr-2 h-4 w-4" />
                  Billing Cycle
                </div>
                <div className="text-xs text-muted-foreground">
                  Monthly
                </div>
              </div>
              <Button variant="ghost" size="sm">
                Change
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Billing Information */}
        <Card>
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
            <CardDescription>
              Manage your billing details and payment methods
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Billing Address</Label>
              <Input 
                defaultValue={preferences.billingAddress} 
                placeholder="Enter billing address"
              />
            </div>

            <div className="space-y-2">
              <Label>Currency</Label>
              <Input 
                defaultValue={preferences.currency} 
                placeholder="USD"
              />
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center text-sm font-medium">
                    <CardIcon className="mr-2 h-4 w-4" />
                    Payment Methods
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user.paymentCards?.length || 0} cards saved
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Add New
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Account Preferences</CardTitle>
            <CardDescription>
              Customize your account settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Time Zone</Label>
                <div className="text-sm text-muted-foreground">
                  {preferences.timezone || "Not set"}
                </div>
              </div>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Date Format</Label>
                <div className="text-sm text-muted-foreground">
                  {preferences.dateFormat || "Default"}
                </div>
              </div>
              <Button variant="outline" size="sm">
                Change
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Time Format</Label>
                <div className="text-sm text-muted-foreground">
                  {preferences.timeFormat || "24-hour"}
                </div>
              </div>
              <Button variant="outline" size="sm">
                Change
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Account Activity</CardTitle>
            <CardDescription>
              Recent account activity and login history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.loginHistory?.slice(0, 3).map((login) => (
                <div key={login.id} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">
                      {login.deviceType}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(login.loginAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {login.ipAddress}
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                View All Activity
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 