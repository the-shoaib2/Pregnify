import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, BarChart, PieChart, HeartPulse, Baby, Activity, Calendar } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

// Mock data - replace with actual data from your backend
const pregnancyData = {
  weightTrend: [
    { week: 12, weight: 0.5 },
    { week: 16, weight: 1.2 },
    { week: 20, weight: 2.5 },
    { week: 24, weight: 5.2 },
    { week: 28, weight: 7.8 },
    { week: 32, weight: 9.5 },
    { week: 36, weight: 11.2 },
    { week: 40, weight: 12.0 }
  ],
  babyGrowth: [
    { week: 12, weight: 0.014, length: 5.4 },
    { week: 16, weight: 0.1, length: 11.6 },
    { week: 20, weight: 0.3, length: 16.4 },
    { week: 24, weight: 0.6, length: 30 },
    { week: 28, weight: 1.0, length: 37.6 },
    { week: 32, weight: 1.7, length: 42.4 },
    { week: 36, weight: 2.6, length: 47.4 },
    { week: 40, weight: 3.4, length: 51.2 }
  ],
  appointments: [
    { date: "2024-01-15", type: "First Ultrasound", status: "completed" },
    { date: "2024-02-20", type: "Regular Checkup", status: "completed" },
    { date: "2024-03-25", type: "Anatomy Scan", status: "completed" },
    { date: "2024-04-20", type: "Regular Checkup", status: "scheduled" },
    { date: "2024-05-15", type: "Growth Scan", status: "upcoming" }
  ],
  healthMetrics: {
    bloodPressure: { systolic: 120, diastolic: 80 },
    heartRate: 85,
    bloodSugar: 95,
    ironLevel: 12.5
  }
}

export default function DashboardAnalytics() {
  return (
    <div className="space-y-2">
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3">
            <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
            <HeartPulse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold">
              {pregnancyData.healthMetrics.bloodPressure.systolic}/{pregnancyData.healthMetrics.bloodPressure.diastolic}
            </div>
            <p className="text-xs text-muted-foreground">Normal range</p>
          </CardContent>
        </Card>
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3">
            <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold">{pregnancyData.healthMetrics.heartRate} bpm</div>
            <p className="text-xs text-muted-foreground">Resting rate</p>
          </CardContent>
        </Card>
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3">
            <CardTitle className="text-sm font-medium">Blood Sugar</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold">{pregnancyData.healthMetrics.bloodSugar} mg/dL</div>
            <p className="text-xs text-muted-foreground">Fasting level</p>
          </CardContent>
        </Card>
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3">
            <CardTitle className="text-sm font-medium">Iron Level</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold">{pregnancyData.healthMetrics.ironLevel} g/dL</div>
            <p className="text-xs text-muted-foreground">Within range</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <Card className="h-[300px]">
          <CardHeader className="p-3">
            <CardTitle className="text-sm">Weight Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="h-full w-full">
              <Skeleton className="h-full w-full" />
            </div>
          </CardContent>
        </Card>
        <Card className="h-[300px]">
          <CardHeader className="p-3">
            <CardTitle className="text-sm">Baby Growth</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="h-full w-full">
              <Skeleton className="h-full w-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-sm">Appointment History</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="space-y-2">
            {pregnancyData.appointments.map((appointment, index) => (
              <div key={index} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{appointment.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(appointment.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={appointment.status === 'completed' ? 'default' : appointment.status === 'scheduled' ? 'secondary' : 'outline'}
                  className="text-xs"
                >
                  {appointment.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 