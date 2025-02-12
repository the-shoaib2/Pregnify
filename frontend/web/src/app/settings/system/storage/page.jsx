import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
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
  Database,
  HardDrive,
  File,
  Image,
  Video,
  FileText,
  Archive,
  Trash2,
  Download,
  RefreshCw,
  AlertCircle
} from "lucide-react"

const storageData = {
  total: 100, // GB
  used: 67.5, // GB
  categories: [
    {
      name: "Documents",
      icon: FileText,
      size: 25.3,
      files: 1250,
      color: "text-blue-500"
    },
    {
      name: "Images",
      icon: Image,
      size: 18.7,
      files: 3420,
      color: "text-green-500"
    },
    {
      name: "Videos",
      icon: Video,
      size: 15.2,
      files: 184,
      color: "text-purple-500"
    },
    {
      name: "Archives",
      icon: Archive,
      size: 8.3,
      files: 95,
      color: "text-orange-500"
    }
  ],
  recentFiles: [
    {
      name: "patient_report_2024.pdf",
      size: "2.4 MB",
      type: "PDF",
      modified: "2024-02-15T10:30:00"
    },
    {
      name: "medical_scan.jpg",
      size: "5.1 MB",
      type: "Image",
      modified: "2024-02-14T15:45:00"
    },
    {
      name: "backup_2024_02.zip",
      size: "1.2 GB",
      type: "Archive",
      modified: "2024-02-13T09:15:00"
    }
  ]
}

function formatSize(size) {
  if (size < 1024) return `${size.toFixed(1)} MB`
  return `${(size / 1024).toFixed(1)} GB`
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export default function StoragePage() {
  const { user } = useAuth()
  const usedPercentage = (storageData.used / storageData.total) * 100

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight">Storage</h3>
        <p className="text-sm text-muted-foreground">
          Manage your storage space and files
        </p>
      </div>
      <Separator />

      <div className="grid gap-6">
        {/* Storage Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                <CardTitle>Storage Overview</CardTitle>
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
            <CardDescription>
              Your storage usage and allocation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{formatSize(storageData.used)} used</span>
                <span>{formatSize(storageData.total)} total</span>
              </div>
              <Progress value={usedPercentage} />
              {usedPercentage > 90 && (
                <div className="flex items-center gap-2 rounded-md bg-yellow-50 p-2 text-sm text-yellow-900">
                  <AlertCircle className="h-4 w-4" />
                  <span>Storage space is running low</span>
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {storageData.categories.map((category) => (
                <div
                  key={category.name}
                  className="flex items-center gap-4 rounded-lg border p-4"
                >
                  <div className={`rounded-lg p-2 ${category.color} bg-opacity-10`}>
                    <category.icon className={`h-5 w-5 ${category.color}`} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{category.name}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{formatSize(category.size)}</span>
                      <span>{category.files} files</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Files */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <File className="h-5 w-5" />
                <CardTitle>Recent Files</CardTitle>
              </div>
              <Button variant="outline" size="sm">
                View All Files
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {storageData.recentFiles.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{file.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{file.type}</span>
                        <span>•</span>
                        <span>{file.size}</span>
                        <span>•</span>
                        <span>Modified {formatDate(file.modified)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Storage Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <CardTitle>Storage Management</CardTitle>
            </div>
            <CardDescription>
              Manage your storage settings and cleanup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Automatic Cleanup</div>
                <div className="text-sm text-muted-foreground">
                  Automatically remove unused files older than 30 days
                </div>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Storage Analytics</div>
                <div className="text-sm text-muted-foreground">
                  View detailed storage usage analytics
                </div>
              </div>
              <Button variant="outline" size="sm">
                View Analytics
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Backup Settings</div>
                <div className="text-sm text-muted-foreground">
                  Configure automatic backup settings
                </div>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 