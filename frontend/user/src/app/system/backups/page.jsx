import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Download, Upload, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function BackupsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Backup Management</h2>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Create Backup
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Available Backups</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>backup_20240409_0200</TableCell>
                <TableCell>2024-04-09 02:00 AM</TableCell>
                <TableCell>2.5 GB</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Completed
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>backup_20240408_0200</TableCell>
                <TableCell>2024-04-08 02:00 AM</TableCell>
                <TableCell>2.4 GB</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                    <Clock className="mr-1 h-3 w-3" />
                    In Progress
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>backup_20240407_0200</TableCell>
                <TableCell>2024-04-07 02:00 AM</TableCell>
                <TableCell>2.3 GB</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-red-100 text-red-800">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Failed
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 