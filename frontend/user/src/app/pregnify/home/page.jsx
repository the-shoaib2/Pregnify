import { useState, useEffect } from "react"
import { RoleBasedLayout } from "@/components/layout/role-based-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import { PregnancyService, SYSTEM_ENUMS } from "@/services/pregnify"
import { useAuth } from "@/contexts/auth-context/auth-context"
import { Baby, Calendar as CalendarIcon, Heart, Activity, Bell, BookOpen, MessageSquare, Plus, Search, Phone, Video } from "lucide-react"
import { PregnancyDataForm } from "@/components/pregnancy/pregnancy-data-form"
import { UserInfoCard } from "@/components/user-info-card"
import ErrorBoundary from "@/components/error-boundary"
import toast from "react-hot-toast"
import { Footer } from "@/components/footer"
// Quick Stats Component
function QuickStats({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="transition-all duration-300 hover:shadow-md">
            <CardContent className="p-4 h-32 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">
                  {stat.label === "Current Week" && "of 40 weeks pregnancy"}
                  {stat.label === "Heart Rate" && "beats per minute"}
                  {stat.label === "Activity Level" && "recommended daily activity"}
                  {stat.label === "Next Checkup" && "until your next appointment"}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// Health Metrics Component
function HealthMetrics() {
  const metrics = [
    {
      title: "Blood Pressure",
      value: "120/80",
      unit: "mmHg",
      progress: 75,
      icon: Heart,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      trend: "↑ 2% from last week"
    },
    {
      title: "Weight",
      value: "65",
      unit: "kg",
      progress: 60,
      icon: Activity,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      trend: "↓ 1kg from last week"
    },
    {
      title: "Sleep",
      value: "7.5",
      unit: "hrs",
      progress: 85,
      icon: Bell,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      trend: "↑ 0.5hrs from last week"
    },
    {
      title: "Water Intake",
      value: "2.5",
      unit: "L",
      progress: 90,
      icon: Baby,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      trend: "↑ 0.5L from last week"
    }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <div key={index} className="relative p-4 rounded-lg border bg-card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                    <Icon className={`h-5 w-5 ${metric.color}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">{metric.title}</h3>
                    <p className="text-xs text-muted-foreground">{metric.trend}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.unit}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{metric.progress}%</span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="absolute h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${metric.progress}%`,
                      backgroundColor: metric.color.replace('text-', 'bg-')
                    }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Weekly Summary */}
      <div className="p-4 rounded-lg border bg-card">
        <h3 className="text-sm font-medium mb-4">Weekly Summary</h3>
        <div className="grid grid-cols-4 gap-4">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
            <div key={index} className="text-center">
              <p className="text-xs text-muted-foreground mb-2">{day}</p>
              <div className="h-16 w-full rounded-lg bg-muted flex items-center justify-center">
                <p className="text-xs font-medium">No data</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Upcoming Appointments Component
function UpcomingAppointments({ appointments }) {
  return (
    <div className="space-y-4">
      {appointments?.length > 0 ? (
        appointments.map((appointment, index) => (
          <div key={index} className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={appointment.doctorImage} />
              <AvatarFallback>{appointment.doctorName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{appointment.doctorName}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
              </p>
            </div>
            <Button variant="outline" size="sm">View Details</Button>
          </div>
        ))
      ) : (
        <Alert>
          <AlertTitle>No Upcoming Appointments</AlertTitle>
          <AlertDescription>
            You don't have any scheduled appointments. Book one now!
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

// Date Display Component
function DateDisplay({ date }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{date.toLocaleDateString('en-US', { weekday: 'long' })}</h3>
          <p className="text-sm text-muted-foreground">{date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>
      <Separator />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Today's Tasks</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <p className="text-xs">Prenatal vitamins</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <p className="text-xs">30 min walk</p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Suggestions</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
              <p className="text-xs">Drink more water</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
              <p className="text-xs">Practice breathing</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Risk Level Badge Component
function RiskLevelBadge({ level }) {
  const getBadgeStyle = (level) => {
    switch (level) {
      case 'LOW':
        return 'bg-green-100 text-green-800'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800'
      case 'HIGH':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeStyle(level)}`}>
      {level}
    </span>
  )
}

// Quick Actions Component
function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
        <Plus className="h-6 w-6" />
        <span className="text-sm">Add Note</span>
      </Button>
      <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
        <Search className="h-6 w-6" />
        <span className="text-sm">Find Doctor</span>
      </Button>
      <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
        <Phone className="h-6 w-6" />
        <span className="text-sm">Emergency</span>
      </Button>
      <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
        <Video className="h-6 w-6" />
        <span className="text-sm">Video Call</span>
      </Button>
    </div>
  )
}

export default function PregnifyPage() {
  const { user } = useAuth()
  const [riskAssessment, setRiskAssessment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [accessDenied, setAccessDenied] = useState(false)
  const [pregnancyData, setPregnancyData] = useState(null)
  const [date, setDate] = useState(new Date())

  // Mock data for quick stats
  const quickStats = [
    { label: "Current Week", value: "12", icon: Baby, color: "bg-pink-500/10 text-pink-500" },
    { label: "Heart Rate", value: "140", icon: Heart, color: "bg-red-500/10 text-red-500" },
    { label: "Activity Level", value: "Moderate", icon: Activity, color: "bg-blue-500/10 text-blue-500" },
    { label: "Next Checkup", value: "3 days", icon: Bell, color: "bg-yellow-500/10 text-yellow-500" }
  ]

  // Mock data for appointments
  const appointments = [
    {
      doctorName: "Dr. Sarah Johnson",
      doctorImage: "/doctors/sarah.jpg",
      date: "2024-03-15",
      time: "10:00 AM"
    },
    {
      doctorName: "Dr. Michael Chen",
      doctorImage: "/doctors/michael.jpg",
      date: "2024-03-20",
      time: "02:30 PM"
    }
  ]

  // Fetch pregnancy data first
  const fetchPregnancyData = async () => {
    try {
      setLoading(true)
      const response = await PregnancyService.getPregnancyDetails()
      if (response?.data?.[0]) {
        const data = response.data[0]
        setPregnancyData(data)
        return data.id
      }
      return null
    } catch (err) {
      console.error("Error fetching pregnancy data:", err)
      setError(err.message || "Failed to fetch pregnancy data")
      toast.error(err.message || "Failed to fetch pregnancy data")
      return null
    }
  }

  // Fetch risk assessment data
  const fetchRiskAssessment = async () => {
    try {
      setLoading(true)
      setError(null)
      setAccessDenied(false)

      const pregnancyId = await fetchPregnancyData()
      if (!pregnancyId) {
        setError("No pregnancy data found. Please add your pregnancy information first.")
        setLoading(false)
        return
      }

      const data = await PregnancyService.getRiskAssessment(pregnancyId)
      setRiskAssessment(data)
    } catch (err) {
      console.error("Error fetching risk assessment:", err)
      if (err.message.includes('Access denied')) {
        setAccessDenied(true)
        toast.error("You need a patient account to view risk assessment data.")
      } else {
        setError(err.message || "Failed to load risk assessment")
        toast.error(err.message || "Failed to load risk assessment")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRiskAssessment()
  }, [])

  const calculatePregnancyProgress = () => {
    if (!pregnancyData?.startDate) return 0
    const startDate = new Date(pregnancyData.startDate)
    const currentDate = new Date()
    const totalDays = 280 // 40 weeks
    const elapsedDays = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24))
    return Math.min(Math.max(Math.round((elapsedDays / totalDays) * 100), 0), 100)
  }

  const getWeekNumber = () => {
    if (!pregnancyData?.startDate) return 0
    const startDate = new Date(pregnancyData.startDate)
    const currentDate = new Date()
    const diffTime = Math.abs(currentDate - startDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.floor(diffDays / 7)
  }

  return (
    <ErrorBoundary>
      <RoleBasedLayout headerTitle="Pregnancy Dashboard">
        <div className="flex flex-1 flex-col gap-4 mx-auto w-full">
          {/* Top Section - User Info and Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* User Info Card */}
            <div className="lg:col-span-2">
              <UserInfoCard user={user} />
              <div className="mt-4">
                <QuickStats stats={quickStats} />
              </div>

              {/* Pregnancy Overview */}
              <div className="mt-4">
                <Card className="transition-all duration-300 hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Baby className="h-5 w-5 text-primary" />
                      Pregnancy Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ) : error ? (
                      <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    ) : pregnancyData ? (
                      <>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Week {getWeekNumber()} of 40</span>
                            <span className="font-medium">{calculatePregnancyProgress()}% Complete</span>
                          </div>
                          <Progress value={calculatePregnancyProgress()} className="h-2" />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarIcon className="h-4 w-4" />
                          <span>Estimated due date: {new Date(pregnancyData.dueDate).toLocaleDateString()}</span>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <Alert>
                          <AlertTitle>No Pregnancy Data</AlertTitle>
                          <AlertDescription>
                            Please add your pregnancy information to get started.
                          </AlertDescription>
                        </Alert>
                        <PregnancyDataForm onSuccess={fetchPregnancyData} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Health Metrics */}
              <div className="mt-4">
                <Card className="transition-all duration-300 hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-primary" />
                      Health Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <HealthMetrics />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Calendar and Daily Info */}
            <div className="space-y-4">
              <Card className="transition-all duration-300 hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    Today's Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DateDisplay date={date} />
                </CardContent>
              </Card>

              {/* Upcoming Appointments */}
              <Card className="transition-all duration-300 hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Upcoming Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <UpcomingAppointments appointments={appointments} />
                </CardContent>
              </Card>

              {/* Resources */}
              <Card className="transition-all duration-300 hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Pregnancy Guide
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Nutrition Tips
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Exercise Guidelines
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Join Discussion Groups
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Risk Assessment */}
              {riskAssessment && (
                <Card className="transition-all duration-300 hover:shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Risk Assessment</CardTitle>
                      <CardDescription>
                        Last updated: {new Date(riskAssessment.updatedAt).toLocaleString()}
                      </CardDescription>
                    </div>
                    <RiskLevelBadge level={riskAssessment.riskLevel} />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Overall Risk Score</span>
                        <span className="font-medium">{riskAssessment.riskScore}%</span>
                      </div>
                      <Progress value={riskAssessment.riskScore} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <QuickActions />

          <Footer />
        </div>
      </RoleBasedLayout>
    </ErrorBoundary>
  )
}
