import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, AlertCircle, CheckCircle, Calendar, HeartPulse, Baby, Stethoscope } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data - replace with actual data from your backend
const notifications = {
  medical: [
    {
      id: 1,
      type: "appointment",
      title: "Upcoming Appointment",
      message: "Regular checkup scheduled for tomorrow at 10:00 AM",
      time: "2 hours ago",
      icon: Calendar,
      status: "upcoming"
    },
    {
      id: 2,
      type: "test",
      title: "Test Results",
      message: "Your blood test results are now available",
      time: "1 day ago",
      icon: HeartPulse,
      status: "completed"
    },
    {
      id: 3,
      type: "reminder",
      title: "Medication Reminder",
      message: "Time to take your prenatal vitamins",
      time: "3 hours ago",
      icon: Stethoscope,
      status: "pending"
    }
  ],
  baby: [
    {
      id: 4,
      type: "milestone",
      title: "Baby Development",
      message: "Your baby is now the size of a papaya",
      time: "1 day ago",
      icon: Baby,
      status: "info"
    },
    {
      id: 5,
      type: "movement",
      title: "Baby Movement",
      message: "Remember to track your baby's movements today",
      time: "4 hours ago",
      icon: HeartPulse,
      status: "reminder"
    }
  ],
  system: [
    {
      id: 6,
      type: "update",
      title: "System Update",
      message: "New features added to track your pregnancy progress",
      time: "2 days ago",
      icon: Bell,
      status: "info"
    },
    {
      id: 7,
      type: "maintenance",
      title: "Scheduled Maintenance",
      message: "System maintenance scheduled for next week",
      time: "3 days ago",
      icon: AlertCircle,
      status: "warning"
    }
  ]
}

export default function DashboardNotifications() {
  return (
    <div className="space-y-2">
      <Tabs defaultValue="medical" className="space-y-2">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="medical">Medical</TabsTrigger>
          <TabsTrigger value="baby">Baby</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>
        
        <TabsContent value="medical" className="space-y-2">
          <Card>
            <CardHeader className="p-3">
              <CardTitle className="text-sm">Medical Notifications</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="space-y-2">
                {notifications.medical.map((notification) => (
                  <div 
                    key={notification.id}
                    className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <notification.icon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={
                        notification.status === 'upcoming' ? 'secondary' :
                        notification.status === 'completed' ? 'default' :
                        'outline'
                      }
                      className="text-xs"
                    >
                      {notification.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="baby" className="space-y-2">
          <Card>
            <CardHeader className="p-3">
              <CardTitle className="text-sm">Baby Updates</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="space-y-2">
                {notifications.baby.map((notification) => (
                  <div 
                    key={notification.id}
                    className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <notification.icon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={notification.status === 'info' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {notification.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-2">
          <Card>
            <CardHeader className="p-3">
              <CardTitle className="text-sm">System Notifications</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="space-y-2">
                {notifications.system.map((notification) => (
                  <div 
                    key={notification.id}
                    className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <notification.icon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={notification.status === 'warning' ? 'destructive' : 'default'}
                      className="text-xs"
                    >
                      {notification.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 