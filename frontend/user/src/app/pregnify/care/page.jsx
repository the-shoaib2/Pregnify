import { RoleBasedLayout } from "@/components/layout/role-based-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle2, 
  Heart, 
  Baby, 
  Utensils, 
  Pill, 
  Stethoscope,
  Calendar,
  Clock
} from "lucide-react"

const CareTask = ({ icon: Icon, title, description, completed }) => (
  <div className="flex items-start gap-4">
    <div className="mt-1">
      <Checkbox checked={completed} />
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
)

export default function CarePage() {
  const careTasks = [
    {
      icon: Heart,
      title: "Morning Exercise",
      description: "15 minutes of light stretching and walking",
      completed: true
    },
    {
      icon: Utensils,
      title: "Healthy Breakfast",
      description: "Include protein, fruits, and whole grains",
      completed: true
    },
    {
      icon: Pill,
      title: "Prenatal Vitamins",
      description: "Take prescribed vitamins with breakfast",
      completed: false
    },
    {
      icon: Stethoscope,
      title: "Doctor's Appointment",
      description: "Monthly checkup at 2:00 PM",
      completed: false
    },
    {
      icon: Baby,
      title: "Fetal Movement Count",
      description: "Count baby's movements for 1 hour",
      completed: false
    }
  ]

  const progress = (careTasks.filter(task => task.completed).length / careTasks.length) * 100

  return (
    <RoleBasedLayout headerTitle="Daily Care">
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Daily Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tasks Completed</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Last updated: 10:30 AM</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Care Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Care Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {careTasks.map((task, index) => (
              <CareTask key={index} {...task} />
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Appointment
            </Button>
            <Button variant="outline" size="sm">
              <Stethoscope className="mr-2 h-4 w-4" />
              Contact Doctor
            </Button>
            <Button variant="outline" size="sm">
              <Heart className="mr-2 h-4 w-4" />
              Emergency Contact
            </Button>
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  )
} 