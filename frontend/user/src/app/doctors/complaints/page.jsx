import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function ComplaintsPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Complaints</h2>
      
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search complaints..."
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Complaint</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Jane Smith</TableCell>
                <TableCell>Dr. Sarah Johnson</TableCell>
                <TableCell>Late response to messages</TableCell>
                <TableCell>
                  <Badge variant="outline">Pending</Badge>
                </TableCell>
                <TableCell>2024-04-09</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">View Details</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>John Doe</TableCell>
                <TableCell>Dr. Michael Chen</TableCell>
                <TableCell>Appointment scheduling issues</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-100 text-green-800">Resolved</Badge>
                </TableCell>
                <TableCell>2024-04-08</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">View Details</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 