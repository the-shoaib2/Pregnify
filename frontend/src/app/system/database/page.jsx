import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, Download, Upload } from "lucide-react"

export default function DatabasePage() {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Database Management</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Database Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span>Connection Status</span>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-800">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Size</span>
                <span className="text-muted-foreground">2.5 GB</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tables</span>
                <span className="text-muted-foreground">24</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Backup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Download className="h-4 w-4 text-muted-foreground" />
                  <span>Last Backup</span>
                </div>
                <span className="text-muted-foreground">2024-04-09 02:00 AM</span>
              </div>
              <Button className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Create Backup
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Restore</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span>Available Backups</span>
                </div>
                <span className="text-muted-foreground">5</span>
              </div>
              <Button variant="outline" className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Restore from Backup
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 