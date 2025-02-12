import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  LayoutGrid,
  Shield,
  AlertCircle,
  ExternalLink,
  Clock,
  Calendar,
  Mail,
  MessageSquare,
  FileText,
  Trash2,
  Settings,
  Info
} from "lucide-react"

const connectedApps = [
  {
    id: 1,
    name: "Google Calendar",
    icon: Calendar,
    description: "Sync your appointments and schedules",
    connectedAt: "2024-01-15",
    lastSync: "2024-02-15T09:30:00",
    permissions: ["read_calendar", "write_calendar"],
    status: "active"
  },
  {
    id: 2,
    name: "Microsoft Teams",
    icon: MessageSquare,
    description: "Video consultations and team communication",
    connectedAt: "2024-01-20",
    lastSync: "2024-02-15T10:15:00",
    permissions: ["read_messages", "write_messages", "video_calls"],
    status: "active"
  },
  {
    id: 3,
    name: "Dropbox",
    icon: FileText,
    description: "File storage and sharing",
    connectedAt: "2024-02-01",
    lastSync: "2024-02-15T08:45:00",
    permissions: ["read_files", "write_files"],
    status: "active"
  }
]

const recentActivity = [
  {
    id: 1,
    app: "Google Calendar",
    action: "Calendar sync",
    timestamp: "2024-02-15T09:30:00"
  },
  {
    id: 2,
    app: "Microsoft Teams",
    action: "Video consultation",
    timestamp: "2024-02-15T10:15:00"
  },
  {
    id: 3,
    app: "Dropbox",
    action: "File upload",
    timestamp: "2024-02-15T08:45:00"
  }
]

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function ConnectedAppsPage() {
  const { user } = useAuth()
  const [apps, setApps] = useState(connectedApps)

  const handleDisconnect = (appId) => {
    setApps(apps.filter(app => app.id !== appId))
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight">Connected Apps</h3>
        <p className="text-sm text-muted-foreground">
          Manage your connected applications and their permissions
        </p>
      </div>
      <Separator />

      <div className="grid gap-6">
        {/* Connected Apps */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-5 w-5" />
                <CardTitle>Connected Applications</CardTitle>
              </div>
              <Button variant="outline" size="sm">
                Connect New App
              </Button>
            </div>
            <CardDescription>
              Applications that have access to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {apps.map((app) => (
              <div
                key={app.id}
                className="flex items-start justify-between space-x-4 rounded-lg border p-4"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-muted">
                    <app.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{app.name}</p>
                      {app.status === "active" && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {app.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Connected {formatDate(app.connectedAt)}</span>
                      <span>•</span>
                      <span>Last sync {formatDateTime(app.lastSync)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleDisconnect(app.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Disconnect
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <CardTitle>Recent Activity</CardTitle>
            </div>
            <CardDescription>
              Recent actions performed by connected apps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{activity.app}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.action}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDateTime(activity.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View All Activity
            </Button>
          </CardFooter>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Security Settings</CardTitle>
            </div>
            <CardDescription>
              Manage security settings for connected applications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">
                  Third-party app notifications
                </div>
                <div className="text-sm text-muted-foreground">
                  Receive notifications about connected app activity
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">
                  Automatic app updates
                </div>
                <div className="text-sm text-muted-foreground">
                  Automatically update connected apps when available
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">
                  Data access alerts
                </div>
                <div className="text-sm text-muted-foreground">
                  Get notified when apps access sensitive data
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 