import { useState } from "react"
import { useAuth } from "@/contexts/auth-context/auth-context"
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
  Save,
  Clock,
  Calendar,
  Download,
  Upload,
  HardDrive,
  Cloud,
  Settings,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  FileText
} from "lucide-react"

const backupHistory = [
  {
    id: 1,
    type: "Automatic",
    status: "success",
    size: "2.3 GB",
    date: "2024-02-15T09:30:00",
    files: 1250
  },
  {
    id: 2,
    type: "Manual",
    status: "success",
    size: "1.8 GB",
    date: "2024-02-10T15:45:00",
    files: 1100
  },
  {
    id: 3,
    type: "Automatic",
    status: "failed",
    size: "0 GB",
    date: "2024-02-05T08:15:00",
    files: 0
  }
]

const backupLocations = [
  {
    id: "cloud",
    name: "Cloud Storage",
    icon: Cloud,
    status: "active",
    lastSync: "2024-02-15T09:30:00",
    space: {
      used: 4.1,
      total: 10
    }
  },
  {
    id: "local",
    name: "Local Drive",
    icon: HardDrive,
    status: "active",
    lastSync: "2024-02-15T09:30:00",
    space: {
      used: 8.5,
      total: 20
    }
  }
]

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function BackupPage() {
  const { user } = useAuth()
  const [isBackingUp, setIsBackingUp] = useState(false)

  const handleBackupNow = () => {
    setIsBackingUp(true)
    // Simulate backup process
    setTimeout(() => setIsBackingUp(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight">Backup Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure your backup settings and manage your data
        </p>
      </div>
      <Separator />

      <div className="grid gap-6">
        {/* Backup Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Save className="h-5 w-5" />
                <CardTitle>Backup Status</CardTitle>
              </div>
              <Button 
                onClick={handleBackupNow}
                disabled={isBackingUp}
              >
                {isBackingUp ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Backing up...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Backup Now
                  </>
                )}
              </Button>
            </div>
            <CardDescription>
              Your backup status and recent history
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Backup Locations */}
            <div className="grid gap-4 sm:grid-cols-2">
              {backupLocations.map((location) => (
                <div
                  key={location.id}
                  className="flex items-center gap-4 rounded-lg border p-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-muted">
                    <location.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{location.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{location.space.used} GB used</span>
                      <span>•</span>
                      <span>{location.space.total} GB total</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div 
                        className="h-full rounded-full bg-primary" 
                        style={{ 
                          width: `${(location.space.used / location.space.total) * 100}%` 
                        }} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Backup History */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Recent Backups</h4>
              {backupHistory.map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    {backup.status === "success" ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{backup.type} Backup</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{backup.size}</span>
                        <span>•</span>
                        <span>{backup.files} files</span>
                        <span>•</span>
                        <span>{formatDate(backup.date)}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Backup Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <CardTitle>Backup Configuration</CardTitle>
            </div>
            <CardDescription>
              Configure your backup preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Automatic Backups</div>
                <div className="text-sm text-muted-foreground">
                  Automatically backup your data daily
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Backup Encryption</div>
                <div className="text-sm text-muted-foreground">
                  Encrypt your backups for additional security
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Version History</div>
                <div className="text-sm text-muted-foreground">
                  Keep previous versions of your backups
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Backup Notifications</div>
                <div className="text-sm text-muted-foreground">
                  Receive notifications about backup status
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